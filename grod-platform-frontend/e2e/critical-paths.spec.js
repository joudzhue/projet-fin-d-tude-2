import { test, expect } from '@playwright/test'
import path from 'node:path'

const api = 'http://127.0.0.1:18080/api'
const adminEmail = 'e2e-admin@example.test'
const adminPassword = 'E2eAdminPassword1!'
const company = 'E2E Copper Industries'
const clientEmail = 'e2e-client@example.test'
const plan = path.join(process.cwd(), 'e2e', 'fixtures', 'test-plan.pdf')
const productImage = path.join(process.cwd(), 'public', 'images', 'home', 'home-copper-rod.webp')
let token
let quoteReference
let quoteId
let quoteFilename

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ request }) => {
  const response = await request.post(`${api}/auth/login`, {
    headers: { 'X-Forwarded-For': '198.51.100.201' },
    data: { email: adminEmail, motDePasse: adminPassword },
  })
  expect(response.ok()).toBeTruthy()
  token = (await response.json()).token
})

test('site public, catalogue, recherche et fiche produit utilisent le backend', async ({ page }) => {
  const errors = []
  const productRequests = []
  const productResponses = []
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('request', request => { if (request.url().includes('produits/actifs')) productRequests.push(request.url()) })
  page.on('response', response => { if (response.url().includes('produits/actifs')) productResponses.push(response.status()) })
  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()
  await page.goto('/catalogue')
  await page.waitForTimeout(1000)
  expect(productRequests).toContain(`${api}/produits/actifs`)
  expect(productResponses).toContain(200)
  await expect(page.getByText('Catalogue indisponible')).toHaveCount(0)
  const catalogue = page.locator('main')
  await expect(catalogue.getByText('Copper Rod', { exact: true }).first()).toBeVisible()
  const search = page.getByLabel('Recherche produit')
  await search.fill('Copper Rod')
  await expect(catalogue.getByText('Copper Rod', { exact: true }).first()).toBeVisible()
  await catalogue.locator('a[href^="/catalogue/"]').first().click()
  await expect(page.getByText('Copper Rod', { exact: true }).first()).toBeVisible()
  await expect(page.locator('body')).not.toContainText('Application error')
  expect(errors.filter(error => !error.includes('favicon'))).toEqual([])
})

test('devis réel avec upload temporaire, promotion et client unique', async ({ page, request }) => {
  await page.goto('/devis')
  await page.locator('[name="societe"]').fill(company)
  await page.locator('[name="nomContact"]').fill('E2E Contact')
  await page.locator('[name="email"]').fill(clientEmail)
  await page.locator('[name="telephone"]').fill('+212600000001')
  await page.locator('[name="produitDemande"]').selectOption({ label: 'Copper Rod' })
  await page.locator('[name="quantite"]').fill('5')
  await page.locator('[name="applicationProjet"]').fill('Projet électrique E2E')
  await page.locator('[name="normeReference"]').fill('ASTM E2E')
  await page.locator('[name="message"]').fill('Message libre du scénario E2E')
  const uploadResponse = page.waitForResponse(response => response.url().includes('/uploads/quote-documents') && response.status() === 200)
  await page.locator('input[type="file"]').setInputFiles(plan)
  const temporaryPayload = await (await uploadResponse).json()
  quoteFilename = path.basename(temporaryPayload.documentUrl)
  expect(temporaryPayload.documentUrl).toContain('/uploads/temp/quotes/')
  const creation = page.waitForResponse(response => response.url().endsWith('/api/demandes-devis') && response.request().method() === 'POST')
  await page.getByRole('button', { name: /Envoyer|Submit/i }).click()
  const createdResponse = await creation
  expect(createdResponse.ok()).toBeTruthy()
  const created = await createdResponse.json()
  quoteReference = created.referenceDemande
  quoteId = created.id
  expect(created.fichierTechniqueUrl).toBe(`/api/demandes-devis/${created.id}/attachment`)
  await expect(page.locator('.quote-status')).toContainText(quoteReference)

  const second = await request.post(`${api}/demandes-devis`, { data: {
    societe: company, nomContact: 'E2E Contact', email: clientEmail.toUpperCase(), telephone: '+212600000001',
    produitDemande: 'Copper Rod', quantite: 2, applicationProjet: 'Deuxième demande E2E', message: 'Historique client E2E',
  } })
  expect(second.ok()).toBeTruthy()
  const clients = await request.get(`${api}/admin/clients?page=0&size=10&search=${encodeURIComponent(clientEmail)}`, { headers: auth() })
  const payload = await clients.json()
  expect(payload.totalElements).toBe(1)
  expect(payload.content[0].nombreDemandes).toBe(2)
  const invalid = await request.post(`${api}/demandes-devis`, { data: {
    societe: '', nomContact: 'E2E', email: 'email-invalide', telephone: '+212600000001', produitDemande: 'Copper Rod', quantite: 0,
  } })
  expect(invalid.status()).toBe(400)
})

