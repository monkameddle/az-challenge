import { useState } from 'react'
import { api } from '../../api/client'
import PollWidget from '../PollWidget'
import WheelWidget from '../WheelWidget'


export default function AdminPanel(){
const [title,setT]=useState('Which lane?')
const [options,setO]=useState('Top\nJungle\nMid\nADC\nSupport')


async function startPoll(){
const opts = options.split('\n').map(s=>s.trim()).filter(Boolean)
await api('/polls/start', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title, options:opts})})
}
async function stopPoll(){ await api('/polls/stop', {method:'POST'}) }


return (
<div className="max-w-2xl mx-auto p-4 space-y-4">
<h2 className="text-2xl font-bold">Admin</h2>
<div className="space-y-2">
<input className="border p-2 w-full" value={title} onChange={e=>setT(e.target.value)} />
<textarea className="border p-2 w-full h-32" value={options} onChange={e=>setO(e.target.value)} />
<div className="flex gap-2">
<button className="border px-4 py-2" onClick={startPoll}>Start Poll</button>
<button className="border px-4 py-2" onClick={stopPoll}>Stop Poll</button>
</div>
</div>
<PollWidget />
<WheelWidget />
</div>
)
}
