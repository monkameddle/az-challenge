import { useEffect, useRef } from 'react'


type Handler = (payload:any)=>void
const handlers = new Map<string, Set<Handler>>()


export function useWS(url: string){
const ref = useRef<WebSocket | null>(null)
useEffect(()=>{
const ws = new WebSocket(url)
ref.current = ws
ws.onmessage = (ev)=>{
const {event, payload} = JSON.parse(ev.data)
handlers.get(event)?.forEach(h=>h(payload))
}
return ()=> ws.close()
}, [url])
return {
on: (event:string, handler:Handler)=>{
if(!handlers.has(event)) handlers.set(event, new Set())
handlers.get(event)!.add(handler)
return ()=> handlers.get(event)!.delete(handler)
}
}
}
