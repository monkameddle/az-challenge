from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
import os

DB_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:////data/app.db")

# ensure parent dir exists for SQLite file paths
if DB_URL.startswith("sqlite"):
    try:
        # naive extract: after ':///' grab path; both 3 or 4 slashes work here
        path = DB_URL.split(":///")[-1]
        # if it still has a leading '/', it's absolute
        dirpath = os.path.dirname(path if not path.startswith("/") else path)
        if dirpath:
            os.makedirs(dirpath, exist_ok=True)
    except Exception:
        pass

engine = create_async_engine(DB_URL, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def init_db():
    from . import models  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
