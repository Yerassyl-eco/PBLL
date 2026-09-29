// Точка входа: каждый модуль отвечает за одно поведение и сам проверяет, есть ли его разметка.
import { initHeader } from './modules/header.js';
import { initReveal } from './modules/reveal.js';
import { initCounters } from './modules/counters.js';
import { initBurial } from './modules/burial.js';
import { initMyths } from './modules/myths.js';
import { initCentury } from './modules/century.js';
import { initTooltips } from './modules/tooltips.js';
import { initArchive } from './modules/archive.js';
import { initParallax } from './modules/parallax.js';

const start = () => {
  document.documentElement.classList.add('js');
  initHeader();
  initReveal();
  initCounters();
  initBurial();
  initMyths();
  initCentury();
  initTooltips();
  initArchive();
  initParallax();
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
