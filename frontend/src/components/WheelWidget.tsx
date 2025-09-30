import { useEffect, useState } from 'react'
import { useWS } from '../hooks/useWS'


export default function WheelWidget(){
const [result, setResult] = useState<string>('')
const ws = useWS(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws`)
useEffect(()=> ws.on('wheel_rolled', (p:any)=> setResult(p.result)), [])
return (
<div className="p-4 rounded-2xl shadow">
<h3 className="font-bold text-xl mb-2">Wheel</h3>
<div>Result: <b>{result}</b></div>
</div>
)
}
