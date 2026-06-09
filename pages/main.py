from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import auth, chat

app = FastAPI(title="MedicalAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth.router, prefix="/auth")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def root():
    return {"status": "MedicalAI backend running"}
