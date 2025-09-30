import { useState } from 'react'
import { api } from '../../api/client'


export default function LoginForm(){
const [username,setU]=useState('admin')
const [password,setP]=useState('admin')
const [msg,setMsg]=useState('')
async function onSubmit(e:any){
e.preventDefault()
try{ await api('/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username,password})}); setMsg('ok') }catch(e:any){ setMsg(e.message) }
}
return (
<form className="max-w-sm mx-auto p-4 space-y-2" onSubmit={onSubmit}>
<input className="border p-2 w-full" value={username} onChange={e=>setU(e.target.value)} placeholder="username"/>
<input className="border p-2 w-full" value={password} onChange={e=>setP(e.target.value)} type="password" placeholder="password"/>
<button className="border p-2 w-full" type="submit">Login</button>
<div className="text-sm text-gray-500">{msg}</div>
</form>
)
}
