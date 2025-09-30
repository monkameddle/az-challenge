from fastapi import APIRouter, Depends, Response
from ..schemas import LoginIn, MeOut
from ..security.auth import login_and_issue_cookie, logout_and_clear_cookie, require_session


router = APIRouter()


@router.post('/login')
async def login(body: LoginIn, response: Response):
return await login_and_issue_cookie(body.username, body.password, response)


@router.post('/logout')
async def logout(response: Response):
return await logout_and_clear_cookie(response)


@router.get('/me', response_model=MeOut)
async def me(me: MeOut = Depends(require_session)):
return me
