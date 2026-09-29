import fs from 'node:fs';
import { feature, mesh } from 'topojson-client';
import * as d3 from 'd3-geo';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const countries = feature(topo, topo.objects.countries);
const kz = countries.features.find(f => f.id === '398');
const W = 1000, H = 560;
const proj = d3.geoConicConformal().parallels([43, 52]).rotate([-67, 0]).fitExtent([[70, 50], [W - 50, H - 60]], kz).clipExtent([[0, 0], [W, H]]);
const path = d3.geoPath(proj);
const r = n => Math.round(n);
const clean = d => d.replace(/-?\d+\.\d+/g, m => r(+m));
// neighbours: borders between countries within view
const borders = clean(path(mesh(topo, topo.objects.countries, (a, b) => a !== b && a.id !== '398' && b.id !== '398')) || '');
const land = clean(path(feature(topo, topo.objects.land)) || '');
const kzPath = clean(path(kz));
const grat = d3.geoGraticule().step([5, 5]).extent([[35, 36], [100, 60]]);
const gratPath = clean(path(grat()));
const labels = [];
for (const lat of [45, 50]) { const p = proj([45.2, lat]); labels.push({ t: `${lat}°N`, x: r(p[0]), y: r(p[1]) - 6, a: 'start' }); }
for (const lon of [50, 60, 70, 80]) { const p = proj([lon, 40.6]); labels.push({ t: `${lon}°E`, x: r(p[0]), y: r(p[1]), a: 'middle' }); }
const pt = ll => proj(ll).map(r);
const out = { W, H, kzPath, land, borders, gratPath, labels,
  urzhar: pt([81.63, 47.09]), astana: pt([71.43, 51.13]), almaty: pt([76.95, 43.24]) };
fs.writeFileSync(new URL('../src/data/map.json', import.meta.url), JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, typeof v === 'string' ? v.length : v])));
