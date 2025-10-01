import {useEffect, useState} from 'react'
import {useWS} from '../hooks/useWS'
import {Card, CardHeader, CardTitle, CardContent} from './ui/Card'
import {motion} from 'framer-motion'
import {pop} from '../lib/motion'


export default function WheelWidget() {
    const [result, setResult] = useState<string>('')
    const ws = useWS(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`)
    useEffect(() => {
        const off = ws.on('wheel_rolled', (p: any) => setResult(p.result))
        return () => off()         // wichtig: () => void zurückgeben
    }, [ws])

    return (
        <Card>
            <CardHeader><CardTitle>Wheel</CardTitle></CardHeader>
            <CardContent>
                {result ? (
                    <motion.div {...pop} className="text-2xl font-semibold">
                        Result: <span className="font-bold">{result}</span>
                    </motion.div>
                ) : <div className="opacity-60">Warte auf Ergebnis…</div>}
            </CardContent>
        </Card>
    )
}