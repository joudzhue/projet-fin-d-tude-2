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

test('le mode Liste du catalogue utilise toute la largeur sans couper les produits', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/catalogue')
  await page.getByRole('button', { name: 'Liste', exact: true }).click()
  await expect(page.locator('.products-grid')).toHaveClass(/products-grid--list/)

  const cards = await page.locator('.products-grid--list .product-card').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect()
    const media = element.querySelector('.product-media')?.getBoundingClientRect()
    const body = element.querySelector('.product-body')?.getBoundingClientRect()
    return {
      x: Math.round(box.x),
      width: Math.round(box.width),
      mediaRight: Math.round(media?.right || 0),
      bodyLeft: Math.round(body?.left || 0),
    }
  }))

  expect(cards.length).toBeGreaterThan(1)
  expect(new Set(cards.map(card => card.x)).size).toBe(1)
  expect(cards.every(card => card.width > 900)).toBeTruthy()
  expect(cards.every(card => card.mediaRight <= card.bodyLeft + 1)).toBeTruthy()
  await expectNoPageOverflow(page, '/catalogue liste @ desktop-standard')
})

test('la recherche rapide utilise les produits et documents publics reels sans Admin', async ({ page }) => {
  await page.route('**/api/produits/actifs', route => route.fulfill({
    json: [{
      id: 'produit-ajoute',
      nom: 'Produit cuivre ajouté',
      description: 'Produit actif ajouté depuis le catalogue Admin.',
      categorie: 'Copper products',
      purete: '99,9%',
      dimensions: 'Sur demande',
      normes: 'EN test',
      applications: ['Industrie'],
      actif: true,
    }],
  }))
  await page.route('**/api/documents-techniques/actifs', route => route.fulfill({
    json: [{
      id: 91,
      titre: 'Document technique ajouté',
      typeDocument: 'Fiche technique',
      description: 'Document public ajouté depuis les ressources Admin.',
      produitConcerne: 'Produit cuivre ajouté',
      fichierNom: 'document-ajoute.pdf',
      actif: true,
      telechargementPublic: true,
    }],
  }))

  await page.goto('/')
  await page.getByRole('button', { name: 'Recherche rapide' }).click()
  const commandList = page.locator('.command-list')
  await expect(commandList.getByText('Admin', { exact: true })).toHaveCount(0)
  await expect(commandList.getByText('Produit cuivre ajouté', { exact: true })).toBeVisible()
  await expect(commandList.getByText('Document technique ajouté', { exact: true })).toBeVisible()

  await page.locator('.command-search input').fill('Document technique ajouté')
  await commandList.getByText('Document technique ajouté', { exact: true }).click()
  await expect(page).toHaveURL(/\/resources\?search=Document%20technique%20ajout%C3%A9$/)
  await expect(page.locator('.resource-tools input')).toHaveValue('Document technique ajouté')
  await expect(page.getByText('Document technique ajouté', { exact: true })).toBeVisible()
})

test('la recommandation produit reste lisible en theme sombre', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('grod_theme', 'dark'))
  await page.goto('/catalogue')
  const selects = page.locator('.product-advisor select')
  await expect(selects).toHaveCount(2)
  await selects.nth(0).selectOption('electricite')
  await selects.nth(1).selectOption('conductivite')

  const result = page.locator('.advisor-result')
  await expect(result).toBeVisible()
  await expect(result).toHaveCSS('background-color', 'rgb(17, 29, 22)')
  await expect(result.locator('strong')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(result.locator('p')).toHaveCSS('color', 'rgba(233, 240, 234, 0.82)')
  await expect(result.locator('.secondary-link')).toHaveCSS('color', 'rgb(223, 244, 232)')
})

test('les outils et le formulaire Ressources restent lisibles en theme sombre', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('grod_theme', 'dark'))
  await page.goto('/resources')

  for (const selector of [
    '.resource-tools label',
    '.frequent-documents-heading h3',
    '.frequent-document-item strong',
    '.document-request-copy h2',
    '.document-request-form .quote-form label',
  ]) {
    await expect(page.locator(selector).first()).toHaveCSS('color', 'rgb(255, 255, 255)')
  }

  await expect(page.locator('.document-request-copy p:not(.eyebrow)')).toHaveCSS('color', 'rgba(233, 240, 234, 0.78)')
  await expect(page.locator('.frequent-document-item').first()).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.055)')
  await expectNoPageOverflow(page, '/resources sombre @ desktop-standard')
})

