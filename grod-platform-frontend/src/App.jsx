import { useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'

const API_URL = 'http://localhost:8080/api'
const ADMIN_TOKEN_KEY = 'grod_admin_token'

const officialProducts = [
  {
    id: 'rod',
    nom: 'Copper Rod',
    description:
      'Barres rondes en cuivre haute purete offrant une excellente conductivite electrique et thermique pour les applications industrielles.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg',
    applications: ['Cables electriques', 'Conducteurs industriels'],
  },
  {
    id: 'anodes',
    nom: 'Copper Anodes',
    description: 'Anodes en cuivre destinees aux procedes industriels, electrolytiques et metallurgiques.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg',
    applications: ['Electrolyse', 'Traitement metallurgique'],
  },
  {
    id: 'bus-bars',
    nom: 'Copper Bus Bars',
    description:
      'Barres conductrices en cuivre concues pour les systemes electriques, tableaux industriels et installations energetiques.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg',
    applications: ['Tableaux electriques', 'Distribution energie'],
  },
  {
    id: 'flat-bars',
    nom: 'Copper Flat Bars',
    description: 'Meplats en cuivre adaptes aux applications electriques, techniques et industrielles.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg',
    applications: ['Assemblage technique', 'Pieces conductrices'],
  },
  {
    id: 'tubes',
    nom: 'Copper Tubes',
    description: 'Tubes en cuivre utilises pour la plomberie, la climatisation, l industrie et les installations techniques.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg',
    applications: ['Plomberie', 'Climatisation'],
  },
  {
    id: 'sheets',
    nom: 'Copper Sheets',
    description:
      'Feuilles et plaques de cuivre destinees a la fabrication, au revetement, a l electricite et aux usages industriels.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg',
    applications: ['Fabrication', 'Revetement'],
  },
  {
    id: 'wire',
    nom: 'Copper Wire',
    description:
      'Fil de cuivre haute conductivite utilise dans les cables, bobinages, connexions electriques et applications industrielles.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg',
    applications: ['Cables', 'Bobinages'],
  },
  {
    id: 'custom',
    nom: 'Custom Copper Parts',
    description:
      'Pieces en cuivre sur mesure fabriquees selon les besoins specifiques des clients et les plans techniques.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg',
    applications: ['Plans techniques', 'Fabrication sur mesure'],
  },
]

const resources = [
  {
    title: 'Brochure institutionnelle G-ROD',
    type: 'Brochure',
    text: 'Presentation de G-ROD, histoire, valeurs, partenaires et vision industrielle.',
    href: '/documents/grod-brochure-institutionnelle.pdf',
  },
  {
    title: 'Schema production MCF',
    type: 'Processus',
    text: 'Flow chart visuel du processus: reception, tri, laboratoire, production et export.',
    href: '/documents/mcf-flow-chart-production.svg',
  },
  {
    title: 'Certificats et conformite',
    type: 'Qualite',
    text: 'Documents disponibles sur demande selon le produit, le lot et la specification client.',
    href: null,
  },
]

const partners = ['ocp', 'tamwilcom', 'anapec', 'maroc-pme', 'cfye']

function App() {
  const [language, setLanguage] = useState('fr')
  const t = dictionary[language]

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand-block" to="/">
          <span className="brand-logo">
            <img src="/grod-logo.png" alt="G-ROD" />
          </span>
          <span>
            <span className="eyebrow">G-ROD B2B Platform</span>
            <h1>{t.brandTitle}</h1>
          </span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/">{t.navHome}</NavLink>
          <NavLink to="/catalogue">{t.navCatalogue}</NavLink>
          <NavLink to="/resources">{t.navResources}</NavLink>
          <NavLink to="/devis">{t.navQuote}</NavLink>
          <NavLink to="/admin">{t.navAdmin}</NavLink>
          <span className="language-switcher">
            <button className={language === 'fr' ? 'active' : ''} onClick={() => setLanguage('fr')}>
              FR
            </button>
            <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
              EN
            </button>
          </span>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage t={t} />} />
        <Route path="/catalogue" element={<ProductsPage t={t} />} />
        <Route path="/resources" element={<ResourcesPage t={t} />} />
        <Route path="/devis" element={<QuotePage t={t} />} />
        <Route path="/admin" element={<AdminPage t={t} />} />
      </Routes>

      <AssistantChat t={t} language={language} />

      <footer className="site-footer">
        <div>
          <strong>G-ROD</strong>
          <span>Morocco Copper Foundry - Youssoufia, Bouznika, Maroc</span>
        </div>
        <div>
          <span>contact@africarod.com</span>
          <span>+212 6 68 61 56 08</span>
        </div>
      </footer>
    </div>
  )
}

