import { reducedMotion } from './motion.js';

// Появление блоков при прокрутке. Всё, что видно при загрузке, остаётся видимым сразу.
export function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!items.length || reducedMotion() || !('IntersectionObserver' in window)) return;
  const fold = innerHeight * 0.92;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      e.target.classList.remove('is-pending');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  items.forEach(el => {
    if (el.getBoundingClientRect().top < fold) return;
    el.classList.add('is-pending');
    io.observe(el);
  });
}
