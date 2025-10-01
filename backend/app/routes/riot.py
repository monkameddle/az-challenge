from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from datetime import datetime, timedelta
from ..db import SessionLocal
from ..models import RiotCache
import os, json, httpx

router = APIRouter()

RIOT_KEY = os.getenv("RIOT_API_KEY", "")
CACHE_TTL = int(os.getenv("RIOT_CACHE_TTL_SECONDS", "600"))

REGION_ROUTING = {
    # platform routing → regional routing for match-v5
    'euw1': {'platform': 'euw1', 'regional': 'europe'},
    'eune': {'platform': 'eun1', 'regional': 'europe'},
    'na1':  {'platform': 'na1',  'regional': 'americas'},
    'kr':   {'platform': 'kr',   'regional': 'asia'},
    'jp1':  {'platform': 'jp1',  'regional': 'asia'},
    'oc1':  {'platform': 'oc1',  'regional': 'sea'},
    'br1':  {'platform': 'br1',  'regional': 'americas'},
    'la1':  {'platform': 'la1',  'regional': 'americas'},
    'la2':  {'platform': 'la2',  'regional': 'americas'},
    'ru':   {'platform': 'ru',   'regional': 'europe'},
    'tr1':  {'platform': 'tr1',  'regional': 'europe'},
}

async def _get(url: str):
    headers = {"X-Riot-Token": RIOT_KEY}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, headers=headers)
        if r.status_code == 429:
            # Bubble up a friendly message
            raise HTTPException(429, "Riot rate limit hit. Try again shortly.")
        if r.status_code >= 400:
            raise HTTPException(r.status_code, r.text)
        return r.json()

async def cache_get(key: str):
    async with SessionLocal() as s:
        row = (await s.execute(select(RiotCache).where(RiotCache.key==key))).scalar_one_or_none()
        if row and (not row.expires_at or row.expires_at > datetime.utcnow()):
            try:
                return json.loads(row.value_json)
            except Exception:
                return None
        return None

async def cache_put(key: str, value: dict):
    async with SessionLocal() as s:
        row = (await s.execute(select(RiotCache).where(RiotCache.key==key))).scalar_one_or_none()
        payload = json.dumps(value)
        expires = datetime.utcnow() + timedelta(seconds=CACHE_TTL)
        if row:
            row.value_json = payload
            row.expires_at = expires
        else:
            s.add(RiotCache(key=key, value_json=payload, expires_at=expires))
        await s.commit()

@router.get('/summary')
async def summary(region: str, summoner: str, count: int = 10):
    if not RIOT_KEY:
        raise HTTPException(500, "RIOT_API_KEY not configured")
    reg = region.lower()
    if reg not in REGION_ROUTING:
        raise HTTPException(400, f"Unsupported region: {region}")
    plat = REGION_ROUTING[reg]['platform']
    rr = REGION_ROUTING[reg]['regional']

    # 1) Summoner → PUUID (cache)
    ckey = f"summoner:{plat}:{summoner.lower()}"
    data = await cache_get(ckey)
    if not data:
        data = await _get(f"https://{plat}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner}")
        await cache_put(ckey, data)
    puuid = data.get('puuid')
    if not puuid:
        raise HTTPException(404, "Summoner not found")

    # 2) Recent match IDs (cache)
    mkey = f"matches:{rr}:{puuid}:c{count}"
    mids = await cache_get(mkey)
    if not mids:
        mids = await _get(f"https://{rr}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}")
        await cache_put(mkey, mids)

    # 3) Fetch match details (individual cached)
    matches = []
    for mid in mids:
        dk = f"match:{rr}:{mid}"
        md = await cache_get(dk)
        if not md:
            md = await _get(f"https://{rr}.api.riotgames.com/lol/match/v5/matches/{mid}")
            await cache_put(dk, md)
        matches.append(md)

    # 4) Aggregate per player (K/D/A, W/L, champ progress)
    totals = { 'games': 0, 'wins': 0, 'losses': 0, 'k': 0, 'd': 0, 'a': 0 }
    per_champ: dict[str, dict] = {}

    for m in matches:
        try:
            info = m.get('info', {})
            parts = info.get('participants', [])
            p = next((p for p in parts if p.get('puuid') == puuid), None)
            if not p:
                continue
            totals['games'] += 1
            win = bool(p.get('win'))
            totals['wins'] += 1 if win else 0
            totals['losses'] += 0 if win else 1
            totals['k'] += int(p.get('kills', 0))
            totals['d'] += int(p.get('deaths', 0))
            totals['a'] += int(p.get('assists', 0))
            ckey = str(p.get('championId'))
            pc = per_champ.setdefault(ckey, {'games':0,'wins':0,'k':0,'d':0,'a':0})
            pc['games'] += 1
            pc['wins'] += 1 if win else 0
            pc['k'] += int(p.get('kills',0))
            pc['d'] += int(p.get('deaths',0))
            pc['a'] += int(p.get('assists',0))
        except Exception:
            # ignore malformed matches
            continue

    # 5) Build response
    out_per_champ = []
    for k, v in per_champ.items():
        d = max(1, v['d'])
        out_per_champ.append({
            'championKey': k,
            'games': v['games'],
            'wins': v['wins'],
            'kda': round((v['k'] + v['a']) / d, 2),
        })

    d = max(1, totals['d'])
    kda_total = round((totals['k'] + totals['a']) / d, 2)

    return {
        'region': reg,
        'summoner': summoner,
        'totals': { **totals, 'kda': kda_total },
        'perChampion': sorted(out_per_champ, key=lambda x: x['games'], reverse=True),
        'matches': [ {'id': mid} for mid in mids ],
    }