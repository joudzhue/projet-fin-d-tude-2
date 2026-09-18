import { chromium } from '../grod-platform-frontend/node_modules/@playwright/test/index.mjs'
import path from 'node:path'

const output = path.resolve('rapport', 'captures-finales')
const site = 'http://127.0.0.1:15173'
const api = 'http://127.0.0.1:18080/api'
const adminEmail = 'e2e-admin@example.test'
const adminPassword = 'E2eAdminPassword1!'

const response = await fetch(`${api}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.91' },
  body: JSON.stringify({ email: adminEmail, motDePasse: adminPassword }),
})
if (!response.ok) throw new Error(`Connexion administrateur impossible: ${response.status}`)
const { token } = await response.json()

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await context.addInitScript(({ jwt, email }) => {
  localStorage.setItem('grod_theme', 'light')
  localStorage.setItem('adminSidebarCollapsed', 'false')
  sessionStorage.setItem('grod_admin_token', jwt)
  sessionStorage.setItem('grod_admin_profile', JSON.stringify({
    email,
    nomComplet: 'Administrateur G-ROD',
    role: 'ADMIN',
  }))
}, { jwt: token, email: adminEmail })
const page = await context.newPage()
page.setDefaultTimeout(15000)

async function goto(route) {
  await page.goto(`${site}${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
}

async function elementShot(route, selector, filename) {
  await goto(route)
  const element = page.locator(selector).first()
  await element.waitFor({ state: 'visible' })
  await element.scrollIntoViewIfNeeded()
  await element.screenshot({ path: path.join(output, filename) })
}

await goto('/resources')
await page.screenshot({ path: path.join(output, 'fig-4-07-ressources-publiques.png') })

await goto('/catalogue')
const firstMenu = page.locator('.product-more-menu').first()
await firstMenu.locator('summary').click()
await firstMenu.getByRole('button', { name: 'Apercu 3D' }).click()
const viewer = page.locator('.catalogue-3d-panel')
await viewer.waitFor({ state: 'visible' })
await page.waitForTimeout(2200)
await viewer.screenshot({ path: path.join(output, 'fig-4-05-apercu-3d.png') })

await goto('/admin/demandes')
await page.locator('.commercial-pipeline').scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(output, 'fig-4-12-pipeline-commercial.png') })
await elementShot('/admin/demandes', '.legacy-requests-table', 'fig-4-13-demandes-admin.png')
await elementShot('/admin/clients', '.crm-table-panel', 'fig-4-14-clients-historique.png')
await elementShot('/admin/produits', '.product-catalogue-panel', 'fig-4-15-produits-admin.png')
await elementShot('/admin/ressources', '.resource-table-wrap', 'fig-4-16-ressources-admin.png')
await elementShot('/admin/documents', '.document-table-panel', 'fig-4-14b-demandes-documents.png')

await goto('/admin/notifications')
await page.screenshot({ path: path.join(output, 'fig-4-17-notifications-admin.png') })
await goto('/admin/account?tab=security')
await page.screenshot({ path: path.join(output, 'fig-4-18-compte-securite.png') })

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await mobile.addInitScript(({ jwt, email }) => {
  localStorage.setItem('grod_theme', 'light')
  localStorage.setItem('adminSidebarCollapsed', 'false')
  sessionStorage.setItem('grod_admin_token', jwt)
  sessionStorage.setItem('grod_admin_profile', JSON.stringify({ email, nomComplet: 'Administrateur G-ROD', role: 'ADMIN' }))
}, { jwt: token, email: adminEmail })
const mobilePage = await mobile.newPage()
await mobilePage.goto(`${site}/catalogue`, { waitUntil: 'domcontentloaded' })
await mobilePage.waitForTimeout(1400)
await mobilePage.screenshot({ path: path.join(output, 'fig-4-09-catalogue-mobile.png') })
await mobilePage.goto(`${site}/admin/dashboard`, { waitUntil: 'domcontentloaded' })
await mobilePage.waitForTimeout(1400)
await mobilePage.getByRole('button', { name: /menu/i }).first().click()
await mobilePage.waitForTimeout(300)
await mobilePage.screenshot({ path: path.join(output, 'fig-4-18b-navigation-admin-mobile.png') })

await mobile.close()
await context.close()
await browser.close()
console.log(`Captures complémentaires créées dans ${output}`)
