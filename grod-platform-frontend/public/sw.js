const CACHE_NAME = 'grod-shell-v1'
const SHELL_ASSETS = [
  '/',
  '/favicon.svg',
  '/grod-logo.png',
  '/manifest.webmanifest',
  '/models/copper-rod.glb',
  '/models/copper-anodes.glb',
  '/models/copper-bus-bars.glb',
  '/models/copper-tubes.glb',
  '/models/copper-sheets.glb',
  '/models/copper-wire.glb',
  '/models/custom-copper-parts.glb'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url)

  if (requestUrl.pathname.startsWith('/api') || event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone()
      if (response.ok && requestUrl.origin === self.location.origin) {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
      }
      return response
    }).catch(() => caches.match('/')))
  )
})
