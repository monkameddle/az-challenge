import {useEffect, useState} from 'react'
import {api} from '../api/client'
import {Badge} from './ui/Badge'


export default function ProgressHeader() {
    const [stats, setStats] = useState<{
        games: number,
        wins: number,
        losses: number,
        k: number,
        d: number,
        a: number
    } | null>(null)
    const [done, setDone] = useState<number>(0)
    const [total, setTotal] = useState<number>(0)
    useEffect(() => {
        (async () => {
            const s = await api('/progress')
            setStats(s)
            const champs = await api('/champions')
            setDone(champs.filter((c: any) => c.done).length)
            setTotal(champs.length)
        })()
    }, [])
    const kda = stats ? ((stats.k + stats.a) / Math.max(1, stats.d)).toFixed(2) : '—'
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Badge>Progress: {done}/{total}</Badge>
            <Badge>Games: {stats?.games ?? 0}</Badge>
            <Badge>W/L: {stats ? `${stats.wins}/${stats.losses}` : '—'}</Badge>
            <Badge>KDA: {kda}</Badge>
        </div>
    )
}