test('authentification, demande Admin, statut persistant et pièce jointe', async ({ page, request }) => {
  await page.goto('/admin/demandes')
  await expect(page).toHaveURL(/\/admin\/login|\/admin\/demandes/)
  await page.locator('[name="email"]').fill(adminEmail)
  await page.locator('[name="motDePasse"]').fill('incorrect-password')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.locator('.error-text')).toBeVisible()
  await page.locator('[name="motDePasse"]').fill(adminPassword)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard/)
  await page.goto('/admin/demandes')
  const search = page.locator('.legacy-request-toolbar input')
  await search.fill(quoteReference)
  const row = page.locator('tr', { hasText: quoteReference })
  await expect(row).toContainText(company)
  await expect(row).toContainText('Message libre du scénario E2E')
  await row.locator('select').selectOption('EN_TRAITEMENT')
  await expect.poll(async () => (await (await request.get(`${api}/demandes-devis/${quoteId}`, { headers: auth() })).json()).statut).toBe('EN_TRAITEMENT')
  await page.reload()
  await search.fill(quoteReference)
  await expect(page.locator('tr', { hasText: quoteReference }).locator('select')).toHaveValue('EN_TRAITEMENT')
  await page.locator('tr', { hasText: quoteReference }).locator('select').selectOption('TRAITEE')
  await expect.poll(async () => (await (await request.get(`${api}/demandes-devis/${quoteId}`, { headers: auth() })).json()).statut).toBe('TRAITEE')
  const fileResponse = await request.get(`${api}/demandes-devis/${quoteId}/attachment`, { headers: auth() })
  expect(fileResponse.ok()).toBeTruthy()
  expect((await fileResponse.body()).length).toBeGreaterThan(0)
  expect((await request.get(`${api}/demandes-devis/${quoteId}/attachment`)).status()).toBe(401)
  const directUpload = await request.get(`http://127.0.0.1:18080/uploads/quotes/${quoteFilename}`)
  expect(directUpload.ok()).toBeFalsy()
})

test('upload image produit, aperçu et persistance utilisent le backend', async ({ page }) => {
  await authenticatePage(page)
  await page.goto('/admin/produits')
  const editButton = page.getByRole('button', { name: 'Modifier Copper Rod' })
  await expect(editButton).toBeVisible()
  await editButton.click()
  await page.getByRole('button', { name: 'Images', exact: true }).click()

  const uploadResponse = page.waitForResponse((response) => response.url().endsWith('/api/uploads/images'))
  await page.locator('.product-image-editor input[type="file"]').setInputFiles(productImage)
  expect((await uploadResponse).ok()).toBeTruthy()

  const preview = page.getByRole('img', { name: 'Aperçu du produit' })
  await expect(preview).toHaveAttribute('src', /http:\/\/127\.0\.0\.1:18080\/uploads\/products\/.+\.webp/)

  const saveResponse = page.waitForResponse((response) => response.url().includes('/api/produits/') && response.request().method() === 'PUT')
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
  expect((await saveResponse).ok()).toBeTruthy()
  await expect(page.getByRole('button', { name: 'Modifier Copper Rod' })).toBeVisible()
  await expect(page.locator('tr', { hasText: 'Copper Rod' }).locator('.admin-product-thumb')).toHaveAttribute(
    'src',
    /http:\/\/127\.0\.0\.1:18080\/uploads\/products\/.+\.webp/,
  )
})

