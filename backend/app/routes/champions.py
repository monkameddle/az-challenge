from fastapi import APIRouter, Depends
from sqlalchemy import select
from ..db import SessionLocal
from ..models import ChampionStatus
from ..security.auth import require_admin
from ..security.csrf import require_csrf

router = APIRouter()

@router.get('/champions')
async def list_champions():
    async with SessionLocal() as s:
        rows = (await s.execute(select(ChampionStatus))).scalars().all()
        return [{"key": r.key, "done": r.done, "excluded": r.excluded} for r in rows]

@router.patch('/champions/{key}/status', dependencies=[Depends(require_admin), Depends(require_csrf)])
async def patch_status(key: str, body: dict):
    async with SessionLocal() as s:
        row = await s.get(ChampionStatus, key)
        if not row:
            from datetime import datetime
            row = ChampionStatus(key=key)
            s.add(row)
        if "done" in body:
            row.done = bool(body["done"])
        if "excluded" in body:
            row.excluded = bool(body["excluded"])
        await s.commit()
    return {"ok": True}