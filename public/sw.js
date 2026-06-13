// MindMirror · Service Worker (v4 - 网络优先策略)
// 策略：所有资源网络优先，离线时降级到缓存
// 关键：避免旧版缓存导致新版本加载异常

const CACHE = 'mindmirror-v4';

// 安装时立即激活
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      // 清理所有旧缓存
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      ),
      // 立即接管所有页面
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // 只拦截同源 GET 请求
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;

  // 所有资源：网络优先，离线时降级到缓存
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp.ok && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
