import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const api = 'http://127.0.0.1:18080/api'
const adminEmail = 'e2e-admin@example.test'
const adminPassword = 'E2eAdminPassword1!'

test('route inconnue, endpoint de diagnostic et export CSV sécurisé', async ({ page, request }) => {
  const login = await request.post(`${api}/auth/login`, {
    headers: { 'X-Forwarded-For': '198.51.100.203' },
    data: { email: adminEmail, motDePasse: adminPassword },
  })
  expect(login.ok()).toBeTruthy()
  const token = (await login.json()).token

  const hostileQuote = await request.post(`${api}/demandes-devis`, {
    data: {
      societe: '=1+1',
      nomContact: '@TEST',
      email: 'csv-security@example.test',
      telephone: '+212600000099',
      produitDemande: 'Copper Rod',
      quantite: 1,
      message: 'Contrôle encodage éèà',
    },
  })
  expect(hostileQuote.ok()).toBeTruthy()

  await page.addInitScript(({ jwt, email }) => {
    sessionStorage.setItem('grod_admin_token', jwt)
    sessionStorage.setItem('grod_admin_profile', JSON.stringify({ email, nomComplet: 'Admin E2E', role: 'ADMIN' }))
  }, { jwt: token, email: adminEmail })
  const demandesLoaded = page.waitForResponse(response => response.url().includes('/api/admin/demandes?') && response.ok())
  await page.goto('/admin/demandes')
  await demandesLoaded
  await expect(page.locator('tr', { hasText: '=1+1' })).toBeVisible()
  const exportButton = page.getByRole('button', { name: 'Exporter Excel' })
  await expect(exportButton).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await exportButton.click()
  const download = await downloadPromise
  const csv = await readFile(await download.path(), 'utf8')
  expect(csv.charCodeAt(0)).toBe(0xfeff)
  expect(csv).toContain("\"'=1+1\"")
  expect(csv).toContain("\"'@TEST\"")
  expect(csv).toContain('Contrôle encodage éèà')

  const diagnostic = await request.get(`${api}/test`)
  expect(diagnostic.ok()).toBeTruthy()

  await page.goto('/ceci-nexiste-pas')
  await expect(page).toHaveURL('/')
  await expect(page.locator('header')).toBeVisible()
})

test('le frontend affiche un message clair sur un 429 login', async ({ page }) => {
  await page.route('**/api/auth/login', route => route.fulfill({
    status: 429,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' }),
  }))
  await page.goto('/admin/login')
  await page.locator('[name="email"]').fill(adminEmail)
  await page.locator('[name="motDePasse"]').fill('incorrect-password')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.locator('.error-text')).toContainText('Trop de tentatives')
})
