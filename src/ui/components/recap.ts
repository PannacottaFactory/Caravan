// End-of-journey recap: fortune day by day (single-series line chart) + highlights.

import { html, nothing, svg, type TemplateResult } from 'lit-html';
import type { DayAction, DayRecord, GameState } from '../../engine';
import { icon, type IconName } from '../icons';
import { fmt } from './common';
import { update } from '../store';

const ACTION_LABEL: Record<DayAction, string> = {
  buy: 'Bought goods',
  sell: 'Sold goods',
  recruit: 'Hired a trader',
  addCamel: 'Bought a camel',
  save: 'Saved gold',
};
const ACTION_ICON: Record<DayAction, IconName> = {
  buy: 'cart',
  sell: 'coins',
  recruit: 'users',
  addCamel: 'weight',
  save: 'piggy',
};

let hovered: number | null = null;

const W = 640;
const H = 230;
const PAD = { top: 26, right: 18, bottom: 28, left: 52 };

function niceMax(v: number): number {
  if (v <= 0) return 10;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

const short = (n: number): string => (n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));

export function recap(g: GameState): TemplateResult {
  const h: DayRecord[] = g.history ?? [];
  if (h.length < 2) return html`<p class="muted">No journey data for this game.</p>`;

  const max = niceMax(Math.max(...h.map((r) => r.worth)));
  const x = (i: number) => PAD.left + (i / (h.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
  const line = h.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(r.worth).toFixed(1)}`).join('');
  const area = `${line}L${x(h.length - 1).toFixed(1)} ${y(0)}L${x(0).toFixed(1)} ${y(0)}Z`;

  // Day-to-day gains, credited to the action of the earlier day.
  const gains = h.slice(0, -1).map((r, i) => ({ i, day: r.day, action: r.action, gain: h[i + 1]!.worth - r.worth }));
  const best = gains.reduce((a, b) => (b.gain > a.gain ? b : a), gains[0]!);
  const counts = new Map<DayAction, number>();
  for (const r of h) if (r.action) counts.set(r.action, (counts.get(r.action) ?? 0) + 1);

  const ticks = [0, max / 2, max];
  const labelEvery = h.length > 16 ? 5 : h.length > 8 ? 3 : 1;
  const hv = hovered !== null && hovered < h.length ? hovered : null;
  const setHover = (i: number | null) => {
    hovered = i;
    update({});
  };

  return html`<div class="recap">
    <div class="recap__tiles">
      <div class="recap__tile">
        <span>Fortune</span>
        <strong>${fmt(h[0]!.worth)} → ${fmt(h.at(-1)!.worth)}</strong>
      </div>
      <div class="recap__tile">
        <span>Best day</span>
        <strong>Day ${best.day} · +${fmt(best.gain)}</strong>
        ${best.action ? html`<small>${ACTION_LABEL[best.action]}</small>` : nothing}
      </div>
    </div>

    <figure class="recap__chart">
      <figcaption>Fortune day by day</figcaption>
      <div class="recap__plot" @pointerleave=${() => setHover(null)}>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Fortune from ${fmt(h[0]!.worth)} to ${fmt(h.at(-1)!.worth)}">
          <defs>
            <linearGradient id="recap-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#f4b74a" stop-opacity=".28" /><stop offset="1" stop-color="#f4b74a" stop-opacity="0" />
            </linearGradient>
          </defs>
          ${ticks.map(
            (t) => svg`<line x1=${PAD.left} x2=${W - PAD.right} y1=${y(t)} y2=${y(t)} class="recap__grid" />
              <text x=${PAD.left - 10} y=${y(t) + 4} text-anchor="end" class="recap__axis">${short(t)}</text>`,
          )}
          ${h.map((r, i) =>
            i % labelEvery === 0 || r.final
              ? svg`<text x=${x(i)} y=${H - 8} text-anchor="middle" class="recap__axis">${r.final ? 'End' : r.day}</text>`
              : nothing,
          )}
          <path d=${area} fill="url(#recap-area)" class="recap__area" />
          <path d=${line} class="recap__line" pathLength="1" />
          ${hv !== null ? svg`<line x1=${x(hv)} x2=${x(hv)} y1=${PAD.top} y2=${y(0)} class="recap__cross" />` : nothing}
          <circle cx=${x(best.i + 1)} cy=${y(h[best.i + 1]!.worth)} r="5.5" class="recap__best" />
          ${hv !== null ? svg`<circle cx=${x(hv)} cy=${y(h[hv]!.worth)} r="5" class="recap__dot" />` : nothing}
          ${h.map(
            (_, i) => svg`<rect x=${x(i) - (W - PAD.left - PAD.right) / (h.length - 1) / 2} y=${PAD.top} width=${(W - PAD.left - PAD.right) / (h.length - 1)}
              height=${H - PAD.top - PAD.bottom} fill="transparent" @pointerenter=${() => setHover(i)} />`,
          )}
        </svg>
        ${hv !== null
          ? html`<div class="recap__tip" style="left:${(x(hv) / W) * 100}%;top:${(y(h[hv]!.worth) / H) * 100}%">
              <strong>${h[hv]!.final ? 'End of journey' : `Day ${h[hv]!.day}`}</strong>
              <span>Fortune ${fmt(h[hv]!.worth)}</span>
              <span class="muted">Gold ${fmt(h[hv]!.gold)}</span>
              ${h[hv]!.action ? html`<span class="recap__tip-action">${icon(ACTION_ICON[h[hv]!.action!])} ${ACTION_LABEL[h[hv]!.action!]}</span>` : nothing}
            </div>`
          : nothing}
      </div>
      <table class="sr-only">
        <caption>Fortune day by day</caption>
        <thead><tr><th>Day</th><th>Fortune</th><th>Gold</th><th>Action</th></tr></thead>
        <tbody>${h.map((r) => html`<tr><td>${r.final ? 'End' : r.day}</td><td>${r.worth}</td><td>${r.gold}</td><td>${r.action ? ACTION_LABEL[r.action] : ''}</td></tr>`)}</tbody>
      </table>
    </figure>

    <ul class="recap__actions" aria-label="Actions played">
      ${(Object.keys(ACTION_LABEL) as DayAction[])
        .filter((a) => counts.get(a))
        .map((a) => html`<li>${icon(ACTION_ICON[a])}<span>${ACTION_LABEL[a]}</span><strong>×${counts.get(a)}</strong></li>`)}
    </ul>
  </div>`;
}

/** Resets the hover state when a new victory screen opens. */
export function resetRecap(): void {
  hovered = null;
}
