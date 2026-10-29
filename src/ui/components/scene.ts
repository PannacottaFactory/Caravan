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

/** Top edge of dune 3 (viewBox 1600×400). The caravan walks along it. */
const CREST = 'M0 150C110 96 200 74 330 70C620 62 920 78 1270 70C1420 72 1510 102 1600 128';
const DUNE3_HEIGHT = 0.31; // must match .dune--3 { height: 31vh }

/**
 * Converts the crest into screen pixels and exposes it as the CSS variable --crest,
 * used by `.caravan { offset-path: var(--crest) }`. Extended off-screen on both sides
 * so the caravan enters and leaves smoothly.
 */
function updateCrestPath(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const duneH = h * DUNE3_HEIGHT;
  const top = h - duneH;
  const X = (x: number) => ((x * w) / 1600).toFixed(1);
  const Y = (y: number) => (top + (y * duneH) / 400).toFixed(1);
  const tokens = CREST.match(/[MC]|-?\d+(?:\.\d+)?/g) ?? [];
  let out = '';
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    if (t === 'M' || t === 'C') {
      out += ` ${t === 'M' ? 'L' : 'C'}`;
      continue;
    }
    out += ` ${X(Number(t))} ${Y(Number(tokens[++i]))}`;
  }
  const path = `M${(-0.15 * w).toFixed(1)} ${Y(150)}${out} L${(1.15 * w).toFixed(1)} ${Y(128)}`;
  document.documentElement.style.setProperty('--crest', `path("${path}")`);
}

export function installScene(): void {
  updateCrestPath();
  let frame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateCrestPath);
  });
}

/** Floating dust motes, lit by the setting sun. Deterministic positions and timings. */
// 10 motes: more makes Firefox drop frames (measured: 22 motes -> 99 fps, 10 -> 143 fps).
const MOTES = Array.from({ length: 10 }, (_, i) => {
  const x = 4 + ((i * 37.7) % 92);
  const y = 30 + ((i * 53.3) % 65);
  const size = 3 + ((i * 7) % 4);
  const duration = 14 + ((i * 11) % 16);
  const delay = -((i * 3.7) % duration);
  const drift = ((i % 2 ? 1 : -1) * (20 + ((i * 13) % 60))).toFixed(0);
  return html`<i style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--s:${size}px;--d:${duration}s;--delay:${delay.toFixed(1)}s;--dx:${drift}px"></i>`;
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

export function scene(mode: 'hero' | 'game', danger = false): TemplateResult {
  return html`
    <div class="scene scene--${mode} ${danger ? 'scene--danger' : ''}" aria-hidden="true">
      <div class="scene__sky"></div>
      <svg class="scene__stars" viewBox="0 0 1600 340" preserveAspectRatio="xMidYMin slice" fill="#fff6e0">${STARS}</svg>
      <div class="scene__sun"></div>
      ${dune('dune--1', 'M0 170C180 110 330 120 520 150S860 70 1090 112 1440 150 1600 92V400H0Z', '#7d4660', '#5a3150', 'gd1')}
      ${dune('dune--2', 'M0 182C230 120 430 210 700 160S1110 96 1310 152 1520 176 1600 150V400H0Z', '#b45f55', '#7e3d48', 'gd2')}
      ${dune('dune--3', `${CREST}V400H0Z`, '#e08a58', '#9c4a3a', 'gd3')}
      ${caravanSilhouette()}
      ${dune('dune--4', 'M0 120C260 40 540 150 860 110S1340 30 1600 90V400H0Z', '#a7543a', '#47211c', 'gd4')}
      <div class="motes">${MOTES}</div>
      <div class="scene__shade"></div>
      <div class="scene__danger"></div>
    </div>
  `;
}
