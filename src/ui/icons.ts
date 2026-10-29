// Vector artwork: UI icons (stroke, currentColor) and illustrated game icons
// (resources, coin, crew). Gradients live once in <svg id="art-defs"> (see artDefs).

import { svg, html, type TemplateResult, type SVGTemplateResult } from 'lit-html';
import type { ResourceId } from '../engine';

// ------------------------------------------------------------------ shared gradients

export const artDefs = (): TemplateResult => html`<svg class="art-defs" aria-hidden="true" width="0" height="0">
  <defs>
    <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe08a" /><stop offset="0.55" stop-color="#f4b740" /><stop offset="1" stop-color="#c9801c" />
    </linearGradient>
    <linearGradient id="g-gold-in" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9a530" /><stop offset="1" stop-color="#ffd76e" />
    </linearGradient>
    <linearGradient id="g-meat" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f29b6b" /><stop offset="1" stop-color="#b44a2c" />
    </linearGradient>
    <linearGradient id="g-bone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fffaf0" /><stop offset="1" stop-color="#e2d3b8" />
    </linearGradient>
    <linearGradient id="g-burlap" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e6cf9f" /><stop offset="1" stop-color="#a8864f" />
    </linearGradient>
    <linearGradient id="g-spice" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8a3d" /><stop offset="1" stop-color="#c8321c" />
    </linearGradient>
    <linearGradient id="g-clay" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f0a06b" /><stop offset="1" stop-color="#a24a26" />
    </linearGradient>
    <linearGradient id="g-silk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f06a86" /><stop offset="1" stop-color="#8d1f45" />
    </linearGradient>
    <linearGradient id="g-silk-dark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#c13a5c" /><stop offset="1" stop-color="#6b1533" />
    </linearGradient>
    <linearGradient id="g-gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e9d6ff" /><stop offset="0.5" stop-color="#a77bff" /><stop offset="1" stop-color="#5b2fc9" />
    </linearGradient>
    <linearGradient id="g-marble-top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" /><stop offset="1" stop-color="#e7e1d8" />
    </linearGradient>
    <linearGradient id="g-sand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd27a" /><stop offset="1" stop-color="#e59a3c" />
    </linearGradient>
  </defs>
</svg>`;

// ------------------------------------------------------------------ illustrated icons (64×64)

