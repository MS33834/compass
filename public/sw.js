// Compass · Service Worker (v1 - 离线可用)
// 策略：
// - 导航请求（HTML）：网络优先，离线回退缓存的 index.html（预缓存 + 运行时缓存）
// - 带 hash 的 JS/CSS：浏览器自身缓存，SW 不干预
// - 静态资源（图片/字体/SVG）：网络优先，离线降级缓存

const CACHE = 'compass-v1';
const BASE = self.registration ? new URL('.', self.registration.scope).pathname : '/';

// 预缓存 app shell 核心文件
const PRECACHE_URLS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}favicon.svg`,
  `${BASE}manifest.webmanifest`,
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(c => c.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      caches
        .keys()
        .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  let url;
  try {
    url = new URL(e.request.url);
  } catch {
    return;
  }
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;

  // 导航请求：网络优先，离线回退缓存的 index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const cloneForRequest = resp.clone();
          const cloneForIndex = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, cloneForRequest)).catch(() => {});
          // 同时缓存 index.html 作为稳定 fallback key
          const indexReq = new Request(`${BASE}index.html`);
          caches.open(CACHE).then(c => c.put(indexReq, cloneForIndex)).catch(() => {});
          return resp;
        })
        .catch(async () => {
          // 先尝试精确匹配
          const cached = await caches.match(e.request);
          if (cached) return cached;
          // 再尝试预缓存的 index.html
          for (const fallback of [`${BASE}index.html`, `${BASE}`, './index.html', '/index.html']) {
            const r = await caches.match(fallback);
            if (r) return r;
          }
          return Response.error();
        })
    );
    return;
  }

  // 带 hash 的 JS/CSS：浏览器自身缓存，SW 不拦截
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    return;
  }

  // 其他资源（图片、字体、SVG 等）：网络优先，离线降级缓存
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || Response.error()))
  );
});