test('le formulaire Admin propose des types pour la premiere ressource', async ({ page }) => {
  await authenticatePage(page)
  await page.goto('/admin/ressources')
  await page.getByRole('button', { name: '+ Ajouter une ressource', exact: true }).click()

  const typeSelect = page.locator('.resource-drawer select[name="typeDocument"]')
  await expect(typeSelect.locator('option')).toHaveText([
    'Sélectionner un type',
    'Brochure',
    'Certificat',
    'FAQ',
    'Fiche technique',
    'Guide',
    'Plan 2D/3D',
  ])
  await typeSelect.selectOption('Fiche technique')
  await expect(typeSelect).toHaveValue('Fiche technique')
})

test('l apercu 3D et le depot de fichier restent lisibles en theme sombre', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('grod_theme', 'dark'))
  await page.goto('/devis?produit=Copper%20Bus%20Bars')

  const preview = page.locator('.quote-3d-preview')
  await expect(preview).toBeVisible()
  await expect(preview).toHaveCSS('color', 'rgb(247, 251, 248)')
  await expect(preview).toHaveCSS('background-image', /linear-gradient/)
  await expect(preview.locator('h3')).toHaveCSS('color', 'rgb(255, 255, 255)')

  const upload = page.locator('.upload-field')
  await expect(upload).toHaveCSS('color', 'rgb(247, 251, 248)')
  await expect(upload).toHaveCSS('background-image', /linear-gradient/)
  await expect(upload.locator('small')).toHaveCSS('color', 'rgba(233, 240, 234, 0.7)')
  await expectNoPageOverflow(page, '/devis sombre @ desktop-standard')
})

test('les listes de la fiche produit restent lisibles en theme sombre', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('grod_theme', 'dark'))
  await page.goto('/catalogue/copper-bus-bars')

  await expect(page.locator('.legacy-detail-card')).toHaveCount(4)
  await expect(page.locator('.legacy-bullet-list li').first()).toHaveCSS('color', 'rgba(233, 240, 234, 0.84)')
  await expect(page.locator('.legacy-spec-list dt').first()).toHaveCSS('color', 'rgba(233, 240, 234, 0.66)')
  await expect(page.locator('.legacy-spec-list dd').first()).toHaveCSS('color', 'rgb(247, 251, 248)')
  await expectNoPageOverflow(page, '/catalogue/copper-bus-bars sombre @ desktop-standard')
})

test('les surfaces partagees de l Admin restent lisibles en theme sombre', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('grod_theme', 'dark'))
  await authenticatePage(page)
  await page.setViewportSize({ width: 1366, height: 768 })

  for (const route of adminRoutes) {
    await page.goto(route)
    await expect(page.locator('.admin-shell')).toHaveCSS('color', 'rgb(233, 240, 234)')
    await expect(page.locator('.admin-topbar')).toHaveCSS('background-color', 'rgba(7, 18, 13, 0.92)')
    await expect(page.locator('.admin-topbar-title h1')).toHaveCSS('color', 'rgb(247, 251, 248)')
    await expectNoPageOverflow(page, `${route} sombre @ desktop-standard`)
  }

  await page.goto('/admin/demandes')
  const requestTableLayout = await page.locator('.requests-table-wrap').evaluate(wrapper => {
    const table = wrapper.querySelector('.legacy-requests-table')
    return {
      overflowX: getComputedStyle(wrapper).overflowX,
      wrapperWidth: wrapper.clientWidth,
      tableWidth: table?.getBoundingClientRect().width || 0,
    }
  })
  expect(requestTableLayout.overflowX).toBe('auto')
  expect(requestTableLayout.tableWidth).toBeGreaterThanOrEqual(1159)
  expect(requestTableLayout.tableWidth).toBeGreaterThan(requestTableLayout.wrapperWidth)

  await page.goto('/admin/dashboard')
  await expect(page.locator('.dashboard-industrial-banner h2')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(page.locator('.dashboard-kpis article').first()).toHaveCSS('background-color', 'rgb(16, 26, 20)')
  await expect(page.locator('.dashboard-kpis article').first().locator('small')).toHaveCSS('color', 'rgb(247, 251, 248)')
  const recentRequest = page.locator('.dashboard-request').first()
  if (await recentRequest.count()) {
    await expect(recentRequest).toHaveCSS('background-color', 'rgb(16, 26, 20)')
    await expect(recentRequest.locator('strong')).toHaveCSS('color', 'rgb(247, 251, 248)')
    await expect(recentRequest.locator('span')).toHaveCSS('color', 'rgba(233, 240, 234, 0.74)')
  }
})

