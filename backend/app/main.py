import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .db import init_db
from .routes import auth, polls, wheels, riot, logs, champions, health
from .ws import manager

app = FastAPI(title="LoL A–Z Backend")

SESSION_SECRET = os.getenv("SESSION_SECRET", "dev-secret")
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)

DOMAIN = os.getenv("DOMAIN", "").strip()
VITE_URL = os.getenv("VITE_URL", "").strip()

origins = {"http://localhost:5173"}

def add_origin(url: str):
    if not url:
        return
    if url.startswith("http://") or url.startswith("https://"):
        origins.add(url)
    else:
        origins.add(f"https://{url}")
        origins.add(f"http://{url}")

add_origin(DOMAIN)
add_origin(VITE_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api = APIRouter(prefix="/api")
api.include_router(auth.router, prefix="/auth", tags=["auth"])
api.include_router(polls.router, prefix="/polls", tags=["polls"])
api.include_router(wheels.router, prefix="", tags=["wheels"])
api.include_router(riot.router, prefix="/riot", tags=["riot"])
api.include_router(logs.router, prefix="", tags=["logs"])
api.include_router(champions.router, prefix="", tags=["champions"])
api.include_router(health.router, prefix="")


app.include_router(api)

@app.on_event("startup")
async def _startup():
    await init_db()

@app.websocket('/ws')
async def ws_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(ws)