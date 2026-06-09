import hashlib
import hmac
import time
import base64
import json
import os

SECRET = os.environ.get("JWT_SECRET", "medicalai-secret-key-change-in-production")

# ── Password hashing ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hmac.new(salt.encode(), password.encode(), hashlib.sha256).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hashed = stored.split(":")
        return hmac.compare_digest(
            hmac.new(salt.encode(), password.encode(), hashlib.sha256).hexdigest(),
            hashed
        )
    except Exception:
        return False

# ── Simple JWT (no external library needed) ───────────────────────────────────

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def create_token(user_id: int, email: str, name: str) -> str:
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = _b64(json.dumps({
        "uid": user_id,
        "email": email,
        "name": name,
        "exp": int(time.time()) + 60 * 60 * 24  # 24 hours
    }).encode())
    sig = _b64(hmac.new(SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
    return f"{header}.{payload}.{sig}"

def decode_token(token: str) -> dict:
    try:
        header, payload, sig = token.split(".")
        expected = _b64(hmac.new(SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            raise ValueError("Invalid signature")
        data = json.loads(base64.urlsafe_b64decode(payload + "=="))
        if data["exp"] < time.time():
            raise ValueError("Token expired")
        return data
    except Exception as e:
        raise ValueError(f"Invalid token: {e}")