test('notifications persistantes, demande document et ressources publique/privée', async ({ page, request }) => {
  await authenticatePage(page)
  const documentRequest = await request.post(`${api}/demandes-documents`, { data: {
    societe: company, nomContact: 'E2E Contact', email: clientEmail, telephone: '+212600000001',
    typeDocument: 'Fiche technique', titreDocument: 'Document E2E', produitConcerne: 'Copper Rod', message: 'Demande document E2E',
  } })
  expect(documentRequest.ok()).toBeTruthy()
  const document = await documentRequest.json()
  const unread = await request.get(`${api}/admin/notifications/unread-count`, { headers: auth() })
  expect((await unread.json()).count).toBeGreaterThan(0)
  await page.goto('/admin/notifications')
  await expect(page.getByText('Nouvelle demande de document', { exact: false }).first()).toBeVisible()
  await request.put(`${api}/admin/notifications/read-all`, { headers: auth() })
  const afterRead = await request.get(`${api}/admin/notifications/unread-count`, { headers: auth() })
  expect((await afterRead.json()).count).toBe(0)
  await page.reload()

  const status = await request.put(`${api}/demandes-documents/${document.id}/statut?statut=TRAITEE`, { headers: auth() })
  expect(status.ok()).toBeTruthy()
  const documents = await request.get(`${api}/admin/documents?page=0&size=10&search=Document%20E2E`, { headers: auth() })
  expect((await documents.json()).content[0].statut).toBe('TRAITEE')

  const uploaded = await request.post(`${api}/uploads/technical-documents`, { headers: auth(), multipart: { file: { name: 'resource-e2e.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 E2E') } } })
  expect(uploaded.ok()).toBeTruthy()
  const stored = await uploaded.json()
  const publicResource = await request.post(`${api}/documents-techniques`, { headers: auth(), data: { titre:'Ressource publique E2E', typeDocument:'Fiche technique', fichierUrl:stored.documentUrl, fichierNom:'resource-e2e.pdf', actif:true, telechargementPublic:true } })
  expect(publicResource.ok()).toBeTruthy()
  const publicEntity = await publicResource.json()
  const publicDownload = await request.get(`${api}/documents-techniques/${publicEntity.id}/download`)
  expect(publicDownload.ok()).toBeTruthy()
  const privateResource = await request.post(`${api}/documents-techniques`, { headers: auth(), data: { titre:'Ressource privée E2E', typeDocument:'Certificat', fichierUrl:stored.documentUrl, fichierNom:'resource-e2e.pdf', actif:true, telechargementPublic:false } })
  expect(privateResource.ok()).toBeTruthy()
  const privateEntity = await privateResource.json()
  const publicList = await request.get(`${api}/documents-techniques/actifs`)
  expect((await publicList.json()).some(item => item.id === privateEntity.id)).toBeFalsy()
  expect((await request.get(`${api}/documents-techniques/${privateEntity.id}/download`)).status()).toBe(404)
  expect((await request.get(`${api}/admin/ressources/${privateEntity.id}/download`, { headers: auth() })).ok()).toBeTruthy()
})

test('Mon compte, sidebar desktop/mobile, session invalide et pagination backend', async ({ page, request, browser }) => {
  await authenticatePage(page)
  await page.goto('/admin/account?tab=security')
  await expect(page.getByText('Changer le mot de passe', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /menu/i }).first().click()
  await expect(page.locator('.admin-shell')).toHaveClass(/sidebar-collapsed/)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: /menu/i }).first().click()
  await expect(page.locator('.admin-shell')).toHaveClass(/mobile-sidebar-open/)
  await expect(page.locator('.admin-sidebar-overlay')).toBeVisible()

  const paged = await request.get(`${api}/admin/demandes?page=0&size=1&search=E2E&status=TRAITEE&sort=dateCreation,desc`, { headers: auth() })
  expect(paged.ok()).toBeTruthy()
  const pagedData = await paged.json()
  expect(pagedData.size).toBe(1)
  expect(pagedData.totalElements).toBeGreaterThan(0)
  const secondPage = await request.get(`${api}/admin/demandes?page=1&size=1&search=E2E&sort=dateCreation,desc`, { headers: auth() })
  expect(secondPage.ok()).toBeTruthy()
  expect((await secondPage.json()).page).toBe(1)

  const invalidContext = await browser.newContext()
  await invalidContext.addInitScript(() => sessionStorage.setItem('grod_admin_token', 'invalid-e2e-token'))
  const invalidPage = await invalidContext.newPage()
  await invalidPage.goto('/admin/dashboard')
  await expect(invalidPage.getByRole('button', { name: 'Se connecter' })).toBeVisible()
  await invalidContext.close()
})

function auth() { return { Authorization: `Bearer ${token}` } }

async function authenticatePage(page) {
  await page.addInitScript(({ jwt, email }) => {
    sessionStorage.setItem('grod_admin_token', jwt)
    sessionStorage.setItem('grod_admin_profile', JSON.stringify({ email, nomComplet: 'Admin E2E', role: 'ADMIN' }))
  }, { jwt: token, email: adminEmail })
}
