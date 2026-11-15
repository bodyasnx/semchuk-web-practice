// Service worker «Смак Традиції» (ПР 10). Це окремий скрипт, який браузер запускає у фоні,
// поза сторінкою; він перехоплює запити сайту (подія fetch) і вирішує, звідки взяти відповідь:
// з мережі чи з кешу (Cache Storage).
//
// Файл не імпортується застосунком: плагін service-worker у vite.config.js під час `npm run build`
// підставляє справжню версію в константу VERSION і кладе результат у dist/sw.js. Версія — хеш файлів
// збірки, тож кожен новий деплой з іншим кодом отримує нові кеші, а старі видаляються.
//
// Стратегії:
//   • сторінки (навігація)       — лише мережа; без мережі — /offline.html з поясненням;
//   • /static/* (JS і CSS з хешем) — спершу кеш: файл із тим самим хешем ніколи не змінюється;
//   • фото, SVG, шрифти, іконки   — кеш, а у фоні оновлення з мережі (stale-while-revalidate);
//   • API на іншому домені (Render) — не перехоплюємо: рецепти завжди свіжі з сервера.

const VERSION = '__SW_VERSION__';
const PRECACHE = `smak-precache-${VERSION}`; // офлайн-сторінка і те, що вона показує
const STATIC = `smak-static-${VERSION}`;     // JS і CSS поточної збірки
const MEDIA = 'smak-media-v1';               // фото й інші файли з public/ (між версіями лишаються)
const MEDIA_LIMIT = 80;                      // щоб кеш фото не ріс безмежно

const PRECACHE_URLS = [
  '/offline.html',
  '/assets/logo-mark.svg',
  '/fonts/lora-cyrillic.woff2',
  '/fonts/manrope-cyrillic.woff2',
];

// 1. Встановлення: заздалегідь кешуємо офлайн-сторінку. skipWaiting — нова версія SW
//    вмикається одразу, не чекаючи, поки людина закриє всі вкладки сайту.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// 2. Активація: видаляємо кеші попередніх версій; clients.claim — SW одразу керує відкритими вкладками.
self.addEventListener('activate', (event) => {
  const keep = [PRECACHE, STATIC, MEDIA];
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith('smak-') && !keep.includes(name))
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

// 3. Перехоплення запитів
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // POST/PUT/DELETE і запити на інші домени (API, мапа OpenStreetMap) — без змін, напряму в мережу
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkWithOfflineFallback(request));
  } else if (url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(request, STATIC));
  } else if (/^\/(images|assets|fonts|icons)\//.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
  // решта (manifest, robots.txt, sitemap.xml) — звичайний запит у мережу
});

/** Сторінка завжди з мережі (свіжий index.html після деплою); немає мережі — офлайн-сторінка. */
async function networkWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch {
    return (await caches.match('/offline.html')) ?? Response.error();
  }
}

/** Спершу кеш; якщо файлу там немає — мережа, і копія відповіді йде в кеш. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

/** Відповідь з кешу одразу (швидко), а свіжа копія з мережі оновлює кеш на наступний раз. */
async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(MEDIA);
  const cached = await cache.match(request);
  const fromNetwork = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trimCache(cache, MEDIA_LIMIT);
      }
      return response;
    });

  if (cached) {
    // Оновлення у фоні: waitUntil не дає браузеру зупинити SW, доки запис у кеш не завершився.
    // Помилку мережі ігноруємо — у людини вже є відповідь з кешу.
    event.waitUntil(fromNetwork.catch(() => {}));
    return cached;
  }
  return fromNetwork;
}

/** Залишає в кеші не більше max записів: видаляє найстаріші (keys() повертає їх у порядку додавання). */
async function trimCache(cache, max) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
}
