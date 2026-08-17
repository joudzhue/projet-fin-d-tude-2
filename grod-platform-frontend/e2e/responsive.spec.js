import { test, expect } from '@playwright/test'

const api = 'http://127.0.0.1:18080/api'
const adminEmail = 'e2e-admin@example.test'
const adminPassword = 'E2eAdminPassword1!'
const viewports = [
  { name: 'desktop-large', width: 1920, height: 1080 },
  { name: 'desktop-standard', width: 1366, height: 768 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-compact', width: 375, height: 812 },
]
const publicRoutes = ['/', '/catalogue', '/resources', '/processus', '/pourquoi-grod', '/demande-document', '/devis', '/admin/login']
const adminRoutes = ['/admin/dashboard', '/admin/demandes', '/admin/clients', '/admin/produits', '/admin/documents', '/admin/ressources', '/admin/notifications', '/admin/account?tab=security']
let token

test.setTimeout(120_000)

test.beforeAll(async ({ request }) => {
  const response = await request.post(`${api}/auth/login`, {
    headers: { 'X-Forwarded-For': '198.51.100.202' },
    data: { email: adminEmail, motDePasse: adminPassword },
  })
  expect(response.ok()).toBeTruthy()
  token = (await response.json()).token
})

for (const viewport of viewports) {
  test(`pages publiques sans débordement — ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    for (const route of publicRoutes) {
      await page.goto(route)
      await page.locator('body').waitFor({ state: 'visible' })
      await expectNoPageOverflow(page, `${route} @ ${viewport.name}`)
    }
  })

  test(`pages Admin sans débordement — ${viewport.name}`, async ({ page }) => {
    await authenticatePage(page)
    await page.setViewportSize(viewport)
    for (const route of adminRoutes) {
      await page.goto(route)
      await page.locator('.admin-main').waitFor({ state: 'visible' })
      await expectNoPageOverflow(page, `${route} @ ${viewport.name}`)
    }
  })
}

test('sidebar et drawer Admin restent utilisables sur mobile', async ({ page }) => {
  await authenticatePage(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/admin/dashboard')
  const menu = page.getByRole('button', { name: /menu/i }).first()
  await menu.click()
  await expect(page.locator('.admin-shell')).toHaveClass(/mobile-sidebar-open/)
  await expect.poll(async () => (await page.locator('.admin-sidebar').boundingBox())?.x).toBeGreaterThanOrEqual(-1)
  await expectInsideViewport(page, '.admin-sidebar')
  await page.locator('.admin-sidebar-overlay').click({ position: { x: 380, y: 100 } })
  await expect(page.locator('.admin-shell')).not.toHaveClass(/mobile-sidebar-open/)

  await page.goto('/admin/produits')
  await page.getByRole('button', { name: /Ajouter un produit/i }).first().click()
  await expect(page.locator('.product-drawer')).toBeVisible()
  await expectInsideViewport(page, '.product-drawer')
})

test('captures représentatives de recette responsive', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const cases = [
    { route: '/', name: 'home-desktop-large', viewport: viewports[0] },
    { route: '/', name: 'home-mobile', viewport: viewports[4] },
    { route: '/catalogue', name: 'catalogue-tablet-portrait', viewport: viewports[3] },
    { route: '/devis', name: 'quote-mobile', viewport: viewports[4] },
  ]
  for (const item of cases) {
    await page.setViewportSize(item.viewport)
    await page.goto(item.route)
    await page.screenshot({ path: `test-results/responsive/${item.name}.png`, fullPage: true })
  }

  await authenticatePage(page)
  for (const item of [
    { route: '/admin/dashboard', name: 'admin-dashboard-1366', viewport: viewports[1] },
    { route: '/admin/dashboard', name: 'admin-dashboard-mobile', viewport: viewports[4] },
    { route: '/admin/produits', name: 'admin-products-mobile', viewport: viewports[4] },
  ]) {
    await page.setViewportSize(item.viewport)
    await page.goto(item.route)
    await page.screenshot({ path: `test-results/responsive/${item.name}.png`, fullPage: true })
  }
})

async function expectNoPageOverflow(page, context) {
  await page.waitForTimeout(120)
  const result = await page.evaluate(() => {
    const root = document.documentElement
    const body = document.body
    return {
      viewport: window.innerWidth,
      scrollWidth: Math.max(root.scrollWidth, body.scrollWidth),
      offenders: [...document.querySelectorAll('body *')]
        .filter(element => {
          const style = getComputedStyle(element)
          const box = element.getBoundingClientRect()
          return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && (box.right > window.innerWidth + 2 || box.left < -2)
        })
        .slice(0, 8)
        .map(element => {
          const box = element.getBoundingClientRect()
          return `${element.tagName.toLowerCase()}.${String(element.className).replaceAll(' ', '.').slice(0, 80)} [${Math.round(box.left)}, ${Math.round(box.right)}]`
        }),
    }
  })
  expect(result.scrollWidth, `${context}: document ${result.scrollWidth}px > viewport ${result.viewport}px; ${result.offenders.join(' | ')}`).toBeLessThanOrEqual(result.viewport + 2)
}

async function expectInsideViewport(page, selector) {
  const box = await page.locator(selector).boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(box.x).toBeGreaterThanOrEqual(-1)
  expect(box.y).toBeGreaterThanOrEqual(-1)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1)
  expect(box.y + Math.min(box.height, viewport.height)).toBeLessThanOrEqual(viewport.height + 1)
}

async function authenticatePage(page) {
  await page.addInitScript(({ jwt, email }) => {
    sessionStorage.setItem('grod_admin_token', jwt)
    sessionStorage.setItem('grod_admin_profile', JSON.stringify({ email, nomComplet: 'Admin E2E', role: 'ADMIN' }))
  }, { jwt: token, email: adminEmail })
}
