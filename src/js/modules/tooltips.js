// Подсказка над столбцами графиков: мышь, касание и фокус клавиатуры
export function initTooltips() {
  const rows = [...document.querySelectorAll('[data-chart] [data-tip]')];
  if (!rows.length) return;
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'status');
  document.body.appendChild(tip);

  const place = (x, y) => {
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const left = Math.min(innerWidth - w - 12, Math.max(12, x + 14));
    const top = y - h - 14 < 8 ? y + 18 : y - h - 14;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };
  const show = (row, x, y) => { tip.textContent = row.dataset.tip; tip.classList.add('is-on'); place(x, y); };
  const hide = () => tip.classList.remove('is-on');

  rows.forEach(row => {
    row.tabIndex = 0;
    row.setAttribute('aria-label', row.dataset.tip);
    row.addEventListener('pointermove', e => show(row, e.clientX, e.clientY));
    row.addEventListener('pointerleave', hide);
    row.addEventListener('focus', () => {
      const r = row.getBoundingClientRect();
      show(row, r.left + r.width / 2, r.top);
    });
    row.addEventListener('blur', hide);
  });
  addEventListener('scroll', hide, { passive: true });
}
