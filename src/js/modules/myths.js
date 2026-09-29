// Стереотипы: вкладки (стрелки ←/→, Home/End) и пошаговый «разбор» фразы при прокрутке
export function initMyths() {
  const root = document.querySelector('.myths');
  if (!root) return;
  const tablist = root.querySelector('[data-tabs]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[data-myth]')];

  // Без JS все три разбора идут подряд; с JS — вкладки
  tablist.hidden = false;
  root.classList.add('js-tabs');
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    update(panel);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = e.key;
      let j = null;
      if (k === 'ArrowRight') j = (i + 1) % tabs.length;
      if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') j = 0;
      if (k === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });

  // Активный шаг — тот, что пересекает линию на 55% высоты окна
  root.classList.add('js-steps');
  const update = panel => {
    if (!panel || panel.hidden) return;
    const steps = [...panel.querySelectorAll('.step')];
    const line = innerHeight * 0.55;
    let stage = 1;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < line) stage = i + 1; });
    panel.dataset.stage = stage;
    steps.forEach((s, i) => s.classList.toggle('is-active', i + 1 === stage));
  };
  const onScroll = () => panels.forEach(update);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  select(tabs[0]);
}
