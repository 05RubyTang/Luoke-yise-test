/**
 * Service Worker — 图片缓存
 *
 * 策略：Cache First（缓存优先）
 *   1. 命中缓存 → 直接返回，无网络请求
 *   2. 未命中   → 发起网络请求，成功后写入缓存
 *
 * 覆盖范围：所有 .png / .jpg / .webp / .gif 图片请求
 *   - 本地 /spirits/、/fruits/ 等静态图
 *   - BWIKI CDN 跨域图（patchwiki.biligame.com）
 */

const CACHE_VERSION = 'v2';
const IMG_CACHE = `luoke-images-${CACHE_VERSION}`;

// ── 安装：立即激活，不等待旧 SW 关闭 ────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ── 激活：删除旧版本缓存，接管所有页面 ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('luoke-images-') && k !== IMG_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch 拦截：Cache First ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理图片请求（通过 destination 或 URL 后缀判断）
  const isImage =
    request.destination === 'image' ||
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url.pathname);

  if (!isImage) return;

  event.respondWith(
    caches.open(IMG_CACHE).then(async (cache) => {
      // 1. 查缓存
      const cached = await cache.match(request);
      if (cached) return cached;

      // 2. 缓存未命中 → 发起网络请求
      try {
        const response = await fetch(request);
        // status === 200：正常响应；status === 0：跨域 opaque 响应（BWIKI 图片）
        if (response.status === 200 || response.status === 0) {
          // 异步写缓存，不阻塞响应返回
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        // 离线/网络错误 → 尝试宽松匹配（忽略 ?v=x 查询参数）
        const fallback = await cache.match(request, { ignoreSearch: true });
        if (fallback) return fallback;
        // 完全失败 → 返回空响应，让 <img> 的 onError 正常触发
        return new Response('', { status: 408, statusText: 'Offline' });
      }
    })
  );
});