test('le pipeline affiche le total reel et limite les cartes prioritaires', async ({ page }) => {
  await authenticatePage(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  const requests = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    referenceDemande: `GROD-E2E-${String(index + 1).padStart(5, '0')}`,
    societe: `Client ${index + 1}`,
    nomContact: `Contact ${index + 1}`,
    produitDemande: 'Copper Rod',
    quantite: String(1000 - index),
    statut: 'NOUVELLE',
    dateCreation: `2026-08-${String(18 - index).padStart(2, '0')}T10:00:00`,
  }))

  await page.route('**/api/admin/dashboard/summary', route => route.fulfill({
    json: {
      demandesTotales: 6,
      nouvellesDemandes: 6,
      documentsEnAttente: 0,
      produitsActifs: 8,
      clients: 6,
      demandesParStatut: { NOUVELLE: 6, EN_TRAITEMENT: 0, TRAITEE: 0, ANNULEE: 0 },
    },
  }))
  await page.route('**/api/admin/demandes/pipeline', route => route.fulfill({
    json: {
      columns: {
        NOUVELLE: { total: 6, demandes: requests.slice(0, 4) },
        EN_TRAITEMENT: { total: 0, demandes: [] },
        TRAITEE: { total: 0, demandes: [] },
        ANNULEE: { total: 0, demandes: [] },
      },
    },
  }))
  await page.route('**/api/admin/demandes?*', route => route.fulfill({
    json: { content: requests, totalElements: 6, totalPages: 1, number: 0, size: 10 },
  }))

  await page.goto('/admin/demandes')
  const newColumn = page.locator('.pipeline-column.nouvelle')
  await expect(newColumn.locator('header span')).toHaveText('6')
  await expect(newColumn.locator('.pipeline-list > button:not(.pipeline-more-button)')).toHaveCount(4)
  await expect(newColumn.locator('.pipeline-more-button')).toHaveText('Voir les 2 autres →')
  await newColumn.locator('.pipeline-more-button').click()
  await expect(page.locator('.status-pill.active')).toContainText('NOUVELLE')
  await expectNoPageOverflow(page, '/admin/demandes pipeline charge @ desktop-standard')
})

test('les filtres des demandes de documents restent verticalement alignes', async ({ page }) => {
  await authenticatePage(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/admin/documents')

  const filters = page.locator('.document-toolbar select')
  await expect(filters).toHaveCount(3)
  for (const filter of await filters.all()) {
    await expect(filter).toHaveCSS('height', '42px')
    await expect(filter).toHaveCSS('padding-top', '0px')
    await expect(filter).toHaveCSS('padding-bottom', '0px')
  }
  await expectNoPageOverflow(page, '/admin/documents filtres @ desktop-standard')
})

test('les filtres des ressources restent alignes et sans bouton flottant superpose', async ({ page }) => {
  await authenticatePage(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/admin/ressources')

  const filters = page.locator('.resource-toolbar select')
  await expect(filters).toHaveCount(3)
  for (const filter of await filters.all()) {
    await expect(filter).toHaveCSS('height', '42px')
    await expect(filter).toHaveCSS('padding-top', '0px')
    await expect(filter).toHaveCSS('padding-bottom', '0px')
  }
  await expect(page.locator('.back-to-top')).toHaveCount(0)
  await expectNoPageOverflow(page, '/admin/ressources filtres @ desktop-standard')
})

test('les avatars et statuts Clients restent lisibles en theme sombre', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('grod_theme', 'dark'))
  await authenticatePage(page)
  await page.route('**/api/admin/clients?*', route => route.fulfill({
    json: {
      content: [{
        id: 1,
        societe: 'Client cuivre',
        nom: 'Contact test',
        email: 'client@example.test',
        telephone: '+212600000001',
        nombreDemandes: 3,
        nombreDemandesOuvertes: 1,
        produitsDemandes: ['Copper Rod'],
        actif: true,
      }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  }))

  await page.goto('/admin/clients')
  await expect(page.locator('.crm-client-identity > span').first()).toHaveCSS('color', 'rgb(8, 115, 68)')
  await expect(page.locator('.crm-follow-status.open')).toHaveCSS('color', 'rgb(7, 93, 55)')
  await expect(page.locator('.crm-follow-status.open')).toHaveCSS('background-color', 'rgb(223, 242, 230)')
  await expect(page.locator('.crm-toolbar select')).toHaveCSS('padding-top', '0px')
  await expect(page.locator('.crm-toolbar select')).toHaveCSS('padding-bottom', '0px')
})

test('les caracteristiques et statuts Produits restent lisibles en theme sombre', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('grod_theme', 'dark'))
  await authenticatePage(page)
  await page.goto('/admin/produits')

  await expect(page.locator('.product-key-specs').first()).toHaveCSS('color', 'rgba(233, 240, 234, 0.76)')
  await expect(page.locator('.product-status.active').first()).toHaveCSS('color', 'rgb(7, 93, 55)')
  await expect(page.locator('.product-status.active').first()).toHaveCSS('background-color', 'rgb(223, 242, 230)')
  await expect(page.locator('.product-icon-actions button').first()).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.07)')
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
