import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useWS } from '../hooks/useWS'


export default function PollWidget(){
const [poll, setPoll] = useState<{id:number,title:string,options:string[],counts:number[]}>({id:0,title:'',options:[],counts:[]})
const ws = useWS(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws`)


async function load(){ setPoll(await api('/polls/active')) }
useEffect(()=>{ load() }, [])


useEffect(()=>{
return ws.on('poll_started', ({poll}:any)=> setPoll({id:poll.id,title:poll.title,options:poll.options,counts:new Array(poll.options.length).fill(0)}))
}, [])
useEffect(()=>{ return ws.on('poll_vote', ({optionIndex}:any)=> setPoll(p=> ({...p, counts: p.counts.map((c,i)=> i===optionIndex? c+1 : c)}))) }, [])
useEffect(()=>{ return ws.on('poll_stopped', ()=> load()) }, [])


async function vote(i:number){
if(!poll.id) return
await api(`/polls/${poll.id}/vote`, {method:'POST', body: JSON.stringify({optionIndex:i}), headers:{'Content-Type':'application/json'}})
}


if(!poll.id) return null
return (
<div className="p-4 rounded-2xl shadow">
<h3 className="font-bold text-xl mb-2">{poll.title}</h3>
<ul className="space-y-2">
{poll.options.map((opt,i)=> (
<li key={i}>
<button className="w-full border rounded p-2" onClick={()=>vote(i)}>
{opt} — {poll.counts[i]||0}
</button>
</li>
))}
</ul>
</div>
)
}
