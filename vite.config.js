import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/* In development, serve /api/resume from the same file Vercel runs, so
   `npm run dev` works end to end. Its secrets come from .env.local
   (gitignored) into the server process only — never into the page, since
   they have no VITE_ prefix. Production is untouched: Vercel runs
   api/resume.js itself. */
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), 'RESUME_')
      Object.assign(process.env, env)
      server.middlewares.use('/api/resume', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/resume.js')
        handler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApi()],
})
