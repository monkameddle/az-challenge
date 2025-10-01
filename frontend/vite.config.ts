import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_ORIGIN = process.env.VITE_BACKEND_ORIGIN || 'http://backend:8000'
const BACKEND_WS     = process.env.VITE_BACKEND_WS     || 'ws://backend:8000'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: BACKEND_ORIGIN,
                changeOrigin: true,
            },
            '/ws': {
                target: BACKEND_WS,
                ws: true,
                changeOrigin: true,
            },
        },
        host: true,
    },
})
