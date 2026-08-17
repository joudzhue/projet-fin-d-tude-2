import { createServer } from 'vite'

process.env.VITE_API_URL = 'http://127.0.0.1:18080/api'

const server = await createServer({
  server: { host: '127.0.0.1', port: 15173, strictPort: true },
})
await server.listen()

const stop = async () => {
  await server.close()
  process.exit(0)
}
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
