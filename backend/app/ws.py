from typing import Set
from fastapi import WebSocket
import json


class WSManager:
def __init__(self):
self.active: Set[WebSocket] = set()


async def connect(self, ws: WebSocket):
await ws.accept()
self.active.add(ws)


async def disconnect(self, ws: WebSocket):
self.active.discard(ws)


async def broadcast(self, event: str, payload: dict):
data = json.dumps({"event": event, "payload": payload})
dead = []
for ws in list(self.active):
try:
await ws.send_text(data)
except Exception:
dead.append(ws)
for d in dead:
self.active.discard(d)


manager = WSManager()
