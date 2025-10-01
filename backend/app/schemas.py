from pydantic import BaseModel, Field
from typing import List, Optional

class MeOut(BaseModel):
    id: int
    username: str
    is_admin: bool

class LoginIn(BaseModel):
    username: str
    password: str

class PollStartIn(BaseModel):
    title: str
    options: List[str]

class PollOut(BaseModel):
    id: int
    title: str
    options: list[str]
    counts: list[int]

class VoteIn(BaseModel):
    optionIndex: int = Field(ge=0)

class WheelConfigIn(BaseModel):
    excluded: list[str]

class CustomWheelStartIn(BaseModel):
    title: str
    optionsText: str

class WheelActiveOut(BaseModel):
    id: int
    title: str
    type: str
    options: list[dict]

class LogIn(BaseModel):
    champion_key: str
    result: str
    k: int
    d: int
    a: int
    vod_url: Optional[str] = None
    clip_url: Optional[str] = None
    notes: Optional[str] = None