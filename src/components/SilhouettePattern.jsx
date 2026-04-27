import { useEffect, useRef } from 'react';

/**
 * SilhouettePattern
 * 在 canvas 上绘制随机倾斜、重复排列的精灵剪影纹样，
 * 作为 app-content 内屏背景的装饰层（position: absolute，被父容器裁剪）。
 */

const RAW_NAMES = ['1.png', '喵喵.png', '春花兔.png', '果冻.png', '火花剪影.png'];

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function drawPattern(ctx, W, H, images, dpr) {
  ctx.clearRect(0, 0, W, H);
  const rng = seededRandom(42);

  const cellW = 110 * dpr;
  const cellH = 110 * dpr;
  const imgSize = 140 * dpr;

  const cols = Math.ceil(W / cellW) + 2;
  const rows = Math.ceil(H / cellH) + 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const imgIdx = Math.floor(rng() * images.length) % images.length;
      const img = images[imgIdx];

      const jitterX = (rng() - 0.5) * cellW * 0.45;
      const jitterY = (rng() - 0.5) * cellH * 0.45;
      const angle   = (rng() - 0.5) * 60 * (Math.PI / 180); // -30°~ +30°
      const alpha   = 0.10 + rng() * 0.12;                  // 0.10~0.22
      const scale   = 0.65 + rng() * 0.65;                  // 0.65~1.3

      const cx = -cellW + col * cellW + cellW / 2 + jitterX;
      const cy = -cellH + row * cellH + cellH / 2 + jitterY;
      const sz = imgSize * scale;

      if (!img || !img.complete || img.naturalWidth === 0) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    }
  }
}

export default function SilhouettePattern() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const baseUrl = import.meta.env.BASE_URL || '/';
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let destroyed = false;
    const images = new Array(RAW_NAMES.length).fill(null);

    function setSize() {
      const parent = canvas.parentElement;
      const W = parent ? parent.offsetWidth  : window.innerWidth;
      const H = parent ? parent.offsetHeight : window.innerHeight;
      if (W === 0 || H === 0) return false;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      return true;
    }

    function redraw() {
      if (destroyed) return;
      if (!setSize()) return;
      drawPattern(ctx, canvas.width, canvas.height, images, dpr);
    }

    // 加载图片
    let loadedCount = 0;
    RAW_NAMES.forEach((name, i) => {
      const img = new Image();
      img.onload = () => {
        images[i] = img;
        loadedCount++;
        redraw();
      };
      img.onerror = () => {
        // 降级：encode 文件名
        const img2 = new Image();
        img2.onload = () => { images[i] = img2; loadedCount++; redraw(); };
        img2.onerror = () => { loadedCount++; };
        img2.src = baseUrl + 'silhouettes/' + encodeURIComponent(name);
      };
      img.src = baseUrl + 'silhouettes/' + name;
    });

    // 首次 resize 后尝试绘制（图片可能已缓存）
    redraw();

    const onResize = () => { if (!destroyed) redraw(); };
    window.addEventListener('resize', onResize);

    return () => {
      destroyed = true;
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  );
}
