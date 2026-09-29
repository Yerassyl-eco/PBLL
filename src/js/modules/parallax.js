import { onFrame, reducedMotion } from './motion.js';

// Очень слабый параллакс карты на первом экране
export function initParallax() {
  const el = document.querySelector('[data-parallax]');
  if (!el || reducedMotion()) return;
  onFrame(() => {
    const y = Math.min(scrollY, innerHeight);
    el.style.transform = `translate3d(0, ${(y * 0.18).toFixed(1)}px, 0)`;
  });
}
