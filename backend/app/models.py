from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from .db import Base


class User(Base):
__tablename__ = "user"
id: Mapped[int] = mapped_column(Integer, primary_key=True)
username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
password_hash: Mapped[str] = mapped_column(String(255))
is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Poll(Base):
__tablename__ = "poll"
id: Mapped[int] = mapped_column(Integer, primary_key=True)
title: Mapped[str] = mapped_column(String(200))
options_json: Mapped[str] = mapped_column(Text)
active: Mapped[bool] = mapped_column(Boolean, default=True)
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("user.id"), nullable=True)


class Vote(Base):
__tablename__ = "vote"
id: Mapped[int] = mapped_column(Integer, primary_key=True)
poll_id: Mapped[int] = mapped_column(Integer, ForeignKey("poll.id"))
ip_hash: Mapped[str] = mapped_column(String(64))
option_index: Mapped[int] = mapped_column(Integer)
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
__table_args__ = (UniqueConstraint("poll_id", "ip_hash", name="uq_vote_poll_ip"),)


class Wheel(Base):
__tablename__ = "wheel"
id: Mapped[int] = mapped_column(Integer, primary_key=True)
title: Mapped[str] = mapped_column(String(200))
type: Mapped[str] = mapped_column(String(20)) # champion|custom
active: Mapped[bool] = mapped_column(Boolean, default=True)
meta_json: Mapped[str] = mapped_column(Text, default="{}")
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("user.id"), nullable=True)


class RiotCache(Base):
__tablename__ = "riot_cache"
id: Mapped[int] = mapped_column(Integer, primary_key=True)
key: Mapped[str] = mapped_column(String(200), unique=True, index=True)
value_json: Mapped[str] = mapped_column(Text)
expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class ChampionStatus(Base):
__tablename__ = "champion_status"
key: Mapped[str] = mapped_column(String(30), primary_key=True)
done: Mapped[bool] = mapped_column(Boolean, default=False)
excluded: Mapped[bool] = mapped_column(Boolean, default=False)
updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class LogEntry(Base):
__tablename__ = "log_entry"
id: Mapped[int] = mapped_column(Integer, primary_key=True)
champion_key: Mapped[str] = mapped_column(String(30))
result: Mapped[str] = mapped_column(String(1)) # W or L
k: Mapped[int] = mapped_column(Integer)
d: Mapped[int] = mapped_column(Integer)
a: Mapped[int] = mapped_column(Integer)
vod_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
clip_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
notes: Mapped[str | None] = mapped_column(Text, nullable=True)
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
