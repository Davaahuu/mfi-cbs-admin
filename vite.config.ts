import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // The browser calls /api on this dev server, which forwards to the CBS backend. Same origin
      // for the browser, so the backend needs no CORS configuration during development.
      proxy: {
        '/api': {
          target: env.CBS_API_URL ?? 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
