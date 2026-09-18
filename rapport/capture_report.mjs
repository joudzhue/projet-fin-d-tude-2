import { chromium } from '../grod-platform-frontend/node_modules/@playwright/test/index.mjs'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('..')
const output = path.join(root, 'rapport', 'captures-finales')
const api = 'http://127.0.0.1:18080/api'
const site = 'http://127.0.0.1:15173'
const adminEmail = 'e2e-admin@example.test'
const adminPassword = 'E2eAdminPassword1!'

await mkdir(output, { recursive: true })

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url}: ${response.status} ${await response.text()}`)
  }
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('json') ? response.json() : response.text()
}

const login = await jsonRequest(`${api}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.90' },
  body: JSON.stringify({ email: adminEmail, motDePasse: adminPassword }),
})
const token = login.token
const authHeaders = { Authorization: `Bearer ${token}` }

// Données de démonstration isolées : aucune base MySQL métier n'est utilisée.
const companies = [
  ['Atlas Câbles', 'contact@atlas-cables.example', 'Copper Rod'],
  ['Maghreb Énergie', 'achats@maghreb-energie.example', 'Copper Bus Bars'],
  ['Industries Safi', 'bureau.etudes@industries-safi.example', 'Copper Anodes'],
  ['Rabat Electrotech', 'projets@rabat-electrotech.example', 'Copper Sheets'],
  ['Tanger Components', 'sourcing@tanger-components.example', 'Copper Wire'],
  ['Casablanca Métal', 'qualite@casablanca-metal.example', 'Copper Flat Bars'],
  ['Marrakech Process', 'technique@marrakech-process.example', 'Custom Copper Parts'],
]

const createdQuotes = []
for (let index = 0; index < companies.length; index += 1) {
  const [societe, email, produitDemande] = companies[index]
  const created = await jsonRequest(`${api}/demandes-devis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `198.51.100.${100 + index}` },
    body: JSON.stringify({
      societe,
      nomContact: `Contact démonstration ${index + 1}`,
      email,
      telephone: `+2126000000${10 + index}`,
      produitDemande,
      quantite: 5 + index * 3,
      pureteCuivre: 99.9,
      longueur: 6,
      applicationProjet: 'Projet industriel de démonstration',
      normeReference: 'Spécification à confirmer avec le client',
      besoinLivraison: index % 2 ? 'NON' : 'OUI',
      message: 'Données fictives préparées uniquement pour les captures du rapport.',
    }),
  })
  createdQuotes.push(created)
}

for (const [index, status] of [[4, 'EN_TRAITEMENT'], [5, 'TRAITEE'], [6, 'ANNULEE']]) {
  await jsonRequest(`${api}/demandes-devis/${createdQuotes[index].id}/statut?statut=${status}`, {
    method: 'PUT', headers: authHeaders,
  })
}

const createdDocuments = []
for (let index = 0; index < 3; index += 1) {
  createdDocuments.push(await jsonRequest(`${api}/demandes-documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `203.0.113.${30 + index}` },
    body: JSON.stringify({
      societe: companies[index][0],
      nomContact: `Responsable qualité ${index + 1}`,
      email: companies[index][1],
      telephone: `+2126111111${10 + index}`,
      typeDocument: index === 0 ? 'Fiche technique' : index === 1 ? 'Certificat' : 'Guide',
      titreDocument: index === 0 ? 'Fiche Copper Rod' : index === 1 ? 'Certificat matière' : 'Guide de stockage',
      produitConcerne: companies[index][2],
      message: 'Demande documentaire fictive pour illustration du mémoire.',
    }),
  }))
}
await jsonRequest(`${api}/demandes-documents/${createdDocuments[1].id}/statut?statut=EN_TRAITEMENT`, { method: 'PUT', headers: authHeaders })
await jsonRequest(`${api}/demandes-documents/${createdDocuments[2].id}/statut?statut=TRAITEE`, { method: 'PUT', headers: authHeaders })

const fixture = await readFile(path.join(root, 'grod-platform-frontend', 'e2e', 'fixtures', 'test-plan.pdf'))
const resourceForm = new FormData()
resourceForm.append('file', new Blob([fixture], { type: 'application/pdf' }), 'fiche-technique-demo.pdf')
const storedResource = await jsonRequest(`${api}/uploads/technical-documents`, {
  method: 'POST', headers: authHeaders, body: resourceForm,
})
for (const [titre, typeDocument, produitConcerne, telechargementPublic] of [
  ['Fiche technique Copper Rod', 'Fiche technique', 'Copper Rod', true],
  ['Certificat matière - démonstration', 'Certificat', 'Copper Anodes', false],
  ['Guide de stockage des produits cuivre', 'Guide', '', true],
]) {
  await jsonRequest(`${api}/documents-techniques`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titre, typeDocument, produitConcerne,
      description: 'Ressource fictive préparée pour le rapport.',
      fichierUrl: storedResource.documentUrl,
      fichierNom: 'fiche-technique-demo.pdf',
      actif: true,
      telechargementPublic,
    }),
  })
}

