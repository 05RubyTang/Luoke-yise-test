import { useEffect, useRef } from 'react';

/**
 * 监听 visualViewport 尺寸变化，将当前可视高度注入到指定 DOM 元素上的
 * CSS 自定义属性 `--modal-vh`（单位 px），供弹窗容器使用。
 *
 * 兜底：若浏览器不支持 visualViewport，则使用 window.innerHeight。
 */
export default function useVisualViewport(ref) {
  const rafRef = useRef(null);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const update = () => {
      const h = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      el.style.setProperty('--modal-vh', `${h}px`);
    };

    // 立即执行一次
    update();

    const vv = window.visualViewport;
    if (vv) {
      const onResize = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(update);
      };
      vv.addEventListener('resize', onResize);
      vv.addEventListener('scroll', onResize);
      return () => {
        vv.removeEventListener('resize', onResize);
        vv.removeEventListener('scroll', onResize);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      const onResize = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(update);
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [ref]);
}
