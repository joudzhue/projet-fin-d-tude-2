import { test, expect } from '@playwright/test'

const isGlbRequest = url => /\.glb(?:\?|$)/i.test(url)
const isThreeModuleRequest = url => url.includes('Copper3DScenes')
const productModels = [
  ['copper-rod', 'Copper Rod', 'copper-rod.glb'],
  ['copper-anodes', 'Copper Anodes', 'copper-anodes.glb'],
  ['copper-bus-bars', 'Copper Bus Bars', 'copper-bus-bars.glb'],
  ['copper-flat-bars', 'Copper Flat Bars', 'copper-flat-bars.glb'],
  ['copper-tubes', 'Copper Tubes', 'copper-tubes.glb'],
  ['copper-sheets', 'Copper Sheets', 'copper-sheets.glb'],
  ['copper-wire', 'Copper Wire', 'copper-wire.glb'],
  ['custom-copper-parts', 'Custom Copper Parts', 'custom-copper-parts.glb'],
]

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

test('chaque produit du catalogue possède son aperçu 3D dédié', async ({ page }) => {
  for (const [slug, name, model] of productModels) {
    await page.goto(`/catalogue/${slug}`)
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
    const glbRequest = page.waitForRequest((request) => request.url().endsWith(`/models/${model}`))
    await page.getByRole('button', { name: /Apercu 3D|3D preview/i }).first().click()
    expect((await glbRequest).url()).toContain(`/models/${model}`)
    await expect(page.locator('.product-3d-canvas canvas')).toBeVisible()
  }
})
