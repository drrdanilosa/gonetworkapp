// Service Worker personalizado para GoNetwork AI
// Este arquivo será usado em conjunto com o next-pwa

const CACHE_NAME = 'gonetwork-ai-v1'
const STATIC_CACHE = 'gonetwork-static-v1'
const DYNAMIC_CACHE = 'gonetwork-dynamic-v1'

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  '/',
  '/login',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cache aberto')
        return cache.addAll(ESSENTIAL_RESOURCES)
      })
      .then(() => {
        console.log('Service Worker: Recursos essenciais cacheados')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Erro durante instalação:', error)
      })
  )
})

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Caches limpos')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições (estratégia Cache First para assets, Network First para APIs)
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return
  }

  // Estratégia para diferentes tipos de recursos
  if (request.url.includes('/api/')) {
    // APIs: Network First com fallback para cache
    event.respondWith(networkFirstStrategy(request))
  } else if (request.destination === 'image') {
    // Imagens: Cache First
    event.respondWith(cacheFirstStrategy(request))
  } else if (request.url.includes('/_next/static/')) {
    // Assets estáticos do Next.js: Cache First
    event.respondWith(cacheFirstStrategy(request))
  } else {
    // Páginas: Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request))
  }
})

// Estratégia Network First (para APIs)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network falhou, tentando cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retornar resposta offline para APIs
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'Você está offline. Conecte-se à internet para sincronizar dados.' 
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    throw error
  }
}

// Estratégia Cache First (para imagens e assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Recurso não disponível offline:', request.url)
    
    // Retornar imagem placeholder para imagens
    if (request.destination === 'image') {
      return caches.match('/placeholder.svg')
    }
    
    throw error
  }
}

// Estratégia Stale While Revalidate (para páginas)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Retornar página offline se não há cache e não há rede
    if (!cachedResponse) {
      return caches.match('/offline')
    }
  })
  
  return cachedResponse || await networkResponsePromise
}

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CACHE_PROJECT_DATA') {
    // Cache específico para dados de projeto (para uso offline)
    const { projectId, data } = event.data
    cacheProjectData(projectId, data)
  }
})

// Função para cachear dados específicos de projetos
async function cacheProjectData(projectId, data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
    await cache.put(`/api/projects/${projectId}`, response)
    console.log(`Service Worker: Dados do projeto ${projectId} cacheados`)
  } catch (error) {
    console.error('Service Worker: Erro ao cachear dados do projeto:', error)
  }
}

// Sync em background (para quando voltar online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  console.log('Service Worker: Sincronizando dados em background...')
  // Aqui você pode implementar lógica para sincronizar dados quando voltar online
  // Por exemplo, enviar dados salvos localmente para o servidor
}

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir App'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Click em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('Service Worker: Carregado e pronto!')
