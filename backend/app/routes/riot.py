from fastapi import APIRouter


router = APIRouter()


@router.get('/summary')
async def summary(region: str, summoner: str):
# Placeholder to keep the route shape; integrate Riot API + cache later.
return {"region": region, "summoner": summoner, "matches": [], "note": "Implement Riot API + SQLite cache"}
