import {useState} from 'react'
import {api} from '../../api/client'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '../ui/Card'
import {Button} from '../ui/Button'
import {toast} from 'sonner'


export default function WheelAdmin() {
    const [customTitle, setTitle] = useState('Custom Wheel')
    const [optionsText, setOptions] = useState('[10] ARAM build\n[3] No wards\n[1] Off - meta pick')
    const [lastResult, setLast] = useState('')


    async function seedChampions() {
        try {
            const res = await api('/admin/seed/champions', {method: 'POST'});
            toast.success(`Seed ok (created ${res.created})`)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    async function rollChampion() {
        try {
            const res = await api('/wheels/champion/roll', {method: 'POST'});
            setLast(res.result);
            toast.success(`Champion: ${res.result}`)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    async function startCustom() {
        try {
            await api('/wheels/custom/start', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({title: customTitle, optionsText})
            });
            toast.success('Custom wheel gestartet')
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    async function rollCustom() {
        try {
            const res = await api('/wheels/custom/roll', {method: 'POST'});
            setLast(res.result);
            toast.success(`Custom: ${res.result}`)
        } catch (e: any) {
            toast.error(e.message)
        }
    }


    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Card>
                <CardHeader><CardTitle>Champion Wheel</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm opacity-70">Pool basiert auf DDragon‑Keys minus done/excluded.</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button variant="outline" onClick={seedChampions}>DDragon seeden</Button>
                    <Button onClick={rollChampion}>Champion rollen</Button>
                </CardFooter>
            </Card>


            <Card>
                <CardHeader><CardTitle>Custom Wheel</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <input className="border p-2 w-full rounded-xl" value={customTitle}
                           onChange={e => setTitle(e.target.value)}/>
                    <textarea className="border p-2 w-full h-40 rounded-xl font-mono" value={optionsText}
                              onChange={e => setOptions(e.target.value)}/>
                    <p className="text-xs opacity-60">Syntax: <code>[1] Option</code> → Gewicht 1, sonst Standard 5.</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={startCustom}>Start</Button>
                    <Button variant="outline" onClick={rollCustom}>Roll</Button>
                </CardFooter>
            </Card>


            {lastResult && (
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>Letztes Ergebnis</CardTitle></CardHeader>
                    <CardContent>{lastResult}</CardContent>
                </Card>
            )}
        </div>
    )
}