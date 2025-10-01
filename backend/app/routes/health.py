from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/healthz")
async def healthz():
    """
    Simple healthcheck endpoint for Docker/K8s health monitoring.
    Returns HTTP 200 + JSON {"ok": true}
    """
    return {"ok": True}