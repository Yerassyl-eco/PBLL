import { onFrame, reducedMotion } from './motion.js';

// XX век: на широком экране лента «приклеивается», и вертикальная прокрутка двигает её вбок.
// На телефоне, при уменьшенном движении или низком окне — обычная горизонтальная лента со snap.
export function initCentury() {
  const sec = document.querySelector('[data-hscroll]');
  if (!sec) return;
  const pin = sec.querySelector('[data-hscroll-pin]');
  const vp = sec.querySelector('[data-hscroll-viewport]');
  const track = sec.querySelector('[data-hscroll-track]');
  const ruler = sec.querySelector('[data-ruler]');
  const stops = [...sec.querySelectorAll('.ruler__stop')].map(s => parseFloat(s.style.getPropertyValue('--x')));
  const first = stops[0] ?? 0, last = stops[stops.length - 1] ?? 1;
  const mq = window.matchMedia('(min-width: 900px) and (min-height: 680px)');
  let distance = 0;

  const layout = () => {
    const pinned = mq.matches && !reducedMotion();
    sec.classList.toggle('is-pinned', pinned);
    if (!pinned) {
      sec.style.height = '';
      track.style.setProperty('--tx', '0px');
      return;
    }
    distance = Math.max(0, track.scrollWidth - vp.clientWidth);
    sec.style.height = `${pin.offsetHeight + distance}px`;
  };

  const setNow = k => ruler && ruler.style.setProperty('--now', (first + (last - first) * k).toFixed(4));

  onFrame(() => {
    if (!sec.classList.contains('is-pinned')) {
      const max = vp.scrollWidth - vp.clientWidth;
      setNow(max > 0 ? vp.scrollLeft / max : 0);
      return;
    }
    const stickTop = parseFloat(getComputedStyle(pin).top) || 0;
    const k = distance ? Math.min(1, Math.max(0, (stickTop - sec.getBoundingClientRect().top) / distance)) : 0;
    track.style.setProperty('--tx', `${(-k * distance).toFixed(1)}px`);
    setNow(k);
  });

  vp.addEventListener('scroll', () => {
    const max = vp.scrollWidth - vp.clientWidth;
    if (!sec.classList.contains('is-pinned')) setNow(max > 0 ? vp.scrollLeft / max : 0);
  }, { passive: true });

  // Клавиатура: фокус на ленте + стрелки прокручивают страницу к следующей остановке
  vp.addEventListener('keydown', e => {
    if (!sec.classList.contains('is-pinned')) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const step = track.firstElementChild ? track.firstElementChild.offsetWidth : 300;
    scrollBy({ top: e.key === 'ArrowRight' ? step : -step, behavior: reducedMotion() ? 'auto' : 'smooth' });
  });

  // Ссылки и фокус внутри ленты: приводим нужную остановку в кадр
  track.addEventListener('focusin', e => {
    if (!sec.classList.contains('is-pinned')) return;
    const stop = e.target.closest('.stop');
    if (!stop) return;
    const k = Math.min(1, stop.offsetLeft / (track.scrollWidth || 1));
    const stickTop = parseFloat(getComputedStyle(pin).top) || 0;
    const y = sec.getBoundingClientRect().top + scrollY - stickTop + k * distance;
    if (Math.abs(scrollY - y) > 40) scrollTo({ top: y, behavior: 'auto' });
  });

  layout();
  addEventListener('resize', layout);
  mq.addEventListener ? mq.addEventListener('change', layout) : mq.addListener(layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
}
