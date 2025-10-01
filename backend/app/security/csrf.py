from fastapi import Header, HTTPException, Request

async def require_csrf(request: Request, x_csrf: str | None = Header(default=None)):
    cookie = request.cookies.get("csrf_token")
    if not cookie or not x_csrf or cookie != x_csrf:
        raise HTTPException(status_code=403, detail="CSRF validation failed")