const RESOURCE_ART: Record<ResourceId, SVGTemplateResult> = {
  food: svg`
    <ellipse cx="32" cy="57" rx="18" ry="3" fill="#000" opacity=".18"/>
    <g transform="rotate(8 32 32)">
      <rect x="37" y="35" width="17" height="7" rx="3.5" transform="rotate(40 45 38)" fill="url(#g-bone)"/>
      <circle cx="53.5" cy="44" r="4.6" fill="url(#g-bone)"/>
      <circle cx="49.5" cy="49.5" r="4.6" fill="url(#g-bone)"/>
      <path d="M10 31c-1.5-12 8-21.5 19.5-22 10.5-.5 18.5 7 18 16.5-.6 11-10.5 18.5-21 19.5C17.5 46 11 40 10 31z" fill="url(#g-meat)"/>
      <path d="M17 25c2.8-6.5 9-10 15.5-9.6" stroke="#ffc4a0" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".85"/>
      <path d="M15 38c4 3.5 10 4.5 16 3" stroke="#8e3219" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".45"/>
    </g>`,
  spices: svg`
    <ellipse cx="32" cy="58" rx="19" ry="3" fill="#000" opacity=".18"/>
    <path d="M17 27c-.4-3.6 2.4-6 5.8-6h18.4c3.4 0 6.2 2.4 5.8 6l2.6 21c.8 6.2-3.4 10-9.4 10H23.8c-6 0-10.2-3.8-9.4-10z" fill="url(#g-burlap)"/>
    <path d="M18.5 22.5c2.5-8 7.6-12.5 13.5-12.5s11 4.5 13.5 12.5z" fill="url(#g-spice)"/>
    <ellipse cx="32" cy="22.5" rx="14.5" ry="3.6" fill="#7d5a2e"/>
    <path d="M18.6 22.3c3 1.8 8 2.6 13.4 2.6s10.4-.8 13.4-2.6" stroke="#5e4220" stroke-width="2" fill="none"/>
    <path d="M17.6 29.5c4.5 1.6 9.2 2.2 14.4 2.2s9.9-.6 14.4-2.2" stroke="#8d6a3a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <circle cx="27" cy="16" r="1.2" fill="#ffd2a1"/><circle cx="35" cy="13.5" r="1.2" fill="#ffd2a1"/><circle cx="38" cy="18.5" r="1.1" fill="#ffd2a1"/>
    <rect x="36" y="38" width="8" height="8" rx="1.5" fill="#f1dfb6" stroke="#8d6a3a" stroke-width="1.6"/>
    <path d="M21 33c-.6 6 .2 12 2 17" stroke="#fff3d6" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".45"/>`,
  pottery: svg`
    <ellipse cx="32" cy="58" rx="15" ry="3" fill="#000" opacity=".18"/>
    <path d="M22 19c-6.5-.5-9 6.5-4.8 10.6M42 19c6.5-.5 9 6.5 4.8 10.6" stroke="#9b4523" stroke-width="3.4" stroke-linecap="round" fill="none"/>
    <path d="M25.5 11h13v5.5c0 2.3 1.8 3.5 4 5.4 5 4.2 8 10 8 16.8C50.5 49 42.3 57 32 57s-18.5-8-18.5-18.3c0-6.8 3-12.6 8-16.8 2.2-1.9 4-3.1 4-5.4z" fill="url(#g-clay)"/>
    <rect x="23.5" y="8" width="17" height="4.6" rx="2.3" fill="#b85a33"/>
    <path d="M15 35.5c5.4 2.6 11 3.6 17 3.6s11.6-1 17-3.6" stroke="#2f5d8f" stroke-width="4.2" fill="none"/>
    <path d="M14.6 43c5.5 2.4 11.2 3.4 17.4 3.4s11.9-1 17.4-3.4" stroke="#f3d39c" stroke-width="1.8" fill="none" opacity=".8"/>
    <path d="M21 29c-2.6 3.4-3.6 8-2.8 12.6" stroke="#ffd1ad" stroke-width="2.8" stroke-linecap="round" fill="none" opacity=".7"/>`,
  marble: svg`
    <ellipse cx="32" cy="57.5" rx="21" ry="3.2" fill="#000" opacity=".2"/>
    <path d="M32 9l22 10.5L32 30 10 19.5z" fill="url(#g-marble-top)"/>
    <path d="M10 19.5L32 30v25L10 44.5z" fill="#d8d1c6"/>
    <path d="M54 19.5L32 30v25l22-10.5z" fill="#b7aea1"/>
    <path d="M18 17c5 1.5 7 4.2 13 4.6M37 13.5c2 2.6 6 3 8.5 5.6" stroke="#a69d90" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M14 27c3 4 2.5 8 6.5 11.5M24 37c1.6 3 4 4 5 8" stroke="#a99f92" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M42 34c2.5 3.5 7 4 9 7.5" stroke="#958b7e" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M32 30v25" stroke="#fff" stroke-width="1" opacity=".5"/>`,
  silk: svg`
    <ellipse cx="32" cy="57" rx="22" ry="3.2" fill="#000" opacity=".18"/>
    <path d="M30 40.5c6.2 2.6 12.6 1 18.8-2.2l6.6 7.4c-7.2 5.4-15.6 7.6-24.2 5.6z" fill="url(#g-silk-dark)"/>
    <path d="M38.6 44.2c4.4.2 9-1.2 13.4-3.6" stroke="#f2c25a" stroke-width="1.6" fill="none"/>
    <rect x="7" y="22" width="44" height="18" rx="9" transform="rotate(-24 29 31)" fill="url(#g-silk)"/>
    <path d="M14 33.6l35.6-15.8M16 39.4l35.4-15.8" stroke="#f2c25a" stroke-width="1.6" opacity=".9"/>
    <ellipse cx="13.2" cy="40.6" rx="5.4" ry="9.2" transform="rotate(-24 13.2 40.6)" fill="#a62a50"/>
    <ellipse cx="13.2" cy="40.6" rx="2.2" ry="4" transform="rotate(-24 13.2 40.6)" fill="#5c1029"/>
    <path d="M19 26.5l26-11.6" stroke="#ffb3c4" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`,
  jewelry: svg`
    <ellipse cx="32" cy="58" rx="16" ry="3" fill="#000" opacity=".18"/>
    <path d="M12 23l9-11h22l9 11-20 31z" fill="url(#g-gem)"/>
    <path d="M12 23h40M21 12l5 11 6-11 6 11 5-11M26 23l6 31 6-31" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" fill="none" opacity=".55"/>
    <path d="M21 12l-9 11h14z" fill="#fff" opacity=".35"/>
    <path d="M32 12l6 11h-12z" fill="#fff" opacity=".22"/>
    <circle cx="47" cy="11" r="2.4" fill="#fff"/><path d="M47 5.5v11M41.5 11h11" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>`,
};

