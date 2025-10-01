import {useEffect, useState} from 'react'
import {api} from '../api/client'
import {Card, CardContent, CardHeader, CardTitle} from './ui/Card'
import {Badge} from './ui/Badge'
import {opggProfile, uggProfile} from '../lib/links'


export default function RiotSummary({region, summoner}: { region: string, summoner: string }) {
    const [data, setData] = useState<any>(null)
    const [err, setErr] = useState('')
    useEffect(() => {
        (async () => {
            try {
                setData(await api(`/riot/summary?region=${region}&summoner=${encodeURIComponent(summoner)}`))
            } catch (e: any) {
                setErr(e.message)
            }
        })()
    }, [region, summoner])
    if (err) return <div className="text-red-600">{err}</div>
    if (!data) return <div>Lade Riot‑Summary…</div>
    return (
        <Card>
            <CardHeader>
                <CardTitle>Riot Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <a className="underline" href={opggProfile(data.region, data.summoner)} target="_blank">OP.GG</a>
                    <a className="underline" href={uggProfile(data.region, data.summoner)} target="_blank">U.GG</a>
                    <Badge>Games: {data.totals.games}</Badge>
                    <Badge>W/L: {data.totals.wins}/{data.totals.losses}</Badge>
                    <Badge>KDA: {data.totals.kda}</Badge>
                </div>
                <div className="divide-y">
                    {data.perChampion.slice(0, 10).map((c: any) => (
                        <div key={c.championKey} className="py-2 flex items-center justify-between text-sm">
                            <div className="font-mono">{c.championKey}</div>
                            <div className="flex gap-3 opacity-80">
                                <span>{c.games} g</span>
                                <span>{c.wins} w</span>
                                <span>KDA {c.kda}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}