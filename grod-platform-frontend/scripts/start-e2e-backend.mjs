import { spawn, spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const backend = resolve('..', 'grod-platform-backend')
const uploads = resolve(backend, 'uploads-e2e')
rmSync(uploads, { recursive: true, force: true })

const isWindows = process.platform === 'win32'
const mavenArguments = [
  '-Dspring-boot.run.profiles=e2e',
  '-Dspring-boot.run.useTestClasspath=true',
  'spring-boot:run',
]
const command = isWindows ? 'cmd.exe' : './mvnw'
const commandArguments = isWindows ? ['/d', '/s', '/c', 'mvnw.cmd', ...mavenArguments] : mavenArguments
const child = spawn(command, commandArguments, {
  cwd: backend,
  stdio: 'inherit',
  env: {
    ...process.env,
    SERVER_PORT: process.env.E2E_BACKEND_PORT || '18080',
    ADMIN_EMAIL: 'e2e-admin@example.test',
    ADMIN_INITIAL_PASSWORD: 'E2eAdminPassword1!',
    ADMIN_NAME: 'Admin E2E',
    JWT_SECRET: 'e2e-only-jwt-secret-with-at-least-32-characters',
    UPLOAD_DIR: uploads,
    FRONTEND_URL: 'http://127.0.0.1:15173',
    EMAIL_NOTIFICATIONS_ENABLED: 'false',
    SMS_NOTIFICATIONS_ENABLED: 'false',
    UPLOAD_CLEANUP_ENABLED: 'false',
    SWAGGER_ENABLED: 'false',
    SPRING_DATASOURCE_URL: `jdbc:h2:mem:grod_e2e_${Date.now()};DB_CLOSE_DELAY=-1;MODE=MySQL`,
    FLYWAY_TEXT_LOB_TYPE: 'CLOB',
    SPRING_DEVTOOLS_RESTART_ENABLED: 'false',
  },
})

let stopping = false
const stop = () => {
  if (stopping) return
  stopping = true
  if (isWindows && child.pid) {
    spawnSync('taskkill.exe', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
}
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
child.on('exit', (code) => process.exit(code ?? 0))
