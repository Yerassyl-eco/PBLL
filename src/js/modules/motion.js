export const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Один rAF-цикл на кадр для всех обработчиков прокрутки
const subs = new Set();
let queued = false;
const run = () => { queued = false; subs.forEach(fn => fn()); };
const request = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
window.addEventListener('scroll', request, { passive: true });
window.addEventListener('resize', request);

export const onFrame = fn => { subs.add(fn); request(); return () => subs.delete(fn); };