function HomePage({ t }) {
  return (
    <>
      <section className="hero-section hero-3d-section">
        <img src="/src/assets/hero.png" alt="Production cuivre G-ROD" />
        <div className="hero-overlay" />
        <CopperScene />
        <div className="hero-copy">
          <p className="eyebrow">Morocco Copper Foundry</p>
          <h2>{t.heroTitle}</h2>
          <p>{t.heroText}</p>
          <div className="hero-actions">
            <NavLink className="primary-link" to="/catalogue">
              {t.heroCatalogue}
            </NavLink>
            <NavLink className="secondary-link" to="/devis">
              {t.heroQuote}
            </NavLink>
          </div>
          <div className="hero-trust-row">
            <span>{t.trustRecycled}</span>
            <span>{t.trustQuality}</span>
            <span>{t.trustMorocco}</span>
          </div>
        </div>
      </section>

      <section className="page-section metrics-row">
        <Metric value="2020" label={t.metricLaunch} />
        <Metric value="25K t" label={t.metricCapacity} />
        <Metric value="68M MAD" label={t.metricInvestment} />
        <Metric value="99.99%" label={t.metricPurity} />
      </section>

      <section className="page-band">
        <div className="page-section split-section">
          <div>
            <p className="eyebrow">{t.industrialEyebrow}</p>
            <h2>{t.industrialTitle}</h2>
          </div>
          <p>{t.industrialText}</p>
        </div>
      </section>

      <section className="page-section solution-grid">
        <InfoCard number="01" title="Copper Rod" text={t.solutionRod} />
        <InfoCard number="02" title="Copper Anodes" text={t.solutionAnodes} />
        <InfoCard number="03" title="Custom Copper Parts" text={t.solutionCustom} />
      </section>

      <section className="partners-section">
        <div className="page-section">
          <div className="partners-heading">
            <p className="eyebrow">{t.partnersEyebrow}</p>
            <h2>{t.partnersTitle}</h2>
            <p>{t.partnersText}</p>
          </div>
          <div className="partners-grid">
            {partners.map((partner) => (
              <div className="partner-logo" key={partner}>
                <img src={`/partners/${partner}.svg`} alt={`${partner} logo`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section brochure-section">
        <div className="brochure-mark" aria-hidden="true">
          <span>G-</span>ROD
        </div>
        <div className="brochure-copy">
          <p className="eyebrow">{t.documentsEyebrow}</p>
          <h2>{t.documentsTitle}</h2>
          <p>{t.documentsText}</p>
          <span className="brochure-meta">PDF / SVG - documents telechargeables</span>
        </div>
        <div className="brochure-actions">
          <a className="primary-link brochure-download" href="/documents/grod-brochure-institutionnelle.pdf" download>
            {t.downloadBrochure}
          </a>
          <a className="secondary-link brochure-download" href="/documents/mcf-flow-chart-production.svg" download>
            {t.downloadFlow}
          </a>
        </div>
      </section>
    </>
  )
}

function CopperScene() {
  return (
    <div className="copper-3d" aria-hidden="true">
      <div className="copper-coil coil-one" />
      <div className="copper-coil coil-two" />
      <div className="copper-coil coil-three" />
      <div className="copper-rod rod-one" />
      <div className="copper-rod rod-two" />
      <div className="copper-slab" />
    </div>
  )
}

function Metric({ value, label }) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}

function InfoCard({ number, title, text }) {
  return (
    <article className="solution-card">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function ProductsPage({ t }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/produits/actifs`)
        if (!response.ok) throw new Error('Backend unavailable')
        const data = await response.json()
        setProducts(Array.isArray(data) && data.length ? data : officialProducts)
      } catch {
        setProducts(officialProducts)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const displayedProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.nom} ${product.description} ${product.categorie}`.toLowerCase()
      return text.includes(search.toLowerCase())
    })
  }, [products, search])

  return (
    <main className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.catalogueEyebrow}</p>
          <h2>{t.catalogueTitle}</h2>
        </div>
        <NavLink className="primary-link" to="/devis">
          {t.requestQuote}
        </NavLink>
      </div>

      <div className="catalogue-tools">
        <label>
          {t.productSearch}
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Copper rod, anodes..." />
        </label>
      </div>

      {loading ? <p>{t.loading}</p> : null}

      <div className="products-grid">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id || product.nom} product={normalizeProduct(product)} t={t} />
        ))}
      </div>
    </main>
  )
}

function ProductCard({ product, t }) {
  return (
    <article className="product-card">
      <div className="product-media">
        <img src={product.imageUrl} alt={product.nom} onError={(event) => event.currentTarget.remove()} />
        <span>{product.categorie}</span>
      </div>
      <div className="product-body">
        <div className="product-title-row">
          <h3>{product.nom}</h3>
          <span className="status-badge active">{t.active}</span>
        </div>
        <p>{product.description}</p>
        <div className="tag-list">
          {product.applications.map((application) => (
            <span key={application}>{application}</span>
          ))}
        </div>
        <NavLink className="text-link" to={`/devis?produit=${encodeURIComponent(product.nom)}`}>
          {t.requestQuote}
        </NavLink>
      </div>
    </article>
  )
}

function ResourcesPage({ t }) {
  return (
    <main className="resources-page">
      <section className="resources-hero">
        <p className="eyebrow">{t.resourcesEyebrow}</p>
        <h2>{t.resourcesTitle}</h2>
        <p>{t.resourcesText}</p>
      </section>
      <section className="page-section resources-grid">
        {resources.map((resource) => (
          <article className="resource-card" key={resource.title}>
            <div className="resource-card-header">
              <span>{resource.type}</span>
              <strong>{resource.href ? t.available : t.onRequest}</strong>
            </div>
            <h3>{resource.title}</h3>
            <p>{resource.text}</p>
            {resource.href ? (
              <a className="text-link" href={resource.href} download>
                {t.download}
              </a>
            ) : (
              <NavLink className="text-link" to="/devis">
                {t.requestDocument}
              </NavLink>
            )}
          </article>
        ))}
      </section>
    </main>
  )
}

