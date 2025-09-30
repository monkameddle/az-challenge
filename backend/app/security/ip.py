import hashlib, hmac, os
from fastapi import Request


SECRET = os.getenv("IP_HASH_SECRET", "change-me-ip-secret")


def client_ip(request: Request) -> str:
return (
request.headers.get("CF-Connecting-IP")
or request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
or request.client.host
)


def ip_hash(ip: str) -> str:
return hmac.new(SECRET.encode(), ip.encode(), hashlib.sha256).hexdigest()
