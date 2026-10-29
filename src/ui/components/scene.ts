import { html, svg, type TemplateResult } from 'lit-html';
import { camelShape, traderArt } from '../icons';

// Desert at dusk, drawn in SVG. Every animated part is its own element animated with
// CSS transform/opacity only (composited by the GPU) — no filters, no backdrop blur,
// so it stays smooth in Firefox too.

const STARS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 197.3) % 1600;
  const y = (i * 71.7) % 330;
  const r = 0.6 + ((i * 13) % 10) / 10;
  return svg`<circle cx=${x.toFixed(1)} cy=${y.toFixed(1)} r=${r.toFixed(2)} />`;
});

const dune = (cls: string, d: string, top: string, bottom: string, id: string): TemplateResult => html`
  <svg class="dune ${cls}" viewBox="0 0 1600 400" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id=${id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${top} /><stop offset="1" stop-color=${bottom} /></linearGradient>
    </defs>
    <path d=${d} fill="url(#${id})" />
  </svg>`;

/** A small caravan: three camels and a walking trader, as a silhouette. */
const caravanSilhouette = (): TemplateResult => html`
  <div class="caravan" aria-hidden="true">
    <svg viewBox="0 0 240 48" fill="currentColor">
      <g transform="translate(0 0)">${camelShape}</g>
      <g transform="translate(62 1) scale(.96)">${camelShape}</g>
      <g transform="translate(124 0)">${camelShape}</g>
      <path d="M44 14l18 2M106 15l18 0" stroke="currentColor" stroke-width="1.2" fill="none" />
    </svg>
    <span class="caravan__walker">${traderArt()}</span>
  </div>`;

export function scene(mode: 'hero' | 'game'): TemplateResult {
  return html`
    <div class="scene scene--${mode}" aria-hidden="true">
      <div class="scene__sky"></div>
      <svg class="scene__stars" viewBox="0 0 1600 340" preserveAspectRatio="xMidYMin slice" fill="#fff6e0">${STARS}</svg>
      <div class="scene__sun"></div>
      ${dune('dune--1', 'M0 170C180 110 330 120 520 150S860 70 1090 112 1440 150 1600 92V400H0Z', '#7d4660', '#5a3150', 'gd1')}
      ${dune('dune--2', 'M0 182C230 120 430 210 700 160S1110 96 1310 152 1520 176 1600 150V400H0Z', '#b45f55', '#7e3d48', 'gd2')}
      ${dune('dune--3', 'M0 150C110 96 200 74 330 70C620 62 920 78 1270 70C1420 72 1510 102 1600 128V400H0Z', '#e08a58', '#9c4a3a', 'gd3')}
      ${caravanSilhouette()}
      ${dune('dune--4', 'M0 120C260 40 540 150 860 110S1340 30 1600 90V400H0Z', '#a7543a', '#47211c', 'gd4')}
      <div class="scene__shade"></div>
    </div>
  `;
}
