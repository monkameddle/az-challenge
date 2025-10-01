import {useState} from 'react'
import {api} from '../../api/client'
import PollWidget from '../PollWidget'
import WheelWidget from '../WheelWidget'
import WheelAdmin from './WheelAdmin'
import {Card, CardContent, CardHeader, CardTitle, CardFooter} from '../ui/Card'
import {Button} from '../ui/Button'
import {toast} from 'sonner'


export default function AdminPanel() {
    const [title, setT] = useState('Which lane?')
    const [options, setO] = useState('Top\nJungle\nMid\nADC\nSupport')


    async function startPoll() {
        try {
            const opts = options.split('\n').map(s=>s.trim()).filter(Boolean)
            await api('/polls/start', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title, options:opts})})
            toast.success('Poll gestartet')
        } catch (e: any) {
            toast.error(e.message || 'Fehler beim Starten')
        }
    }

    async function stopPoll() {
        try {
            await api('/polls/stop', {method: 'POST'});
            toast('Poll gestoppt')
        } catch (e: any) {
            toast.error(e.message)
        }
    }


    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Polls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <input className="border p-2 w-full rounded-xl" value={title} onChange={e => setT(e.target.value)}/>
                    <textarea className="border p-2 w-full h-32 rounded-xl" value={options}
                              onChange={e => setO(e.target.value)}/>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={startPoll}>Start Poll</Button>
                    <Button variant="outline" onClick={stopPoll}>Stop Poll</Button>
                </CardFooter>
            </Card>


            <div className="grid md:grid-cols-2 gap-4">
                <PollWidget/>
                <WheelWidget/>
            </div>

            <WheelAdmin/>
        </div>
    )
}