from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import get_conn
from auth_utils import hash_password, verify_password, create_token

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    if not req.name or not req.email or not req.password:
        raise HTTPException(status_code=400, detail="All fields are required.")
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")

    conn = get_conn()
    c = conn.cursor()

    # Check if email already exists
    existing = c.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed = hash_password(req.password)
    c.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        (req.name, req.email, hashed)
    )
    conn.commit()
    conn.close()

    return {"message": "Registered successfully. Please sign in."}


@router.post("/login")
def login(req: LoginRequest):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password required.")

    conn = get_conn()
    c = conn.cursor()
    user = c.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()

    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_token(user["id"], user["email"], user["name"])

    return {
        "token": token,
        "name": user["name"],
        "email": user["email"],
        "uid": user["id"]
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out."}
