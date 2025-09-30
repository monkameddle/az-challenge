from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
row = ChampionStatus(key=key, excluded=True)
s.add(row)
else:
row.excluded = True
await s.commit()
return {"excluded": excluded}


@router.get('/champion/options')
async def champion_options():
async with SessionLocal() as s:
rows = (await s.execute(select(ChampionStatus))).scalars().all()
done = {r.key for r in rows if r.done}
excluded = {r.key for r in rows if r.excluded}
# NOTE: In a real app, load champion list from DDragon. Here expect keys pre-seeded.
all_keys = {r.key for r in rows} or set()
pool = sorted(list(all_keys - done - excluded))
return {"options": pool}


@router.post('/champion/roll', dependencies=[Depends(require_admin), Depends(require_csrf)])
async def champion_roll():
async with SessionLocal() as s:
rows = (await s.execute(select(ChampionStatus))).scalars().all()
pool = [r.key for r in rows if not r.done and not r.excluded]
if not pool:
raise HTTPException(400, "No champions available")
result = random.choice(pool)
payload = {"wheelId": 0, "result": result, "meta": {"wheelType": "champion"}}
await manager.broadcast('wheel_rolled', payload)
return payload


# Custom wheel
@router.post('/custom/start', dependencies=[Depends(require_admin), Depends(require_csrf)])
async def custom_start(body: dict):
title = body.get("title", "Custom Wheel")
options_text = body.get("optionsText", "")
lines = [l.strip() for l in options_text.splitlines() if l.strip()]
opts = []
for l in lines:
if l.startswith('[') and '] ' in l:
try:
w = int(l[1:l.index(']')])
except Exception:
w = 5
t = l[l.index(']')+2:]
opts.append({"text": t, "weight": max(1, w)})
else:
opts.append({"text": l, "weight": 5})
async with SessionLocal() as s:
w = Wheel(title=title, type="custom", active=True, meta_json=json.dumps({"options": opts}))
s.add(w)
await s.commit()
await s.refresh(w)
await manager.broadcast('wheel_started', {"id": w.id, "title": w.title, "type": w.type})
return {"id": w.id}


@router.get('/custom/active')
async def custom_active():
async with SessionLocal() as s:
w = (await s.execute(select(Wheel).where(Wheel.type=="custom", Wheel.active==True).order_by(Wheel.id.desc()))).scalar_one_or_none()
if not w:
return {"id": 0, "title": "", "type": "custom", "options": []}
meta = json.loads(w.meta_json)
return {"id": w.id, "title": w.title, "type": w.type, "options": meta.get("options", [])}


@router.post('/custom/roll', dependencies=[Depends(require_admin), Depends(require_csrf)])
async def custom_roll():
async with SessionLocal() as s:
w = (await s.execute(select(Wheel).where(Wheel.type=="custom", Wheel.active==True).order_by(Wheel.id.desc()))).scalar_one_or_none()
if not w:
raise HTTPException(404, "No active custom wheel")
opts = json.loads(w.meta_json).get("options", [])
pool = []
for o in opts:
pool.extend([o["text"]]*int(o.get("weight",5)))
if not pool:
raise HTTPException(400, "No options")
result = random.choice(pool)
payload = {"wheelId": w.id, "result": result, "meta": {"wheelType": "custom"}}
await manager.broadcast('wheel_rolled', payload)
return payload
