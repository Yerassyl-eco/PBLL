// Архив источников: фильтр по разделам (кнопки-переключатели с aria-pressed)
export function initArchive() {
  const root = document.querySelector('[data-archive]');
  if (!root) return;
  const chips = [...root.querySelectorAll('[data-filter]')];
  const groups = [...root.querySelectorAll('[data-group]')];
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => c.setAttribute('aria-pressed', c === chip));
    groups.forEach(g => { g.hidden = f !== 'all' && g.dataset.group !== f; });
  }));
}
