// Calculadora do Forjador: funciona sem internet depois da primeira visita.
// A página vem da rede quando há conexão (para pegar atualizações) e do
// cache quando não há. As fontes do Google ficam guardadas depois de baixadas.
const CACHE = 'forjador-v5';
const PAGINA = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // Busca direto na rede: evita esperar o cache HTTP que a própria página está usando
      .then((cache) => fetch(new Request(PAGINA, { cache: 'reload' }))
        .then((res) => { if (!res.ok) throw new Error('sem página'); return cache.put(PAGINA, res); }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fontes: cache primeiro (não mudam)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(req).then((salvo) => salvo || fetch(req).then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copia));
        return res;
      }))
    );
    return;
  }

  // Arquivos do próprio site: rede primeiro, cache se estiver sem internet
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copia));
        }
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then((salvo) => salvo || (req.mode === 'navigate' ? caches.match(PAGINA) : undefined))
          .then((resp) => resp || Response.error())
      )
    );
  }
});
