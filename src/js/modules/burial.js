// Связка схемы погребения и описи: наведение или фокус на номер подсвечивает пару
export function initBurial() {
  const marks = [...document.querySelectorAll('.burial__marks [data-find]')];
  const items = [...document.querySelectorAll('.inv [data-find]')];
  if (!marks.length) return;
  const set = id => {
    marks.forEach(m => m.classList.toggle('is-on', m.dataset.find === id));
    items.forEach(i => i.classList.toggle('is-on', i.dataset.find === id));
  };
  [...marks, ...items].forEach(el => {
    el.addEventListener('mouseenter', () => set(el.dataset.find));
    el.addEventListener('mouseleave', () => set(null));
  });
  items.forEach(i => {
    i.tabIndex = 0;
    i.addEventListener('focus', () => set(i.dataset.find));
    i.addEventListener('blur', () => set(null));
  });
}
