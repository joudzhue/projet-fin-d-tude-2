import { test, expect } from '@playwright/test'

const isGlbRequest = url => /\.glb(?:\?|$)/i.test(url)
const isThreeModuleRequest = url => url.includes('Copper3DScenes')

test('Three.js et le GLB restent absents avant le clic Aperçu 3D', async ({ page }) => {
  const requests = []
  page.on('request', request => requests.push(request.url()))

  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()
  expect(requests.some(isGlbRequest)).toBeFalsy()
  expect(requests.some(isThreeModuleRequest)).toBeFalsy()

  await page.goto('/catalogue')
  await expect(page.getByText('Copper Rod', { exact: true }).first()).toBeVisible()
  expect(requests.some(isGlbRequest)).toBeFalsy()
  expect(requests.some(isThreeModuleRequest)).toBeFalsy()

  await page.locator('a[href^="/catalogue/"]').first().click()
  await expect(page.getByText('Copper Rod', { exact: true }).first()).toBeVisible()
  expect(requests.some(isGlbRequest)).toBeFalsy()
  expect(requests.some(isThreeModuleRequest)).toBeFalsy()

  const glbRequest = page.waitForRequest(request => isGlbRequest(request.url()))
  await page.getByRole('button', { name: /Apercu 3D|3D preview/i }).first().click()
  expect((await glbRequest).url()).toMatch(/\/models\/copper-rod\.glb(?:\?|$)/)
  expect(requests.some(isThreeModuleRequest)).toBeTruthy()
})

test('un échec GLB conserve la fiche et affiche un aperçu de remplacement', async ({ page }) => {
  await page.route(/\.glb(?:\?|$)/i, route => route.abort('failed'))
  await page.goto('/catalogue')
  await page.locator('a[href^="/catalogue/"]').first().click()
  await page.getByRole('button', { name: /Apercu 3D|3D preview/i }).first().click()

  await expect(page.getByText('Le modèle détaillé est momentanément indisponible. Aperçu simplifié affiché.')).toBeVisible()
  await expect(page.locator('.product-3d-canvas canvas')).toBeVisible()
  await expect(page.locator('body')).not.toContainText('Application error')
})
