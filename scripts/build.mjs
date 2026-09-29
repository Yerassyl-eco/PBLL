// Собирает страницу из src/ в два вида:
//   docs/index.html + docs/assets/*  — статический сайт (GitHub Pages, любой хостинг)
//   dist/artifact.html               — однофайловая версия без <html>/<head> (для публикации как Artifact)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => path.join(root, 'src', ...p);
const read = p => fs.readFileSync(p, 'utf8');

const { sources, categories, checked } = JSON.parse(read(src('data', 'sources.json')));
const byId = Object.fromEntries(sources.map(s => [s.id, s]));
const map = JSON.parse(read(src('data', 'map.json')));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const need = id => {
  if (!byId[id]) throw new Error(`Неизвестный источник: ${id}`);
  return byId[id];
};

// Ссылка на источник прямо под утверждением
const srcLink = s =>
  `<a class="src__link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.short)} — «${esc(s.title)}»<span class="src__arrow" aria-hidden="true">↗</span><span class="sr-only"> (откроется в новой вкладке)</span></a>`;

const srcLine = ids => {
  const list = ids.split(',').map(x => need(x.trim()));
  const label = list.length > 1 ? 'Источники' : 'Источник';
  return `<p class="src"><span class="src__label">${label}</span> ${list.map(srcLink).join('<span class="src__sep">;</span> ')}</p>`;
};

// Карта: реальные границы (Natural Earth через world-atlas), проекция Ламберта
const mapSvg = variant => {
  const { W, H } = map;
  const pin = (p, label, cls = '') =>
    `<g class="map__pin ${cls}" transform="translate(${p[0]} ${p[1]})"><circle r="3.5"/><text x="9" y="4">${label}</text></g>`;
  if (variant === 'inset') {
    return `<svg class="map map--inset" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="inset-t">
<title id="inset-t">Карта Казахстана с отметкой Урджарского района на востоке страны</title>
<path class="map__kz" d="${map.kzPath}"/>
<g class="map__pin map__pin--find" transform="translate(${map.urzhar[0]} ${map.urzhar[1]})"><circle r="16" class="map__halo"/><circle r="7"/></g>
</svg>`;
  }
  return `<svg class="map map--hero" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="hero-map-t" preserveAspectRatio="xMidYMid meet">
<title id="hero-map-t">Контурная карта Республики Казахстан с координатной сеткой; отмечены Астана, Алматы и Урджарский район</title>
<path class="map__grat" d="${map.gratPath}"/>
<path class="map__land" d="${map.land}"/>
<path class="map__borders" d="${map.borders}"/>
<path class="map__kz" pathLength="1" d="${map.kzPath}"/>
${map.labels.map(l => `<text class="map__deg" x="${l.x}" y="${l.y}" text-anchor="${l.a}">${l.t}</text>`).join('')}
${pin(map.astana, 'Астана')}
${pin(map.almaty, 'Алматы')}
<g class="map__pin map__pin--find" transform="translate(${map.urzhar[0]} ${map.urzhar[1]})"><circle r="12" class="map__halo"/><circle r="4.5"/><text x="-14" y="-18" text-anchor="end">Урджарский район · находка 2013 г.</text></g>
</svg>`;
};

// Архив источников: сгруппирован по разделам, у каждого — организация, год, тип, ссылка
const archive = () => {
  const groups = categories
    .map(c => ({ ...c, items: sources.filter(s => s.cat === c.id) }))
    .filter(g => g.items.length);
  const filters = `<div class="archive__filters" role="group" aria-label="Фильтр по разделам">
<button type="button" class="chip" aria-pressed="true" data-filter="all">Все <span class="chip__n">${sources.length}</span></button>
${groups.map(g => `<button type="button" class="chip" aria-pressed="false" data-filter="${g.id}">${esc(g.label)} <span class="chip__n">${g.items.length}</span></button>`).join('\n')}
</div>`;
  const body = groups.map(g => `<section class="archive__group" data-group="${g.id}" aria-labelledby="ag-${g.id}">
<h3 class="archive__h" id="ag-${g.id}">${esc(g.label)}</h3>
<ol class="archive__list">
${g.items.map(s => `<li class="entry" id="src-${s.id}">
<p class="entry__title">${esc(s.title)}</p>
<dl class="entry__meta">
<div><dt>Автор / организация</dt><dd>${esc(s.org)}</dd></div>
<div><dt>Год</dt><dd>${s.year ? esc(s.year) : '<abbr title="без года: дата публикации на странице не указана или не установлена">б. г.</abbr>'}</dd></div>
<div><dt>Тип</dt><dd>${esc(s.type)}</dd></div>
</dl>
<a class="entry__open" href="${esc(s.url)}" target="_blank" rel="noopener">Открыть источник <span aria-hidden="true">↗</span><span class="sr-only"> (откроется в новой вкладке)</span></a>
</li>`).join('\n')}
</ol>
</section>`).join('\n');
  return filters + '\n' + body;
};

// Сборка разметки
const include = html => html.replace(/<!--\s*@include\s+([\w./-]+)\s*-->/g, (_, f) => include(read(src(f))));
let body = include(read(src('page.html')));
body = body
  .replace(/\{\{srcs?:([\w,\s-]+)\}\}/g, (_, ids) => srcLine(ids))
  .replace(/\{\{map:(\w+)\}\}/g, (_, v) => mapSvg(v))
  .replace(/\{\{archive\}\}/g, archive)
  .replace(/\{\{checked\}\}/g, checked)
  .replace(/\{\{sources-count\}\}/g, String(sources.length));
const leftover = body.match(/\{\{[^}]+\}\}/);
if (leftover) throw new Error(`Не обработан шаблон: ${leftover[0]}`);

const head = read(src('head.html'));
const cssFiles = ['tokens.css', 'base.css', 'components.css', 'sections.css', 'motion.css'];
const css = cssFiles.map(f => `/* ${f} */\n` + read(src('css', f))).join('\n');

const js = (await esbuild.build({
  entryPoints: [src('js', 'main.js')],
  bundle: true, minify: true, format: 'iife', target: 'es2019', write: false,
})).outputFiles[0].text;
const cssMin = (await esbuild.transform(css, { loader: 'css', minify: true })).code;

// docs/
const docs = path.join(root, 'docs');
fs.rmSync(docs, { recursive: true, force: true });
fs.mkdirSync(path.join(docs, 'assets'), { recursive: true });
fs.writeFileSync(path.join(docs, 'assets', 'app.css'), cssMin);
fs.writeFileSync(path.join(docs, 'assets', 'app.js'), js);
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
fs.writeFileSync(path.join(docs, 'index.html'), `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
<link rel="stylesheet" href="assets/app.css">
<script defer src="assets/app.js"></script>
</head>
<body>
${body}
</body>
</html>
`);

// dist/artifact.html — всё встроено, без обёртки документа
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'),
  `${head}\n<style>${cssMin}</style>\n${body}\n<script>document.documentElement.lang='ru';${js}</script>\n`);

console.log(`Собрано: docs/index.html, dist/artifact.html · источников: ${sources.length} · css ${(cssMin.length / 1024).toFixed(1)} КБ · js ${(js.length / 1024).toFixed(1)} КБ`);
