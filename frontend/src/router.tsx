import {createBrowserRouter} from 'react-router-dom'
import App from './App'
import AdminPanel from './components/Admin/AdminPanel'
import LoginForm from './components/Admin/LoginForm'
import AdminLayout from './components/Admin/AdminLayout'
import ChampionAdmin from './components/Admin/ChampionAdmin'


export const router = createBrowserRouter([
    {path: '/', element: <App/>},
    {path: '/login', element: <LoginForm/>},
    {
        path: '/admin', element: <AdminLayout/>, children: [
            {index: true, element: <AdminPanel/>},
            {path: 'champions', element: <ChampionAdmin/>},
        ]
    },
])