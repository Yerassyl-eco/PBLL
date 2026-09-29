import { reducedMotion } from './motion.js';

// Цифры набегают до значения, уже записанного в разметке. Без JS видно итоговое число.
const fmt = {
  int: n => Math.round(n).toLocaleString('ru-RU').replace(/ |\s/g, ' '),
  dec1: n => n.toFixed(1).replace('.', ','),
};

export function initCounters() {
  const nums = [...document.querySelectorAll('[data-count]')];
  if (!nums.length || reducedMotion() || !('IntersectionObserver' in window)) return;
  const run = el => {
    const end = parseFloat(el.dataset.count);
    const f = fmt[el.dataset.format] || fmt.int;
    const final = el.textContent;
    const t0 = performance.now();
    const dur = 1400;
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = k < 1 ? f(end * eased) : final;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach(n => {
    if (n.getBoundingClientRect().top < innerHeight) return; // уже на экране — не трогаем
    io.observe(n);
  });
}
