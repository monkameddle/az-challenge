import React from 'react'
import {createRoot} from 'react-dom/client'
import {RouterProvider} from 'react-router-dom'
import {Toaster} from './components/ui/Toaster'
import './styles/index.css'
import {router} from './router'


createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
        <Toaster/>
    </React.StrictMode>
)
