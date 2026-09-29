import { onFrame } from './motion.js';

// Прогресс чтения, плотный фон после первого экрана, название текущего зала, активная эпоха в меню
export function initHeader() {
  const bar = document.querySelector('[data-bar]');
  if (!bar) return;
  const progress = bar.querySelector('[data-progress]');
  const roomN = bar.querySelector('[data-room-n]');
  const roomT = bar.querySelector('[data-room-t]');
  const hero = document.querySelector('.hero');
  const links = [...bar.querySelectorAll('.bar__nav a')];
  const navFor = { steppe: 'steppe', evidence: 'steppe', tradition: 'tradition', myths: 'tradition', century: 'century',
    independence: 'today', today: 'today', wages: 'today', politics: 'today', coda: 'today', archive: 'archive' };

  onFrame(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    const heroEnd = hero ? hero.offsetHeight - 80 : 200;
    bar.classList.toggle('is-solid', scrollY > heroEnd);
  });

  const rooms = [...document.querySelectorAll('[data-room]')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      roomN.textContent = el.dataset.room;
      roomT.textContent = el.dataset.roomTitle;
      const target = navFor[el.id];
      links.forEach(a => {
        if (a.getAttribute('href') === `#${target}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -54% 0px' });
  rooms.forEach(r => io.observe(r));
}
