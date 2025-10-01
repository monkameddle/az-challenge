import os, time
import jwt
from fastapi import Response, HTTPException, Depends
from fastapi import Request
from ..schemas import MeOut
from ..db import SessionLocal
from ..models import User
from sqlalchemy import select

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-secret")
JWT_TTL = int(os.getenv("JWT_TTL", "86400"))
COOKIE_NAME = "session"

async def set_csrf_and_session(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME, value=token, httponly=True, secure=True, samesite="Lax", path="/"
    )
    # simple CSRF token = JWT signature (not secret). For demo; replace with random token.
    response.set_cookie(key="csrf_token", value=token.split(".")[-1], httponly=False, secure=True, samesite="Lax", path="/")

async def require_session(request: Request) -> MeOut:
    raw = request.cookies.get(COOKIE_NAME)
    if not raw:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        data = jwt.decode(raw, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session")
    return MeOut(id=data["sub"], username=data["username"], is_admin=data.get("is_admin", False))

async def require_admin(me: MeOut = Depends(require_session)) -> MeOut:
    if not me.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return me

async def login_and_issue_cookie(username: str, password: str, response: Response):
    from ..security.passwords import verify_password
    async with SessionLocal() as s:
        row = (await s.execute(select(User).where(User.username == username))).scalar_one_or_none()
        if not row or not verify_password(password, row.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        now = int(time.time())
        token = jwt.encode({"sub": row.id, "username": row.username, "is_admin": row.is_admin, "iat": now, "exp": now+JWT_TTL}, JWT_SECRET, algorithm="HS256")
        await set_csrf_and_session(response, token)
        return {"ok": True}

async def logout_and_clear_cookie(response: Response):
    response.delete_cookie("session", path="/")
    response.delete_cookie("csrf_token", path="/")
    return {"ok": True}