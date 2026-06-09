from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3, hashlib
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = "users.db"

def init():
    conn = sqlite3.connect(DB)
    conn.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, email TEXT UNIQUE, password TEXT)""")
    conn.commit()
    conn.close()

init()

def hash_pw(pw): return hashlib.sha256(pw.encode()).hexdigest()

class Register(BaseModel):
    name: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

@app.post("/auth/register")
def register(r: Register):
    try:
        conn = sqlite3.connect(DB)
        conn.execute("INSERT INTO users (name,email,password) VALUES (?,?,?)",
                     (r.name, r.email, hash_pw(r.password)))
        conn.commit()
        conn.close()
        return {"message": "Registered successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Email already exists")

@app.post("/auth/login")
def login(r: Login):
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM users WHERE email=? AND password=?",
                        (r.email, hash_pw(r.password))).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return {"token": "tok_"+str(user["id"]), "name": user["name"],
            "email": user["email"], "uid": user["id"]}

@app.post("/auth/logout")
def logout():
    return {"message": "Logged out"}
