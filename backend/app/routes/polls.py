from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from ..db import SessionLocal
from ..models import Poll, Vote
from ..schemas import PollStartIn, PollOut, VoteIn
from ..security.auth import require_admin
from ..security.csrf import require_csrf
from ..utils.ip import client_ip, ip_hash
from ..ws import manager
import json


router = APIRouter()


@router.post('/start', dependencies=[Depends(require_admin), Depends(require_csrf)])
async def start_poll(body: PollStartIn, request: Request):
async with SessionLocal() as s:
p = Poll(title=body.title, options_json=json.dumps(body.options), active=True)
s.add(p)
await s.commit()
await s.refresh(p)
await manager.broadcast('poll_started', {"poll": {"id": p.id, "title": p.title, "options": body.options}})
return {"id": p.id}


@router.post('/stop', dependencies=[Depends(require_admin), Depends(require_csrf)])
async def stop_poll():
async with SessionLocal() as s:
row = (await s.execute(select(Poll).where(Poll.active == True).order_by(Poll.id.desc()))).scalar_one_or_none()
if not row:
raise HTTPException(404, "No active poll")
row.active = False
await s.commit()
await manager.broadcast('poll_stopped', {})
return {"ok": True}


@router.get('/active', response_model=PollOut)
async def active_poll():
async with SessionLocal() as s:
p = (await s.execute(select(Poll).where(Poll.active == True).order_by(Poll.id.desc()))).scalar_one_or_none()
if not p:
return {"id": 0, "title": "", "options": [], "counts": []}
options = json.loads(p.options_json)
counts = [0]*len(options)
rows = (await s.execute(select(Vote.option_index, func.count()).where(Vote.poll_id==p.id).group_by(Vote.option_index))).all()
for idx, cnt in rows:
if 0 <= idx < len(counts):
counts[idx] = cnt
return {"id": p.id, "title": p.title, "options": options, "counts": counts}


@router.post('/{poll_id}/vote', dependencies=[Depends(require_csrf)])
async def vote(poll_id: int, body: VoteIn, request: Request):
ip = client_ip(request)
ih = ip_hash(ip)
async with SessionLocal() as s:
p = (await s.execute(select(Poll).where(Poll.id == poll_id, Poll.active == True))).scalar_one_or_none()
if not p:
raise HTTPException(404, "Poll not found or inactive")
# enforce 1 vote per ip via unique constraint
v = Vote(poll_id=p.id, ip_hash=ih, option_index=body.optionIndex)
s.add(v)
try:
await s.commit()
except Exception:
raise HTTPException(429, "Already voted from this IP")
await manager.broadcast('poll_vote', {"pollId": poll_id, "optionIndex": body.optionIndex})
return {"ok": True}
