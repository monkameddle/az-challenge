import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import AdminPanel from './components/Admin/AdminPanel'
import LoginForm from './components/Admin/LoginForm'


export const router = createBrowserRouter([
{ path: '/', element: <App /> },
{ path: '/login', element: <LoginForm /> },
{ path: '/admin', element: <AdminPanel /> },
])
