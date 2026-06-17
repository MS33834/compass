// MindMirror · Service Worker (v6 - 离线可用)
// 策略：
// - 导航请求（HTML）：网络优先，离线回退缓存 index.html
// - 带 hash 的 JS/CSS：浏览器自身缓存，SW 不干预
// - 静态资源（图片/字体/SVG）：网络优先，离线降级缓存

const CACHE = 'mindmirror-v6';

self.addEventListener('install', () => {
  self.skipWaiting();
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
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
          return resp;
        })
        .catch(() =>
          caches.match(e.request).then(r => r || caches.match('/MindMirror/index.html') || caches.match('./index.html') || caches.match('/index.html'))
        )
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