function QuotePage({ t }) {
  const params = new URLSearchParams(window.location.search)
  const [form, setForm] = useState({
    societe: '',
    nomContact: '',
    email: '',
    telephone: '',
    produitDemande: params.get('produit') || '',
    pureteCuivre: '',
    longueur: '',
    largeur: '',
    epaisseur: '',
    quantite: '',
    besoinLivraison: '',
    message: '',
  })
  const [status, setStatus] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitQuote(event) {
    event.preventDefault()
    setStatus(t.sending)
    const payload = {
      ...form,
      quantite: Number(form.quantite),
      pureteCuivre: form.pureteCuivre ? Number(form.pureteCuivre) : null,
      longueur: form.longueur ? Number(form.longueur) : null,
      largeur: form.largeur ? Number(form.largeur) : null,
      epaisseur: form.epaisseur ? Number(form.epaisseur) : null,
    }

    try {
      const response = await fetch(`${API_URL}/demandes-devis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Request failed')
      const data = await response.json()
      setStatus(`${t.quoteSuccess} ${data.referenceDemande || ''}`)
    } catch {
      setStatus(t.quoteError)
    }
  }

  const isAnodes = form.produitDemande.toLowerCase().includes('anode')

  return (
    <main className="page-section compact-section">
      <p className="eyebrow">{t.quoteEyebrow}</p>
      <h2>{t.quoteTitle}</h2>
      <form className="quote-form" onSubmit={submitQuote}>
        <Field label={t.company} name="societe" value={form.societe} onChange={updateField} required />
        <Field label={t.contact} name="nomContact" value={form.nomContact} onChange={updateField} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} required />
        <Field label={t.phone} name="telephone" value={form.telephone} onChange={updateField} required />
        <label>
          {t.product}
          <select name="produitDemande" value={form.produitDemande} onChange={updateField} required>
            <option value="">{t.chooseProduct}</option>
            {officialProducts.map((product) => (
              <option key={product.nom} value={product.nom}>
                {product.nom}
              </option>
            ))}
          </select>
        </label>
        {isAnodes ? (
          <Field
            label={t.purity}
            name="pureteCuivre"
            type="number"
            min="50"
            max="99.99"
            step="0.01"
            value={form.pureteCuivre}
            onChange={updateField}
          />
        ) : null}
        <Field label={t.quantity} name="quantite" type="number" min="1" value={form.quantite} onChange={updateField} required />
        <Field label={t.length} name="longueur" type="number" value={form.longueur} onChange={updateField} />
        <Field label={t.width} name="largeur" type="number" value={form.largeur} onChange={updateField} />
        <Field label={t.thickness} name="epaisseur" type="number" value={form.epaisseur} onChange={updateField} />
        <label>
          {t.message}
          <textarea name="message" value={form.message} onChange={updateField} rows="5" />
        </label>
        <button type="submit">{t.submitQuote}</button>
        {status ? <p className="form-status">{status}</p> : null}
      </form>
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  )
}

function AdminPage({ t }) {
  const [token, setToken] = useState(sessionStorage.getItem(ADMIN_TOKEN_KEY) || '')
  const [login, setLogin] = useState({ email: 'admin@grod.ma', motDePasse: 'admin123' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submitLogin(event) {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      })
      if (!response.ok) throw new Error('Login failed')
      const data = await response.json()
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      setToken(data.token)
      navigate('/admin')
    } catch {
      setError(t.loginError)
    }
  }

  async function loginWithPasskey() {
    setError('')
    try {
      if (!window.PublicKeyCredential) throw new Error('Passkey unsupported')
      const optionsResponse = await fetch(`${API_URL}/passkeys/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: login.email }),
      })
      if (!optionsResponse.ok) throw new Error('Passkey options failed')
      const options = await optionsResponse.json()
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: base64urlToBuffer(options.challenge),
          allowCredentials: (options.allowCredentials || []).map((item) => ({
            ...item,
            id: base64urlToBuffer(item.id),
          })),
        },
      })
      const loginResponse = await fetch(`${API_URL}/passkeys/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: bufferToBase64url(credential.rawId),
          clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
          authenticatorData: bufferToBase64url(credential.response.authenticatorData),
          signature: bufferToBase64url(credential.response.signature),
        }),
      })
      if (!loginResponse.ok) throw new Error('Passkey login failed')
      const data = await loginResponse.json()
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      setToken(data.token)
      navigate('/admin')
    } catch {
      setError(t.passkeyLoginError)
    }
  }

  if (!token) {
    return (
      <main className="admin-login-page">
        <form className="login-card" onSubmit={submitLogin}>
          <p className="eyebrow">Admin</p>
          <h2>{t.adminLogin}</h2>
          <Field
            label="Email"
            name="email"
            value={login.email}
            onChange={(event) => setLogin((current) => ({ ...current, email: event.target.value }))}
          />
          <Field
            label={t.password}
            name="motDePasse"
            type="password"
            value={login.motDePasse}
            onChange={(event) => setLogin((current) => ({ ...current, motDePasse: event.target.value }))}
          />
          <button type="submit">{t.login}</button>
          <button type="button" className="secondary-button" onClick={loginWithPasskey}>
            {t.passkeyLogin}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </main>
    )
  }

  return <AdminDashboard t={t} token={token} onLogout={() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken('')
  }} />
}

function AdminDashboard({ t, token, onLogout }) {
  const [demandes, setDemandes] = useState([])
  const [products, setProducts] = useState([])
  const [documents, setDocuments] = useState([])
  const [settings, setSettings] = useState({ adminEmail: 'admin@grod.ma', adminPhone: '+212 6 68 61 56 08' })
  const [productForm, setProductForm] = useState(emptyProductForm())
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm())
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingDocumentId, setEditingDocumentId] = useState(null)
  const [selectedClient, setSelectedClient] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [demandesResponse, productsResponse, documentsResponse, settingsResponse] = await Promise.all([
          fetch(`${API_URL}/demandes-devis`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/produits`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/documents-techniques`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/settings/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        if (!demandesResponse.ok) throw new Error('Admin request failed')
        setDemandes(await demandesResponse.json())

        if (productsResponse.ok) {
          setProducts(await productsResponse.json())
        }
        if (documentsResponse.ok) {
          setDocuments(await documentsResponse.json())
        }
        if (settingsResponse.ok) {
          setSettings(await settingsResponse.json())
        }
      } catch {
        setError(t.adminLoadError)
      }
    }
    loadAdminData()
  }, [token, t.adminLoadError])

  const clients = useMemo(() => buildClientHistory(demandes), [demandes])
  const filteredDemandes = demandes.filter((demande) => {
    const haystack = [
      demande.referenceDemande,
      demande.societe,
      demande.nomContact,
      demande.email,
      demande.telephone,
      demande.produitDemande,
      demande.statut,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search.toLowerCase())
  })
  const selectedClientData = clients.find((client) => client.key === selectedClient)

  async function updateStatus(id, statut) {
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/demandes-devis/${id}/statut?statut=${statut}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Status update failed')
      const updated = await response.json()
      setDemandes((current) => current.map((demande) => (demande.id === updated.id ? updated : demande)))
      setSuccess(t.statusUpdated)
    } catch {
      setError(t.statusError)
    }
  }

  async function updateLoyalty(demande, clientFidele) {
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/demandes-devis/${demande.id}/client-fidele`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientFidele,
          referenceClient: demande.referenceClient || demande.email || demande.societe,
        }),
      })
      if (!response.ok) throw new Error('Loyalty update failed')
      const updated = await response.json()
      setDemandes((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setSuccess(t.loyaltyUpdated)
    } catch {
      setError(t.loyaltyError)
    }
  }

  async function deleteDemande(id) {
    if (!window.confirm(t.confirmDelete)) return
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/demandes-devis/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Delete failed')
      setDemandes((current) => current.filter((demande) => demande.id !== id))
      setSuccess(t.requestDeleted)
    } catch {
      setError(t.deleteError)
    }
  }

  async function downloadPdf(demande) {
    try {
      const response = await fetch(`${API_URL}/demandes-devis/${demande.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('PDF failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${demande.referenceDemande || `demande-${demande.id}`}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setError(t.pdfError)
    }
  }

  async function uploadFile(file, endpoint) {
    const data = new FormData()
    data.append('file', file)
    const response = await fetch(`${API_URL}/uploads/${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    })
    if (!response.ok) throw new Error('Upload failed')
    return response.json()
  }

  async function uploadProductImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSuccess('')
    setError('')
    try {
      const result = await uploadFile(file, 'images')
      setProductForm((current) => ({ ...current, imageUrl: result.imageUrl }))
      setSuccess(t.uploadSuccess)
    } catch {
      setError(t.uploadError)
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/produits${editingProductId ? `/${editingProductId}` : ''}`, {
        method: editingProductId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm),
      })
      if (!response.ok) throw new Error('Product save failed')
      const saved = await response.json()
      setProducts((current) =>
        editingProductId ? current.map((product) => (product.id === saved.id ? saved : product)) : [...current, saved],
      )
      setProductForm(emptyProductForm())
      setEditingProductId(null)
      setSuccess(t.productSaved)
    } catch {
      setError(t.productSaveError)
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm(t.confirmDeleteProduct)) return
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/produits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Product delete failed')
      setProducts((current) => current.filter((product) => product.id !== id))
      setSuccess(t.productDeleted)
    } catch {
      setError(t.productDeleteError)
    }
  }

  async function uploadTechnicalPdf(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSuccess('')
    setError('')
    try {
      const result = await uploadFile(file, 'technical-documents')
      setDocumentForm((current) => ({
        ...current,
        fichierUrl: result.documentUrl,
        fichierNom: result.originalName,
      }))
      setSuccess(t.uploadSuccess)
    } catch {
      setError(t.uploadError)
    }
  }

  async function saveDocument(event) {
    event.preventDefault()
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/documents-techniques${editingDocumentId ? `/${editingDocumentId}` : ''}`, {
        method: editingDocumentId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentForm),
      })
      if (!response.ok) throw new Error('Document save failed')
      const saved = await response.json()
      setDocuments((current) =>
        editingDocumentId ? current.map((document) => (document.id === saved.id ? saved : document)) : [...current, saved],
      )
      setDocumentForm(emptyDocumentForm())
      setEditingDocumentId(null)
      setSuccess(t.documentSaved)
    } catch {
      setError(t.documentSaveError)
    }
  }

  async function deleteDocument(id) {
    if (!window.confirm(t.confirmDeleteDocument)) return
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/documents-techniques/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Document delete failed')
      setDocuments((current) => current.filter((document) => document.id !== id))
      setSuccess(t.documentDeleted)
    } catch {
      setError(t.documentDeleteError)
    }
  }

  async function saveSettings(event) {
    event.preventDefault()
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/admin/settings/notifications`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      if (!response.ok) throw new Error('Settings save failed')
      setSettings(await response.json())
      setSuccess(t.settingsSaved)
    } catch {
      setError(t.settingsSaveError)
    }
  }

  async function registerPasskey() {
    setSuccess('')
    setError('')
    try {
      if (!window.PublicKeyCredential) throw new Error('Passkey unsupported')
      const optionsResponse = await fetch(`${API_URL}/passkeys/register/options`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!optionsResponse.ok) throw new Error('Passkey options failed')
      const options = await optionsResponse.json()
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: base64urlToBuffer(options.challenge),
          user: {
            ...options.user,
            id: base64urlToBuffer(options.user.id),
          },
        },
      })
      const registerResponse = await fetch(`${API_URL}/passkeys/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialId: bufferToBase64url(credential.rawId),
          clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
          attestationObject: bufferToBase64url(credential.response.attestationObject),
        }),
      })
      if (!registerResponse.ok) throw new Error('Passkey register failed')
      setSuccess(t.passkeyEnabled)
    } catch {
      setError(t.passkeyRegisterError)
    }
  }

  return (
    <main className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>{t.adminTitle}</h2>
        </div>
        <div className="admin-actions">
          <button className="secondary-button" onClick={() => exportCsv(filteredDemandes)}>
            Export CSV
          </button>
          <button className="secondary-button" onClick={registerPasskey}>
            {t.passkeyEnable}
          </button>
          <button className="secondary-button" onClick={onLogout}>
            {t.logout}
          </button>
        </div>
      </div>

      <section className="metrics-row">
        <Metric value={demandes.length} label={t.totalRequests} />
        <Metric value={demandes.filter((demande) => demande.statut === 'NOUVELLE').length} label={t.newRequests} />
        <Metric value={clients.length} label={t.clients} />
        <Metric value={products.length || officialProducts.length} label={t.products} />
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      <section className="admin-panel">
        <div>
          <p className="eyebrow">{t.adminSearch}</p>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.adminSearchPlaceholder} />
        </div>
        <div>
          <p className="eyebrow">{t.clientHistory}</p>
          <select value={selectedClient} onChange={(event) => setSelectedClient(event.target.value)}>
            <option value="">{t.chooseClient}</option>
            {clients.map((client) => (
              <option key={client.key} value={client.key}>
                {client.name} - {client.total} {t.requests}
              </option>
            ))}
          </select>
        </div>
      </section>

      {selectedClientData ? (
        <section className="client-detail-panel">
          <div>
            <p className="eyebrow">{t.clientHistory}</p>
            <h3>{selectedClientData.name}</h3>
            <p>{selectedClientData.email} - {selectedClientData.phone}</p>
          </div>
          <div className="client-stats">
            <span>{selectedClientData.total} {t.requests}</span>
            <span>{selectedClientData.products.join(', ')}</span>
          </div>
        </section>
      ) : null}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>{t.company}</th>
              <th>{t.contact}</th>
              <th>{t.product}</th>
              <th>{t.quantity}</th>
              <th>{t.loyalClient}</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDemandes.map((demande) => (
              <tr key={demande.id}>
                <td>{demande.referenceDemande || `#${demande.id}`}</td>
                <td>
                  <strong>{demande.societe}</strong>
                  <span>{formatDate(demande.dateCreation)}</span>
                </td>
                <td>
                  <strong>{demande.nomContact}</strong>
                  <span>{demande.email}</span>
                  <span>{demande.telephone}</span>
                </td>
                <td>{demande.produitDemande}</td>
                <td>{demande.quantite}</td>
                <td>
                  <label className="toggle-control">
                    <input
                      type="checkbox"
                      checked={Boolean(demande.clientFidele)}
                      onChange={(event) => updateLoyalty(demande, event.target.checked)}
                    />
                    {demande.clientFidele ? t.yes : t.no}
                  </label>
                </td>
                <td>
                  <select value={demande.statut} onChange={(event) => updateStatus(demande.id, event.target.value)}>
                    <option value="NOUVELLE">NOUVELLE</option>
                    <option value="EN_TRAITEMENT">EN_TRAITEMENT</option>
                    <option value="TRAITEE">TRAITEE</option>
                    <option value="ANNULEE">ANNULEE</option>
                  </select>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => downloadPdf(demande)}>
                      PDF
                    </button>
                    <button type="button" className="danger-button" onClick={() => deleteDemande(demande.id)}>
                      {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="product-admin-form">
        <p className="eyebrow">{t.catalogueTitle}</p>
        <h3>{editingProductId ? t.editProduct : t.addProduct}</h3>
        <form className="admin-form-grid" onSubmit={saveProduct}>
          <Field label={t.productName} name="nom" value={productForm.nom} onChange={(event) => setProductFormValue(setProductForm, event)} required />
          <Field label="Categorie" name="categorie" value={productForm.categorie} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <label>
            {t.productImage}
            <input type="file" accept="image/*" onChange={uploadProductImage} />
          </label>
          <Field label="Image URL" name="imageUrl" value={productForm.imageUrl} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <label>
            Description
            <textarea name="description" rows="4" value={productForm.description} onChange={(event) => setProductFormValue(setProductForm, event)} />
          </label>
          <Field label="Applications" name="applications" value={productForm.applications} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <Field label="Dimensions" name="dimensions" value={productForm.dimensions} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <Field label="Purete" name="purete" value={productForm.purete} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <Field label="Normes" name="normes" value={productForm.normes} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <Field label="Conditionnement" name="conditionnement" value={productForm.conditionnement} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={productForm.actif}
              onChange={(event) => setProductForm((current) => ({ ...current, actif: event.target.checked }))}
            />
            {t.active}
          </label>
          <div className="form-actions">
            <button type="submit">{editingProductId ? t.saveChanges : t.addProduct}</button>
            {editingProductId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingProductId(null)
                  setProductForm(emptyProductForm())
                }}
              >
                {t.cancel}
              </button>
            ) : null}
          </div>
        </form>

        <h3>{t.productsVisible}</h3>
        <div className="products-admin-table">
          {products.map((product) => (
            <div key={product.id || product.nom}>
              <strong>{product.nom}</strong>
              <span>{product.actif ? t.active : 'Inactif'}</span>
              <span>{product.categorie}</span>
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(product.id)
                  setProductForm({
                    nom: product.nom || '',
                    description: product.description || '',
                    categorie: product.categorie || '',
                    imageUrl: product.imageUrl || '',
                    applications: product.applications || '',
                    dimensions: product.dimensions || '',
                    purete: product.purete || '',
                    normes: product.normes || '',
                    conditionnement: product.conditionnement || '',
                    actif: Boolean(product.actif),
                  })
                }}
              >
                {t.edit}
              </button>
              <button type="button" className="danger-button" onClick={() => deleteProduct(product.id)}>
                {t.delete}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="product-admin-form">
        <p className="eyebrow">{t.resourcesEyebrow}</p>
        <h3>{editingDocumentId ? t.editDocument : t.addDocument}</h3>
        <form className="admin-form-grid" onSubmit={saveDocument}>
          <Field label={t.documentTitle} name="titre" value={documentForm.titre} onChange={(event) => setProductFormValue(setDocumentForm, event)} required />
          <Field label={t.documentType} name="typeDocument" value={documentForm.typeDocument} onChange={(event) => setProductFormValue(setDocumentForm, event)} required />
          <Field label={t.concernedProduct} name="produitConcerne" value={documentForm.produitConcerne} onChange={(event) => setProductFormValue(setDocumentForm, event)} />
          <label>
            PDF
            <input type="file" accept="application/pdf" onChange={uploadTechnicalPdf} />
          </label>
          <Field label="Fichier URL" name="fichierUrl" value={documentForm.fichierUrl} onChange={(event) => setProductFormValue(setDocumentForm, event)} required />
          <Field label="Nom fichier" name="fichierNom" value={documentForm.fichierNom} onChange={(event) => setProductFormValue(setDocumentForm, event)} required />
          <label>
            Description
            <textarea name="description" rows="4" value={documentForm.description} onChange={(event) => setProductFormValue(setDocumentForm, event)} />
          </label>
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={documentForm.actif}
              onChange={(event) => setDocumentForm((current) => ({ ...current, actif: event.target.checked }))}
            />
            {t.active}
          </label>
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={documentForm.telechargementPublic}
              onChange={(event) => setDocumentForm((current) => ({ ...current, telechargementPublic: event.target.checked }))}
            />
            {t.publicDownload}
          </label>
          <div className="form-actions">
            <button type="submit">{editingDocumentId ? t.saveChanges : t.addDocument}</button>
            {editingDocumentId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingDocumentId(null)
                  setDocumentForm(emptyDocumentForm())
                }}
              >
                {t.cancel}
              </button>
            ) : null}
          </div>
        </form>

        <div className="products-admin-table">
          {documents.map((document) => (
            <div key={document.id}>
              <strong>{document.titre}</strong>
              <span>{document.typeDocument}</span>
              <span>{document.actif ? t.active : 'Inactif'}</span>
              <button
                type="button"
                onClick={() => {
                  setEditingDocumentId(document.id)
                  setDocumentForm({
                    titre: document.titre || '',
                    typeDocument: document.typeDocument || '',
                    produitConcerne: document.produitConcerne || '',
                    description: document.description || '',
                    fichierUrl: document.fichierUrl || '',
                    fichierNom: document.fichierNom || '',
                    actif: Boolean(document.actif),
                    telechargementPublic: Boolean(document.telechargementPublic),
                  })
                }}
              >
                {t.edit}
              </button>
              <button type="button" className="danger-button" onClick={() => deleteDocument(document.id)}>
                {t.delete}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="product-admin-form">
        <p className="eyebrow">Notifications</p>
        <h3>{t.notificationSettings}</h3>
        <form className="admin-form-grid" onSubmit={saveSettings}>
          <Field
            label={t.adminEmail}
            name="adminEmail"
            type="email"
            value={settings.adminEmail || ''}
            onChange={(event) => setProductFormValue(setSettings, event)}
            required
          />
          <Field
            label={t.adminPhone}
            name="adminPhone"
            value={settings.adminPhone || ''}
            onChange={(event) => setProductFormValue(setSettings, event)}
          />
          <button type="submit">{t.saveChanges}</button>
        </form>
        <p className="form-status">{t.notificationHelp}</p>
      </section>
    </main>
  )
}

function AssistantChat({ t, language }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t.assistantWelcome },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMessage(event) {
    event.preventDefault()
    if (!input.trim()) return
    const nextMessages = [...messages, { role: 'user', content: input.trim() }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          messages: nextMessages.slice(-10).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      })
      if (!response.ok) throw new Error('Assistant failed')
      const data = await response.json()
      setMessages((current) => [...current, { role: 'assistant', content: data.message }])
    } catch {
      setError(t.assistantError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="assistant-chat">
      {open ? (
        <div className="assistant-panel">
          <div className="assistant-header">
            <div>
              <strong>{t.assistantTitle}</strong>
              <span>{t.assistantSubtitle}</span>
            </div>
            <button className="assistant-close" type="button" onClick={() => setOpen(false)}>
              x
            </button>
          </div>
          <div className="assistant-messages">
            {messages.map((message, index) => (
              <p className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </p>
            ))}
            {loading ? <p className="assistant-message assistant">{t.sending}</p> : null}
            {error ? <p className="assistant-error">{error}</p> : null}
          </div>
          <form className="assistant-form" onSubmit={sendMessage}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.assistantPlaceholder}
              rows="2"
            />
            <button type="submit" disabled={loading}>
              {t.send}
            </button>
          </form>
        </div>
      ) : null}
      <button className="assistant-launcher" type="button" onClick={() => setOpen((current) => !current)}>
        <span>IA</span>
        {t.assistantTitle}
      </button>
    </aside>
  )
}

