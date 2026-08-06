import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import './App.css'

const API_URL = 'http://localhost:8080/api'
const ADMIN_TOKEN_KEY = 'grod_admin_token'
const RECENT_PRODUCTS_KEY = 'grod_recent_products'
const FAVORITE_PRODUCTS_KEY = 'grod_favorite_products'
const QUOTE_DRAFT_KEY = 'grod_quote_draft'
const CopperScene = lazy(() => import('./Copper3DScenes.jsx').then((module) => ({ default: module.CopperScene })))
const Product3DViewer = lazy(() => import('./Copper3DScenes.jsx').then((module) => ({ default: module.Product3DViewer })))

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
    dimensions: 'Diametres et longueurs selon demande client',
    normes: 'ASTM, EN, IEC ou specification interne',
    purete: 'Cuivre haute conductivite',
    conditionnement: 'Bottes, bobines ou palettes selon format',
  },
  {
    id: 'anodes',
    nom: 'Copper Anodes',
    description: 'Anodes en cuivre destinees aux procedes industriels, electrolytiques et metallurgiques.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg',
    applications: ['Electrolyse', 'Traitement metallurgique'],
    dimensions: 'Formats et epaisseurs selon installation',
    normes: 'Specification client et controle laboratoire',
    purete: 'Choix libre entre 50% et 99,99%',
    conditionnement: 'Palettes industrielles securisees',
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
    dimensions: 'Largeur, epaisseur et percage sur demande',
    normes: 'Normes electriques industrielles',
    purete: 'Cuivre conducteur',
    conditionnement: 'Pieces marquees et emballees',
  },
  {
    id: 'flat-bars',
    nom: 'Copper Flat Bars',
    description: 'Meplats en cuivre adaptes aux applications electriques, techniques et industrielles.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg',
    applications: ['Assemblage technique', 'Pieces conductrices'],
    dimensions: 'Largeur, epaisseur et longueur selon besoin',
    normes: 'EN 13601 ou equivalent selon specification',
    purete: 'Cuivre technique',
    conditionnement: 'Barres protegees pour transport',
  },
  {
    id: 'tubes',
    nom: 'Copper Tubes',
    description: 'Tubes en cuivre utilises pour la plomberie, la climatisation, l industrie et les installations techniques.',
    categorie: 'Copper products',
    imageUrl:
      'https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg',
    applications: ['Plomberie', 'Climatisation'],
    dimensions: 'Diametres, epaisseurs et longueurs sur demande',
    normes: 'Normes plomberie, HVAC et industrie',
    purete: 'Cuivre adapte aux installations techniques',
    conditionnement: 'Tubes droits ou couronnes',
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
    dimensions: 'Feuilles, plaques et epaisseurs selon besoin',
    normes: 'Specification client ou norme industrielle',
    purete: 'Cuivre pour fabrication et conductivite',
    conditionnement: 'Feuilles protegees, plaques ou palettes',
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
    dimensions: 'Sections et conditionnements selon application',
    normes: 'Normes cable, bobinage et connexion',
    purete: 'Haute conductivite',
    conditionnement: 'Bobines, tourets ou cartons',
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
    dimensions: 'Selon plan 2D/3D et cahier des charges',
    normes: 'Controle selon specification client',
    purete: 'Selon usage et contrainte technique',
    conditionnement: 'Emballage adapte a la geometrie',
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
  const [theme, setTheme] = useState(() => localStorage.getItem('grod_theme') || 'light')
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandSearch, setCommandSearch] = useState('')
  const navigate = useNavigate()
  const t = dictionary[language]
  const commandActions = useMemo(
    () => [
      { title: t.navHome, subtitle: t.commandHomeHint, to: '/' },
      { title: t.navCatalogue, subtitle: t.commandCatalogueHint, to: '/catalogue' },
      { title: t.navResources, subtitle: t.commandResourcesHint, to: '/resources' },
      { title: t.navProcess, subtitle: t.commandProcessHint, to: '/processus' },
      { title: t.navWhy, subtitle: t.commandWhyHint, to: '/pourquoi-grod' },
      { title: t.navQuote, subtitle: t.commandQuoteHint, to: '/devis' },
      { title: t.navAdmin, subtitle: t.commandAdminHint, to: '/admin' },
      ...officialProducts.map((product) => ({
        title: product.nom,
        subtitle: product.description,
        to: `/catalogue/${product.id || slugify(product.nom)}`,
      })),
    ],
    [t],
  )
  const filteredCommandActions = useMemo(() => {
    const query = normalizeSearchText(commandSearch)
    if (!query) return commandActions
    return commandActions.filter((action) => normalizeSearchText(`${action.title} ${action.subtitle}`).includes(query))
  }, [commandActions, commandSearch])

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((current) => !current)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    localStorage.setItem('grod_theme', theme)
  }, [theme])

  function runCommand(action) {
    setCommandOpen(false)
    setCommandSearch('')
    navigate(action.to)
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <PageMeta t={t} />
      <ScrollProgress t={t} />
      <MotionEnhancer />
      <ConnectionStatus t={t} />
      <InstallAppPrompt t={t} />
      <header className="topbar">
        <NavLink className="brand-block" to="/">
          <span className="brand-logo">
            <img src="/grod-logo.png" alt="G-ROD" />
          </span>
          <span>
            <span className="eyebrow">{t.platformLabel}</span>
            <h1>{t.brandTitle}</h1>
          </span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/">{t.navHome}</NavLink>
          <NavLink to="/catalogue">{t.navCatalogue}</NavLink>
          <NavLink to="/resources">{t.navResources}</NavLink>
          <NavLink to="/processus">{t.navProcess}</NavLink>
          <NavLink to="/pourquoi-grod">{t.navWhy}</NavLink>
          <NavLink to="/devis">{t.navQuote}</NavLink>
          <NavLink to="/admin">{t.navAdmin}</NavLink>
          <button className="command-trigger" type="button" onClick={() => setCommandOpen(true)}>
            {t.commandTrigger}
            <span>{t.shortcutLabel}</span>
          </button>
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? t.lightMode : t.darkMode}
          </button>
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
      <SmartBreadcrumbs t={t} />

      {commandOpen ? (
        <section className="command-palette" role="dialog" aria-modal="true">
          <button className="command-backdrop" type="button" aria-label={t.close} onClick={() => setCommandOpen(false)} />
          <div className="command-panel">
            <div className="command-search">
              <span>{t.commandEyebrow}</span>
              <input
                autoFocus
                value={commandSearch}
                onChange={(event) => setCommandSearch(event.target.value)}
                placeholder={t.commandPlaceholder}
              />
            </div>
            <div className="command-list">
              {filteredCommandActions.length ? filteredCommandActions.map((action) => (
                <button type="button" key={`${action.title}-${action.to}`} onClick={() => runCommand(action)}>
                  <strong>{action.title}</strong>
                  <span>{action.subtitle}</span>
                </button>
              )) : <p>{t.commandNoResult}</p>}
            </div>
          </div>
        </section>
      ) : null}

      <Routes>
        <Route path="/" element={<HomePage t={t} />} />
        <Route path="/catalogue" element={<ProductsPage t={t} />} />
        <Route path="/catalogue/:productId" element={<ProductDetailPage t={t} />} />
        <Route path="/resources" element={<ResourcesPage t={t} />} />
        <Route path="/processus" element={<ProductionProcessPage t={t} />} />
        <Route path="/pourquoi-grod" element={<WhyGrodPage t={t} />} />
        <Route path="/demande-document" element={<DocumentRequestPage t={t} />} />
        <Route path="/devis" element={<QuotePage t={t} />} />
        <Route path="/admin" element={<AdminPage t={t} />} />
        <Route path="/admin/login" element={<AdminPage t={t} />} />
        <Route path="/admin/dashboard" element={<AdminPage t={t} />} />
        <Route path="/admin/produits" element={<AdminPage t={t} />} />
        <Route path="/admin/demandes" element={<AdminPage t={t} />} />
        <Route path="/admin/documents" element={<AdminPage t={t} />} />
        <Route path="/admin/clients" element={<AdminPage t={t} />} />
        <Route path="/admin/clients/:clientKey" element={<AdminPage t={t} />} />
      </Routes>

      <TrustDock t={t} />
      <QuickActionDock t={t} />
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

function TrustDock({ t }) {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null

  return (
    <section className="trust-dock" aria-label={t.trustDockLabel}>
      <article>
        <strong>24h</strong>
        <span>{t.trustDockResponse}</span>
      </article>
      <article>
        <strong>PDF</strong>
        <span>{t.trustDockDocs}</span>
      </article>
      <article>
        <strong>3D</strong>
        <span>{t.trustDock3d}</span>
      </article>
      <article>
        <strong>+212</strong>
        <span>{t.trustDockContact}</span>
      </article>
    </section>
  )
}

function InstallAppPrompt({ t }) {
  const [installEvent, setInstallEvent] = useState(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('grod_install_prompt_dismissed') === 'true')

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallEvent(event)
    }

    function handleInstalled() {
      setInstallEvent(null)
      setDismissed(true)
      localStorage.setItem('grod_install_prompt_dismissed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function installApp() {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  function dismissPrompt() {
    setDismissed(true)
    localStorage.setItem('grod_install_prompt_dismissed', 'true')
  }

  if (!installEvent || dismissed) return null

  return (
    <aside className="install-app-prompt">
      <div>
        <strong>{t.installAppTitle}</strong>
        <span>{t.installAppText}</span>
      </div>
      <button type="button" onClick={installApp}>{t.installApp}</button>
      <button type="button" className="install-dismiss" onClick={dismissPrompt} aria-label={t.close}>
        x
      </button>
    </aside>
  )
}

function ConnectionStatus({ t }) {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setOnline(true)
      setShowBackOnline(true)
      window.setTimeout(() => setShowBackOnline(false), 2800)
    }

    function handleOffline() {
      setOnline(false)
      setShowBackOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online && !showBackOnline) return null

  return (
    <aside className={`connection-status ${online ? 'online' : 'offline'}`} role="status">
      <strong>{online ? t.connectionBack : t.connectionLost}</strong>
      <span>{online ? t.connectionBackText : t.connectionLostText}</span>
    </aside>
  )
}

function PageMeta({ t }) {
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname
    const productId = pathname.startsWith('/catalogue/') ? pathname.split('/').filter(Boolean).at(-1) : ''
    const product = productId ? officialProducts.find((item) => item.id === productId || slugify(item.nom) === productId) : null
    const page = product
      ? { title: `${product.nom} | G-ROD`, description: product.description }
      : pathname.startsWith('/catalogue')
        ? { title: `${t.navCatalogue} | G-ROD`, description: t.metaCatalogue }
        : pathname.startsWith('/resources') || pathname.startsWith('/demande-document')
          ? { title: `${t.navResources} | G-ROD`, description: t.metaResources }
          : pathname.startsWith('/processus')
            ? { title: `${t.navProcess} | G-ROD`, description: t.metaProcess }
            : pathname.startsWith('/pourquoi-grod')
              ? { title: `${t.navWhy} | G-ROD`, description: t.metaWhy }
              : pathname.startsWith('/devis')
                ? { title: `${t.navQuote} | G-ROD`, description: t.metaQuote }
                : pathname.startsWith('/admin')
                  ? { title: `${t.navAdmin} | G-ROD`, description: t.metaAdmin }
                  : { title: 'G-ROD | Morocco Copper Foundry', description: t.metaHome }

    document.title = page.title

    const descriptionMeta = document.querySelector('meta[name="description"]') || document.createElement('meta')
    descriptionMeta.setAttribute('name', 'description')
    descriptionMeta.setAttribute('content', page.description)
    if (!descriptionMeta.parentNode) document.head.appendChild(descriptionMeta)

    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
    ogTitle.setAttribute('property', 'og:title')
    ogTitle.setAttribute('content', page.title)
    if (!ogTitle.parentNode) document.head.appendChild(ogTitle)

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
    ogDescription.setAttribute('property', 'og:description')
    ogDescription.setAttribute('content', page.description)
    if (!ogDescription.parentNode) document.head.appendChild(ogDescription)
  }, [location.pathname, t])

  return null
}

function SmartBreadcrumbs({ t }) {
  const location = useLocation()
  const pathname = location.pathname

  if (pathname === '/') return null

  const productId = pathname.startsWith('/catalogue/') ? pathname.split('/').filter(Boolean).at(-1) : ''
  const product = productId ? officialProducts.find((item) => item.id === productId || slugify(item.nom) === productId) : null
  const adminLabel = pathname.includes('/admin/produits')
    ? t.products
    : pathname.includes('/admin/demandes')
      ? t.requests
      : pathname.includes('/admin/documents')
        ? t.documentRequests
        : pathname.includes('/admin/clients')
          ? t.clients
          : t.navAdmin

  const crumbs = [
    { label: t.navHome, to: '/' },
    pathname.startsWith('/catalogue') ? { label: t.navCatalogue, to: '/catalogue' } : null,
    product ? { label: product.nom } : null,
    pathname === '/resources' ? { label: t.navResources } : null,
    pathname === '/processus' ? { label: t.navProcess } : null,
    pathname === '/pourquoi-grod' ? { label: t.navWhy } : null,
    pathname === '/devis' ? { label: t.navQuote } : null,
    pathname === '/demande-document' ? { label: t.requestADocument } : null,
    pathname.startsWith('/admin') ? { label: t.navAdmin, to: '/admin/dashboard' } : null,
    pathname.startsWith('/admin') && pathname !== '/admin' && pathname !== '/admin/dashboard' && pathname !== '/admin/login'
      ? { label: adminLabel }
      : null,
  ].filter(Boolean)

  return (
    <nav className="smart-breadcrumbs" aria-label={t.breadcrumbLabel}>
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`}>
          {crumb.to && index < crumbs.length - 1 ? <NavLink to={crumb.to}>{crumb.label}</NavLink> : <strong>{crumb.label}</strong>}
        </span>
      ))}
    </nav>
  )
}

function MotionEnhancer() {
  const location = useLocation()

  useEffect(() => {
    const animatedSelector = [
      '.product-card',
      '.resource-card',
      '.legacy-detail-card',
      '.dashboard-card',
      '.priority-summary-card',
      '.pipeline-column',
      '.client-card',
      '.solution-card',
      '.partner-card',
      '.quote-form-card',
      '.commercial-pipeline',
      '.smart-search-panel',
      '.product-advisor',
      '.process-step',
      '.process-control-grid article',
      '.why-reasons-grid article',
      '.why-partners-panel',
      '.quote-configurator',
      '.related-product-card',
      '.admin-analytics-panel',
      '.analytics-card',
      '.document-request-card',
    ].join(',')
    const elements = [...document.querySelectorAll(animatedSelector)]

    elements.forEach((element, index) => {
      element.classList.add('motion-ready')
      element.style.setProperty('--motion-delay', `${Math.min(index * 28, 260)}ms`)
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('motion-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('motion-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [location.pathname])

  return null
}

function ScrollProgress({ t }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0
      setProgress(nextProgress)
      setVisible(scrollTop > 420)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <button
        className={`back-to-top ${visible ? 'visible' : ''}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t.backToTop}
      >
        ↑
      </button>
    </>
  )
}

function QuickActionDock({ t }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) return null

  return (
    <aside className="quick-action-dock" aria-label={t.quickDockLabel}>
      <NavLink to="/devis" className="dock-primary">
        {t.quickDockQuote}
      </NavLink>
      <NavLink to="/catalogue">{t.quickDockCatalog}</NavLink>
      <NavLink to="/resources">{t.quickDockDocs}</NavLink>
      <a href="tel:+212668615608">{t.quickDockCall}</a>
    </aside>
  )
}

