import { defineConfig, devices } from '@playwright/test'

const backendPort = 18080
const frontendPort = 15173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node scripts/start-e2e-backend.mjs',
      url: `http://127.0.0.1:${backendPort}/api/produits/actifs`,
      timeout: 180_000,
      reuseExistingServer: false,
      env: { ...process.env, E2E_BACKEND_PORT: String(backendPort) },
    },
    {
      command: 'node scripts/start-e2e-frontend.mjs',
      url: `http://127.0.0.1:${frontendPort}`,
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
})
