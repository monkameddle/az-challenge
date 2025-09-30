from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from ..db import SessionLocal
from ..models import LogEntry
from ..schemas import LogIn
from ..security.auth import require_admin
from ..security.csrf import require_csrf


router = APIRouter()


@router.get('/progress')
async def progress():
async with SessionLocal() as s:
total = (await s.execute(select(func.count(LogEntry.id)))).scalar_one()
wl = (await s.execute(select(LogEntry.result, func.count()).group_by(LogEntry.result))).all()
w = sum(c for r,c in wl if r=='W')
l = sum(c for r,c in wl if r=='L')
kda = (await s.execute(select(func.sum(LogEntry.k), func.sum(LogEntry.d), func.sum(LogEntry.a)))).one()
k, d, a = [x or 0 for x in kda]
return {"games": total, "wins": w, "losses": l, "k": k, "d": d, "a": a}


@router.post('/logs', dependencies=[Depends(require_admin), Depends(require_csrf)])
async def create_log(body: LogIn):
async with SessionLocal() as s:
row = LogEntry(**body.model_dict())
s.add(row)
await s.commit()
await s.refresh(row)
return {"id": row.id}
