import {useEffect, useState} from 'react'
import {api} from '../api/client'


export function useMe() {
    const [me, setMe] = useState<{ id: number, username: string, is_admin: boolean } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    useEffect(() => {
        (async () => {
            try {
                setMe(await api('/auth/me'));
            } catch (e: any) {
                setError(e.message || '')
            } finally {
                setLoading(false)
            }
        })()
    }, [])
    return {me, loading, error}
}