function HomePage({ t }) {
  return (
    <>
      <section className="hero-section hero-3d-section">
        <img src="/src/assets/hero.png" alt="Production cuivre G-ROD" />
        <div className="hero-overlay" />
        <Suspense fallback={<div className="copper-3d copper-3d-fallback" aria-hidden="true" />}>
          <CopperScene />
        </Suspense>
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
  const [applicationFilter, setApplicationFilter] = useState('')
  const [sortMode, setSortMode] = useState('recommended')
  const [viewMode, setViewMode] = useState('grid')
  const [activeOnly, setActiveOnly] = useState(true)
  const [previewProduct, setPreviewProduct] = useState(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [compareProducts, setCompareProducts] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [projectProducts, setProjectProducts] = useState([])
  const [advisor, setAdvisor] = useState({ application: '', need: '' })
  const [recentProducts, setRecentProducts] = useState([])
  const [favoriteProducts, setFavoriteProducts] = useState([])

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

  useEffect(() => {
    setRecentProducts(getRecentProducts())
    setFavoriteProducts(getFavoriteProducts())
  }, [])

  const normalizedProducts = useMemo(() => products.map((product) => normalizeProduct(product)), [products])
  const applications = useMemo(
    () => [...new Set(normalizedProducts.flatMap((product) => product.applications))].sort(),
    [normalizedProducts],
  )
  const displayedProducts = useMemo(() => {
    const filteredProducts = normalizedProducts.filter((product) => {
      const text = `${product.nom} ${product.description} ${product.categorie} ${product.applications.join(' ')}`.toLowerCase()
      const matchesSearch = text.includes(search.toLowerCase())
      const matchesApplication = !applicationFilter || product.applications.includes(applicationFilter)
      const matchesActive = !activeOnly || product.actif !== false
      return matchesSearch && matchesApplication && matchesActive
    })

    return [...filteredProducts].sort((first, second) => {
      if (sortMode === 'name') return first.nom.localeCompare(second.nom)
      if (sortMode === 'category') return first.categorie.localeCompare(second.categorie) || first.nom.localeCompare(second.nom)
      if (sortMode === 'active') return Number(second.actif !== false) - Number(first.actif !== false) || first.nom.localeCompare(second.nom)
      return 0
    })
  }, [normalizedProducts, search, applicationFilter, activeOnly, sortMode])
  const recommendedProduct = useMemo(() => {
    if (!advisor.application && !advisor.need) return null
    return getRecommendedProduct(normalizedProducts, advisor)
  }, [normalizedProducts, advisor])
  const smartSearchProduct = useMemo(() => {
    if (!search.trim()) return null
    return getSmartSearchProduct(normalizedProducts, search)
  }, [normalizedProducts, search])

  function toggleCompareProduct(product) {
    setCompareProducts((current) => {
      const exists = current.some((item) => (item.id || item.nom) === (product.id || product.nom))
      if (exists) {
        return current.filter((item) => (item.id || item.nom) !== (product.id || product.nom))
      }
      return current.length >= 3 ? current : [...current, product]
    })
  }

  function toggleProjectProduct(product) {
    setProjectProducts((current) => {
      const exists = current.some((item) => (item.id || item.nom) === (product.id || product.nom))
      if (exists) {
        return current.filter((item) => (item.id || item.nom) !== (product.id || product.nom))
      }
      return [...current, product]
    })
  }

  function toggleFavoriteProduct(product) {
    setFavoriteProducts((current) => {
      const exists = current.some((item) => (item.id || item.nom) === (product.id || product.nom))
      const nextProducts = exists
        ? current.filter((item) => (item.id || item.nom) !== (product.id || product.nom))
        : [normalizeProduct(product), ...current].slice(0, 8)
      localStorage.setItem(FAVORITE_PRODUCTS_KEY, JSON.stringify(nextProducts))
      return nextProducts
    })
  }

  const projectQuoteUrl = `/devis?produit=${encodeURIComponent(projectProducts[0]?.nom || '')}&produits=${encodeURIComponent(projectProducts.map((product) => product.nom).join(','))}`
  const favoriteQuoteUrl = `/devis?produit=${encodeURIComponent(favoriteProducts[0]?.nom || '')}&produits=${encodeURIComponent(favoriteProducts.map((product) => product.nom).join(','))}`
  const sortLabels = {
    recommended: t.sortRecommended,
    name: t.sortName,
    category: t.sortCategory,
    active: t.sortActive,
  }
  const hasCatalogueFilters = Boolean(search || applicationFilter || !activeOnly || sortMode !== 'recommended')

  return (
    <main className="page-section catalogue-page">
      <div className="section-heading catalogue-heading">
        <div>
          <p className="eyebrow">{t.catalogueEyebrow}</p>
          <h2>{t.catalogueTitle}</h2>
        </div>
        <label className="active-only-control">
          <input type="checkbox" checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />
          {t.activeOnly}
        </label>
      </div>

      <div className="catalogue-tools">
        <label>
          {t.productSearch}
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.productSearchPlaceholder} />
        </label>
        <label>
          {t.applicationFilter}
          <select value={applicationFilter} onChange={(event) => setApplicationFilter(event.target.value)}>
            <option value="">{t.allApplications}</option>
            {applications.map((application) => (
              <option key={application} value={application}>
                {application}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.sortProducts}
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="recommended">{t.sortRecommended}</option>
            <option value="name">{t.sortName}</option>
            <option value="category">{t.sortCategory}</option>
            <option value="active">{t.sortActive}</option>
          </select>
        </label>
      </div>

      <section className="catalogue-result-summary">
        <div>
          <span>{displayedProducts.length}</span>
          <strong>{displayedProducts.length > 1 ? t.catalogueResultsPlural : t.catalogueResultsSingle}</strong>
        </div>
        <p>{hasCatalogueFilters ? t.catalogueFilteredHint : t.catalogueAllVisibleHint}</p>
        <div className="catalogue-view-switch" aria-label={t.viewMode}>
          <button type="button" className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
            {t.gridView}
          </button>
          <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            {t.listView}
          </button>
        </div>
        {hasCatalogueFilters ? (
          <button type="button" className="secondary-button" onClick={() => {
            setSearch('')
            setApplicationFilter('')
            setSortMode('recommended')
            setActiveOnly(true)
          }}>
            {t.resetFilters}
          </button>
        ) : null}
      </section>

      {hasCatalogueFilters ? (
        <section className="active-filter-chips" aria-label={t.activeFilters}>
          <span>{t.activeFilters}</span>
          {search ? (
            <button type="button" onClick={() => setSearch('')}>
              {t.productSearch}: {search}
            </button>
          ) : null}
          {applicationFilter ? (
            <button type="button" onClick={() => setApplicationFilter('')}>
              {t.applicationFilter}: {applicationFilter}
            </button>
          ) : null}
          {sortMode !== 'recommended' ? (
            <button type="button" onClick={() => setSortMode('recommended')}>
              {t.sortProducts}: {sortLabels[sortMode]}
            </button>
          ) : null}
          {!activeOnly ? (
            <button type="button" onClick={() => setActiveOnly(true)}>
              {t.allProductStatuses}
            </button>
          ) : null}
        </section>
      ) : null}

      {smartSearchProduct ? (
        <section className="smart-search-panel">
          <div>
            <p className="eyebrow">{t.smartSearchEyebrow}</p>
            <h3>{smartSearchProduct.nom}</h3>
            <p>{getSmartSearchReason(smartSearchProduct, search, t)}</p>
          </div>
          <div className="smart-search-actions">
            <button type="button" onClick={() => setPreviewProduct(smartSearchProduct)}>{t.quick3dPreview}</button>
            <NavLink className="secondary-link" to={`/catalogue/${smartSearchProduct.id || slugify(smartSearchProduct.nom)}`}>
              {t.productDetail}
            </NavLink>
            <NavLink className="primary-link" to={`/devis?produit=${encodeURIComponent(smartSearchProduct.nom)}`}>
              {t.requestQuote}
            </NavLink>
          </div>
        </section>
      ) : null}

      {recentProducts.length ? (
        <section className="recent-products-panel">
          <div>
            <p className="eyebrow">{t.recentProductsEyebrow}</p>
            <h3>{t.recentProductsTitle}</h3>
          </div>
          <div className="recent-products-list">
            {recentProducts.map((product) => (
              <NavLink to={`/catalogue/${product.id || slugify(product.nom)}`} key={product.id || product.nom}>
                <img src={product.imageUrl} alt="" />
                <span>{product.nom}</span>
              </NavLink>
            ))}
          </div>
        </section>
      ) : null}

      {favoriteProducts.length ? (
        <section className="favorite-products-panel">
          <div>
            <p className="eyebrow">{t.favoriteProductsEyebrow}</p>
            <h3>{t.favoriteProductsTitle}</h3>
            <p>{favoriteProducts.map((product) => product.nom).join(' / ')}</p>
          </div>
          <div>
            <NavLink className="primary-link" to={favoriteQuoteUrl}>{t.prepareFavoriteQuote}</NavLink>
            <button type="button" className="secondary-button" onClick={() => {
              localStorage.removeItem(FAVORITE_PRODUCTS_KEY)
              setFavoriteProducts([])
            }}>
              {t.clearFavorites}
            </button>
          </div>
        </section>
      ) : null}

      <section className="product-advisor">
        <div>
          <p className="eyebrow">{t.advisorEyebrow}</p>
          <h3>{t.advisorTitle}</h3>
        </div>
        <label>
          {t.advisorApplication}
          <select value={advisor.application} onChange={(event) => setAdvisor((current) => ({ ...current, application: event.target.value }))}>
            <option value="">{t.advisorChoose}</option>
            <option value="electricite">{t.advisorElectricity}</option>
            <option value="electrolyse">{t.advisorElectrolysis}</option>
            <option value="plomberie">{t.advisorPlumbing}</option>
            <option value="fabrication">{t.advisorFabrication}</option>
            <option value="sur-mesure">{t.advisorCustom}</option>
          </select>
        </label>
        <label>
          {t.advisorNeed}
          <select value={advisor.need} onChange={(event) => setAdvisor((current) => ({ ...current, need: event.target.value }))}>
            <option value="">{t.advisorChoose}</option>
            <option value="conductivite">{t.advisorConductivity}</option>
            <option value="forme-plate">{t.advisorFlat}</option>
            <option value="tube">{t.advisorTube}</option>
            <option value="fil">{t.advisorWire}</option>
            <option value="piece-speciale">{t.advisorSpecialPart}</option>
          </select>
        </label>
        {recommendedProduct ? (
          <article className="advisor-result">
            <span>{t.advisorRecommendation}</span>
            <strong>{recommendedProduct.nom}</strong>
            <p>{getRecommendationReason(recommendedProduct, advisor, t)}</p>
            <div>
              <button type="button" onClick={() => setPreviewProduct(recommendedProduct)}>{t.quick3dPreview}</button>
              <NavLink className="secondary-link" to={`/catalogue/${recommendedProduct.id || slugify(recommendedProduct.nom)}`}>
                {t.productDetail}
              </NavLink>
              <NavLink className="primary-link" to={`/devis?produit=${encodeURIComponent(recommendedProduct.nom)}`}>
                {t.requestQuote}
              </NavLink>
            </div>
          </article>
        ) : null}
      </section>

      {compareProducts.length ? (
        <section className="compare-toolbar">
          <div>
            <strong>{compareProducts.length} {t.compareSelected}</strong>
            <span>{compareProducts.map((product) => product.nom).join(' / ')}</span>
          </div>
          <div>
            <button type="button" onClick={() => setCompareOpen(true)} disabled={compareProducts.length < 2}>
              {t.compareProducts}
            </button>
            <button type="button" className="secondary-button" onClick={() => setCompareProducts([])}>
              {t.clearCompare}
            </button>
          </div>
        </section>
      ) : null}

      {projectProducts.length ? (
        <section className="project-selection-bar">
          <div>
            <span>{t.projectSelectionEyebrow}</span>
            <strong>{projectProducts.length} {t.projectSelectionCount}</strong>
            <p>{projectProducts.map((product) => product.nom).join(' / ')}</p>
          </div>
          <div>
            <NavLink className="primary-link" to={projectQuoteUrl}>
              {t.prepareGroupedQuote}
            </NavLink>
            <button type="button" className="secondary-button" onClick={() => setProjectProducts([])}>
              {t.clearSelection}
            </button>
          </div>
        </section>
      ) : null}

      {loading ? (
        <div className="products-grid skeleton-grid" aria-label={t.loading}>
          {Array.from({ length: 8 }).map((_, index) => (
            <article className="product-card skeleton-card" key={`product-skeleton-${index}`}>
              <div className="skeleton-media" />
              <div className="skeleton-body">
                <span />
                <strong />
                <p />
                <p />
                <div />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !displayedProducts.length ? (
        <section className="catalogue-empty-state">
          <p className="eyebrow">{t.noProductEyebrow}</p>
          <h3>{t.noProductTitle}</h3>
          <p>{t.noProductText}</p>
          <div>
            <button type="button" onClick={() => {
              setSearch('')
              setApplicationFilter('')
              setSortMode('recommended')
              setActiveOnly(true)
            }}>
              {t.resetFilters}
            </button>
            <NavLink className="secondary-link" to="/devis">
              {t.requestQuote}
            </NavLink>
          </div>
        </section>
      ) : null}

      {!loading ? (
      <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id || product.nom}
            product={product}
            t={t}
            onPreview={setPreviewProduct}
            onQuickView={setQuickViewProduct}
            onCompare={toggleCompareProduct}
            onProjectSelect={toggleProjectProduct}
            onFavorite={toggleFavoriteProduct}
            compareSelected={compareProducts.some((item) => (item.id || item.nom) === (product.id || product.nom))}
            compareDisabled={compareProducts.length >= 3 && !compareProducts.some((item) => (item.id || item.nom) === (product.id || product.nom))}
            projectSelected={projectProducts.some((item) => (item.id || item.nom) === (product.id || product.nom))}
            favoriteSelected={favoriteProducts.some((item) => (item.id || item.nom) === (product.id || product.nom))}
          />
        ))}
      </div>
      ) : null}

      {previewProduct ? (
        <section className="catalogue-3d-modal" role="dialog" aria-modal="true">
          <div className="catalogue-3d-panel">
            <div className="catalogue-3d-heading">
              <div>
                <p className="eyebrow">{t.quick3dPreview}</p>
                <h3>{previewProduct.nom}</h3>
              </div>
              <button type="button" onClick={() => setPreviewProduct(null)}>{t.close}</button>
            </div>
            <Suspense fallback={<div className="product-3d-viewer product-3d-fallback"><span>3D</span></div>}>
              <Product3DViewer product={previewProduct} />
            </Suspense>
          </div>
        </section>
      ) : null}

      {quickViewProduct ? (
        <section className="quick-view-modal" role="dialog" aria-modal="true">
          <button className="quick-view-backdrop" type="button" aria-label={t.close} onClick={() => setQuickViewProduct(null)} />
          <article className="quick-view-panel">
            <div className="quick-view-media">
              <img src={quickViewProduct.imageUrl} alt={quickViewProduct.nom} />
            </div>
            <div className="quick-view-content">
              <div className="quick-view-heading">
                <div>
                  <p className="eyebrow">{t.quickViewEyebrow}</p>
                  <h3>{quickViewProduct.nom}</h3>
                </div>
                <button type="button" onClick={() => setQuickViewProduct(null)}>{t.close}</button>
              </div>
              <p>{quickViewProduct.description}</p>
              <dl className="quick-view-specs">
                <div><dt>{t.purity}</dt><dd>{quickViewProduct.purete || '-'}</dd></div>
                <div><dt>{t.dimensions}</dt><dd>{quickViewProduct.dimensions || '-'}</dd></div>
                <div><dt>{t.standards}</dt><dd>{quickViewProduct.normes || '-'}</dd></div>
                <div><dt>{t.applications}</dt><dd>{quickViewProduct.applications.join(', ')}</dd></div>
              </dl>
              <div className="quick-view-actions">
                <button type="button" onClick={() => {
                  setQuickViewProduct(null)
                  setPreviewProduct(quickViewProduct)
                }}>
                  {t.quick3dPreview}
                </button>
                <NavLink className="secondary-link" to={`/catalogue/${quickViewProduct.id || slugify(quickViewProduct.nom)}`}>
                  {t.productDetail}
                </NavLink>
                <NavLink className="primary-link" to={`/devis?produit=${encodeURIComponent(quickViewProduct.nom)}`}>
                  {t.requestQuote}
                </NavLink>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {compareOpen ? (
        <section className="compare-3d-modal" role="dialog" aria-modal="true">
          <div className="compare-3d-panel">
            <div className="compare-3d-heading">
              <div>
                <p className="eyebrow">{t.compare3dTitle}</p>
                <h3>{compareProducts.map((product) => product.nom).join(' vs ')}</h3>
              </div>
              <button type="button" onClick={() => setCompareOpen(false)}>{t.close}</button>
            </div>
            <div className="compare-3d-grid">
              {compareProducts.map((product) => (
                <article className="compare-3d-card" key={product.id || product.nom}>
                  <Suspense fallback={<div className="product-3d-viewer product-3d-fallback"><span>3D</span></div>}>
                    <Product3DViewer product={product} />
                  </Suspense>
                  <div className="compare-3d-info">
                    <h4>{product.nom}</h4>
                    <dl>
                      <div><dt>{t.purity}</dt><dd>{product.purete || '-'}</dd></div>
                      <div><dt>{t.dimensions}</dt><dd>{product.dimensions || '-'}</dd></div>
                      <div><dt>{t.standards}</dt><dd>{product.normes || '-'}</dd></div>
                      <div><dt>{t.applications}</dt><dd>{product.applications.join(', ')}</dd></div>
                    </dl>
                    <NavLink className="primary-link" to={`/devis?produit=${encodeURIComponent(product.nom)}`}>
                      {t.requestQuote}
                    </NavLink>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}

function ProductCard({ product, t, onPreview, onQuickView, onCompare, onProjectSelect, onFavorite, compareSelected, compareDisabled, projectSelected, favoriteSelected }) {
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
        <div className="product-card-actions">
          <button type="button" className="text-link quick-view-button" onClick={() => onQuickView(product)}>
            {t.quickView}
          </button>
          <button
            type="button"
            className={`text-link favorite-select-button ${favoriteSelected ? 'active' : ''}`}
            onClick={() => onFavorite(product)}
          >
            {favoriteSelected ? t.removeFavorite : t.addFavorite}
          </button>
          <button
            type="button"
            className={`text-link project-select-button ${projectSelected ? 'active' : ''}`}
            onClick={() => onProjectSelect(product)}
          >
            {projectSelected ? t.removeFromProject : t.addToProject}
          </button>
          <button
            type="button"
            className={`text-link compare-select-button ${compareSelected ? 'active' : ''}`}
            onClick={() => onCompare(product)}
            disabled={compareDisabled}
          >
            {compareSelected ? t.removeCompare : t.addCompare}
          </button>
          <button type="button" className="text-link product-3d-preview-button" onClick={() => onPreview(product)}>
            {t.quick3dPreview}
          </button>
          <NavLink className="text-link" to={`/catalogue/${product.id || slugify(product.nom)}`}>
            {t.productDetail}
          </NavLink>
          <NavLink className="text-link" to={`/devis?produit=${encodeURIComponent(product.nom)}`}>
            {t.requestQuote}
          </NavLink>
        </div>
      </div>
    </article>
  )
}

function ProductDetailPage({ t }) {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDetail3d, setShowDetail3d] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      const localProduct = officialProducts.find((item) => item.id === productId || slugify(item.nom) === productId)

      try {
        if (/^\d+$/.test(productId)) {
          const response = await fetch(`${API_URL}/produits/actifs`)
          if (response.ok) {
            const activeProducts = await response.json()
            const backendProduct = activeProducts.find((item) => String(item.id) === String(productId))
            if (backendProduct) {
              setProduct(normalizeProduct(backendProduct))
              return
            }
          }
        }
        setProduct(normalizeProduct(localProduct || officialProducts[0]))
      } catch {
        setProduct(normalizeProduct(localProduct || officialProducts[0]))
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  useEffect(() => {
    if (product) saveRecentProduct(product)
  }, [product])

  useEffect(() => {
    setShowDetail3d(false)
  }, [productId])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return officialProducts
      .map((item) => normalizeProduct(item))
      .filter((item) => (item.id || item.nom) !== (product.id || product.nom))
      .map((item) => {
        const sharedApplications = item.applications.filter((application) => product.applications.includes(application)).length
        const sameCategory = item.categorie === product.categorie ? 2 : 0
        return { ...item, relationScore: sharedApplications + sameCategory }
      })
      .filter((item) => item.relationScore > 0)
      .sort((first, second) => second.relationScore - first.relationScore || first.nom.localeCompare(second.nom))
      .slice(0, 3)
  }, [product])

  if (loading || !product) {
    return (
      <main className="page-section">
        <p>{t.loading}</p>
      </main>
    )
  }

  return (
    <main className="product-detail-page">
      <section className="legacy-product-detail">
        <NavLink className="text-link product-back-link" to="/catalogue">{t.backCatalogue}</NavLink>

        <div className="legacy-product-hero">
          <article className="legacy-product-intro">
          <p className="eyebrow">{product.categorie}</p>
            <h1>{product.nom}</h1>
          <p>{product.description}</p>
            <dl className="product-hero-specs">
              <div>
                <dt>{t.purity}</dt>
                <dd>{product.purete || '-'}</dd>
              </div>
              <div>
                <dt>{t.dimensions}</dt>
                <dd>{product.dimensions || '-'}</dd>
              </div>
              <div>
                <dt>{t.standards}</dt>
                <dd>{product.normes || '-'}</dd>
              </div>
            </dl>
            <div className="legacy-product-actions">
            <NavLink className="primary-link" to={`/devis?produit=${encodeURIComponent(product.nom)}`}>
              {t.requestQuote}
            </NavLink>
              <a className="secondary-link" href="#documents-section">
                {t.viewDocuments}
            </a>
              <ShareProductButton product={product} t={t} />
              <span className="status-badge active">{t.active}</span>
          </div>
          </article>

          <aside className="legacy-product-media">
            {showDetail3d ? (
              <Suspense fallback={<div className="product-3d-viewer product-3d-fallback"><span>3D</span></div>}>
                <Product3DViewer product={product} />
              </Suspense>
            ) : (
              <div className="legacy-product-image-preview">
                <img src={product.imageUrl} alt={product.nom} />
                <button type="button" onClick={() => setShowDetail3d(true)}>
                  {t.quick3dPreview}
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="page-section legacy-product-grid" id="technical-sheet">
        <article className="legacy-detail-card">
          <h3>{t.applications}</h3>
          <ul className="legacy-bullet-list">
            {product.applications.map((application) => (
              <li key={application}>{application}</li>
            ))}
            <li>{t.copperTransformation}</li>
          </ul>
        </article>

        <article className="legacy-detail-card">
          <h3>{t.techInfo}</h3>
          <dl className="legacy-spec-list">
            <div><dt>{t.formLabel}</dt><dd>{getProductForm(product)}</dd></div>
            <div><dt>{t.usageLabel}</dt><dd>{getProductUsage(product)}</dd></div>
            <div><dt>{t.demandLabel}</dt><dd>{product.dimensions}</dd></div>
          </dl>
        </article>

        <article className="legacy-detail-card" id="documents-section">
          <h3>{t.availableDocuments}</h3>
          <ul className="legacy-bullet-list">
            <li>{t.technicalSheet}</li>
            <li>{t.materialCertificate}</li>
            <li>{t.analysisCertificate}</li>
            <li>{t.safetyHandlingInfo}</li>
          </ul>
        </article>

        <article className="legacy-detail-card">
          <h3>{t.quoteInfoTitle}</h3>
          <dl className="legacy-spec-list">
            <div><dt>{t.applicationNeed}</dt><dd>{t.applicationNeedValue}</dd></div>
            <div><dt>{t.normReference}</dt><dd>{product.normes}</dd></div>
            <div><dt>{t.drawingPlan}</dt><dd>{t.drawingPlanValue}</dd></div>
          </dl>
        </article>
      </section>

      {relatedProducts.length ? (
        <section className="page-section related-products-section">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">{t.relatedProductsEyebrow}</p>
              <h2>{t.relatedProductsTitle}</h2>
            </div>
            <NavLink className="secondary-link" to="/catalogue">
              {t.backCatalogue}
            </NavLink>
          </div>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <article className="related-product-card" key={relatedProduct.id || relatedProduct.nom}>
                <img src={relatedProduct.imageUrl} alt={relatedProduct.nom} />
                <div>
                  <span>{relatedProduct.categorie}</span>
                  <h3>{relatedProduct.nom}</h3>
                  <p>{relatedProduct.description}</p>
                  <nav>
                    <NavLink className="text-link" to={`/catalogue/${relatedProduct.id || slugify(relatedProduct.nom)}`}>
                      {t.productDetail}
                    </NavLink>
                    <NavLink className="primary-link" to={`/devis?produit=${encodeURIComponent(relatedProduct.nom)}`}>
                      {t.requestQuote}
                    </NavLink>
                  </nav>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="product-sticky-conversion" aria-label={t.productActionBar}>
        <div>
          <span>{t.productActionBar}</span>
          <strong>{product.nom}</strong>
        </div>
        <nav>
          <NavLink className="primary-link" to={`/devis?produit=${encodeURIComponent(product.nom)}`}>
            {t.requestQuote}
          </NavLink>
          <a className="secondary-link" href="#documents-section">
            {t.viewDocuments}
          </a>
          <ShareProductButton product={product} t={t} />
        </nav>
      </section>
    </main>
  )
}

function ShareProductButton({ product, t }) {
  const [copied, setCopied] = useState(false)

  async function shareProduct() {
    const url = window.location.href
    const shareData = {
      title: `${product.nom} | G-ROD`,
      text: product.description,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2400)
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2400)
      } catch {
        setCopied(false)
      }
    }
  }

  return (
    <button type="button" className="secondary-button share-product-button" onClick={shareProduct}>
      {copied ? t.linkCopied : t.shareProduct}
    </button>
  )
}

function ResourcesPage({ t }) {
  const [backendDocs, setBackendDocs] = useState([])
  const [request, setRequest] = useState(emptyDocumentRequest())
  const [status, setStatus] = useState('')
  const [resourceSearch, setResourceSearch] = useState('')
  const [resourceType, setResourceType] = useState('')

  useEffect(() => {
    async function loadDocs() {
      try {
        const response = await fetch(`${API_URL}/documents-techniques/actifs`)
        if (response.ok) setBackendDocs(await response.json())
      } catch {
        setBackendDocs([])
      }
    }
    loadDocs()
  }, [])

  const allResources = [
    ...resources,
    ...backendDocs.map((document) => ({
      title: document.titre,
      type: document.typeDocument,
      text: document.description || document.fichierNom,
      href: document.telechargementPublic ? document.fichierUrl : null,
      product: document.produitConcerne,
    })),
  ]
  const resourceTypes = [...new Set(allResources.map((resource) => resource.type).filter(Boolean))].sort()
  const filteredResources = allResources.filter((resource) => {
    const text = `${resource.title} ${resource.type} ${resource.text} ${resource.product || ''}`.toLowerCase()
    const matchesSearch = text.includes(resourceSearch.toLowerCase())
    const matchesType = !resourceType || resource.type === resourceType
    return matchesSearch && matchesType
  })

  async function submitDocumentRequest(event) {
    event.preventDefault()
    setStatus(t.sending)
    try {
      const response = await fetch(`${API_URL}/demandes-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!response.ok) throw new Error('Document request failed')
      const data = await response.json()
      setRequest(emptyDocumentRequest())
      setStatus(`${t.documentRequestSuccess} ${data.referenceDemande || ''}`)
    } catch {
      setStatus(t.documentRequestError)
    }
  }

  return (
    <main className="resources-page">
      <section className="resources-hero">
        <div>
          <p className="eyebrow">{t.resourcesEyebrow}</p>
          <h2>{t.resourcesTitle}</h2>
          <p>{t.resourcesText}</p>
        </div>
        <a className="primary-link" href="#document-request">
          {t.requestADocument}
        </a>
      </section>

      <section className="page-section resource-tools">
        <label>
          {t.documentSearch}
          <input value={resourceSearch} onChange={(event) => setResourceSearch(event.target.value)} placeholder={t.documentSearchPlaceholder} />
        </label>
        <label>
          {t.documentType}
          <select value={resourceType} onChange={(event) => setResourceType(event.target.value)}>
            <option value="">{t.allTypes}</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="page-section resource-grid">
        {filteredResources.map((resource) => (
          <article className="resource-card" key={resource.title}>
            <div className="resource-card-header">
              <span>{resource.type}</span>
              <strong>{resource.href ? t.available : t.onRequest}</strong>
            </div>
            <h3>{resource.title}</h3>
            <p>{resource.text}</p>
            {resource.product ? <span className="resource-product">{resource.product}</span> : null}
            {resource.href ? (
              <a className="text-link" href={resource.href} download>
                {t.download}
              </a>
            ) : (
              <NavLink className="text-link" to={`/demande-document?document=${encodeURIComponent(resource.title)}&type=${encodeURIComponent(resource.type || '')}&produit=${encodeURIComponent(resource.product || '')}`}>
                {t.requestDocument}
              </NavLink>
            )}
          </article>
        ))}
      </section>

      <section className="page-section faq-section">
        <div>
          <p className="eyebrow">{t.technicalFaq}</p>
          <h2>{t.faqTitle}</h2>
        </div>
        <div className="faq-list">
          <article className="faq-item">
            <h3>{t.faqDocumentsQuestion}</h3>
            <p>{t.faqDocumentsAnswer}</p>
          </article>
          <article className="faq-item">
            <h3>{t.faqPurityQuestion}</h3>
            <p>{t.faqPurityAnswer}</p>
          </article>
          <article className="faq-item">
            <h3>{t.faqCustomQuestion}</h3>
            <p>{t.faqCustomAnswer}</p>
          </article>
          <article className="faq-item">
            <h3>{t.faqStandardsQuestion}</h3>
            <p>{t.faqStandardsAnswer}</p>
          </article>
        </div>
      </section>

      <section className="page-section document-request-form" id="document-request">
        <div>
          <p className="eyebrow">{t.documentRequestEyebrow}</p>
          <h2>{t.documentRequestTitle}</h2>
          <p>{t.documentRequestText}</p>
        </div>
        <form className="quote-form" onSubmit={submitDocumentRequest}>
          <Field label={t.company} name="societe" value={request.societe} onChange={(event) => setProductFormValue(setRequest, event)} required />
          <Field label={t.contact} name="nomContact" value={request.nomContact} onChange={(event) => setProductFormValue(setRequest, event)} required />
          <Field label={t.email} name="email" type="email" value={request.email} onChange={(event) => setProductFormValue(setRequest, event)} required />
          <Field label={t.phone} name="telephone" value={request.telephone} onChange={(event) => setProductFormValue(setRequest, event)} required />
          <Field label={t.documentType} name="typeDocument" value={request.typeDocument} onChange={(event) => setProductFormValue(setRequest, event)} required />
          <Field label={t.documentTitle} name="titreDocument" value={request.titreDocument} onChange={(event) => setProductFormValue(setRequest, event)} required />
          <Field label={t.concernedProduct} name="produitConcerne" value={request.produitConcerne} onChange={(event) => setProductFormValue(setRequest, event)} />
          <label>
            {t.message}
            <textarea name="message" rows="4" value={request.message} onChange={(event) => setProductFormValue(setRequest, event)} />
          </label>
          <button type="submit">{t.submitDocumentRequest}</button>
          {status ? <p className="form-status">{status}</p> : null}
        </form>
      </section>
    </main>
  )
}

function ProductionProcessPage({ t }) {
  const processSteps = [
    { number: '01', title: t.processStepReceptionTitle, text: t.processStepReceptionText, tag: t.processZoneRaw },
    { number: '02', title: t.processStepSortingTitle, text: t.processStepSortingText, tag: t.processZoneRaw },
    { number: '03', title: t.processStepWeighingTitle, text: t.processStepWeighingText, tag: t.processZoneControl },
    { number: '04', title: t.processStepLabTitle, text: t.processStepLabText, tag: t.processZoneQuality },
    { number: '05', title: t.processStepFurnaceTitle, text: t.processStepFurnaceText, tag: t.processZoneProduction },
    { number: '06', title: t.processStepCastingTitle, text: t.processStepCastingText, tag: t.processZoneProduction },
    { number: '07', title: t.processStepStockTitle, text: t.processStepStockText, tag: t.processZoneLogistics },
    { number: '08', title: t.processStepExportTitle, text: t.processStepExportText, tag: t.processZoneLogistics },
  ]

  const controlPoints = [
    { title: t.processControlSecurity, text: t.processControlSecurityText },
    { title: t.processControlTraceability, text: t.processControlTraceabilityText },
    { title: t.processControlQuality, text: t.processControlQualityText },
    { title: t.processControlPerformance, text: t.processControlPerformanceText },
  ]

  return (
    <main className="process-page">
      <section className="process-hero">
        <div>
          <p className="eyebrow">{t.processEyebrow}</p>
          <h2>{t.processTitle}</h2>
          <p>{t.processText}</p>
          <div className="process-hero-actions">
            <NavLink className="primary-link" to="/devis">{t.requestQuote}</NavLink>
            <NavLink className="secondary-link" to="/resources">{t.navResources}</NavLink>
          </div>
        </div>
        <aside className="process-hero-card">
          <strong>MCF</strong>
          <span>{t.processHeroBadge}</span>
          <dl>
            <div><dt>{t.processMetricFlow}</dt><dd>8</dd></div>
            <div><dt>{t.processMetricPurity}</dt><dd>99.99%</dd></div>
            <div><dt>{t.processMetricTraceability}</dt><dd>100%</dd></div>
          </dl>
        </aside>
      </section>

      <section className="process-flow-panel">
        <div className="process-flow-heading">
          <div>
            <p className="eyebrow">{t.processFlowEyebrow}</p>
            <h3>{t.processFlowTitle}</h3>
          </div>
          <span>{t.processFlowHint}</span>
        </div>
        <div className="process-flow-line">
          {processSteps.map((step) => (
            <article className="process-step" key={step.number}>
              <span>{step.number}</span>
              <small>{step.tag}</small>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="process-control-grid">
        {controlPoints.map((point) => (
          <article key={point.title}>
            <span />
            <h3>{point.title}</h3>
            <p>{point.text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

function WhyGrodPage({ t }) {
  const reasons = [
    { title: t.whyRecyclingTitle, text: t.whyRecyclingText, metric: t.whyRecyclingMetric },
    { title: t.whyCarbonTitle, text: t.whyCarbonText, metric: t.whyCarbonMetric },
    { title: t.whyMoroccoTitle, text: t.whyMoroccoText, metric: t.whyMoroccoMetric },
    { title: t.whyQualityTitle, text: t.whyQualityText, metric: t.whyQualityMetric },
    { title: t.whyTraceabilityTitle, text: t.whyTraceabilityText, metric: t.whyTraceabilityMetric },
    { title: t.whyPartnersTitle, text: t.whyPartnersText, metric: t.whyPartnersMetric },
  ]

  return (
    <main className="why-page">
      <section className="why-hero">
        <div>
          <p className="eyebrow">{t.whyEyebrow}</p>
          <h2>{t.whyTitle}</h2>
          <p>{t.whyText}</p>
          <div className="why-hero-actions">
            <NavLink className="primary-link" to="/catalogue">{t.heroCatalogue}</NavLink>
            <NavLink className="secondary-link" to="/devis">{t.requestQuote}</NavLink>
          </div>
        </div>
        <aside className="why-impact-card">
          <span>{t.whyImpactEyebrow}</span>
          <strong>{t.whyImpactTitle}</strong>
          <p>{t.whyImpactText}</p>
        </aside>
      </section>

      <section className="why-reasons-grid">
        {reasons.map((reason) => (
          <article key={reason.title}>
            <span>{reason.metric}</span>
            <h3>{reason.title}</h3>
            <p>{reason.text}</p>
          </article>
        ))}
      </section>

      <section className="why-partners-panel">
        <div>
          <p className="eyebrow">{t.partnersEyebrow}</p>
          <h3>{t.whyPartnersPanelTitle}</h3>
          <p>{t.whyPartnersPanelText}</p>
        </div>
        <div className="why-partners-strip">
          {partners.map((partner) => (
            <span key={partner}>
              <img src={`/partners/${partner}.svg`} alt={`${partner} logo`} />
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}

function DocumentRequestPage({ t }) {
  const params = new URLSearchParams(window.location.search)
  const [request, setRequest] = useState({
    ...emptyDocumentRequest(),
    titreDocument: params.get('document') || '',
    typeDocument: params.get('type') || '',
    produitConcerne: params.get('produit') || '',
  })
  const [status, setStatus] = useState('')

  async function submitDocumentRequest(event) {
    event.preventDefault()
    setStatus(t.sending)
    try {
      const response = await fetch(`${API_URL}/demandes-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!response.ok) throw new Error('Document request failed')
      const data = await response.json()
      setStatus(`${t.documentRequestSuccess} ${data.referenceDemande || ''}`)
    } catch {
      setStatus(t.documentRequestError)
    }
  }

  return (
    <main className="document-request-page">
      <section className="document-request-heading">
        <div>
          <p className="eyebrow">{t.documentRequestEyebrow}</p>
          <h2>{t.documentRequestTitle}</h2>
          <p>{t.documentRequestStandaloneText}</p>
        </div>
        <NavLink className="secondary-link" to="/resources">
          {t.navResources}
        </NavLink>
      </section>

      <form className="document-request-card" onSubmit={submitDocumentRequest}>
        <Field label={t.company} name="societe" value={request.societe} onChange={(event) => setProductFormValue(setRequest, event)} required />
        <Field label={t.contact} name="nomContact" value={request.nomContact} onChange={(event) => setProductFormValue(setRequest, event)} required />
        <Field label={t.email} name="email" type="email" value={request.email} onChange={(event) => setProductFormValue(setRequest, event)} required />
        <Field label={t.phone} name="telephone" value={request.telephone} onChange={(event) => setProductFormValue(setRequest, event)} required />
        <label className="field-wide">
          {t.requestedDocument}
          <select name="titreDocument" value={request.titreDocument} onChange={(event) => setProductFormValue(setRequest, event)} required>
            <option value="">{t.chooseDocument}</option>
            {resources.map((resource) => (
              <option key={resource.title} value={resource.title}>
                {resource.title}
              </option>
            ))}
          </select>
        </label>
        <Field label={t.documentType} name="typeDocument" value={request.typeDocument} onChange={(event) => setProductFormValue(setRequest, event)} required />
        <label>
          {t.concernedProduct}
          <select name="produitConcerne" value={request.produitConcerne} onChange={(event) => setProductFormValue(setRequest, event)}>
            <option value="">{t.allProductsUnspecified}</option>
            {officialProducts.map((product) => (
              <option key={product.nom} value={product.nom}>
                {product.nom}
              </option>
            ))}
          </select>
        </label>
        <label className="field-wide">
          {t.message}
          <textarea
            name="message"
            rows="5"
            value={request.message}
            placeholder={t.documentMessagePlaceholder}
            onChange={(event) => setProductFormValue(setRequest, event)}
          />
        </label>
        <button className="field-wide" type="submit">{t.submitDocumentRequest}</button>
        {status ? <p className="form-status field-wide">{status}</p> : null}
      </form>
    </main>
  )
}

function QuotePage({ t }) {
  const params = new URLSearchParams(window.location.search)
  const groupedProducts = (params.get('produits') || '')
    .split(',')
    .map((productName) => productName.trim())
    .filter(Boolean)
  const initialQuoteForm = {
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
    applicationProjet: '',
    finitionSouhaitee: t.finishUndefined,
    normeReference: '',
    lienPlanTechnique: '',
    diametreSouhaite: '',
    message: groupedProducts.length > 1 ? `${t.groupedQuoteMessage}: ${groupedProducts.join(', ')}` : '',
    fichierTechniqueUrl: '',
    fichierTechniqueNom: '',
  }
  const [form, setForm] = useState(() => getQuoteDraftForm(initialQuoteForm, Boolean(params.get('produit') || groupedProducts.length)))
  const [status, setStatus] = useState('')
  const [draftSaved, setDraftSaved] = useState(false)

  useEffect(() => {
    if (!hasQuoteDraftContent(form)) {
      localStorage.removeItem(QUOTE_DRAFT_KEY)
      setDraftSaved(false)
      return undefined
    }

    const timeout = window.setTimeout(() => {
      localStorage.setItem(QUOTE_DRAFT_KEY, JSON.stringify(form))
      setDraftSaved(true)
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [form])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitQuote(event) {
    event.preventDefault()
    setStatus(t.sending)
    const extraMessage = [
      form.applicationProjet ? `${t.projectApplication}: ${form.applicationProjet}` : '',
      form.finitionSouhaitee ? `${t.desiredFinish}: ${form.finitionSouhaitee}` : '',
      form.normeReference ? `${t.normReference}: ${form.normeReference}` : '',
      form.lienPlanTechnique ? `${t.technicalPlanLink}: ${form.lienPlanTechnique}` : '',
      form.diametreSouhaite ? `${t.desiredDiameter}: ${form.diametreSouhaite}` : '',
      form.message,
    ].filter(Boolean).join('\n')
    const payload = {
      ...form,
      message: extraMessage,
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
      localStorage.removeItem(QUOTE_DRAFT_KEY)
      setDraftSaved(false)
      setStatus(`${t.quoteSuccess} ${data.referenceDemande || ''}`)
    } catch {
      setStatus(t.quoteError)
    }
  }

  function clearQuoteDraft() {
    localStorage.removeItem(QUOTE_DRAFT_KEY)
    setForm(initialQuoteForm)
    setDraftSaved(false)
    setStatus(t.quoteDraftCleared)
  }

  async function uploadQuoteDocument(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setStatus(t.uploadingFile)
    try {
      const data = new FormData()
      data.append('file', file)
      const response = await fetch(`${API_URL}/uploads/quote-documents`, {
        method: 'POST',
        body: data,
      })
      if (!response.ok) throw new Error('Upload failed')
      const result = await response.json()
      setForm((current) => ({
        ...current,
        fichierTechniqueUrl: result.documentUrl,
        fichierTechniqueNom: result.originalName,
      }))
      setStatus(t.uploadSuccess)
    } catch {
      setStatus(t.uploadError)
    }
  }

  const isAnodes = form.produitDemande.toLowerCase().includes('anode')
  const selectedProduct = form.produitDemande
    ? normalizeProduct(officialProducts.find((product) => product.nom === form.produitDemande) || { nom: form.produitDemande })
    : null
  const quotePreviewProduct = selectedProduct
    ? {
        ...selectedProduct,
        dimensions: [form.diametreSouhaite && `${t.desiredDiameter}: ${form.diametreSouhaite}`, form.longueur && `${t.lengthLabel}: ${form.longueur}`, form.largeur && `${t.widthLabel}: ${form.largeur}`, form.epaisseur && `${t.thicknessLabel}: ${form.epaisseur}`]
          .filter(Boolean)
          .join(' | ') || selectedProduct.dimensions,
      }
    : null
  const quoteReadinessItems = [
    { label: t.readinessContact, done: Boolean(form.societe && form.nomContact && form.email && form.telephone) },
    { label: t.readinessProduct, done: Boolean(form.produitDemande || groupedProducts.length) },
    { label: t.readinessQuantity, done: Boolean(form.quantite) },
    { label: t.readinessTechnical, done: Boolean(form.applicationProjet || form.normeReference || form.diametreSouhaite || form.longueur || form.largeur || form.epaisseur) },
    { label: t.readinessFile, done: Boolean(form.fichierTechniqueUrl || form.lienPlanTechnique || form.message) },
  ]
  const quoteReadinessScore = Math.round((quoteReadinessItems.filter((item) => item.done).length / quoteReadinessItems.length) * 100)
  const quoteReadinessLabel = quoteReadinessScore >= 80 ? t.readinessStrong : quoteReadinessScore >= 50 ? t.readinessMedium : t.readinessWeak
  const hasConfiguredDimensions = Boolean(form.diametreSouhaite || form.longueur || form.largeur || form.epaisseur)
  const hasConfiguredPurity = !isAnodes || (Number(form.pureteCuivre) >= 50 && Number(form.pureteCuivre) <= 99.99)
  const configuratorSteps = [
    { label: t.configProduct, value: form.produitDemande || t.notProvided, done: Boolean(form.produitDemande || groupedProducts.length) },
    { label: t.configDimensions, value: hasConfiguredDimensions ? [form.diametreSouhaite, form.longueur, form.largeur, form.epaisseur].filter(Boolean).join(' / ') : t.notProvided, done: hasConfiguredDimensions },
    { label: t.configPurity, value: isAnodes ? (form.pureteCuivre ? `${form.pureteCuivre}%` : t.notProvided) : t.configNotRequired, done: hasConfiguredPurity },
    { label: t.configQuantity, value: form.quantite || t.notProvided, done: Boolean(form.quantite) },
    { label: t.configDelivery, value: form.besoinLivraison || t.notProvided, done: Boolean(form.besoinLivraison) },
  ]
  const configuratorScore = Math.round((configuratorSteps.filter((item) => item.done).length / configuratorSteps.length) * 100)
  const missingConfiguratorSteps = configuratorSteps.filter((item) => !item.done)

  return (
    <main className="quote-page legacy-quote-page">
      <section className="page-section legacy-quote-section">
        <h2>{t.quoteTitle}</h2>
        <form className="quote-form quote-form-card legacy-quote-form" onSubmit={submitQuote}>
          {draftSaved ? (
            <div className="quote-draft-status field-wide">
              <span>{t.quoteDraftSaved}</span>
              <button type="button" onClick={clearQuoteDraft}>{t.clearQuoteDraft}</button>
            </div>
          ) : null}
          <section className="quote-configurator field-wide">
            <div className="quote-configurator-heading">
              <div>
                <p className="eyebrow">{t.configEyebrow}</p>
                <h3>{t.configTitle}</h3>
                <p>{t.configText}</p>
              </div>
              <strong>{configuratorScore}%</strong>
            </div>
            <div className="quote-configurator-grid">
              {configuratorSteps.map((step) => (
                <article className={step.done ? 'done' : ''} key={step.label}>
                  <span>{step.done ? t.ok : '!'}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.value}</p>
                  </div>
                </article>
              ))}
            </div>
            <aside className="quote-configurator-help">
              <div>
                <h4>{missingConfiguratorSteps.length ? t.configMissingTitle : t.configReadyTitle}</h4>
                <p>{missingConfiguratorSteps.length ? `${t.configMissingText} ${missingConfiguratorSteps.map((step) => step.label).join(', ')}` : t.configReadyText}</p>
              </div>
              <div className="quote-configurator-actions">
                {isAnodes ? (
                  <>
                    <button type="button" onClick={() => setForm((current) => ({ ...current, pureteCuivre: '50' }))}>50%</button>
                    <button type="button" onClick={() => setForm((current) => ({ ...current, pureteCuivre: '99.99' }))}>99.99%</button>
                  </>
                ) : null}
                <button type="button" onClick={() => setForm((current) => ({ ...current, besoinLivraison: t.deliveryStandardValue }))}>{t.deliveryStandardValue}</button>
                <button type="button" onClick={() => setForm((current) => ({ ...current, besoinLivraison: t.deliveryUrgentValue }))}>{t.deliveryUrgentValue}</button>
              </div>
            </aside>
          </section>
          <Field label={t.company} name="societe" value={form.societe} onChange={updateField} required />
          <Field label={t.contact} name="nomContact" value={form.nomContact} onChange={updateField} required />
          <Field label={t.email} name="email" type="email" value={form.email} onChange={updateField} required />
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
          {selectedProduct ? (
            <article className="selected-product-summary field-wide">
              <img src={selectedProduct.imageUrl} alt={selectedProduct.nom} />
              <div>
                <strong>{selectedProduct.nom}</strong>
                <span>{selectedProduct.categorie}</span>
                <p>{selectedProduct.description}</p>
              </div>
            </article>
          ) : null}
          {groupedProducts.length > 1 ? (
            <article className="grouped-products-summary field-wide">
              <div>
                <p className="eyebrow">{t.groupedQuoteEyebrow}</p>
                <h3>{t.groupedQuoteTitle}</h3>
              </div>
              <div className="grouped-products-list">
                {groupedProducts.map((productName) => {
                  const product = normalizeProduct(officialProducts.find((item) => item.nom === productName) || { nom: productName })
                  return (
                    <span key={productName}>
                      <img src={product.imageUrl} alt="" />
                      {product.nom}
                    </span>
                  )
                })}
              </div>
            </article>
          ) : null}
          {quotePreviewProduct ? (
            <article className="quote-3d-preview field-wide">
              <div>
                <p className="eyebrow">{t.quote3dPreview}</p>
                <h3>{quotePreviewProduct.nom}</h3>
                <p>{quotePreviewProduct.dimensions}</p>
              </div>
              <Suspense fallback={<div className="product-3d-viewer product-3d-fallback"><span>3D</span></div>}>
                <Product3DViewer product={quotePreviewProduct} />
              </Suspense>
            </article>
          ) : null}
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
          <Field label={t.projectApplication} name="applicationProjet" value={form.applicationProjet} onChange={updateField} placeholder="Ex: tableau electrique, cables, electrolyse..." />
          <label>
            {t.desiredFinish}
            <select name="finitionSouhaitee" value={form.finitionSouhaitee} onChange={updateField}>
              <option value={t.finishUndefined}>{t.finishUndefined}</option>
              <option value={t.finishBright}>{t.finishBright}</option>
              <option value={t.finishMatte}>{t.finishMatte}</option>
              <option value={t.finishTinned}>{t.finishTinned}</option>
            </select>
          </label>
          <Field label={t.normReference} name="normeReference" value={form.normeReference} onChange={updateField} placeholder={t.normReferencePlaceholder} />
          <Field label={t.technicalPlanLink} name="lienPlanTechnique" value={form.lienPlanTechnique} onChange={updateField} placeholder="Lien Drive, PDF, reference plan..." />
          <Field label={t.quantity} name="quantite" type="number" min="1" value={form.quantite} onChange={updateField} required />
          <Field label={t.deliveryNeed} name="besoinLivraison" value={form.besoinLivraison} onChange={updateField} />
          <Field label={t.desiredDiameter} name="diametreSouhaite" value={form.diametreSouhaite} onChange={updateField} />
          <label className="upload-field">
            {t.uploadDrawing}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.dwg,.dxf" onChange={uploadQuoteDocument} />
            <small>{t.uploadHelp}</small>
          </label>
          {form.fichierTechniqueNom ? <p className="form-status upload-status">{t.uploadedFile}: {form.fichierTechniqueNom}</p> : null}
          <label className="field-wide">
            {t.message}
            <textarea name="message" value={form.message} onChange={updateField} rows="5" />
          </label>
          <section className="quote-readiness field-wide">
            <div className="quote-readiness-heading">
              <div>
                <p className="eyebrow">{t.quickQuoteChecklist}</p>
                <h3>{quoteReadinessLabel}</h3>
              </div>
              <strong>{quoteReadinessScore}%</strong>
            </div>
            <div className="quote-readiness-meter" aria-hidden="true">
              <span style={{ width: `${quoteReadinessScore}%` }} />
            </div>
            <div className="quote-readiness-items">
              {quoteReadinessItems.map((item) => (
                <span key={item.label} className={item.done ? 'done' : ''}>
                  {item.done ? t.ok : '!'} {item.label}
                </span>
              ))}
            </div>
          </section>
          <div className="quote-submit-row">
            <button type="submit">{t.submitQuote}</button>
          </div>
          {status ? <p className="form-status quote-status">{status}</p> : null}
        </form>
      </section>
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
      navigate('/admin/dashboard')
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
          <p className="eyebrow">{t.adminSpace}</p>
          <h2>{t.adminLogin}</h2>
          <p className="login-intro">{t.adminLoginIntro}</p>
          <Field
            label={t.adminEmailLogin}
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
  const location = useLocation()
  const navigate = useNavigate()
  const [demandes, setDemandes] = useState([])
  const [documentRequests, setDocumentRequests] = useState([])
  const [products, setProducts] = useState([])
  const [documents, setDocuments] = useState([])
  const [settings, setSettings] = useState({ adminEmail: 'admin@grod.ma', adminPhone: '+212 6 68 61 56 08' })
  const [productForm, setProductForm] = useState(emptyProductForm())
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm())
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingDocumentId, setEditingDocumentId] = useState(null)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedDemande, setSelectedDemande] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TOUTES')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [adminTab, setAdminTab] = useState(getAdminTabFromPath(location.pathname))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isClientSection = adminTab === 'clients'

  useEffect(() => {
    setAdminTab(getAdminTabFromPath(location.pathname))
  }, [location.pathname])

  function openAdminTab(tab, path) {
    setAdminTab(tab)
    navigate(path)
  }

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [demandesResponse, documentRequestsResponse, productsResponse, documentsResponse, settingsResponse] = await Promise.all([
          fetch(`${API_URL}/demandes-devis`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/demandes-documents`, {
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
        if (demandesResponse.status === 401 || demandesResponse.status === 403) {
          sessionStorage.removeItem(ADMIN_TOKEN_KEY)
          navigate('/admin/login')
          return
        }
        if (!demandesResponse.ok) throw new Error('Admin request failed')
        setDemandes(await demandesResponse.json())
        if (documentRequestsResponse.ok) {
          setDocumentRequests(await documentRequestsResponse.json())
        }

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
  const routeClientKey = location.pathname.includes('/admin/clients/')
    ? decodeURIComponent(location.pathname.split('/admin/clients/')[1] || '').toLowerCase()
    : ''
  const activeClientData = clients.find((client) => client.key === routeClientKey)
  const visibleClients = clients.filter((client) => {
    const haystack = [client.name, client.contact, client.email, client.phone, client.products.join(' ')].join(' ').toLowerCase()
    return haystack.includes(search.toLowerCase())
  })
  const recentDemandes = [...demandes]
    .sort((a, b) => new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0))
    .slice(0, 3)
  const searchedDemandes = demandes.filter((demande) => {
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
  const filteredDemandes = searchedDemandes
    .filter((demande) => statusFilter === 'TOUTES' || demande.statut === statusFilter)
    .filter((demande) => priorityFilter === 'ALL' || getDemandPriority(demande).level === priorityFilter)
    .sort((first, second) => getDemandPriority(second).score - getDemandPriority(first).score || new Date(second.dateCreation || 0) - new Date(first.dateCreation || 0))
  const prioritySummary = filteredDemandes.reduce(
    (summary, demande) => {
      const level = getDemandPriority(demande).level
      return { ...summary, [level]: summary[level] + 1 }
    },
    { high: 0, medium: 0, low: 0 },
  )
  const pipelineColumns = [
    ['NOUVELLE', t.pipelineNew],
    ['EN_TRAITEMENT', t.pipelineProgress],
    ['TRAITEE', t.pipelineDone],
    ['ANNULEE', t.pipelineCancelled],
  ].map(([status, label]) => ({
    status,
    label,
    demandes: searchedDemandes
      .filter((demande) => demande.statut === status)
      .sort((first, second) => getDemandPriority(second).score - getDemandPriority(first).score)
      .slice(0, 4),
  }))
  const statusAnalytics = ['NOUVELLE', 'EN_TRAITEMENT', 'TRAITEE', 'ANNULEE'].map((status) => ({
    status,
    label: status.replace('_', ' '),
    count: demandes.filter((demande) => demande.statut === status).length,
    percent: demandes.length ? Math.round((demandes.filter((demande) => demande.statut === status).length / demandes.length) * 100) : 0,
  }))
  const productAnalytics = Object.entries(
    demandes.reduce((accumulator, demande) => {
      const productName = demande.produitDemande || t.notProvided
      accumulator[productName] = (accumulator[productName] || 0) + 1
      return accumulator
    }, {}),
  )
    .map(([name, count]) => ({ name, count, percent: demandes.length ? Math.round((count / demandes.length) * 100) : 0 }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 5)
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

  async function updateDocumentRequestStatus(id, statut) {
    setSuccess('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/demandes-documents/${id}/statut?statut=${statut}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Document status failed')
      const updated = await response.json()
      setDocumentRequests((current) => current.map((request) => (request.id === updated.id ? updated : request)))
      setSuccess(t.statusUpdated)
    } catch {
      setError(t.statusError)
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
    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Upload failed')
    }
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
      setSuccess(`${t.uploadSuccess} ${t.clickSaveProduct}`)
    } catch {
      setError(t.uploadError)
    }
  }

  async function uploadAndSaveProductImage(product, event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSuccess('')
    setError('')
    try {
      const result = await uploadFile(file, 'images')
      const payload = {
        nom: product.nom || '',
        description: product.description || '',
        categorie: product.categorie || '',
        imageUrl: result.imageUrl,
        applications: product.applications || '',
        dimensions: product.dimensions || '',
        purete: product.purete || '',
        normes: product.normes || '',
        conditionnement: product.conditionnement || '',
        actif: Boolean(product.actif),
      }
      const response = await fetch(`${API_URL}/produits/${product.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Product image save failed')
      const saved = await response.json()
      setProducts((current) => current.map((item) => (item.id === saved.id ? saved : item)))
      setSuccess(t.productImageSaved)
    } catch {
      setError(t.productImageSaveError)
    } finally {
      event.target.value = ''
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
    <main className="page-section admin-dashboard-page">
      {!isClientSection ? (
      <section className="legacy-admin-hero">
        <div>
          <p className="eyebrow">{t.administration}</p>
          <h2>{t.commercialDashboard}</h2>
          <p>{t.dashboardIntro}</p>
        </div>
        <div className="legacy-admin-actions">
          <button type="button" onClick={() => openAdminTab('produits', '/admin/produits')}>{t.products}</button>
          <button type="button" onClick={() => openAdminTab('demandes', '/admin/demandes')}>{t.requestsMenu}</button>
          <button type="button" onClick={() => openAdminTab('documents', '/admin/documents')}>{t.documentsMenu}</button>
          <button type="button" onClick={() => openAdminTab('clients', '/admin/clients')}>{t.clients}</button>
          <button type="button" onClick={onLogout}>{t.logout}</button>
        </div>
      </section>
      ) : null}

      {!isClientSection ? (
      <section className="metrics-row legacy-admin-metrics">
        <Metric value={demandes.length} label={t.totalRequests} />
        <Metric value={demandes.filter((demande) => demande.statut === 'NOUVELLE').length} label={t.newRequests} />
        <Metric value={documentRequests.length} label={t.documentRequests} />
        <Metric value={products.filter((product) => product.actif !== false).length} label={t.activeProducts} />
      </section>
      ) : null}

      {!isClientSection ? (
      <div className="admin-utility-actions">
        <button className="secondary-button" onClick={() => exportCsv(filteredDemandes)}>{t.exportCsv}</button>
        <button className="secondary-button" onClick={registerPasskey}>{t.passkeyEnable}</button>
      </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      {!isClientSection ? (
      <nav className="admin-tabs">
        <button className={adminTab === 'demandes' ? 'active' : ''} onClick={() => openAdminTab('demandes', '/admin/demandes')}>
          {t.totalRequests}
          <span>{filteredDemandes.length}</span>
        </button>
        <button className={adminTab === 'clients' ? 'active' : ''} onClick={() => openAdminTab('clients', '/admin/clients')}>
          {t.clientHistory}
          <span>{clients.length}</span>
        </button>
        <button className={adminTab === 'documents' ? 'active' : ''} onClick={() => openAdminTab('documents', '/admin/documents')}>
          {t.documentRequests}
          <span>{documentRequests.length}</span>
        </button>
        <button className={adminTab === 'produits' ? 'active' : ''} onClick={() => openAdminTab('produits', '/admin/produits')}>
          {t.products}
          <span>{products.length}</span>
        </button>
        <button className={adminTab === 'ressources' ? 'active' : ''} onClick={() => openAdminTab('ressources', '/admin/documents')}>
          {t.resourcesEyebrow}
          <span>{documents.length}</span>
        </button>
        <button className={adminTab === 'settings' ? 'active' : ''} onClick={() => openAdminTab('settings', '/admin/dashboard')}>
          {t.notifications}
        </button>
      </nav>
      ) : null}

      {location.pathname.includes('/admin/dashboard') ? (
        <section className="dashboard-panels legacy-dashboard-panels">
          <article className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t.priority}</p>
                <h3>{t.recentRequests}</h3>
              </div>
              <button type="button" className="text-link" onClick={() => openAdminTab('demandes', '/admin/demandes')}>
                {t.viewAll}
              </button>
            </div>
            <div className="recent-list">
              {recentDemandes.map((demande) => (
                <article className="recent-item" key={demande.id}>
                  <div>
                    <strong>{demande.societe || demande.nomContact}</strong>
                    <span>{demande.referenceDemande || `#${demande.id}`}</span>
                    <span>{demande.produitDemande}</span>
                  </div>
                  <div>
                    <span className="recent-status">{demande.statut}</span>
                    <small>{formatDate(demande.dateCreation)}</small>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t.catalogueEyebrow}</p>
                <h3>{t.productStatus}</h3>
              </div>
              <button type="button" className="text-link" onClick={() => openAdminTab('produits', '/admin/produits')}>
                {t.manage}
              </button>
            </div>
            <dl className="dashboard-catalogue-state">
              <div><dt>{t.activeProducts}</dt><dd>{products.filter((product) => product.actif !== false).length}</dd></div>
              <div><dt>{t.totalCatalogue}</dt><dd>{products.length}</dd></div>
            </dl>
            <button type="button" onClick={() => openAdminTab('produits', '/admin/produits')}>{t.addProduct}</button>
            <NavLink className="secondary-link" to="/catalogue">{t.viewPublicCatalogue}</NavLink>
          </article>
        </section>
      ) : null}

      {location.pathname.includes('/admin/dashboard') ? (
        <section className="admin-analytics-panel">
          <div className="analytics-heading">
            <div>
              <p className="eyebrow">{t.analyticsEyebrow}</p>
              <h3>{t.analyticsTitle}</h3>
            </div>
            <span>{t.analyticsHint}</span>
          </div>
          <div className="analytics-grid">
            <article className="analytics-card">
              <h4>{t.statusDistribution}</h4>
              <div className="analytics-bars">
                {statusAnalytics.map((item) => (
                  <div className="analytics-bar-row" key={item.status}>
                    <span>{item.label}</span>
                    <div><strong style={{ width: `${item.percent}%` }} /></div>
                    <em>{item.count}</em>
                  </div>
                ))}
              </div>
            </article>
            <article className="analytics-card">
              <h4>{t.topRequestedProducts}</h4>
              <div className="analytics-bars">
                {productAnalytics.length ? productAnalytics.map((item) => (
                  <div className="analytics-bar-row" key={item.name}>
                    <span>{item.name}</span>
                    <div><strong style={{ width: `${item.percent}%` }} /></div>
                    <em>{item.count}</em>
                  </div>
                )) : <p>{t.noData}</p>}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {location.pathname.includes('/admin/dashboard') ? (
      <section className="admin-workspace notification-settings-panel">
        <p className="eyebrow">{t.notifications}</p>
        <h3>{t.notificationSettings}</h3>
        <form className="notification-settings-form" onSubmit={saveSettings}>
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
        <p className="settings-note">{t.notificationHelp}</p>
      </section>
      ) : null}

      {adminTab === 'demandes' && !location.pathname.includes('/admin/dashboard') ? (
      <>
      <section className="status-filter-row legacy-status-filters">
        {[
          ['TOUTES', t.allRequests, searchedDemandes.length],
          ['NOUVELLE', 'NOUVELLE', searchedDemandes.filter((item) => item.statut === 'NOUVELLE').length],
          ['EN_TRAITEMENT', 'EN TRAITEMENT', searchedDemandes.filter((item) => item.statut === 'EN_TRAITEMENT').length],
          ['TRAITEE', 'TRAITEE', searchedDemandes.filter((item) => item.statut === 'TRAITEE').length],
          ['ANNULEE', 'ANNULEE', searchedDemandes.filter((item) => item.statut === 'ANNULEE').length],
        ].map(([value, label, count]) => (
          <button
            type="button"
            className={`status-pill ${statusFilter === value ? 'active' : ''}`}
            key={value}
            onClick={() => setStatusFilter(value)}
          >
            {label}
            <span>{count}</span>
          </button>
        ))}
      </section>

      <section className="legacy-request-toolbar">
        <div className="admin-toolbar-title">
          <strong>{filteredDemandes.length} {t.visibleRequests}</strong>
          <span>{t.adminRequestsHint}</span>
        </div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.adminSearchPlaceholder} />
        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
          <option value="ALL">{t.allPriorities}</option>
          <option value="high">{t.priorityHigh}</option>
          <option value="medium">{t.priorityMedium}</option>
          <option value="low">{t.priorityLow}</option>
        </select>
        <button className="secondary-button" type="button" onClick={() => {
          setSearch('')
          setStatusFilter('TOUTES')
          setPriorityFilter('ALL')
        }}>
          {t.resetFilters}
        </button>
        <button className="secondary-button" onClick={() => exportCsv(filteredDemandes)}>
          {t.exportExcel}
        </button>
      </section>

      <section className="priority-summary-row">
        <article className="priority-summary-card high">
          <span>{t.priorityHigh}</span>
          <strong>{prioritySummary.high}</strong>
        </article>
        <article className="priority-summary-card medium">
          <span>{t.priorityMedium}</span>
          <strong>{prioritySummary.medium}</strong>
        </article>
        <article className="priority-summary-card low">
          <span>{t.priorityLow}</span>
          <strong>{prioritySummary.low}</strong>
        </article>
      </section>

      <section className="commercial-pipeline">
        <div className="pipeline-heading">
          <div>
            <p className="eyebrow">{t.pipelineEyebrow}</p>
            <h3>{t.pipelineTitle}</h3>
          </div>
          <span>{t.pipelineHint}</span>
        </div>
        <div className="pipeline-grid">
          {pipelineColumns.map((column) => (
            <article className={`pipeline-column ${column.status.toLowerCase()}`} key={column.status}>
              <header>
                <strong>{column.label}</strong>
                <span>{column.demandes.length}</span>
              </header>
              <div className="pipeline-list">
                {column.demandes.length ? column.demandes.map((demande) => {
                  const priority = getDemandPriority(demande)
                  return (
                    <button type="button" key={demande.id} onClick={() => setSelectedDemande(demande)}>
                      <span>{demande.referenceDemande || `#${demande.id}`}</span>
                      <strong>{demande.societe || t.notProvided}</strong>
                      <small>{demande.produitDemande || t.notProvided}</small>
                      <em>{priority.score}%</em>
                    </button>
                  )
                }) : <p>{t.pipelineEmpty}</p>}
              </div>
            </article>
          ))}
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
        <table className="admin-table legacy-requests-table">
          <thead>
            <tr>
              <th>{t.reference}</th>
              <th>{t.client}</th>
              <th>{t.product}</th>
              <th>{t.details}</th>
              <th>{t.priority}</th>
              <th>{t.status}</th>
              <th>{t.quickAction}</th>
            </tr>
          </thead>
          <tbody>
            {filteredDemandes.map((demande) => {
              const priority = getDemandPriority(demande)
              return (
              <tr className={`request-row priority-${priority.level}`} key={demande.id}>
                <td><strong>{demande.referenceDemande || `#${demande.id}`}</strong></td>
                <td>
                  <strong>{demande.societe}</strong>
                  <span>{demande.nomContact}</span>
                  <span>{demande.email}</span>
                  <span>{demande.telephone}</span>
                  <button type="button" className="text-link" onClick={() => setSelectedDemande(demande)}>
                    {t.clientHistory}
                  </button>
                  <label className="toggle-control loyalty-inline">
                    <input
                      type="checkbox"
                      checked={Boolean(demande.clientFidele)}
                      onChange={(event) => updateLoyalty(demande, event.target.checked)}
                    />
                    {t.loyalClient}
                  </label>
                </td>
                <td>
                  <strong>{demande.produitDemande}</strong>
                  <span>{formatDate(demande.dateCreation)}</span>
                </td>
                <td>
                  <strong>{t.quantity}: {demande.quantite || '-'}</strong>
                  <span>{t.lengthLabel}: {demande.longueur || '-'}</span>
                  <span>{t.widthLabel}: {demande.largeur || '-'}</span>
                  <span>{t.thicknessLabel}: {demande.epaisseur || '-'}</span>
                  <span>{t.deliveryLabel}: {demande.besoinLivraison || '-'}</span>
                  {demande.message ? <span>{demande.message}</span> : null}
                </td>
                <td>
                  <div className={`priority-badge ${priority.level}`}>
                    <strong>{priority.score}%</strong>
                    <span>{t[priority.labelKey]}</span>
                  </div>
                  <small className="priority-reason">{priority.reasons.map((key) => t[key]).join(' / ')}</small>
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
                  <div className="row-actions legacy-quick-actions">
                    <button type="button" onClick={() => downloadPdf(demande)}>
                      {t.downloadPdf}
                    </button>
                    <button type="button" className="secondary-button" onClick={() => updateStatus(demande.id, 'EN_TRAITEMENT')}>
                      {t.inProgressAction}
                    </button>
                    <button type="button" className="danger-button" onClick={() => deleteDemande(demande.id)}>
                      {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {selectedDemande ? (
        <section className="request-detail-panel">
          <div className="request-detail-heading">
            <div>
              <p className="eyebrow">{t.requestDetails}</p>
              <h3>{selectedDemande.referenceDemande || `#${selectedDemande.id}`}</h3>
            </div>
            <button type="button" className="secondary-button" onClick={() => setSelectedDemande(null)}>
              {t.close}
            </button>
          </div>

          <div className="request-detail-grid">
            <div className="detail-card">
              <h4>{t.clientInfo}</h4>
              <dl className="admin-detail-list">
                <div><dt>{t.company}</dt><dd>{selectedDemande.societe || '-'}</dd></div>
                <div><dt>{t.contact}</dt><dd>{selectedDemande.nomContact || '-'}</dd></div>
                <div><dt>{t.email}</dt><dd>{selectedDemande.email || '-'}</dd></div>
                <div><dt>{t.phone}</dt><dd>{selectedDemande.telephone || '-'}</dd></div>
                <div><dt>{t.loyalClient}</dt><dd>{selectedDemande.clientFidele ? t.yes : t.no}</dd></div>
              </dl>
            </div>

            <div className="detail-card">
              <h4>{t.techInfo}</h4>
              <dl className="admin-detail-list">
                <div><dt>{t.product}</dt><dd>{selectedDemande.produitDemande || '-'}</dd></div>
                <div><dt>{t.quantity}</dt><dd>{selectedDemande.quantite || '-'}</dd></div>
                <div><dt>{t.purity}</dt><dd>{selectedDemande.pureteCuivre ? `${selectedDemande.pureteCuivre}%` : '-'}</dd></div>
                <div><dt>{t.dimensions}</dt><dd>{formatDimensions(selectedDemande)}</dd></div>
                <div><dt>{t.status}</dt><dd>{selectedDemande.statut || '-'}</dd></div>
              </dl>
            </div>

            <div className="detail-card detail-card-wide">
              <h4>{t.message}</h4>
              <p className="request-message">{selectedDemande.message || t.noMessage}</p>
              {selectedDemande.fichierTechniqueUrl ? (
                <a className="primary-link detail-download" href={selectedDemande.fichierTechniqueUrl} target="_blank" rel="noreferrer">
                  {t.downloadAttachedFile}: {selectedDemande.fichierTechniqueNom || t.uploadedFile}
                </a>
              ) : (
                <p className="form-status">{t.noAttachedFile}</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
      </>
      ) : null}

      {adminTab === 'documents' ? (
      <section className="admin-workspace">
        <div className="admin-workspace-header">
          <div>
            <p className="eyebrow">{t.resourcesEyebrow}</p>
            <h3>{t.documentRequests}</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.reference}</th>
                <th>{t.company}</th>
                <th>{t.documentTitle}</th>
                <th>{t.documentType}</th>
                <th>{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {documentRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.referenceDemande || `#${request.id}`}</td>
                  <td>
                    <strong>{request.societe}</strong>
                    <span>{request.email}</span>
                  </td>
                  <td>{request.titreDocument}</td>
                  <td>{request.typeDocument}</td>
                  <td>
                    <select value={request.statut} onChange={(event) => updateDocumentRequestStatus(request.id, event.target.value)}>
                      <option value="NOUVELLE">NOUVELLE</option>
                      <option value="EN_TRAITEMENT">EN_TRAITEMENT</option>
                      <option value="TRAITEE">TRAITEE</option>
                      <option value="ANNULEE">ANNULEE</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {adminTab === 'produits' ? (
      <section className="admin-workspace">
        <div className="admin-workspace-header">
          <div>
            <p className="eyebrow">{t.catalogueTitle}</p>
            <h3>{t.addProduct}</h3>
          </div>
        </div>
        {!editingProductId ? (
        <form className="admin-form-grid" onSubmit={saveProduct}>
          <Field label={t.productName} name="nom" value={productForm.nom} onChange={(event) => setProductFormValue(setProductForm, event)} required />
          <Field label="Categorie" name="categorie" value={productForm.categorie} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <label>
            {t.productImage}
            <input type="file" accept="image/*" onChange={uploadProductImage} />
          </label>
          <label>
            Description
            <textarea name="description" rows="4" value={productForm.description} onChange={(event) => setProductFormValue(setProductForm, event)} />
          </label>
          <Field label="Applications" name="applications" value={productForm.applications} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <Field label="Dimensions" name="dimensions" value={productForm.dimensions} onChange={(event) => setProductFormValue(setProductForm, event)} />
          <Field label={t.configPurity} name="purete" value={productForm.purete} onChange={(event) => setProductFormValue(setProductForm, event)} />
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
          </div>
        </form>
        ) : null}

        <div className="admin-workspace-header">
          <div>
            <p className="eyebrow">{t.products}</p>
            <h3>{t.productsVisible}</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table className="admin-table legacy-products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t.product}</th>
                <th>{t.category}</th>
                <th>{t.characteristics}</th>
                <th>{t.status}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id || product.nom}>
                  <td>#{product.id || index + 1}</td>
                  <td>
                    <div className="legacy-product-cell">
                      <img className="admin-product-thumb" src={product.imageUrl || normalizeProduct(product).imageUrl} alt={product.nom} />
                      <div>
                        <strong>{product.nom}</strong>
                        <span>{product.description}</span>
                      </div>
                    </div>
                  </td>
                  <td>{product.categorie}</td>
                  <td>
                    <strong>{product.purete || t.unspecifiedPurity}</strong>
                    <span>{product.dimensions || t.unspecifiedDimensions}</span>
                    <span>{product.normes || t.unspecifiedStandards}</span>
                  </td>
                  <td><span className="status-badge active">{product.actif ? t.active : t.inactive}</span></td>
                  <td>
                    <div className="row-actions legacy-table-actions">
                      <label className="inline-upload">
                        {t.uploadImage}
                        <input type="file" accept="image/*" onChange={(event) => uploadAndSaveProductImage(product, event)} />
                      </label>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="products-admin-table">
          {products.map((product) => (
            <article className="product-admin-item" key={`edit-${product.id || product.nom}`}>
              {editingProductId === product.id ? (
                <form className="admin-form-grid inline-product-editor" onSubmit={saveProduct}>
                  <Field label={t.productName} name="nom" value={productForm.nom} onChange={(event) => setProductFormValue(setProductForm, event)} required />
                  <Field label="Categorie" name="categorie" value={productForm.categorie} onChange={(event) => setProductFormValue(setProductForm, event)} />
                  <label>
                    {t.productImage}
                    <input type="file" accept="image/*" onChange={uploadProductImage} />
                  </label>
                  <label>
                    Description
                    <textarea name="description" rows="4" value={productForm.description} onChange={(event) => setProductFormValue(setProductForm, event)} />
                  </label>
                  <Field label="Applications" name="applications" value={productForm.applications} onChange={(event) => setProductFormValue(setProductForm, event)} />
                  <Field label="Dimensions" name="dimensions" value={productForm.dimensions} onChange={(event) => setProductFormValue(setProductForm, event)} />
                  <Field label={t.configPurity} name="purete" value={productForm.purete} onChange={(event) => setProductFormValue(setProductForm, event)} />
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
                    <button type="submit">{t.saveChanges}</button>
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
                  </div>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {adminTab === 'ressources' ? (
      <section className="admin-workspace">
        <div className="admin-workspace-header">
          <div>
            <p className="eyebrow">{t.resourcesEyebrow}</p>
            <h3>{editingDocumentId ? t.editDocument : t.addDocument}</h3>
          </div>
        </div>
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

        <div className="admin-workspace-header">
          <div>
            <p className="eyebrow">{t.resourcesEyebrow}</p>
            <h3>{t.resourcesTitle}</h3>
          </div>
        </div>
        <div className="products-admin-table document-admin-list">
          {documents.map((document) => (
            <div key={document.id}>
              <strong>{document.titre}</strong>
              <span>{document.typeDocument}</span>
              <span>{document.actif ? t.active : t.inactive}</span>
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
      ) : null}

      {adminTab === 'settings' ? (
      <section className="product-admin-form">
        <p className="eyebrow">{t.notifications}</p>
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
      ) : null}

      {adminTab === 'clients' && !activeClientData ? (
        <section className="clients-page">
          <div className="clients-page-heading">
            <div>
              <p className="eyebrow">{t.administration}</p>
              <h2>{t.clientsHistoryTitle}</h2>
            </div>
            <div className="clients-page-actions">
              <button type="button" className="secondary-button" onClick={() => navigate('/admin/dashboard')}>
                Dashboard
              </button>
              <button type="button" className="secondary-button" onClick={() => navigate('/admin/demandes')}>
                {t.requestsMenu}
              </button>
              <label>
                {t.clientSearch}
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.clientSearchPlaceholder} />
              </label>
              <button type="button" className="secondary-button" onClick={onLogout}>
                {t.logout}
              </button>
            </div>
          </div>

          <div className="clients-grid">
            {visibleClients.map((client) => (
              <article className="client-card" key={client.key}>
                <div className="client-card-heading">
                  <div>
                    <h3>{client.name}</h3>
                    <span>{client.contact || '-'}</span>
                    <span>{client.email || '-'}</span>
                    <span>{client.phone || '-'}</span>
                  </div>
                </div>
                <div className="client-stats-row">
                  <span>{client.total} {t.requests}</span>
                  <span>{client.products.length} {t.requestedProducts}</span>
                  <span>{t.last}: {formatDate(client.lastRequest)}</span>
                </div>
                <div className="client-stats-row">
                  {client.products.map((product) => (
                    <span key={product}>{product}</span>
                  ))}
                </div>
                <button type="button" onClick={() => navigate(`/admin/clients/${encodeURIComponent(client.key)}`)}>
                  {t.viewHistory}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {adminTab === 'clients' && activeClientData ? (
        <section className="client-profile-page">
          <div className="client-profile-heading">
            <div>
              <p className="eyebrow">{t.clientSheet}</p>
              <h2>{activeClientData.name}</h2>
            </div>
            <div className="clients-page-actions">
              <button type="button" className="secondary-button" onClick={() => navigate('/admin/clients')}>
                {t.allClients}
              </button>
              <button type="button" className="secondary-button" onClick={() => navigate('/admin/demandes')}>
                {t.requestsMenu}
              </button>
            </div>
          </div>

          <div className="client-profile-grid">
            <article className="admin-card client-info-card">
              <p className="eyebrow">{t.clientInfo}</p>
              <h3>{activeClientData.name}</h3>
              <dl className="client-info-list">
                <div><dt>{t.contact}</dt><dd>{activeClientData.contact || '-'}</dd></div>
                <div><dt>{t.email}</dt><dd>{activeClientData.email || '-'}</dd></div>
                <div><dt>{t.phone}</dt><dd>{activeClientData.phone || '-'}</dd></div>
                <div><dt>{t.reference}</dt><dd>{activeClientData.reference || t.notProvided}</dd></div>
                <div><dt>{t.firstRequest}</dt><dd>{formatDate(activeClientData.firstRequest)}</dd></div>
                <div><dt>{t.lastRequest}</dt><dd>{formatDate(activeClientData.lastRequest)}</dd></div>
              </dl>
            </article>

            <article className="admin-card client-summary-card">
              <p className="eyebrow">{t.summary}</p>
              <h3>{t.commercialActivity}</h3>
              <dl className="client-info-list">
                <div><dt>{t.totalRequests}</dt><dd>{activeClientData.total}</dd></div>
                <div><dt>{t.requestedProducts}</dt><dd>{activeClientData.products.length}</dd></div>
                <div><dt>{t.newRequests}</dt><dd>{activeClientData.demandes.filter((item) => item.statut === 'NOUVELLE').length}</dd></div>
                <div><dt>{t.inProgressAction}</dt><dd>{activeClientData.demandes.filter((item) => item.statut === 'EN_TRAITEMENT').length}</dd></div>
                <div><dt>{t.loyalClient}</dt><dd>{activeClientData.demandes.some((item) => item.clientFidele) ? t.yes : t.no}</dd></div>
              </dl>
            </article>
          </div>

          <div className="table-wrap">
            <table className="admin-table client-history-table">
              <thead>
                <tr>
                  <th>{t.reference}</th>
                  <th>{t.product}</th>
                  <th>{t.details}</th>
                  <th>{t.status}</th>
                  <th>{t.quickAction}</th>
                </tr>
              </thead>
              <tbody>
                {activeClientData.demandes.map((demande) => (
                  <tr key={demande.id}>
                    <td>
                      <strong>{demande.referenceDemande || `#${demande.id}`}</strong>
                      <span>{formatDate(demande.dateCreation)}</span>
                    </td>
                    <td><strong>{demande.produitDemande}</strong></td>
                    <td>
                      <strong>{t.quantity}: {demande.quantite || '-'}</strong>
                      <span>{formatDimensions(demande)}</span>
                      {demande.message ? <span>{demande.message}</span> : null}
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
                      <div className="row-actions legacy-quick-actions">
                        <button type="button" onClick={() => downloadPdf(demande)}>{t.downloadPdf}</button>
                        <button type="button" className="secondary-button" onClick={() => updateStatus(demande.id, 'EN_TRAITEMENT')}>
                          {t.inProgressAction}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
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
  const assistantPrompts = [t.assistantPromptProduct, t.assistantPromptAnodes, t.assistantPromptQuote]

  async function submitAssistantMessage(content) {
    if (!content.trim()) return
    const nextMessages = [...messages, { role: 'user', content: content.trim() }]
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

  async function sendMessage(event) {
    event.preventDefault()
    await submitAssistantMessage(input)
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
          <div className="assistant-prompts">
            {assistantPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => submitAssistantMessage(prompt)} disabled={loading}>
                {prompt}
              </button>
            ))}
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
  const applications = Array.isArray(product.applications)
    ? product.applications
    : String(product.applications || fallback.applications.join(','))
        .replace(/([a-z])([A-Z])/g, '$1,$2')
        .replace(/(electriques|industriels|technique|conductrices|energie)([A-Z])/gi, '$1,$2')
        .split(',')
        .map((application) => application.trim())
        .filter(Boolean)

  return {
    ...fallback,
    ...product,
    applications,
    imageUrl: product.imageUrl || fallback.imageUrl,
    dimensions: product.dimensions || fallback.dimensions,
    purete: product.purete || fallback.purete,
    normes: product.normes || fallback.normes,
    conditionnement: product.conditionnement || fallback.conditionnement,
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

function emptyDocumentRequest() {
  return {
    societe: '',
    nomContact: '',
    email: '',
    telephone: '',
    typeDocument: '',
    titreDocument: '',
    produitConcerne: '',
    message: '',
  }
}

function setProductFormValue(setter, event) {
  const { name, value } = event.target
  setter((current) => ({ ...current, [name]: value }))
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function buildClientHistory(demandes) {
  const clients = new Map()

  demandes.forEach((demande) => {
    const key = (demande.email || demande.telephone || demande.societe || `client-${demande.id}`).toLowerCase()
    const current = clients.get(key) || {
      key,
      name: demande.societe || demande.nomContact || 'Client',
      contact: demande.nomContact || '',
      email: demande.email || '',
      phone: demande.telephone || '',
      reference: demande.referenceClient || '',
      firstRequest: demande.dateCreation || '',
      lastRequest: demande.dateCreation || '',
      total: 0,
      products: [],
      demandes: [],
    }

    current.total += 1
    current.demandes.push(demande)
    if (demande.dateCreation) {
      if (!current.firstRequest || new Date(demande.dateCreation) < new Date(current.firstRequest)) {
        current.firstRequest = demande.dateCreation
      }
      if (!current.lastRequest || new Date(demande.dateCreation) > new Date(current.lastRequest)) {
        current.lastRequest = demande.dateCreation
      }
    }
    if (demande.produitDemande && !current.products.includes(demande.produitDemande)) {
      current.products.push(demande.produitDemande)
    }
    clients.set(key, current)
  })

  return [...clients.values()]
    .map((client) => ({
      ...client,
      demandes: [...client.demandes].sort((a, b) => new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0)),
    }))
    .sort((a, b) => new Date(b.lastRequest || 0) - new Date(a.lastRequest || 0))
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

function formatDimensions(demande) {
  const dimensions = [
    demande.longueur ? `L ${demande.longueur}` : '',
    demande.largeur ? `l ${demande.largeur}` : '',
    demande.epaisseur ? `E ${demande.epaisseur}` : '',
  ].filter(Boolean)

  return dimensions.length ? dimensions.join(' x ') : '-'
}

function getRecommendedProduct(products, advisor) {
  const application = advisor.application
  const need = advisor.need
  const rules = [
    [application === 'electrolyse', 'anode'],
    [application === 'plomberie' || need === 'tube', 'tube'],
    [need === 'fil', 'wire'],
    [need === 'forme-plate', 'bus'],
    [application === 'sur-mesure' || need === 'piece-speciale', 'custom'],
    [application === 'fabrication', 'sheet'],
    [application === 'electricite' || need === 'conductivite', 'rod'],
  ]
  const matchedRule = rules.find(([condition]) => condition)
  const keyword = matchedRule?.[1] || 'rod'
  return products.find((product) => String(product.nom || '').toLowerCase().includes(keyword)) || products[0] || null
}

function getSmartSearchProduct(products, query) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return null

  const tokens = normalizedQuery.split(' ').filter(Boolean)
  const scoredProducts = products
    .map((product) => {
      const productName = normalizeSearchText(product.nom)
      const applications = Array.isArray(product.applications) ? product.applications : []
      const haystack = normalizeSearchText([
        product.nom,
        product.description,
        product.categorie,
        product.dimensions,
        product.normes,
        product.purete,
        product.conditionnement,
        applications.join(' '),
      ].join(' '))

      let score = 0
      tokens.forEach((token) => {
        if (haystack.includes(token)) score += 3
        if (productName.includes(token)) score += 5
        if (applications.some((application) => normalizeSearchText(application).includes(token))) score += 4
      })

      if (normalizedQuery.includes('conduct') && haystack.includes('conduct')) score += 4
      if ((normalizedQuery.includes('electro') || normalizedQuery.includes('metall')) && productName.includes('anode')) score += 5
      if ((normalizedQuery.includes('plomb') || normalizedQuery.includes('clim')) && productName.includes('tube')) score += 5
      if ((normalizedQuery.includes('cable') || normalizedQuery.includes('bobin')) && productName.includes('wire')) score += 5
      if ((normalizedQuery.includes('tableau') || normalizedQuery.includes('distribution')) && productName.includes('bus')) score += 5
      if ((normalizedQuery.includes('sur mesure') || normalizedQuery.includes('plan')) && productName.includes('custom')) score += 5

      return { product, score }
    })
    .sort((first, second) => second.score - first.score)

  if (!scoredProducts.length) return null
  if (scoredProducts[0].score <= 0) {
    return products.find((product) => normalizeSearchText(product.nom).includes('custom')) || products[0] || null
  }
  return scoredProducts[0].product
}

function getSmartSearchReason(product, query, t) {
  const text = normalizeSearchText(`${product?.nom || ''} ${product?.description || ''} ${(product?.applications || []).join(' ')} ${query}`)
  if (text.includes('anode')) return t.smartSearchReasonAnodes
  if (text.includes('tube')) return t.smartSearchReasonTubes
  if (text.includes('wire') || text.includes('fil')) return t.smartSearchReasonWire
  if (text.includes('bus') || text.includes('flat') || text.includes('meplat')) return t.smartSearchReasonBusBars
  if (text.includes('sheet') || text.includes('plaque') || text.includes('feuille')) return t.smartSearchReasonSheets
  if (text.includes('custom') || text.includes('sur mesure') || text.includes('plan')) return t.smartSearchReasonCustom
  return t.smartSearchReasonDefault
}

function getRecentProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_PRODUCTS_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.map((product) => normalizeProduct(product)).slice(0, 4)
  } catch {
    return []
  }
}

function getFavoriteProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITE_PRODUCTS_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.map((product) => normalizeProduct(product)).slice(0, 8)
  } catch {
    return []
  }
}

function saveRecentProduct(product) {
  try {
    const normalized = normalizeProduct(product)
    const current = getRecentProducts()
    const nextProducts = [
      normalized,
      ...current.filter((item) => (item.id || item.nom) !== (normalized.id || normalized.nom)),
    ].slice(0, 4)
    localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(nextProducts))
  } catch {
    // Local personalization should never block the product page.
  }
}

function getQuoteDraftForm(initialForm, hasUrlProduct) {
  try {
    if (hasUrlProduct) return initialForm
    const saved = JSON.parse(localStorage.getItem(QUOTE_DRAFT_KEY) || 'null')
    if (!saved || typeof saved !== 'object') return initialForm
    return { ...initialForm, ...saved }
  } catch {
    return initialForm
  }
}

function hasQuoteDraftContent(form) {
  return [
    form.societe,
    form.nomContact,
    form.email,
    form.telephone,
    form.produitDemande,
    form.pureteCuivre,
    form.longueur,
    form.largeur,
    form.epaisseur,
    form.quantite,
    form.besoinLivraison,
    form.applicationProjet,
    form.normeReference,
    form.lienPlanTechnique,
    form.diametreSouhaite,
    form.message,
    form.fichierTechniqueUrl,
  ].some((value) => String(value || '').trim())
}

function getDemandPriority(demande) {
  const checks = [
    Boolean(demande.societe && demande.nomContact && demande.email && demande.telephone),
    Boolean(demande.produitDemande),
    Boolean(demande.quantite),
    Boolean(demande.longueur || demande.largeur || demande.epaisseur || demande.diametreSouhaite || demande.pureteCuivre),
    Boolean(demande.message || demande.fichierTechniqueUrl || demande.lienPlanTechnique || demande.besoinLivraison),
  ]
  let score = checks.filter(Boolean).length * 15
  const reasons = []

  if (demande.clientFidele) {
    score += 10
    reasons.push('priorityReasonLoyal')
  }
  if (demande.statut === 'NOUVELLE') {
    score += 10
    reasons.push('priorityReasonNew')
  }
  if (demande.quantite && Number(demande.quantite) >= 10) {
    score += 10
    reasons.push('priorityReasonQuantity')
  }
  if (demande.fichierTechniqueUrl || demande.lienPlanTechnique) {
    score += 10
    reasons.push('priorityReasonFile')
  }
  if (!reasons.length) reasons.push('priorityReasonInfo')

  const finalScore = Math.min(100, score)
  if (finalScore >= 75) return { score: finalScore, level: 'high', labelKey: 'priorityHigh', reasons }
  if (finalScore >= 45) return { score: finalScore, level: 'medium', labelKey: 'priorityMedium', reasons }
  return { score: finalScore, level: 'low', labelKey: 'priorityLow', reasons }
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getRecommendationReason(product, advisor, t) {
  const name = String(product?.nom || '').toLowerCase()
  if (name.includes('anode')) return t.advisorReasonAnodes
  if (name.includes('tube')) return t.advisorReasonTubes
  if (name.includes('wire')) return t.advisorReasonWire
  if (name.includes('bus') || name.includes('flat')) return t.advisorReasonBusBars
  if (name.includes('sheet')) return t.advisorReasonSheets
  if (name.includes('custom')) return t.advisorReasonCustom
  if (advisor.need === 'conductivite') return t.advisorReasonConductivity
  return t.advisorReasonRod
}

function getProductForm(product) {
  const name = String(product.nom || '').toLowerCase()
  if (name.includes('rod')) return 'Barre ronde'
  if (name.includes('anode')) return 'Anode cuivre'
  if (name.includes('bus')) return 'Barre conductrice'
  if (name.includes('flat')) return 'Meplat cuivre'
  if (name.includes('tube')) return 'Tube cuivre'
  if (name.includes('sheet')) return 'Feuille ou plaque'
  if (name.includes('wire')) return 'Fil cuivre'
  return 'Piece sur mesure'
}

function getProductUsage(product) {
  const applications = Array.isArray(product.applications) ? product.applications.join(', ') : product.applications
  return applications || product.description || '-'
}

function getAdminTabFromPath(pathname) {
  if (pathname.includes('/admin/produits')) return 'produits'
  if (pathname.includes('/admin/documents')) return 'documents'
  if (pathname.includes('/admin/clients')) return 'clients'
  if (pathname.includes('/admin/demandes')) return 'demandes'
  return 'demandes'
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
    navProcess: 'Processus',
    navWhy: 'Pourquoi',
    navQuote: 'Demande de devis',
    navAdmin: 'Admin',
    commandTrigger: 'Recherche rapide',
    commandEyebrow: 'Navigation intelligente',
    commandPlaceholder: 'Chercher une page, un produit, un devis...',
    commandNoResult: 'Aucun resultat trouve.',
    commandHomeHint: 'Retourner a la page d accueil G-ROD.',
    commandCatalogueHint: 'Voir les produits cuivre, comparer et ouvrir la 3D.',
    commandResourcesHint: 'Documents, certificats, FAQ et brochure.',
    commandProcessHint: 'Comprendre le flow industriel, la qualite et la tracabilite.',
    commandWhyHint: 'Voir les preuves de confiance, durabilite, qualite et partenaires.',
    commandQuoteHint: 'Creer une nouvelle demande client.',
    commandAdminHint: 'Ouvrir le dashboard commercial.',
    quickDockLabel: 'Actions rapides',
    quickDockQuote: 'Devis rapide',
    quickDockCatalog: 'Catalogue',
    quickDockDocs: 'Documents',
    quickDockCall: 'Appeler',
    trustDockLabel: 'Garanties rapides',
    trustDockResponse: 'reponse commerciale',
    trustDockDocs: 'documents techniques',
    trustDock3d: 'apercus produits',
    trustDockContact: 'contact direct',
    backToTop: 'Retour en haut',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    breadcrumbLabel: 'Fil de navigation',
    metaHome: 'Plateforme industrielle G-ROD pour produits cuivre, demandes B2B, documents techniques et suivi commercial.',
    metaCatalogue: 'Catalogue professionnel G-ROD: copper rod, anodes, bus bars, tubes, sheets, wire et pieces cuivre sur mesure.',
    metaResources: 'Ressources techniques G-ROD: brochure, certificats, fiches techniques, FAQ et documents pour acheteurs cuivre.',
    metaProcess: 'Processus industriel G-ROD: reception, tri, laboratoire, production, controle qualite et export du cuivre recycle.',
    metaWhy: 'Pourquoi choisir G-ROD: cuivre recycle, faible empreinte carbone, production marocaine, qualite, tracabilite et partenaires strategiques.',
    metaQuote: 'Formulaire de demande de devis G-ROD pour produits cuivre, dimensions, quantites, plans et specifications.',
    metaAdmin: 'Espace administration G-ROD pour suivre les demandes, clients, produits, documents et opportunites commerciales.',
    connectionLost: 'Connexion interrompue',
    connectionLostText: 'Certaines actions peuvent attendre le retour du reseau.',
    connectionBack: 'Connexion retablie',
    connectionBackText: 'Le site est de nouveau pret.',
    installAppTitle: 'Installer G-ROD',
    installAppText: 'Acces plus rapide depuis votre appareil.',
    installApp: 'Installer',
    brandTitle: 'Solutions cuivre industrielles',
    heroTitle: 'Plateforme industrielle cuivre G-ROD',
    heroText:
      'Une plateforme B2B pour les acheteurs industriels qui recherchent du cuivre, des anodes, des rods et des solutions non ferreuses avec une approche qualite, rapidite commerciale et supply chain claire.',
    heroCatalogue: 'Explorer le catalogue',
    heroQuote: 'Demander une cotation',
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
    productSearchPlaceholder: 'Rod, anodes, bus bars...',
    applicationFilter: 'Application',
    allApplications: 'Toutes les applications',
    sortProducts: 'Trier par',
    sortRecommended: 'Ordre recommande',
    sortName: 'Nom du produit',
    sortCategory: 'Categorie',
    sortActive: 'Statut actif',
    viewMode: 'Mode d affichage',
    gridView: 'Cartes',
    listView: 'Liste',
    activeFilters: 'Filtres actifs',
    allProductStatuses: 'Tous les statuts',
    catalogueResultsSingle: 'produit affiche',
    catalogueResultsPlural: 'produits affiches',
    catalogueFilteredHint: 'Resultats adaptes aux filtres et a la recherche en cours.',
    catalogueAllVisibleHint: 'Catalogue complet des produits cuivre actifs.',
    resetFilters: 'Reinitialiser',
    noProductEyebrow: 'Recherche catalogue',
    noProductTitle: 'Aucun produit trouve',
    noProductText: 'Essayez un autre mot cle, retirez les filtres ou envoyez une demande sur mesure.',
    activeOnly: 'Actifs seulement',
    active: 'Actif',
    quickView: 'Apercu rapide',
    quickViewEyebrow: 'Fiche rapide',
    productDetail: 'Voir la fiche produit',
    quick3dPreview: 'Apercu 3D',
    productActionBar: 'Fiche produit',
    relatedProductsEyebrow: 'Selection associee',
    relatedProductsTitle: 'Produits souvent compares',
    addCompare: 'Ajouter au comparateur',
    removeCompare: 'Retirer du comparateur',
    compareSelected: 'produit(s) selectionne(s)',
    compareProducts: 'Comparer en 3D',
    clearCompare: 'Vider',
    compare3dTitle: 'Comparateur 3D',
    addToProject: 'Ajouter au projet',
    removeFromProject: 'Retirer du projet',
    recentProductsEyebrow: 'Navigation personnalisee',
    recentProductsTitle: 'Produits recemment consultes',
    favoriteProductsEyebrow: 'Selection sauvegardee',
    favoriteProductsTitle: 'Produits favoris',
    addFavorite: 'Ajouter aux favoris',
    removeFavorite: 'Retirer des favoris',
    prepareFavoriteQuote: 'Devis avec favoris',
    clearFavorites: 'Vider les favoris',
    projectSelectionEyebrow: 'Selection projet',
    projectSelectionCount: 'produit(s) dans la demande',
    prepareGroupedQuote: 'Preparer le devis groupe',
    clearSelection: 'Vider la selection',
    advisorEyebrow: 'Assistant produit',
    advisorTitle: 'Trouver le bon cuivre rapidement',
    advisorApplication: 'Application',
    advisorNeed: 'Besoin principal',
    advisorChoose: 'Choisir',
    advisorElectricity: 'Electricite / conductivite',
    advisorElectrolysis: 'Electrolyse / metallurgie',
    advisorPlumbing: 'Plomberie / climatisation',
    advisorFabrication: 'Fabrication / revetement',
    advisorCustom: 'Piece sur mesure',
    advisorConductivity: 'Conductivite',
    advisorFlat: 'Forme plate',
    advisorTube: 'Tube',
    advisorWire: 'Fil cuivre',
    advisorSpecialPart: 'Piece speciale',
    advisorRecommendation: 'Recommendation',
    advisorReasonAnodes: 'Adapte aux procedes electrolytiques et metallurgiques avec purete configurable.',
    advisorReasonTubes: 'Adapte aux reseaux techniques, plomberie, climatisation et installations industrielles.',
    advisorReasonWire: 'Adapte aux cables, bobinages et connexions electriques haute conductivite.',
    advisorReasonBusBars: 'Adapte aux tableaux electriques, distribution energie et pieces conductrices plates.',
    advisorReasonSheets: 'Adapte a la fabrication, au revetement et aux usages industriels en plaque.',
    advisorReasonCustom: 'Adapte aux plans techniques et besoins specifiques du client.',
    advisorReasonConductivity: 'Recommande pour les applications qui demandent une excellente conductivite.',
    advisorReasonRod: 'Produit polyvalent pour conducteurs industriels, cables et transformation cuivre.',
    smartSearchEyebrow: 'Recherche intelligente',
    smartSearchReasonDefault: 'Produit recommande selon les mots recherches et les applications disponibles.',
    smartSearchReasonAnodes: 'Resultat recommande pour les procedes electrolytiques, metallurgiques ou besoins en anodes.',
    smartSearchReasonTubes: 'Resultat recommande pour les besoins en tubes, plomberie, climatisation ou installation technique.',
    smartSearchReasonWire: 'Resultat recommande pour cables, bobinages et connexions electriques.',
    smartSearchReasonBusBars: 'Resultat recommande pour distribution electrique, tableaux industriels et formes plates conductrices.',
    smartSearchReasonSheets: 'Resultat recommande pour plaques, feuilles, revetement et fabrication industrielle.',
    smartSearchReasonCustom: 'Resultat recommande quand le besoin est specifique ou base sur un plan technique.',
    backCatalogue: 'Retour au catalogue',
    viewDocuments: 'Voir les documents',
    shareProduct: 'Partager la fiche',
    linkCopied: 'Lien copie',
    productQuoteText: 'Recevez une reponse structuree avec dimensions, quantite, specification et conditions de livraison.',
    applications: 'Applications',
    copperTransformation: 'Transformation cuivre',
    formLabel: 'Forme',
    usageLabel: 'Usage',
    demandLabel: 'Demande',
    availableDocuments: 'Documents disponibles',
    technicalSheet: 'Fiche technique',
    materialCertificate: 'Certificat matiere sur demande',
    analysisCertificate: 'Certificat d analyse sur demande',
    safetyHandlingInfo: 'Informations de securite et manipulation',
    quoteInfoTitle: 'Informations a preciser pour devis',
    applicationNeed: 'Application',
    applicationNeedValue: 'Usage industriel, environnement et contraintes techniques',
    normReference: 'Norme ou reference',
    drawingPlan: 'Plan',
    drawingPlanValue: 'Dessin technique ou lien document pour les pieces sur mesure',
    techInfo: 'Informations techniques',
    dimensions: 'Dimensions',
    standards: 'Normes',
    packaging: 'Conditionnement',
    loading: 'Chargement...',
    resourcesEyebrow: 'Ressources techniques',
    resourcesTitle: 'Documents, certificats et FAQ pour acheteurs cuivre',
    resourcesText: 'Un espace organise pour preparer les demandes B2B: fiches techniques, certificats, informations de conformite, exigences de plans et guides de stockage.',
    processEyebrow: 'Flow industriel',
    processTitle: 'Processus de production cuivre recycle',
    processText: 'Une lecture visuelle du parcours industriel MCF: reception, tri, controle laboratoire, transformation, stockage et expedition.',
    processHeroBadge: 'Excellence in copper',
    processMetricFlow: 'etapes cles',
    processMetricPurity: 'purete cible',
    processMetricTraceability: 'tracabilite',
    processFlowEyebrow: 'Production MCF',
    processFlowTitle: 'Du vieux metal au produit cuivre fini',
    processFlowHint: 'Chaque etape relie la matiere, la qualite, la securite et la performance industrielle.',
    processZoneRaw: 'Matiere',
    processZoneControl: 'Controle',
    processZoneQuality: 'Qualite',
    processZoneProduction: 'Production',
    processZoneLogistics: 'Logistique',
    processStepReceptionTitle: 'Reception ferraille',
    processStepReceptionText: 'Reception locale ou import, dechargement et preparation de la matiere premiere.',
    processStepSortingTitle: 'Tri et selection',
    processStepSortingText: 'Separation des flux cuivre et verification des lots avant entree en production.',
    processStepWeighingTitle: 'Pesage industriel',
    processStepWeighingText: 'Controle quantitatif par pont bascule et balances pour fiabiliser les entrees.',
    processStepLabTitle: 'Laboratoire',
    processStepLabText: 'Analyse de composition, verification de conformite et validation qualite.',
    processStepFurnaceTitle: 'Fusion et raffinage',
    processStepFurnaceText: 'Transformation thermique et raffinage pour stabiliser la qualite du cuivre.',
    processStepCastingTitle: 'Production cuivre',
    processStepCastingText: 'Fabrication de rods, anodes et formes cuivre selon besoin industriel.',
    processStepStockTitle: 'Stock produit fini',
    processStepStockText: 'Conditionnement, identification et preparation des lots pour livraison.',
    processStepExportTitle: 'Expedition',
    processStepExportText: 'Livraison locale ou export avec suivi documentaire et commercial.',
    processControlSecurity: 'Securite',
    processControlSecurityText: 'Processus controle pour reduire les risques et proteger les operations.',
    processControlTraceability: 'Tracabilite',
    processControlTraceabilityText: 'Suivi de chaque etape depuis la matiere premiere jusqu au produit fini.',
    processControlQuality: 'Qualite',
    processControlQualityText: 'Controles laboratoire et documents techniques selon demande client.',
    processControlPerformance: 'Performance',
    processControlPerformanceText: 'Optimisation continue de la production, du stockage et de la livraison.',
    whyEyebrow: 'Pourquoi G-ROD',
    whyTitle: 'Une plateforme cuivre construite pour les acheteurs industriels exigeants',
    whyText: 'G-ROD associe cuivre recycle, production marocaine, controle qualite, tracabilite et accompagnement B2B pour simplifier les achats cuivre.',
    whyImpactEyebrow: 'Promesse industrielle',
    whyImpactTitle: 'Cuivre responsable, achat plus clair',
    whyImpactText: 'Un parcours qui relie matiere recyclee, documents techniques, demandes structurees et suivi commercial.',
    whyRecyclingTitle: 'Cuivre recycle',
    whyRecyclingText: 'Valorisation des metaux non ferreux pour reduire la dependance aux matieres importees et soutenir une industrie plus durable.',
    whyRecyclingMetric: 'Recycle',
    whyCarbonTitle: 'Faible empreinte carbone',
    whyCarbonText: 'Le cuivre recycle permet de viser une production plus sobre en energie et mieux adaptee aux exigences environnementales.',
    whyCarbonMetric: 'CO2',
    whyMoroccoTitle: 'Production marocaine',
    whyMoroccoText: 'Ancrage industriel local pour servir les acheteurs marocains, africains et internationaux avec plus de proximite.',
    whyMoroccoMetric: 'MA',
    whyQualityTitle: 'Qualite controlee',
    whyQualityText: 'Laboratoire, certificats, documents techniques et suivi des specifications pour mieux securiser chaque demande.',
    whyQualityMetric: 'QC',
    whyTraceabilityTitle: 'Tracabilite',
    whyTraceabilityText: 'Suivi des lots, des demandes et des informations client pour garder une vision claire du parcours commercial et industriel.',
    whyTraceabilityMetric: 'Lot',
    whyPartnersTitle: 'Partenaires strategiques',
    whyPartnersText: 'Un ecosysteme de partenaires institutionnels, industriels et financiers qui renforce la credibilite du projet.',
    whyPartnersMetric: '5+',
    whyPartnersPanelTitle: 'Un ecosysteme qui soutient la transition industrielle',
    whyPartnersPanelText: 'OCP, Tamwilcom, ANAPEC, Maroc PME et CFYE representent un signal de confiance pour les clients B2B et les partenaires du projet.',
    requestADocument: 'Demander un document',
    documentSearch: 'Recherche document',
    documentSearchPlaceholder: 'Certificat, anodes, norme...',
    allTypes: 'Tous les types',
    technicalFaq: 'FAQ technique',
    faqTitle: 'Questions frequentes',
    faqDocumentsQuestion: 'Quels documents peut demander un acheteur industriel ?',
    faqDocumentsAnswer: 'Fiche technique, certificat matiere, certificat d analyse, informations de stockage et documents de conformite selon le produit et la commande.',
    faqPurityQuestion: 'La purete cuivre peut-elle etre choisie pour les anodes ?',
    faqPurityAnswer: 'Oui. Le formulaire de devis permet de choisir une valeur entre 50% et 99,99% pour les Copper Anodes.',
    faqCustomQuestion: 'Comment demander une piece cuivre sur mesure ?',
    faqCustomAnswer: 'Le client doit envoyer les dimensions, la quantite, la finition souhaitee, la norme ou reference, et idealement un plan technique.',
    faqStandardsQuestion: 'Les normes sont-elles garanties automatiquement ?',
    faqStandardsAnswer: 'Non. Les normes ASTM, EN, IEC ou specifications internes doivent etre confirmees au moment du devis selon le produit, le lot et la production.',
    available: 'Disponible',
    onRequest: 'Sur demande',
    download: 'Telecharger',
    requestDocument: 'Demander ce document',
    documentRequestEyebrow: 'Documentation technique',
    documentRequestTitle: 'Demander un document technique',
    documentRequestText: 'Demandez une fiche technique, un certificat ou un document de conformite sans demander un prix.',
    documentRequestStandaloneText: 'Cette demande concerne uniquement une fiche technique, un certificat ou un document de conformite. Elle ne demande pas de prix.',
    requestedDocument: 'Document demande',
    chooseDocument: 'Choisir un document',
    allProductsUnspecified: 'Tous les produits / non precise',
    documentMessagePlaceholder: 'Lot, norme, utilisation ou precision utile...',
    submitDocumentRequest: 'Envoyer la demande document',
    documentRequestSuccess: 'Demande document enregistree.',
    documentRequestError: 'Impossible d envoyer la demande document.',
    quoteEyebrow: 'Devis',
    quoteTitle: 'Nouvelle demande client',
    quoteIntro: 'Envoyez une demande claire avec le produit, les dimensions et le fichier technique si disponible.',
    groupedQuoteEyebrow: 'Demande groupee',
    groupedQuoteTitle: 'Produits selectionnes pour ce projet',
    groupedQuoteMessage: 'Produits selectionnes pour ce projet',
    quoteDraftSaved: 'Brouillon sauvegarde automatiquement',
    clearQuoteDraft: 'Effacer le brouillon',
    quoteDraftCleared: 'Brouillon effacé.',
    quoteProcess: 'Préparation du devis',
    quoteCheckProduct: 'Produit, quantité et dimensions',
    quoteCheckFile: 'Plan, photo ou fiche technique',
    quoteCheckReply: 'Réponse commerciale structurée',
    quoteCheckPlan: 'Plan ou lien document pour les pieces speciales',
    readinessContact: 'Coordonnées client',
    readinessProduct: 'Produit sélectionné',
    readinessQuantity: 'Quantité indiquée',
    readinessTechnical: 'Détails techniques',
    readinessFile: 'Plan, fichier ou message',
    readinessStrong: 'Demande tres complete',
    readinessMedium: 'Demande presque complete',
    readinessWeak: 'Demande a completer',
    configEyebrow: 'Configurateur devis',
    configTitle: 'Construire une demande claire',
    configText: 'Le site vérifie les points essentiels pour aider le client à envoyer une demande exploitable.',
    configProduct: 'Produit',
    configDimensions: 'Dimensions',
    configPurity: 'Pureté',
    configQuantity: 'Quantité',
    configDelivery: 'Livraison',
    configNotRequired: 'Non obligatoire',
    configMissingTitle: 'Informations a completer',
    configMissingText: 'Ajoutez encore:',
    configReadyTitle: 'Configuration solide',
    configReadyText: 'La demande contient les informations essentielles pour une réponse commerciale rapide.',
    deliveryStandardValue: 'Livraison standard',
    deliveryUrgentValue: 'Livraison urgente',
    quoteSideTitle: 'Informations utiles',
    quoteSideText: 'Plus la demande est précise, plus l équipe G-ROD peut répondre rapidement avec une offre adaptée.',
    company: 'Société',
    contact: 'Contact',
    email: 'Email',
    phone: 'Téléphone',
    product: 'Produit',
    chooseProduct: 'Choisir un produit',
    purity: 'Pureté du cuivre (%)',
    quantity: 'Quantité',
    length: 'Longueur',
    width: 'Largeur',
    thickness: 'Épaisseur',
    uploadDrawing: 'Joindre un fichier technique',
    uploadHelp: 'PDF, image, DWG ou DXF - maximum 15 MB',
    projectApplication: 'Application du projet',
    desiredFinish: 'Finition souhaitée',
    finishUndefined: 'À définir',
    finishBright: 'Brillant',
    finishMatte: 'Mat',
    finishTinned: 'Étamé',
    normReference: 'Norme ou référence',
    normReferencePlaceholder: 'Ex: ASTM, EN, IEC, spécification interne...',
    technicalPlanLink: 'Lien plan technique',
    desiredDiameter: 'Diamètre souhaité',
    deliveryNeed: 'Besoin livraison',
    quote3dPreview: 'Prévisualisation 3D',
    quickQuoteChecklist: 'Checklist devis rapide',
    uploadedFile: 'Fichier joint',
    uploadingFile: 'Upload en cours...',
    message: 'Message',
    submitQuote: 'Envoyer la demande',
    sending: 'Envoi en cours...',
    quoteSuccess: 'Demande enregistrée.',
    quoteError: 'Impossible d envoyer la demande. Vérifiez que le backend est lancé.',
    adminLogin: 'Connexion sécurisée',
    adminSpace: 'Espace admin',
    adminLoginIntro: 'Acces reserve a l equipe G-ROD pour le suivi des demandes de devis.',
    adminEmailLogin: 'Email admin',
    password: 'Mot de passe',
    login: 'Se connecter',
    loginError: 'Identifiants invalides ou backend non lance.',
    passkeyLogin: 'Connexion Face ID',
    passkeyLoginError: 'Connexion Face ID impossible. Activez-la d abord depuis l admin.',
    passkeyEnable: 'Activer Face ID',
    passkeyEnabled: 'Face ID / Windows Hello active pour cet admin.',
    passkeyRegisterError: 'Impossible d activer Face ID sur cet appareil.',
    adminTitle: 'Demandes clients',
    administration: 'Administration',
    commercialDashboard: 'Dashboard commercial G-ROD',
    dashboardIntro: 'Vue rapide sur les demandes clients, le catalogue et les actions prioritaires.',
    analyticsEyebrow: 'Analyse',
    analyticsTitle: 'Vue commerciale instantanee',
    analyticsHint: 'Lecture rapide des statuts et produits qui generent le plus de demandes.',
    statusDistribution: 'Repartition des statuts',
    topRequestedProducts: 'Produits les plus demandes',
    noData: 'Aucune donnee disponible',
    requestsMenu: 'Demandes',
    documentsMenu: 'Documents',
    activeProducts: 'Produits actifs',
    priority: 'Priorite',
    recentRequests: 'Demandes recentes',
    viewAll: 'Voir tout',
    productStatus: 'Etat produits',
    manage: 'Gerer',
    totalCatalogue: 'Total catalogue',
    viewPublicCatalogue: 'Voir le catalogue public',
    logout: 'Deconnexion',
    adminLoadError: 'Impossible de charger les demandes.',
    totalRequests: 'Demandes totales',
    newRequests: 'Nouvelles demandes',
    clients: 'Clients',
    clientsHistoryTitle: 'Clients et historique',
    clientSearch: 'Recherche client',
    clientSearchPlaceholder: 'Societe, email, produit...',
    viewHistory: 'Voir historique',
    clientSheet: 'Fiche client',
    allClients: 'Tous les clients',
    summary: 'Synthese',
    commercialActivity: 'Activite commerciale',
    requestedProducts: 'produits',
    firstRequest: 'Premiere demande',
    lastRequest: 'Derniere demande',
    last: 'Derniere',
    notProvided: 'Non renseignee',
    products: 'Produits',
    documentRequests: 'Demandes documents',
    adminSearch: 'Recherche admin',
    adminSearchPlaceholder: 'Reference, client, email, produit...',
    allRequests: 'Toutes',
    visibleRequests: 'demandes visibles',
    exportExcel: 'Exporter Excel',
    client: 'Client',
    details: 'Details',
    priority: 'Priorite',
    priorityHigh: 'Priorite forte',
    priorityMedium: 'Priorite moyenne',
    priorityLow: 'Priorite faible',
    allPriorities: 'Toutes les priorites',
    adminRequestsHint: 'Trie par urgence commerciale',
    priorityReasonLoyal: 'client fidele',
    priorityReasonNew: 'nouvelle demande',
    priorityReasonQuantity: 'quantite importante',
    priorityReasonFile: 'fichier ou plan fourni',
    priorityReasonInfo: 'informations a completer',
    pipelineEyebrow: 'Pipeline commercial',
    pipelineTitle: 'Suivi rapide des opportunites',
    pipelineHint: 'Les cartes affichent les demandes les plus prioritaires par statut.',
    pipelineNew: 'Nouvelles',
    pipelineProgress: 'En traitement',
    pipelineDone: 'Traitees',
    pipelineCancelled: 'Annulees',
    pipelineEmpty: 'Aucune demande',
    quickAction: 'Action rapide',
    downloadPdf: 'Telecharger PDF',
    inProgressAction: 'En traitement',
    clientHistory: 'Historique client',
    chooseClient: 'Choisir un client',
    requests: 'demandes',
    loyalClient: 'Client fidele',
    yes: 'Oui',
    no: 'Non',
    delete: 'Supprimer',
    statusUpdated: 'Statut mis a jour.',
    statusError: 'Impossible de modifier le statut.',
    viewDetails: 'Voir',
    requestDetails: 'Detail demande',
    clientInfo: 'Informations client',
    noMessage: 'Aucun message renseigne.',
    noAttachedFile: 'Aucun fichier technique joint.',
    downloadAttachedFile: 'Telecharger le fichier joint',
    close: 'Fermer',
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
    category: 'Categorie',
    characteristics: 'Caracteristiques',
    unspecifiedPurity: 'Purete non precisee',
    unspecifiedDimensions: 'Dimensions non precisees',
    unspecifiedStandards: 'Normes non precisees',
    productImage: 'Upload image produit',
    edit: 'Modifier',
    cancel: 'Annuler',
    saveChanges: 'Sauvegarder',
    uploadSuccess: 'Upload termine.',
    uploadError: 'Upload impossible.',
    uploadImage: 'Uploader image',
    clickSaveProduct: 'Cliquez sur Sauvegarder pour appliquer au produit.',
    productImageSaved: 'Image produit sauvegardee.',
    productImageSaveError: 'Impossible de sauvegarder l image du produit.',
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
    assistantPromptProduct: 'Quel produit choisir pour une application electrique ?',
    assistantPromptAnodes: 'Explique-moi la purete des anodes cuivre.',
    assistantPromptQuote: 'Aide-moi a preparer une demande de devis.',
    assistantError: 'Assistant indisponible. Verifiez la cle OpenAI ou le backend.',
    reference: 'Référence',
    status: 'Statut',
    inactive: 'Inactif',
    notifications: 'Notifications',
    exportCsv: 'Exporter CSV',
    ok: 'OK',
    platformLabel: 'G-ROD B2B Platform',
    shortcutLabel: 'Ctrl K',
    lengthLabel: 'Longueur',
    widthLabel: 'Largeur',
    thicknessLabel: 'Épaisseur',
    deliveryLabel: 'Livraison',
    finishUndefined: 'À définir',
    finishBright: 'Brillant',
    finishMatte: 'Mat',
    finishTinned: 'Étamé',
    send: 'Envoyer',
  },
  en: {
    navHome: 'Home',
    navCatalogue: 'Catalog',
    navResources: 'Resources',
    navProcess: 'Process',
    navWhy: 'Why G-ROD',
    navQuote: 'Request a quote',
    navAdmin: 'Admin',
    commandTrigger: 'Quick search',
    commandEyebrow: 'Smart navigation',
    commandPlaceholder: 'Search a page, product, quote...',
    commandNoResult: 'No result found.',
    commandHomeHint: 'Return to the G-ROD homepage.',
    commandCatalogueHint: 'View copper products, compare and open 3D.',
    commandResourcesHint: 'Documents, certificates, FAQ and brochure.',
    commandProcessHint: 'Understand the industrial flow, quality and traceability.',
    commandWhyHint: 'See trust proof, sustainability, quality and partners.',
    commandQuoteHint: 'Create a new client request.',
    commandAdminHint: 'Open the commercial dashboard.',
    quickDockLabel: 'Quick actions',
    quickDockQuote: 'Quick quote',
    quickDockCatalog: 'Catalog',
    quickDockDocs: 'Documents',
    quickDockCall: 'Call',
    trustDockLabel: 'Quick trust indicators',
    trustDockResponse: 'commercial response',
    trustDockDocs: 'technical documents',
    trustDock3d: 'product previews',
    trustDockContact: 'direct contact',
    backToTop: 'Back to top',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    breadcrumbLabel: 'Navigation path',
    metaHome: 'G-ROD industrial platform for copper products, B2B requests, technical documents and commercial tracking.',
    metaCatalogue: 'Professional G-ROD catalog: copper rod, anodes, bus bars, tubes, sheets, wire and custom copper parts.',
    metaResources: 'G-ROD technical resources: brochure, certificates, data sheets, FAQ and documents for copper buyers.',
    metaProcess: 'G-ROD industrial process: receiving, sorting, laboratory, production, quality control and export of recycled copper.',
    metaWhy: 'Why choose G-ROD: recycled copper, lower carbon footprint, Moroccan production, quality, traceability and strategic partners.',
    metaQuote: 'G-ROD quote request form for copper products, dimensions, quantities, drawings and specifications.',
    metaAdmin: 'G-ROD administration area to track requests, clients, products, documents and commercial opportunities.',
    connectionLost: 'Connection interrupted',
    connectionLostText: 'Some actions may wait until the network is back.',
    connectionBack: 'Connection restored',
    connectionBackText: 'The site is ready again.',
    installAppTitle: 'Install G-ROD',
    installAppText: 'Faster access from your device.',
    installApp: 'Install',
    brandTitle: 'Industrial copper solutions',
    heroTitle: 'G-ROD industrial copper platform',
    heroText:
      'A B2B platform for industrial buyers looking for copper, anodes, rods and non-ferrous solutions with a clear quality, commercial speed and supply chain approach.',
    heroCatalogue: 'Explore catalog',
    heroQuote: 'Request a quotation',
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
    productSearchPlaceholder: 'Rod, anodes, bus bars...',
    applicationFilter: 'Application',
    allApplications: 'All applications',
    sortProducts: 'Sort by',
    sortRecommended: 'Recommended order',
    sortName: 'Product name',
    sortCategory: 'Category',
    sortActive: 'Active status',
    viewMode: 'View mode',
    gridView: 'Cards',
    listView: 'List',
    activeFilters: 'Active filters',
    allProductStatuses: 'All statuses',
    catalogueResultsSingle: 'product shown',
    catalogueResultsPlural: 'products shown',
    catalogueFilteredHint: 'Results adapted to the current filters and search.',
    catalogueAllVisibleHint: 'Complete catalog of active copper products.',
    resetFilters: 'Reset',
    noProductEyebrow: 'Catalog search',
    noProductTitle: 'No product found',
    noProductText: 'Try another keyword, remove filters or send a custom request.',
    activeOnly: 'Active only',
    active: 'Active',
    quickView: 'Quick view',
    quickViewEyebrow: 'Quick sheet',
    productDetail: 'View product sheet',
    quick3dPreview: '3D preview',
    productActionBar: 'Product sheet',
    relatedProductsEyebrow: 'Related selection',
    relatedProductsTitle: 'Often compared products',
    addCompare: 'Add to comparator',
    removeCompare: 'Remove from comparator',
    compareSelected: 'selected product(s)',
    compareProducts: 'Compare in 3D',
    clearCompare: 'Clear',
    compare3dTitle: '3D comparator',
    addToProject: 'Add to project',
    removeFromProject: 'Remove from project',
    recentProductsEyebrow: 'Personalized navigation',
    recentProductsTitle: 'Recently viewed products',
    favoriteProductsEyebrow: 'Saved selection',
    favoriteProductsTitle: 'Favorite products',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    prepareFavoriteQuote: 'Quote with favorites',
    clearFavorites: 'Clear favorites',
    projectSelectionEyebrow: 'Project selection',
    projectSelectionCount: 'product(s) in the request',
    prepareGroupedQuote: 'Prepare grouped quote',
    clearSelection: 'Clear selection',
    advisorEyebrow: 'Product assistant',
    advisorTitle: 'Find the right copper quickly',
    advisorApplication: 'Application',
    advisorNeed: 'Main need',
    advisorChoose: 'Choose',
    advisorElectricity: 'Electricity / conductivity',
    advisorElectrolysis: 'Electrolysis / metallurgy',
    advisorPlumbing: 'Plumbing / HVAC',
    advisorFabrication: 'Fabrication / cladding',
    advisorCustom: 'Custom part',
    advisorConductivity: 'Conductivity',
    advisorFlat: 'Flat shape',
    advisorTube: 'Tube',
    advisorWire: 'Copper wire',
    advisorSpecialPart: 'Special part',
    advisorRecommendation: 'Recommendation',
    advisorReasonAnodes: 'Suited for electrolytic and metallurgical processes with configurable purity.',
    advisorReasonTubes: 'Suited for technical networks, plumbing, HVAC and industrial installations.',
    advisorReasonWire: 'Suited for cables, windings and high-conductivity electrical connections.',
    advisorReasonBusBars: 'Suited for electrical boards, energy distribution and flat conductive parts.',
    advisorReasonSheets: 'Suited for fabrication, cladding and industrial sheet uses.',
    advisorReasonCustom: 'Suited for technical drawings and specific client requirements.',
    advisorReasonConductivity: 'Recommended for applications requiring excellent conductivity.',
    advisorReasonRod: 'Versatile product for industrial conductors, cables and copper transformation.',
    smartSearchEyebrow: 'Smart search',
    smartSearchReasonDefault: 'Recommended product based on searched words and available applications.',
    smartSearchReasonAnodes: 'Recommended for electrolytic, metallurgical or copper anode requirements.',
    smartSearchReasonTubes: 'Recommended for tubes, plumbing, HVAC or technical installation needs.',
    smartSearchReasonWire: 'Recommended for cables, windings and electrical connections.',
    smartSearchReasonBusBars: 'Recommended for electrical distribution, industrial panels and flat conductive shapes.',
    smartSearchReasonSheets: 'Recommended for sheets, plates, cladding and industrial fabrication.',
    smartSearchReasonCustom: 'Recommended when the need is specific or based on a technical drawing.',
    backCatalogue: 'Back to catalog',
    viewDocuments: 'View documents',
    shareProduct: 'Share product',
    linkCopied: 'Link copied',
    productQuoteText: 'Receive a structured reply with dimensions, quantity, specification and delivery conditions.',
    applications: 'Applications',
    copperTransformation: 'Copper transformation',
    formLabel: 'Shape',
    usageLabel: 'Use',
    demandLabel: 'Request',
    availableDocuments: 'Available documents',
    technicalSheet: 'Technical data sheet',
    materialCertificate: 'Material certificate on request',
    analysisCertificate: 'Analysis certificate on request',
    safetyHandlingInfo: 'Safety and handling information',
    quoteInfoTitle: 'Information to specify for quote',
    applicationNeed: 'Application',
    applicationNeedValue: 'Industrial use, environment and technical constraints',
    normReference: 'Standard or reference',
    normReferencePlaceholder: 'Ex: ASTM, EN, IEC, internal specification...',
    drawingPlan: 'Drawing',
    drawingPlanValue: 'Technical drawing or document link for custom parts',
    techInfo: 'Technical information',
    dimensions: 'Dimensions',
    standards: 'Standards',
    packaging: 'Packaging',
    loading: 'Loading...',
    resourcesEyebrow: 'Technical resources',
    resourcesTitle: 'Documents, certificates and FAQ for copper buyers',
    resourcesText: 'An organized space to prepare B2B requests: technical sheets, certificates, compliance information, drawing requirements and storage guides.',
    processEyebrow: 'Industrial flow',
    processTitle: 'Recycled copper production process',
    processText: 'A visual reading of the MCF industrial journey: receiving, sorting, laboratory control, transformation, storage and shipment.',
    processHeroBadge: 'Excellence in copper',
    processMetricFlow: 'key steps',
    processMetricPurity: 'target purity',
    processMetricTraceability: 'traceability',
    processFlowEyebrow: 'MCF production',
    processFlowTitle: 'From recovered metal to finished copper product',
    processFlowHint: 'Each step connects material, quality, safety and industrial performance.',
    processZoneRaw: 'Material',
    processZoneControl: 'Control',
    processZoneQuality: 'Quality',
    processZoneProduction: 'Production',
    processZoneLogistics: 'Logistics',
    processStepReceptionTitle: 'Scrap receiving',
    processStepReceptionText: 'Local or imported receiving, unloading and preparation of raw material.',
    processStepSortingTitle: 'Sorting and selection',
    processStepSortingText: 'Separation of copper flows and batch verification before production entry.',
    processStepWeighingTitle: 'Industrial weighing',
    processStepWeighingText: 'Quantitative control through weighbridge and scales to secure incoming material.',
    processStepLabTitle: 'Laboratory',
    processStepLabText: 'Composition analysis, conformity verification and quality validation.',
    processStepFurnaceTitle: 'Melting and refining',
    processStepFurnaceText: 'Thermal transformation and refining to stabilize copper quality.',
    processStepCastingTitle: 'Copper production',
    processStepCastingText: 'Production of rods, anodes and copper forms according to industrial needs.',
    processStepStockTitle: 'Finished stock',
    processStepStockText: 'Packaging, identification and preparation of batches for delivery.',
    processStepExportTitle: 'Shipment',
    processStepExportText: 'Local delivery or export with documentary and commercial follow-up.',
    processControlSecurity: 'Safety',
    processControlSecurityText: 'Controlled process to reduce risks and protect operations.',
    processControlTraceability: 'Traceability',
    processControlTraceabilityText: 'Tracking of each step from raw material to finished product.',
    processControlQuality: 'Quality',
    processControlQualityText: 'Laboratory controls and technical documents according to client request.',
    processControlPerformance: 'Performance',
    processControlPerformanceText: 'Continuous optimization of production, storage and delivery.',
    whyEyebrow: 'Why G-ROD',
    whyTitle: 'A copper platform built for demanding industrial buyers',
    whyText: 'G-ROD combines recycled copper, Moroccan production, quality control, traceability and B2B support to simplify copper sourcing.',
    whyImpactEyebrow: 'Industrial promise',
    whyImpactTitle: 'Responsible copper, clearer purchasing',
    whyImpactText: 'A journey connecting recycled material, technical documents, structured requests and commercial follow-up.',
    whyRecyclingTitle: 'Recycled copper',
    whyRecyclingText: 'Valorization of non-ferrous metals to reduce dependency on imported material and support a more sustainable industry.',
    whyRecyclingMetric: 'Recycled',
    whyCarbonTitle: 'Lower carbon footprint',
    whyCarbonText: 'Recycled copper supports more energy-efficient production aligned with environmental requirements.',
    whyCarbonMetric: 'CO2',
    whyMoroccoTitle: 'Moroccan production',
    whyMoroccoText: 'Local industrial anchoring to serve Moroccan, African and international buyers with stronger proximity.',
    whyMoroccoMetric: 'MA',
    whyQualityTitle: 'Controlled quality',
    whyQualityText: 'Laboratory, certificates, technical documents and specification tracking to secure each request.',
    whyQualityMetric: 'QC',
    whyTraceabilityTitle: 'Traceability',
    whyTraceabilityText: 'Tracking of batches, requests and client information to keep a clear view of the commercial and industrial journey.',
    whyTraceabilityMetric: 'Batch',
    whyPartnersTitle: 'Strategic partners',
    whyPartnersText: 'An ecosystem of institutional, industrial and financial partners strengthening project credibility.',
    whyPartnersMetric: '5+',
    whyPartnersPanelTitle: 'An ecosystem supporting industrial transition',
    whyPartnersPanelText: 'OCP, Tamwilcom, ANAPEC, Maroc PME and CFYE are trust signals for B2B clients and project partners.',
    requestADocument: 'Request a document',
    documentSearch: 'Document search',
    documentSearchPlaceholder: 'Certificate, anodes, standard...',
    allTypes: 'All types',
    technicalFaq: 'Technical FAQ',
    faqTitle: 'Frequently asked questions',
    faqDocumentsQuestion: 'Which documents can an industrial buyer request?',
    faqDocumentsAnswer: 'Technical sheet, material certificate, analysis certificate, storage information and compliance documents depending on the product and order.',
    faqPurityQuestion: 'Can copper purity be selected for anodes?',
    faqPurityAnswer: 'Yes. The quote form allows choosing a value between 50% and 99.99% for Copper Anodes.',
    faqCustomQuestion: 'How to request a custom copper part?',
    faqCustomAnswer: 'The client should send dimensions, quantity, desired finish, standard or reference, and ideally a technical drawing.',
    faqStandardsQuestion: 'Are standards automatically guaranteed?',
    faqStandardsAnswer: 'No. ASTM, EN, IEC standards or internal specifications must be confirmed at quotation stage depending on the product, batch and production.',
    available: 'Available',
    onRequest: 'On request',
    download: 'Download',
    requestDocument: 'Request this document',
    documentRequestEyebrow: 'Technical documentation',
    documentRequestTitle: 'Request a technical document',
    documentRequestText: 'Request a datasheet, certificate or compliance document without requesting a price.',
    documentRequestStandaloneText: 'This request only concerns a technical sheet, certificate or compliance document. It is not a price request.',
    requestedDocument: 'Requested document',
    chooseDocument: 'Choose a document',
    allProductsUnspecified: 'All products / unspecified',
    documentMessagePlaceholder: 'Batch, standard, use case or useful detail...',
    submitDocumentRequest: 'Send document request',
    documentRequestSuccess: 'Document request saved.',
    documentRequestError: 'Unable to send document request.',
    quoteEyebrow: 'Quote',
    quoteTitle: 'New client request',
    quoteIntro: 'Send a clear request with the product, dimensions and technical file when available.',
    groupedQuoteEyebrow: 'Grouped request',
    groupedQuoteTitle: 'Products selected for this project',
    groupedQuoteMessage: 'Products selected for this project',
    quoteDraftSaved: 'Draft saved automatically',
    clearQuoteDraft: 'Clear draft',
    quoteDraftCleared: 'Draft cleared.',
    quoteProcess: 'Quote preparation',
    quoteCheckProduct: 'Product, quantity and dimensions',
    quoteCheckFile: 'Drawing, photo or technical sheet',
    quoteCheckReply: 'Structured commercial reply',
    quoteCheckPlan: 'Drawing or document link for special parts',
    readinessContact: 'Client contact details',
    readinessProduct: 'Selected product',
    readinessQuantity: 'Quantity provided',
    readinessTechnical: 'Technical details',
    readinessFile: 'Drawing, file or message',
    readinessStrong: 'Very complete request',
    readinessMedium: 'Almost complete request',
    readinessWeak: 'Request to complete',
    configEyebrow: 'Quote configurator',
    configTitle: 'Build a clear request',
    configText: 'The site checks the essential points to help the client send an actionable request.',
    configProduct: 'Product',
    configDimensions: 'Dimensions',
    configPurity: 'Purity',
    configQuantity: 'Quantity',
    configDelivery: 'Delivery',
    configNotRequired: 'Not required',
    configMissingTitle: 'Information to complete',
    configMissingText: 'Still add:',
    configReadyTitle: 'Strong configuration',
    configReadyText: 'The request contains the essential information for a fast commercial response.',
    deliveryStandardValue: 'Standard delivery',
    deliveryUrgentValue: 'Urgent delivery',
    quoteSideTitle: 'Useful information',
    quoteSideText: 'The more precise the request is, the faster the G-ROD team can respond with a suitable offer.',
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
    uploadDrawing: 'Attach technical file',
    uploadHelp: 'PDF, image, DWG or DXF - maximum 15 MB',
    projectApplication: 'Project application',
    desiredFinish: 'Desired finish',
    normReference: 'Standard or reference',
    technicalPlanLink: 'Technical drawing link',
    desiredDiameter: 'Desired diameter',
    deliveryNeed: 'Delivery need',
    quote3dPreview: '3D preview',
    quickQuoteChecklist: 'Quick quote checklist',
    uploadedFile: 'Attached file',
    uploadingFile: 'Uploading...',
    message: 'Message',
    submitQuote: 'Send request',
    sending: 'Sending...',
    quoteSuccess: 'Request saved.',
    quoteError: 'Unable to send request. Check that backend is running.',
    adminLogin: 'Secure login',
    adminSpace: 'Admin area',
    adminLoginIntro: 'Access reserved for the G-ROD team to monitor quote requests.',
    adminEmailLogin: 'Admin email',
    password: 'Password',
    login: 'Log in',
    loginError: 'Invalid credentials or backend unavailable.',
    passkeyLogin: 'Face ID login',
    passkeyLoginError: 'Face ID login failed. Enable it first from admin.',
    passkeyEnable: 'Enable Face ID',
    passkeyEnabled: 'Face ID / Windows Hello enabled for this admin.',
    passkeyRegisterError: 'Unable to enable Face ID on this device.',
    adminTitle: 'Client requests',
    administration: 'Administration',
    commercialDashboard: 'G-ROD commercial dashboard',
    dashboardIntro: 'Quick view of client requests, catalog and priority actions.',
    analyticsEyebrow: 'Analytics',
    analyticsTitle: 'Instant commercial overview',
    analyticsHint: 'Quick reading of statuses and products generating the most requests.',
    statusDistribution: 'Status distribution',
    topRequestedProducts: 'Top requested products',
    noData: 'No data available',
    requestsMenu: 'Requests',
    documentsMenu: 'Documents',
    activeProducts: 'Active products',
    priority: 'Priority',
    recentRequests: 'Recent requests',
    viewAll: 'View all',
    productStatus: 'Product status',
    manage: 'Manage',
    totalCatalogue: 'Total catalog',
    viewPublicCatalogue: 'View public catalog',
    logout: 'Logout',
    adminLoadError: 'Unable to load requests.',
    totalRequests: 'Total requests',
    newRequests: 'New requests',
    clients: 'Clients',
    clientsHistoryTitle: 'Clients and history',
    clientSearch: 'Client search',
    clientSearchPlaceholder: 'Company, email, product...',
    viewHistory: 'View history',
    clientSheet: 'Client sheet',
    allClients: 'All clients',
    summary: 'Summary',
    commercialActivity: 'Commercial activity',
    requestedProducts: 'products',
    firstRequest: 'First request',
    lastRequest: 'Last request',
    last: 'Last',
    notProvided: 'Not provided',
    products: 'Products',
    documentRequests: 'Document requests',
    adminSearch: 'Admin search',
    adminSearchPlaceholder: 'Reference, client, email, product...',
    allRequests: 'All',
    visibleRequests: 'visible requests',
    exportExcel: 'Export Excel',
    client: 'Client',
    details: 'Details',
    priority: 'Priority',
    priorityHigh: 'High priority',
    priorityMedium: 'Medium priority',
    priorityLow: 'Low priority',
    allPriorities: 'All priorities',
    adminRequestsHint: 'Sorted by commercial urgency',
    priorityReasonLoyal: 'loyal client',
    priorityReasonNew: 'new request',
    priorityReasonQuantity: 'large quantity',
    priorityReasonFile: 'file or drawing provided',
    priorityReasonInfo: 'information to complete',
    pipelineEyebrow: 'Commercial pipeline',
    pipelineTitle: 'Fast opportunity tracking',
    pipelineHint: 'Cards show the highest-priority requests by status.',
    pipelineNew: 'New',
    pipelineProgress: 'In progress',
    pipelineDone: 'Done',
    pipelineCancelled: 'Cancelled',
    pipelineEmpty: 'No request',
    quickAction: 'Quick action',
    downloadPdf: 'Download PDF',
    inProgressAction: 'In progress',
    clientHistory: 'Client history',
    chooseClient: 'Choose a client',
    requests: 'requests',
    loyalClient: 'Loyal client',
    yes: 'Yes',
    no: 'No',
    delete: 'Delete',
    statusUpdated: 'Status updated.',
    statusError: 'Unable to update status.',
    viewDetails: 'View',
    requestDetails: 'Request details',
    clientInfo: 'Client information',
    noMessage: 'No message provided.',
    noAttachedFile: 'No technical file attached.',
    downloadAttachedFile: 'Download attached file',
    close: 'Close',
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
    category: 'Category',
    characteristics: 'Characteristics',
    unspecifiedPurity: 'Unspecified purity',
    unspecifiedDimensions: 'Unspecified dimensions',
    unspecifiedStandards: 'Unspecified standards',
    productImage: 'Upload product image',
    edit: 'Edit',
    cancel: 'Cancel',
    saveChanges: 'Save',
    uploadSuccess: 'Upload complete.',
    uploadError: 'Upload failed.',
    uploadImage: 'Upload image',
    clickSaveProduct: 'Click Save to apply it to the product.',
    productImageSaved: 'Product image saved.',
    productImageSaveError: 'Unable to save product image.',
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
    assistantPromptProduct: 'Which product should I choose for an electrical application?',
    assistantPromptAnodes: 'Explain copper anode purity.',
    assistantPromptQuote: 'Help me prepare a quote request.',
    assistantError: 'Assistant unavailable. Check the OpenAI key or backend.',
    reference: 'Reference',
    status: 'Status',
    inactive: 'Inactive',
    notifications: 'Notifications',
    exportCsv: 'Export CSV',
    ok: 'OK',
    platformLabel: 'G-ROD B2B Platform',
    shortcutLabel: 'Ctrl K',
    lengthLabel: 'Length',
    widthLabel: 'Width',
    thicknessLabel: 'Thickness',
    deliveryLabel: 'Delivery',
    finishUndefined: 'To define',
    finishBright: 'Bright',
    finishMatte: 'Matte',
    finishTinned: 'Tinned',
    send: 'Send',
  },
}

export default App
