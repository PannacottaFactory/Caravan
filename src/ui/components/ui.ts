import { html, svg, nothing, type TemplateResult } from 'lit-html';
import { FACTIONS } from '../../engine';
import { icon, type IconName } from '../icons';

/** Faction crest: a shield with the faction's own hue and initial. */
export function crest(factionId: string, cls = ''): TemplateResult {
  const index = Math.max(0, FACTIONS.findIndex((f) => f.id === factionId));
  const name = FACTIONS[index]?.name ?? '?';
  const hue = (index * 37 + 18) % 360;
  const pattern = index % 3;
  return html`<svg class="crest ${cls}" viewBox="0 0 64 72" aria-hidden="true">
    <defs>
      <linearGradient id="crest-${index}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${hue} 55% 52%)" /><stop offset="1" stop-color="hsl(${hue} 60% 28%)" />
      </linearGradient>
    </defs>
    <path d="M32 3l26 8v22c0 17-11 29-26 36C17 62 6 50 6 33V11z" fill="#1a1310" />
    <path d="M32 7l22 6.8v19.4c0 14.8-9.4 25.4-22 31.6-12.6-6.2-22-16.8-22-31.6V13.8z" fill="url(#crest-${index})" />
    ${pattern === 0
      ? svg`<path d="M10 30h44" stroke="#fff" stroke-opacity=".14" stroke-width="10"/>`
      : pattern === 1
        ? svg`<path d="M32 7v58" stroke="#fff" stroke-opacity=".12" stroke-width="12"/>`
        : svg`<path d="M10 14l44 40" stroke="#fff" stroke-opacity=".12" stroke-width="10"/>`}
    <path d="M32 7l22 6.8v19.4c0 14.8-9.4 25.4-22 31.6" fill="#000" opacity=".12" />
    <text x="32" y="44" text-anchor="middle" class="crest__letter">${name.charAt(0)}</text>
  </svg>`;
}

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: IconName;
  locked?: boolean;
  hint?: string;
}

/** Segmented control with a sliding highlight. */
export function segmented<T extends string>(
  options: SegmentOption<T>[],
  active: T,
  onSelect: (id: T) => void,
  cls = '',
): TemplateResult {
  const index = Math.max(0, options.findIndex((o) => o.id === active));
  return html`<div class="segmented ${cls}" role="tablist" style="--count:${options.length};--index:${index}">
    <span class="segmented__thumb" aria-hidden="true"></span>
    ${options.map(
      (o) => html`<button role="tab" class="segmented__btn ${o.id === active ? 'is-active' : ''}" aria-selected=${o.id === active}
        title=${o.hint ?? o.label} @click=${() => onSelect(o.id)}>
        ${o.icon ? icon(o.icon) : nothing}<span>${o.label}</span>${o.locked ? icon('lock', 'segmented__lock') : nothing}
      </button>`,
    )}
  </div>`;
}

export function iconButton(name: IconName, label: string, onClick: () => void, cls = ''): TemplateResult {
  return html`<button class="icon-btn ${cls}" @click=${onClick} aria-label=${label} title=${label}>${icon(name)}</button>`;
}

export const brandMark = (): TemplateResult => html`<span class="brand-mark">Caravan</span>`;