function normalizeProduct(product) {
  const fallback = officialProducts.find((item) => item.nom === product.nom) || officialProducts[0]
  return {
    ...fallback,
    ...product,
    applications: product.applications || fallback.applications || [],
    imageUrl: product.imageUrl || fallback.imageUrl,
  }
}

function emptyProductForm() {
  return {
    nom: '',
    description: '',
    categorie: 'Copper products',
    imageUrl: '',
    applications: '',
    dimensions: '',
    purete: '',
    normes: '',
    conditionnement: '',
    actif: true,
  }
}

function emptyDocumentForm() {
  return {
    titre: '',
    typeDocument: '',
    produitConcerne: '',
    description: '',
    fichierUrl: '',
    fichierNom: '',
    actif: true,
    telechargementPublic: true,
  }
}

function setProductFormValue(setter, event) {
  const { name, value } = event.target
  setter((current) => ({ ...current, [name]: value }))
}

function buildClientHistory(demandes) {
  const clients = new Map()

  demandes.forEach((demande) => {
    const key = (demande.email || demande.telephone || demande.societe || `client-${demande.id}`).toLowerCase()
    const current = clients.get(key) || {
      key,
      name: demande.societe || demande.nomContact || 'Client',
      email: demande.email || '',
      phone: demande.telephone || '',
      total: 0,
      products: [],
      demandes: [],
    }

    current.total += 1
    current.demandes.push(demande)
    if (demande.produitDemande && !current.products.includes(demande.produitDemande)) {
      current.products.push(demande.produitDemande)
    }
    clients.set(key, current)
  })

  return [...clients.values()].sort((a, b) => b.total - a.total)
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function exportCsv(demandes) {
  const header = ['Reference', 'Societe', 'Contact', 'Email', 'Telephone', 'Produit', 'Quantite', 'Statut']
  const rows = demandes.map((demande) => [
    demande.referenceDemande || `#${demande.id}`,
    demande.societe,
    demande.nomContact,
    demande.email,
    demande.telephone,
    demande.produitDemande,
    demande.quantite,
    demande.statut,
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'demandes-grod.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function base64urlToBuffer(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const dictionary = {
  fr: {
    navHome: 'Accueil',
    navCatalogue: 'Catalogue',
    navResources: 'Ressources',
    navQuote: 'Demande de devis',
    navAdmin: 'Admin',
    brandTitle: 'Solutions cuivre industrielles',
    heroTitle: 'Plateforme cuivre industrielle avec experience 3D',
    heroText:
      'Un site B2B pour presenter les produits cuivre, recevoir des demandes de devis et rassurer les acheteurs industriels avec une image premium.',
    heroCatalogue: 'Explorer le catalogue',
    heroQuote: 'Demander un devis',
    trustRecycled: 'Cuivre recycle',
    trustQuality: 'Qualite controlee',
    trustMorocco: 'Production marocaine',
    metricLaunch: 'lancement industriel MCF',
    metricCapacity: 'capacite cible',
    metricInvestment: 'investissement initial',
    metricPurity: 'purete possible',
    industrialEyebrow: 'Cap industriel',
    industrialTitle: 'Un parcours clair pour les acheteurs cuivre',
    industrialText:
      'Catalogue professionnel, documents telechargeables, demande structuree et tableau admin pour suivre les opportunites commerciales.',
    solutionRod: 'Produits cuivre pour cables, conducteurs et applications industrielles.',
    solutionAnodes: 'Anodes avec choix de purete entre 50% et 99,99%.',
    solutionCustom: 'Pieces en cuivre sur mesure selon plans et specifications client.',
    partnersEyebrow: 'Ecosysteme',
    partnersTitle: 'Partenaires strategiques',
    partnersText: 'Acteurs institutionnels, industriels et financiers qui renforcent la credibilite du projet.',
    documentsEyebrow: 'Documents',
    documentsTitle: 'Brochure et schema de production telechargeables',
    documentsText: 'Mettez a disposition des acheteurs une presentation claire et un flow chart industriel de qualite.',
    downloadBrochure: 'Telecharger la brochure',
    downloadFlow: 'Telecharger le schema production',
    catalogueEyebrow: 'Catalogue',
    catalogueTitle: 'Produits cuivre G-ROD',
    requestQuote: 'Demander un devis',
    productSearch: 'Recherche produit',
    active: 'Actif',
    loading: 'Chargement...',
    resourcesEyebrow: 'Ressources techniques',
    resourcesTitle: 'Documents utiles pour acheteurs B2B',
    resourcesText: 'Brochures, schemas, certificats et documents de conformite.',
    available: 'Disponible',
    onRequest: 'Sur demande',
    download: 'Telecharger',
    requestDocument: 'Demander ce document',
    quoteEyebrow: 'Devis',
    quoteTitle: 'Nouvelle demande client',
    company: 'Societe',
    contact: 'Contact',
    phone: 'Telephone',
    product: 'Produit',
    chooseProduct: 'Choisir un produit',
    purity: 'Purete du cuivre (%)',
    quantity: 'Quantite',
    length: 'Longueur',
    width: 'Largeur',
    thickness: 'Epaisseur',
    message: 'Message',
    submitQuote: 'Envoyer la demande',
    sending: 'Envoi en cours...',
    quoteSuccess: 'Demande enregistree.',
    quoteError: 'Impossible d envoyer la demande. Verifiez que le backend est lance.',
    adminLogin: 'Connexion securisee',
    password: 'Mot de passe',
    login: 'Se connecter',
    loginError: 'Identifiants invalides ou backend non lance.',
    passkeyLogin: 'Connexion Face ID',
    passkeyLoginError: 'Connexion Face ID impossible. Activez-la d abord depuis l admin.',
    passkeyEnable: 'Activer Face ID',
    passkeyEnabled: 'Face ID / Windows Hello active pour cet admin.',
    passkeyRegisterError: 'Impossible d activer Face ID sur cet appareil.',
    adminTitle: 'Demandes clients',
    logout: 'Deconnexion',
    adminLoadError: 'Impossible de charger les demandes.',
    totalRequests: 'Demandes totales',
    newRequests: 'Nouvelles demandes',
    clients: 'Clients',
    products: 'Produits',
    adminSearch: 'Recherche admin',
    adminSearchPlaceholder: 'Reference, client, email, produit...',
    clientHistory: 'Historique client',
    chooseClient: 'Choisir un client',
    requests: 'demandes',
    loyalClient: 'Client fidele',
    yes: 'Oui',
    no: 'Non',
    delete: 'Supprimer',
    statusUpdated: 'Statut mis a jour.',
    statusError: 'Impossible de modifier le statut.',
    loyaltyUpdated: 'Client fidele mis a jour.',
    loyaltyError: 'Impossible de modifier le client fidele.',
    confirmDelete: 'Supprimer cette demande ?',
    requestDeleted: 'Demande supprimee.',
    deleteError: 'Impossible de supprimer la demande.',
    pdfError: 'Impossible de telecharger le PDF.',
    productsVisible: 'Produits visibles dans le catalogue',
    addProduct: 'Ajouter un produit',
    editProduct: 'Modifier le produit',
    productName: 'Nom du produit',
    productImage: 'Upload image produit',
    edit: 'Modifier',
    cancel: 'Annuler',
    saveChanges: 'Sauvegarder',
    uploadSuccess: 'Upload termine.',
    uploadError: 'Upload impossible.',
    productSaved: 'Produit sauvegarde.',
    productSaveError: 'Impossible de sauvegarder le produit.',
    confirmDeleteProduct: 'Supprimer ce produit ?',
    productDeleted: 'Produit supprime.',
    productDeleteError: 'Impossible de supprimer le produit.',
    addDocument: 'Ajouter un document',
    editDocument: 'Modifier le document',
    documentTitle: 'Titre document',
    documentType: 'Type document',
    concernedProduct: 'Produit concerne',
    publicDownload: 'Telechargement public',
    documentSaved: 'Document sauvegarde.',
    documentSaveError: 'Impossible de sauvegarder le document.',
    confirmDeleteDocument: 'Supprimer ce document ?',
    documentDeleted: 'Document supprime.',
    documentDeleteError: 'Impossible de supprimer le document.',
    notificationSettings: 'Email admin et numero SMS',
    adminEmail: 'Email qui recoit les notifications',
    adminPhone: 'Numero admin / SMS',
    notificationHelp: 'Les demandes restent visibles dans l admin. Les emails/SMS necessitent une configuration SMTP/SMS active cote backend.',
    settingsSaved: 'Parametres sauvegardes.',
    settingsSaveError: 'Impossible de sauvegarder les parametres.',
    assistantTitle: 'Assistant cuivre',
    assistantSubtitle: 'Aide produits et devis',
    assistantWelcome: 'Bonjour, je peux vous aider a choisir un produit cuivre ou preparer une demande de devis.',
    assistantPlaceholder: 'Posez votre question...',
    assistantError: 'Assistant indisponible. Verifiez la cle OpenAI ou le backend.',
    send: 'Envoyer',
  },
  en: {
    navHome: 'Home',
    navCatalogue: 'Catalog',
    navResources: 'Resources',
    navQuote: 'Request a quote',
    navAdmin: 'Admin',
    brandTitle: 'Industrial copper solutions',
    heroTitle: 'Industrial copper platform with a 3D experience',
    heroText:
      'A B2B website for copper products, quote requests and premium industrial confidence for professional buyers.',
    heroCatalogue: 'Explore catalog',
    heroQuote: 'Request a quote',
    trustRecycled: 'Recycled copper',
    trustQuality: 'Controlled quality',
    trustMorocco: 'Moroccan production',
    metricLaunch: 'MCF industrial launch',
    metricCapacity: 'target capacity',
    metricInvestment: 'initial investment',
    metricPurity: 'possible purity',
    industrialEyebrow: 'Industrial scale',
    industrialTitle: 'A clear journey for copper buyers',
    industrialText:
      'Professional catalog, downloadable documents, structured requests and admin dashboard for commercial follow-up.',
    solutionRod: 'Copper products for cables, conductors and industrial applications.',
    solutionAnodes: 'Anodes with purity selection from 50% to 99.99%.',
    solutionCustom: 'Custom copper parts based on client drawings and specifications.',
    partnersEyebrow: 'Ecosystem',
    partnersTitle: 'Strategic partners',
    partnersText: 'Institutional, industrial and financial stakeholders that strengthen project credibility.',
    documentsEyebrow: 'Documents',
    documentsTitle: 'Downloadable brochure and production diagram',
    documentsText: 'Provide buyers with a clear corporate presentation and a quality industrial flow chart.',
    downloadBrochure: 'Download brochure',
    downloadFlow: 'Download production diagram',
    catalogueEyebrow: 'Catalog',
    catalogueTitle: 'G-ROD copper products',
    requestQuote: 'Request a quote',
    productSearch: 'Product search',
    active: 'Active',
    loading: 'Loading...',
    resourcesEyebrow: 'Technical resources',
    resourcesTitle: 'Useful documents for B2B buyers',
    resourcesText: 'Brochures, diagrams, certificates and compliance documents.',
    available: 'Available',
    onRequest: 'On request',
    download: 'Download',
    requestDocument: 'Request this document',
    quoteEyebrow: 'Quote',
    quoteTitle: 'New client request',
    company: 'Company',
    contact: 'Contact',
    phone: 'Phone',
    product: 'Product',
    chooseProduct: 'Choose a product',
    purity: 'Copper purity (%)',
    quantity: 'Quantity',
    length: 'Length',
    width: 'Width',
    thickness: 'Thickness',
    message: 'Message',
    submitQuote: 'Send request',
    sending: 'Sending...',
    quoteSuccess: 'Request saved.',
    quoteError: 'Unable to send request. Check that backend is running.',
    adminLogin: 'Secure login',
    password: 'Password',
    login: 'Log in',
    loginError: 'Invalid credentials or backend unavailable.',
    passkeyLogin: 'Face ID login',
    passkeyLoginError: 'Face ID login failed. Enable it first from admin.',
    passkeyEnable: 'Enable Face ID',
    passkeyEnabled: 'Face ID / Windows Hello enabled for this admin.',
    passkeyRegisterError: 'Unable to enable Face ID on this device.',
    adminTitle: 'Client requests',
    logout: 'Logout',
    adminLoadError: 'Unable to load requests.',
    totalRequests: 'Total requests',
    newRequests: 'New requests',
    clients: 'Clients',
    products: 'Products',
    adminSearch: 'Admin search',
    adminSearchPlaceholder: 'Reference, client, email, product...',
    clientHistory: 'Client history',
    chooseClient: 'Choose a client',
    requests: 'requests',
    loyalClient: 'Loyal client',
    yes: 'Yes',
    no: 'No',
    delete: 'Delete',
    statusUpdated: 'Status updated.',
    statusError: 'Unable to update status.',
    loyaltyUpdated: 'Loyal client updated.',
    loyaltyError: 'Unable to update loyal client.',
    confirmDelete: 'Delete this request?',
    requestDeleted: 'Request deleted.',
    deleteError: 'Unable to delete request.',
    pdfError: 'Unable to download PDF.',
    productsVisible: 'Products visible in catalog',
    addProduct: 'Add product',
    editProduct: 'Edit product',
    productName: 'Product name',
    productImage: 'Upload product image',
    edit: 'Edit',
    cancel: 'Cancel',
    saveChanges: 'Save',
    uploadSuccess: 'Upload complete.',
    uploadError: 'Upload failed.',
    productSaved: 'Product saved.',
    productSaveError: 'Unable to save product.',
    confirmDeleteProduct: 'Delete this product?',
    productDeleted: 'Product deleted.',
    productDeleteError: 'Unable to delete product.',
    addDocument: 'Add document',
    editDocument: 'Edit document',
    documentTitle: 'Document title',
    documentType: 'Document type',
    concernedProduct: 'Concerned product',
    publicDownload: 'Public download',
    documentSaved: 'Document saved.',
    documentSaveError: 'Unable to save document.',
    confirmDeleteDocument: 'Delete this document?',
    documentDeleted: 'Document deleted.',
    documentDeleteError: 'Unable to delete document.',
    notificationSettings: 'Admin email and SMS number',
    adminEmail: 'Notification email',
    adminPhone: 'Admin / SMS number',
    notificationHelp: 'Requests remain visible in admin. Email/SMS delivery requires active SMTP/SMS backend configuration.',
    settingsSaved: 'Settings saved.',
    settingsSaveError: 'Unable to save settings.',
    assistantTitle: 'Copper assistant',
    assistantSubtitle: 'Product and quote help',
    assistantWelcome: 'Hello, I can help you choose a copper product or prepare a quote request.',
    assistantPlaceholder: 'Ask your question...',
    assistantError: 'Assistant unavailable. Check the OpenAI key or backend.',
    send: 'Send',
  },
}

export default App
