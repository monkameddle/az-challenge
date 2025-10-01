import {NavLink, Outlet, useNavigate} from 'react-router-dom'
import {useEffect} from 'react'
import {useMe} from '../../hooks/useMe'
import {Button} from '../ui/Button'
import {Card} from '../ui/Card'


export default function AdminLayout() {
    const {me, loading} = useMe()
    const nav = useNavigate()
    useEffect(() => {
        if (!loading && !me) nav('/login')
    }, [loading, me])
    if (loading) return <div className="p-8">Loading…</div>
    return (
        <div className="max-w-6xl mx-auto p-4 space-y-4">
            <Card className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-semibold">Admin</span>
                    <nav className="flex gap-2">
                        <NavLink to="/admin" className={({isActive}) => isActive ? 'underline' : ''}>Dashboard</NavLink>
                        <NavLink to="/admin/champions"
                                 className={({isActive}) => isActive ? 'underline' : ''}>Champions</NavLink>
                    </nav>
                </div>
                <form action="/api/auth/logout" method="post">
                    <Button asChild variant="outline">
                        <button type="submit">Logout</button>
                    </Button>
                </form>
            </Card>
            <Outlet/>
        </div>
    )
}