import {useEffect, useMemo, useState} from 'react'
import {api} from '../../api/client'
import {Card, CardContent, CardHeader, CardTitle, CardFooter} from '../ui/Card'
import {Button} from '../ui/Button'
import {toast} from 'sonner'


type Row = { key: string, done: boolean, excluded: boolean }


export default function ChampionAdmin() {
    const [rows, setRows] = useState<Row[]>([])
    const [filter, setFilter] = useState('')
    const [excludeBulk, setExcludeBulk] = useState('')


    async function load() {
        const list: Row[] = await api('/champions')
        setRows(list)
        const excl = list.filter(x => x.excluded).map(x => x.key).join('\n')
        setExcludeBulk(excl)
    }

    useEffect(() => {
        load()
    }, [])


    const view = useMemo(() => rows.filter(r => r.key.toLowerCase().includes(filter.toLowerCase())), [rows, filter])


    async function toggle(key: string, patch: Partial<Row>) {
        try {
            await api(`/champions/${key}/status`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(patch)
            })
            toast.success('Gespeichert')
            setRows(rs => rs.map(r => r.key === key ? {...r, ...patch} : r))
        } catch (e: any) {
            toast.error(e.message)
        }
    }


    async function saveExcluded() {
        const excluded = excludeBulk.split('\n').map(s=>s.trim()).filter(Boolean)
        try {
            await api('/wheels/champion/config', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({excluded})
            })
            toast.success('Exclude-Liste gespeichert')
// mark locally
            setRows(rs => rs.map(r => ({...r, excluded: excluded.includes(r.key)})))
        } catch (e: any) {
            toast.error(e.message)
        }
    }


    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Card>
                <CardHeader><CardTitle>Champion-Status</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <input className="border p-2 w-full rounded-xl" placeholder="Filter…" value={filter}
                           onChange={e => setFilter(e.target.value)}/>
                    <div className="max-h-[60vh] overflow-auto divide-y">
                        {view.map(r => (
                            <div key={r.key} className="py-2 flex items-center justify-between">
                                <div className="font-mono text-sm">{r.key}</div>
                                <div className="flex gap-2">
                                    <Button variant={r.done ? 'default' : 'outline'}
                                            onClick={() => toggle(r.key, {done: !r.done})}>{r.done ? 'Done ✓' : 'Mark Done'}</Button>
                                    <Button variant={r.excluded ? 'default' : 'outline'}
                                            onClick={() => toggle(r.key, {excluded: !r.excluded})}>{r.excluded ? 'Excluded ✓' : 'Exclude'}</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader><CardTitle>Exclude-Liste (Bulk)</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm opacity-70">Ein Champion pro Zeile. Speichern überschreibt die Flags.</p>
                    <textarea className="border p-2 w-full h-72 rounded-xl font-mono" value={excludeBulk}
                              onChange={e => setExcludeBulk(e.target.value)}/>
                </CardContent>
                <CardFooter>
                    <Button onClick={saveExcluded}>Speichern</Button>
                </CardFooter>
            </Card>
        </div>
    )
}