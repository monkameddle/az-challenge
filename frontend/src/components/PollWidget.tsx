import {useEffect, useState} from 'react'
import {api} from '../api/client'
import {useWS} from '../hooks/useWS'
import {Card, CardHeader, CardTitle, CardContent} from './ui/Card'
import {Button} from './ui/Button'
import {toast} from 'sonner'
import {motion, AnimatePresence} from 'framer-motion'
import {fadeInUp} from '../lib/motion'


export default function PollWidget() {
    const [poll, setPoll] = useState<{ id: number, title: string, options: string[], counts: number[] }>({
        id: 0,
        title: '',
        options: [],
        counts: []
    })
    const ws = useWS(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`)


    async function load() {
        setPoll(await api('/polls/active'))
    }

    useEffect(() => {
        load()
    }, [])


    useEffect(() => {
        const off = ws.on('poll_started', ({ poll }: any) =>
            setPoll({
                id: poll.id,
                title: poll.title,
                options: poll.options,
                counts: new Array(poll.options.length).fill(0),
            })
        )
        return () => off() // jetzt korrekt: () => void
    }, [ws])

    useEffect(() => {
        const off = ws.on('poll_vote', ({ optionIndex }: any) =>
            setPoll(p => ({
                ...p,
                counts: p.counts.map((c, i) => (i === optionIndex ? c + 1 : c)),
            }))
        )
        return () => off()
    }, [ws])

    useEffect(() => {
        const off = ws.on('poll_stopped', () => load())
        return () => off()
    }, [ws, load])


    async function vote(i: number) {
        if (!poll.id) return
        try {
            await api(`/polls/${poll.id}/vote`, {
                method: 'POST',
                body: JSON.stringify({optionIndex: i}),
                headers: {'Content-Type': 'application/json'}
            })
        } catch (e: any) {
            toast.error(e.message || 'Vote error')
        }
    }


    if (!poll.id) return null
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">{poll.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    <AnimatePresence>
                        {poll.options.map((opt, i) => (
                            <motion.li key={i} {...fadeInUp}>
                                <Button variant="outline" className="w-full justify-between" onClick={() => vote(i)}>
                                    <span>{opt}</span>
                                    <span className="text-sm opacity-70">{poll.counts[i] || 0}</span>
                                </Button>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </CardContent>
        </Card>
    )
}