export const resourceArt = (id: ResourceId, cls = ''): TemplateResult =>
  html`<svg class="art ${cls}" viewBox="0 0 64 64" aria-hidden="true">${RESOURCE_ART[id]}</svg>`;

export const coinArt = (cls = ''): TemplateResult => html`<svg class="art coin ${cls}" viewBox="0 0 64 64" aria-hidden="true">
  <circle cx="32" cy="34" r="25" fill="#9a5e12" />
  <circle cx="32" cy="31" r="25" fill="url(#g-gold)" />
  <circle cx="32" cy="31" r="18.5" fill="url(#g-gold-in)" stroke="#b9761c" stroke-width="2" />
  <path d="M38.5 24.5a9.5 9.5 0 1 0 0 13" stroke="#a7661a" stroke-width="5" stroke-linecap="round" fill="none" />
  <path d="M38.5 23.5a9.5 9.5 0 1 0 0 13" stroke="#fff2c4" stroke-width="5" stroke-linecap="round" fill="none" />
  <path d="M15 22a19 19 0 0 1 12-9" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7" />
</svg>`;

// Crew silhouettes (filled, currentColor). Dromedary facing right.
export const camelShape = svg`
  <ellipse cx="27" cy="25" rx="15" ry="7.5"/>
  <path d="M15.5 23.5C17 12 23 8.5 27 8.5s9.5 3.5 11 15z"/>
  <path d="M38 26c4.5-1.6 6-6 7.5-11.5" stroke="currentColor" stroke-width="6.5" stroke-linecap="round" fill="none"/>
  <ellipse cx="49" cy="12.6" rx="6" ry="3.6" transform="rotate(-12 49 12.6)"/>
  <path d="M43.5 9.6l1-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M17 29l-1.6 15M21.5 30.5l.8 13.5M33 30.5l-.8 13.5M37.5 29l2.2 15" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M12.5 23c-2.4 1.6-3 5-2.2 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`;
export const camelArt = (cls = ''): TemplateResult =>
  html`<svg class="art ${cls}" viewBox="0 0 58 48" fill="currentColor" aria-hidden="true">${camelShape}</svg>`;

export const traderArt = (cls = ''): TemplateResult => html`<svg class="art ${cls}" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M15 14c0-5.5 4-9.5 9-9.5s9 4 9 9.5c0 1.3-.6 2-2 2H17c-1.4 0-2-.7-2-2z" fill="currentColor" />
  <circle cx="24" cy="19" r="6.2" fill="currentColor" opacity=".9" />
  <path d="M11 44l2.6-12.6C14.6 27 18.8 25 24 25s9.4 2 10.4 6.4L37 44z" fill="currentColor" />
  <path d="M24 26v10" stroke="#000" stroke-opacity=".22" stroke-width="2" />
</svg>`;

// ------------------------------------------------------------------ UI icons (24×24, stroke)

