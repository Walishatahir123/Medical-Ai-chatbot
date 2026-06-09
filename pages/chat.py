from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from database import get_conn
from auth_utils import decode_token
import json
import io
import datetime

router = APIRouter()

# ── Auth helper ───────────────────────────────────────────────────────────────

def get_user(authorization: str = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        return decode_token(authorization.split(" ")[1])
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# ── Medical AI response (mock — replace with real LLM later) ──────────────────

MEDICAL_RESPONSES = {
    "headache": "Headaches can have many causes including tension, dehydration, or migraines. Stay hydrated, rest in a quiet dark room, and consider OTC pain relief. See a doctor if severe or persistent.",
    "fever": "A fever above 38°C (100.4°F) indicates your body is fighting infection. Rest, stay hydrated, and take paracetamol/ibuprofen if needed. Seek care if fever exceeds 39.5°C or lasts more than 3 days.",
    "cough": "Coughs can be viral, bacterial, or allergic. Honey and warm water can soothe throat. See a doctor if you have blood in sputum, high fever, or symptoms lasting over 2 weeks.",
    "diabetes": "Diabetes management includes blood sugar monitoring, healthy diet (low sugar/refined carbs), regular exercise, and medication as prescribed. Regular check-ups are essential.",
    "blood pressure": "Normal BP is around 120/80 mmHg. Reduce salt intake, exercise regularly, avoid smoking, and take medications as prescribed. Monitor regularly at home.",
    "anxiety": "Anxiety is very common. Deep breathing, regular exercise, adequate sleep, and limiting caffeine can help. Cognitive behavioral therapy (CBT) is highly effective. Please consult a mental health professional.",
    "depression": "Depression is a medical condition, not a weakness. Please speak with a mental health professional. Treatment often includes therapy, lifestyle changes, and sometimes medication.",
    "stomach": "Stomach pain can range from gas to serious conditions. Mild cases: rest and a bland diet. Seek immediate care for severe, persistent pain, vomiting blood, or high fever.",
    "sleep": "For better sleep: keep a consistent schedule, avoid screens 1hr before bed, keep your room cool and dark, and limit caffeine after 2pm.",
    "diet": "A balanced diet includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, sugar, and saturated fats. Stay hydrated with water.",
}

def ai_response(message: str) -> dict:
    msg_lower = message.lower()
    for keyword, response in MEDICAL_RESPONSES.items():
        if keyword in msg_lower:
            return {
                "answer": response,
                "sources": [{"title": "MedicalAI Knowledge Base", "relevance": "high"}]
            }
    return {
        "answer": (
            "Thank you for your question. As a Medical AI assistant, I can provide general health information. "
            "For your specific concern, I recommend consulting a qualified healthcare professional who can properly "
            "evaluate your condition. Is there a specific symptom or health topic I can provide general information about?"
        ),
        "sources": []
    }

# ── Routes ────────────────────────────────────────────────────────────────────

class SendRequest(BaseModel):
    message: str
    session_id: str

class SaveRequest(BaseModel):
    session_id: str
    messages: list

@router.post("/send")
def send_message(req: SendRequest, authorization: Optional[str] = Header(None)):
    user = get_user(authorization)
    result = ai_response(req.message)

    # Auto-save message to DB
    conn = get_conn()
    c = conn.cursor()

    # Create session if doesn't exist
    existing = c.execute("SELECT id FROM sessions WHERE id = ?", (req.session_id,)).fetchone()
    if not existing:
        title = req.message[:40] + "..." if len(req.message) > 40 else req.message
        c.execute(
            "INSERT INTO sessions (id, user_id, title) VALUES (?, ?, ?)",
            (req.session_id, user["uid"], title)
        )

    time_now = datetime.datetime.now().strftime("%I:%M %p")

    # Save user message
    c.execute(
        "INSERT INTO messages (session_id, role, text, sources, time) VALUES (?, ?, ?, ?, ?)",
        (req.session_id, "user", req.message, "[]", time_now)
    )
    # Save AI message
    c.execute(
        "INSERT INTO messages (session_id, role, text, sources, time) VALUES (?, ?, ?, ?, ?)",
        (req.session_id, "ai", result["answer"], json.dumps(result["sources"]), time_now)
    )

    conn.commit()
    conn.close()

    return result


@router.post("/save")
def save_session(req: SaveRequest, authorization: Optional[str] = Header(None)):
    user = get_user(authorization)
    conn = get_conn()
    c = conn.cursor()

    existing = c.execute("SELECT id FROM sessions WHERE id = ?", (req.session_id,)).fetchone()
    if not existing:
        c.execute(
            "INSERT INTO sessions (id, user_id, title) VALUES (?, ?, ?)",
            (req.session_id, user["uid"], f"Session {req.session_id[-6:]}")
        )

    for msg in req.messages:
        c.execute(
            "INSERT INTO messages (session_id, role, text, sources, time) VALUES (?, ?, ?, ?, ?)",
            (req.session_id, msg.get("role"), msg.get("text"), json.dumps(msg.get("sources", [])), msg.get("time", ""))
        )

    conn.commit()
    conn.close()
    return {"message": "Session saved."}


@router.get("/history")
def get_history(authorization: Optional[str] = Header(None)):
    user = get_user(authorization)
    conn = get_conn()
    c = conn.cursor()

    sessions = c.execute(
        "SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC",
        (user["uid"],)
    ).fetchall()

    result = []
    for s in sessions:
        msgs = c.execute(
            "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC",
            (s["id"],)
        ).fetchall()
        result.append({
            "id": s["id"],
            "title": s["title"],
            "created_at": s["created_at"],
            "messages": [
                {
                    "role": m["role"],
                    "text": m["text"],
                    "sources": json.loads(m["sources"]),
                    "time": m["time"]
                } for m in msgs
            ]
        })

    conn.close()
    return result


@router.get("/download/{session_id}")
def download_session(session_id: str, authorization: Optional[str] = Header(None)):
    user = get_user(authorization)
    conn = get_conn()
    c = conn.cursor()

    msgs = c.execute(
        "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,)
    ).fetchall()
    conn.close()

    if not msgs:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Build plain text transcript (docx requires python-docx; use txt for now)
    lines = [f"MedicalAI Chat Transcript\nSession: {session_id}\n{'='*50}\n"]
    for m in msgs:
        role = "You" if m["role"] == "user" else "MedicalAI"
        lines.append(f"[{m['time']}] {role}:\n{m['text']}\n")

    content = "\n".join(lines)
    return StreamingResponse(
        io.BytesIO(content.encode()),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=MedicalAI_{session_id}.txt"}
    )
