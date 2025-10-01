from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .db import init_db
from .routes import auth, polls, wheels, riot, logs, champions
from .ws import manager

app = FastAPI(title="LoL A–Z Backend")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "https://yourdomain"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(SessionMiddleware, secret_key="change-me-session")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(polls.router, prefix="/polls", tags=["polls"])
app.include_router(wheels.router, tags=["wheels"])
app.include_router(riot.router, prefix="/riot", tags=["riot"])
app.include_router(logs.router, tags=["logs"])
app.include_router(champions.router, tags=["champions"])

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