const productImages = [
  'home-copper-rod.webp',
  'home-copper-anodes.webp',
  'home-custom-copper-parts.webp',
]
const products = await jsonRequest(`${api}/produits`, { headers: authHeaders })
for (let index = 0; index < products.length; index += 1) {
  const product = products[index]
  const imageName = productImages[index % productImages.length]
  const imageBytes = await readFile(path.join(root, 'grod-platform-frontend', 'public', 'images', 'home', imageName))
  const imageForm = new FormData()
  imageForm.append('file', new Blob([imageBytes], { type: 'image/webp' }), imageName)
  const uploaded = await jsonRequest(`${api}/uploads/images`, { method: 'POST', headers: authHeaders, body: imageForm })
  await jsonRequest(`${api}/produits/${product.id}`, {
    method: 'PUT',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: product.nom,
      description: product.description,
      categorie: product.categorie,
      imageUrl: uploaded.imageUrl,
      applications: product.applications,
      dimensions: product.dimensions,
      purete: product.purete,
      normes: product.normes,
      conditionnement: product.conditionnement,
      actif: product.actif,
    }),
  })
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await context.addInitScript(() => {
  localStorage.setItem('grod_theme', 'light')
  localStorage.setItem('adminSidebarCollapsed', 'false')
})
const page = await context.newPage()

async function goto(route) {
  await page.goto(`${site}${route}`, { waitUntil: 'networkidle' })
}

async function shot(name, options = {}) {
  await page.screenshot({ path: path.join(output, name), fullPage: false, ...options })
}

await goto('/')
await shot('fig-4-01-accueil-public.png')

await goto('/catalogue')
await page.getByLabel('Recherche produit').fill('Copper')
await shot('fig-4-02-catalogue-recherche-cartes.png')
const listButton = page.getByRole('button', { name: 'Liste' })
if (await listButton.count() === 1) await listButton.click()
await shot('fig-4-03-catalogue-mode-liste.png')

await goto('/catalogue/copper-rod')
await shot('fig-4-04-fiche-produit.png')
const previewButton = page.getByRole('button', { name: 'Aperçu 3D' })
if (await previewButton.count() > 0) {
  await previewButton.first().click()
  await page.locator('.catalogue-3d-panel').waitFor({ state: 'visible' })
  await page.locator('.catalogue-3d-panel').screenshot({ path: path.join(output, 'fig-4-05-apercu-3d.png') })
}

await goto('/devis?produit=Copper%20Rod')
await page.locator('[name="societe"]').fill('Société de démonstration')
await page.locator('[name="nomContact"]').fill('Contact fictif')
await page.locator('[name="email"]').fill('contact@example.test')
await shot('fig-4-06-formulaire-devis.png')

await goto('/ressources')
await shot('fig-4-07-ressources-publiques.png')

await goto('/processus')
await shot('fig-4-08-processus-production.png')

await goto('/admin/login')
await shot('fig-4-10-connexion-admin.png')

await context.addInitScript(({ jwt, email }) => {
  sessionStorage.setItem('grod_admin_token', jwt)
  sessionStorage.setItem('grod_admin_profile', JSON.stringify({ email, nomComplet: 'Administrateur G-ROD', role: 'ADMIN' }))
}, { jwt: token, email: adminEmail })

await goto('/admin/dashboard')
await shot('fig-4-11-dashboard-admin.png')
const pipeline = page.locator('.commercial-pipeline')
await pipeline.scrollIntoViewIfNeeded()
await pipeline.screenshot({ path: path.join(output, 'fig-4-12-pipeline-commercial.png') })

await goto('/admin/demandes')
await page.locator('.legacy-requests-table').screenshot({ path: path.join(output, 'fig-4-13-demandes-admin.png') })

await goto('/admin/clients')
await page.locator('.crm-table-panel').screenshot({ path: path.join(output, 'fig-4-14-clients-historique.png') })

await goto('/admin/produits')
await page.locator('.product-catalogue-panel').screenshot({ path: path.join(output, 'fig-4-15-produits-admin.png') })

await goto('/admin/ressources')
await page.locator('.resource-table-wrap').screenshot({ path: path.join(output, 'fig-4-16-ressources-admin.png') })

await goto('/admin/notifications')
await shot('fig-4-17-notifications-admin.png')

await goto('/admin/account?tab=security')
await shot('fig-4-18-compte-securite.png')

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await mobileContext.addInitScript(() => localStorage.setItem('grod_theme', 'light'))
const mobilePage = await mobileContext.newPage()
await mobilePage.goto(`${site}/catalogue`, { waitUntil: 'networkidle' })
await mobilePage.screenshot({ path: path.join(output, 'fig-4-09-catalogue-mobile.png'), fullPage: false })

await mobileContext.close()
await context.close()
await browser.close()

console.log(`Captures créées dans ${output}`)
