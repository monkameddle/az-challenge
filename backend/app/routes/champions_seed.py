from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from ..db import SessionLocal
from ..models import ChampionStatus
from ..security.auth import require_admin
import httpx

router = APIRouter(prefix="/admin/seed", tags=["seed"])

DD_BASE = "https://ddragon.leagueoflegends.com"

async def fetch_json(url: str):
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()

@router.post('/champions')
async def seed_champions(admin=Depends(require_admin)):
    # 1) latest version
    versions = await fetch_json(f"{DD_BASE}/api/versions.json")
    if not versions:
        raise HTTPException(502, "Cannot fetch DDragon versions")
    ver = versions[0]
    # 2) champion.json
    data = await fetch_json(f"{DD_BASE}/cdn/{ver}/data/en_US/champion.json")
    champs = data.get('data', {})
    keys = []
    for cid, c in champs.items():
        key = c.get('key')  # numeric as string, e.g., '266' for Aatrox
        if key: keys.append(key)
    if not keys:
        raise HTTPException(502, "No champions parsed")

    created = 0
    async with SessionLocal() as s:
        existing = (await s.execute(select(ChampionStatus))).scalars().all()
        present = {e.key for e in existing}
        for k in keys:
            if k not in present:
                s.add(ChampionStatus(key=k))
                created += 1
        await s.commit()
    return {"ok": True, "version": ver, "created": created, "total": len(keys)}