const ICONS = {
  menu: svg`<path d="M4 7h16M4 12h16M4 17h10"/>`,
  back: svg`<path d="M15 5l-7 7 7 7"/>`,
  close: svg`<path d="M6 6l12 12M18 6L6 18"/>`,
  chevronLeft: svg`<path d="M15 5l-7 7 7 7"/>`,
  chevronRight: svg`<path d="M9 5l7 7-7 7"/>`,
  plus: svg`<path d="M12 5v14M5 12h14"/>`,
  minus: svg`<path d="M5 12h14"/>`,
  lock: svg`<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>`,
  check: svg`<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
  soundOn: svg`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11"/>`,
  soundOff: svg`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>`,
  trophy: svg`<path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 14v3M8.5 20h7M10 17h4"/>`,
  podium: svg`<path d="M9 20V10h6v10M3 20v-6h6M15 20v-8h6v8M2 20h20"/><path d="M12 3.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" fill="currentColor" stroke-width="1"/>`,
  help: svg`<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8M12 17h.01"/>`,
  info: svg`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/>`,
  user: svg`<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>`,
  share: svg`<circle cx="6" cy="12" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="M8.3 10.8l7-3.6M8.3 13.2l7 3.6"/>`,
  play: svg`<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>`,
  refresh: svg`<path d="M19 7a8 8 0 1 0 1.5 6"/><path d="M19.5 3v4.5H15"/>`,
  sun: svg`<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>`,
  weight: svg`<path d="M6.5 9.5h11l2 10.5h-15z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 5 0"/>`,
  food: svg`<path d="M7 3v7a2.5 2.5 0 0 0 5 0V3M9.5 10.5V21M17 21V3c-2.5 1.5-3.5 4.5-3.5 8h3.5"/>`,
  piggy: svg`<path d="M4 12.5C4 9 7.6 6.5 12 6.5c1.6 0 3 .3 4.3.9L19 6v3.2c.8.8 1.4 1.8 1.6 2.8H22v3h-1.6c-.5 1.3-1.4 2.4-2.6 3.2V21h-3v-1.7a10 10 0 0 1-5.6 0V21h-3v-2.5C4.9 17 4 14.9 4 12.5z"/><path d="M10 6.7V5a2 2 0 0 1 4 0v1.6"/><circle cx="16" cy="11" r=".6" fill="currentColor"/>`,
  market: svg`<path d="M3.5 9.5L5 4.5h14l1.5 5"/><path d="M3.5 9.5a2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.4 0"/><path d="M5 12v8h14v-8M10 20v-5h4v5"/>`,
  cart: svg`<path d="M3 4h2.5l2.3 11h10.4l2-8H6.6"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>`,
  coins: svg`<ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7"/><path d="M10 14.5V17c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4c0-1.4-2.2-2.5-5-2.5-.7 0-1.4.1-2 .2"/>`,
  users: svg`<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M16 5.2a3.2 3.2 0 0 1 0 6.1M17.5 14.3c2 .7 3.2 2.5 3.5 5.2"/>`,
  sparkle: svg`<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>`,
  warning: svg`<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.4h.01"/>`,
  skull: svg`<path d="M12 3.5c-4.4 0-7.5 3-7.5 7 0 2.4 1.1 4.2 3 5.3V19h9v-3.2c1.9-1.1 3-2.9 3-5.3 0-4-3.1-7-7.5-7z"/><circle cx="9.3" cy="11" r="1.4" fill="currentColor"/><circle cx="14.7" cy="11" r="1.4" fill="currentColor"/><path d="M10.5 19v-2M13.5 19v-2"/>`,
  crown: svg`<path d="M4 8l4 4 4-6 4 6 4-4-1.5 10h-13z"/><path d="M5.5 21h13"/>`,
  arrowUp: svg`<path d="M12 19V5M6 11l6-6 6 6"/>`,
  arrowDown: svg`<path d="M12 5v14M6 13l6 6 6-6"/>`,
  max: svg`<path d="M7 17l5-5 5 5M7 11l5-5 5 5"/>`,
} as const;

export type IconName = keyof typeof ICONS;

export const icon = (name: IconName, cls = ''): TemplateResult =>
  html`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// Brand marks (simplified, filled)
const BRANDS = {
  instagram: svg`<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/>`,
  twitter: svg`<path d="M4 4h4.6l4 5.6L17.4 4H20l-6.2 7.2L20.5 20h-4.6l-4.3-6-5.2 6H3.8l6.6-7.6z" fill="currentColor"/>`,
  discord: svg`<path d="M18.6 6.4A16 16 0 0 0 14.8 5l-.5 1a14.6 14.6 0 0 0-4.6 0l-.5-1a16 16 0 0 0-3.8 1.4C3 10 2.4 13.6 2.7 17.1a16 16 0 0 0 4.7 2.4l1-1.6a10 10 0 0 1-1.6-.8l.4-.3a11.3 11.3 0 0 0 9.6 0l.4.3c-.5.3-1 .6-1.6.8l1 1.6a16 16 0 0 0 4.7-2.4c.4-4-.6-7.6-2.7-10.7zM9.2 14.8c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2zm5.6 0c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2z" fill="currentColor"/>`,
  reddit: svg`<circle cx="12" cy="13.5" r="7" fill="currentColor"/><circle cx="18.5" cy="5.5" r="1.6" fill="currentColor"/><path d="M12 6.5l1.2-3.5 5.3 2.5" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="9.3" cy="13" r="1.2" fill="#2a1f1a"/><circle cx="14.7" cy="13" r="1.2" fill="#2a1f1a"/><path d="M9.3 16.2c1.6 1 3.8 1 5.4 0" stroke="#2a1f1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
} as const;

export const brand = (name: keyof typeof BRANDS): TemplateResult =>
  html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${BRANDS[name]}</svg>`;
