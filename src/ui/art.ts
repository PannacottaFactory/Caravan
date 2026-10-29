// Illustrations of the merchant's artifacts, the witch's powers and the disasters.
// Same style as the resources (64×64, gradients from artDefs in icons.ts).

import { html, svg, type SVGTemplateResult, type TemplateResult } from 'lit-html';
import { camelShape, RESOURCE_ART } from './icons';

const shadow = (rx = 18): SVGTemplateResult => svg`<ellipse cx="32" cy="58.5" rx=${rx} ry="3" fill="#000" opacity=".2"/>`;

/** Small red badge with an arrow (price or value going up/down). */
const badge = (dir: 'up' | 'down', x = 50, y = 48): SVGTemplateResult => svg`
  <circle cx=${x} cy=${y} r="9" fill="#e5583f" stroke="#1e1714" stroke-width="2"/>
  <path d=${dir === 'up' ? `M${x} ${y + 4.5}V${y - 4.5}M${x - 4} ${y - 0.5}l4-4 4 4` : `M${x} ${y - 4.5}V${y + 4.5}M${x - 4} ${y + 0.5}l4 4 4-4`}
    stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

const sparkle = (x: number, y: number, s = 1, color = '#fff'): SVGTemplateResult =>
  svg`<path d="M${x} ${y - 4 * s}L${x + s} ${y - s}L${x + 4 * s} ${y}L${x + s} ${y + s}L${x} ${y + 4 * s}L${x - s} ${y + s}L${x - 4 * s} ${y}L${x - s} ${y - s}Z" fill=${color}/>`;

/** Resource art scaled down, to compose with badges. */
const small = (id: keyof typeof RESOURCE_ART, x = 2, y = 4, k = 0.85): SVGTemplateResult =>
  svg`<g transform="translate(${x} ${y}) scale(${k})">${RESOURCE_ART[id]}</g>`;

const camel = (color: string, x = 3, y = 10, k = 0.95): SVGTemplateResult =>
  svg`<g transform="translate(${x} ${y}) scale(${k})" style="color:${color}" fill="currentColor">${camelShape}</g>`;

// ------------------------------------------------------------------ merchant artifacts

const ITEMS: Record<string, SVGTemplateResult> = {
  cornucopia: svg`${shadow(20)}
    <path d="M9 21c-3-2-4-6-1-8" stroke="#e5a52f" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M9 21c6 18 21 30 38 29l5-2c-1-9-8-16-16-20C25 23 15 19 9 21z" fill="url(#g-gold)"/>
    <path d="M16 27c2 6 4 10 4 15M24 30c1 5 2 10 1 14M32 33c0 5-.5 9-2 12" stroke="#b9761c" stroke-width="1.8" fill="none" opacity=".75"/>
    <ellipse cx="48" cy="38" rx="7" ry="11.5" transform="rotate(22 48 38)" fill="#7a4610"/>
    <path d="M47 21c2-4 6-5 8-3-2 1-5 3-8 3z" fill="url(#g-leaf)"/>
    <circle cx="50" cy="31" r="6.5" fill="#e0483a"/><path d="M47 28.5a3 3 0 0 1 3-1.8" stroke="#ffb0a4" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <circle cx="55" cy="41" r="3.2" fill="#8a46c9"/><circle cx="58" cy="45.5" r="3.2" fill="#7a38b8"/><circle cx="52.5" cy="45.5" r="3.2" fill="#9b5ad8"/><circle cx="55.5" cy="49.8" r="3.2" fill="#7a38b8"/>
    <circle cx="44" cy="45" r="4.5" fill="#f2b23a"/>`,
  'route-to-mahaji': svg`${shadow(22)}
    <path d="M10 14l14-4 16 4 14-4v40l-14 4-16-4-14 4z" fill="#f3e2b8"/>
    <path d="M24 10l16 4v40l-16-4z" fill="#e2cb98"/>
    <path d="M24 10v40M40 14v40" stroke="#c4a873" stroke-width="1.2"/>
    <path d="M15 43c6-2 6-11 12-12s8 6 14 2 6-11 10-13" stroke="#c8321c" stroke-width="2.4" stroke-dasharray=".5 4.5" stroke-linecap="round" fill="none"/>
    <circle cx="15" cy="43" r="2.6" fill="#c8321c"/>
    <path d="M48.5 16.5l5 5M53.5 16.5l-5 5" stroke="#c8321c" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M14 22c3-2 6-2 8 0M30 46c2-1 5-1 7 0" stroke="#b49460" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
  'wooden-statuette': svg`${shadow(15)}
    <path d="M22 32l-6 6v7M42 32l6 6v7" stroke="#8a5530" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M22 54V31c0-3 2-5 5-5h10c3 0 5 2 5 5v23z" fill="url(#g-wood)"/>
    <rect x="20" y="7" width="24" height="20" rx="7" fill="url(#g-wood)"/>
    <rect x="25.5" y="14" width="4.5" height="3.5" rx="1" fill="#4a2a14"/><rect x="34" y="14" width="4.5" height="3.5" rx="1" fill="#4a2a14"/>
    <rect x="28" y="21" width="8" height="2.2" rx="1" fill="#4a2a14"/>
    <path d="M28 30v22M36 30v22M24 11c2-2 4-2 6-2" stroke="#6b3d1e" stroke-width="1.2" opacity=".45" fill="none"/>
    <rect x="17" y="52" width="30" height="6" rx="2" fill="#6b3d22"/>`,
  'canvas-bag': svg`${shadow(20)}
    <path d="M19 28c-7 6-9 14-7 20 2 7 9 10 20 10s18-3 20-10c2-6 0-14-7-20z" fill="url(#g-canvas)"/>
    <path d="M24 29c-1-6 2-13 8-13s9 7 8 13z" fill="url(#g-canvas)"/>
    <path d="M24.5 16.5c2-4 4.5-6.5 7.5-6.5s5.5 2.5 7.5 6.5c-2.5-1-5-1.4-7.5-1.4s-5 .4-7.5 1.4z" fill="#e6d4ab"/>
    <path d="M21 28.5h22" stroke="#8a6a3a" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 28.5c-4 3-8 4-9 8M32 28.5c4 3 8 4 9 8" stroke="#8a6a3a" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M17 40c0 6 3 11 8 13" stroke="#fffaf0" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".6"/>
    <rect x="35" y="40" width="10" height="9" rx="1.5" fill="#d9c49a" stroke="#9c7f4e" stroke-width="1.4" stroke-dasharray="2 1.5"/>`,
  'leaders-necklace': svg`${shadow(14)}
    <path d="M12 10c0 17 9 27 20 27s20-10 20-27" stroke="url(#g-gold)" stroke-width="3.4" stroke-dasharray="3.5 2" stroke-linecap="round" fill="none"/>
    <circle cx="19" cy="27" r="2.6" fill="#e5a52f"/><circle cx="45" cy="27" r="2.6" fill="#e5a52f"/>
    <path d="M32 35l-5 4h10z" fill="#c9801c"/>
    <circle cx="32" cy="46" r="11" fill="url(#g-gold)"/>
    <circle cx="32" cy="46" r="6.5" fill="url(#g-blue)" stroke="#9a6215" stroke-width="1.4"/>
    <path d="M29 43a3.5 3.5 0 0 1 3-1.5" stroke="#d6ecff" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,
  'hand-of-midas': svg`${shadow(16)}
    <path d="M22 57c-3-6-6-12-8.5-18-1-3 2-5.2 4.3-3.2L23 41V17c0-2.2 1.6-4 3.5-4s3.5 1.8 3.5 4v13V12c0-2.2 1.6-4 3.5-4S37 9.8 37 12v18V15c0-2.2 1.6-4 3.5-4S44 12.8 44 15v17-11c0-2 1.5-3.5 3.3-3.5S50.6 19 50.6 21v21c0 9-5 15-12 15z" fill="url(#g-gold)"/>
    <path d="M26.5 17v20M33.5 13v19M40.5 16v17" stroke="#c9801c" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
    <path d="M25 45c3 3 9 4 15 1" stroke="#fff4c9" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".7"/>
    ${sparkle(11, 14, 1.3, '#fff3c4')} ${sparkle(55, 9, 1, '#fff3c4')} ${sparkle(57, 30, 0.8, '#ffe08a')}`,
  'sturdy-saddle': svg`${shadow(22)}
    <path d="M10 40h44l-4 7H14z" fill="#3f6fb0"/><path d="M13 43h38" stroke="#f2c25a" stroke-width="1.6"/>
    <path d="M8 27c8-1 14 3 24 3s16-6 24-4c2 7-2 14-10 16H20C12 42 6 35 8 27z" fill="url(#g-leather)"/>
    <path d="M46 26c0-6 2-10 6-10s4 4 2 8z" fill="#9a4d26"/>
    <path d="M8 27c-2-6 0-10 4-10s4 4 3 10z" fill="#7a3a1e"/>
    <path d="M13 33c8 3 22 3 33-2" stroke="#f3c48b" stroke-width="1.4" stroke-dasharray="2 2.5" fill="none"/>
    <path d="M28 42v8" stroke="#5c2f18" stroke-width="3"/>
    <path d="M22.5 50h11l-2 7h-7z" fill="none" stroke="#c7c0b2" stroke-width="2.6" stroke-linejoin="round"/>`,
  'magic-clepsydra': svg`${shadow(17)}
    <path d="M21 13h22c0 10-8 14-8 19s8 9 8 19H21c0-10 8-14 8-19s-8-9-8-19z" fill="#d6eeff" opacity=".28" stroke="#e8f6ff" stroke-width="1.2"/>
    <path d="M24 17h16c-1 5-5 8-8 10-3-2-7-5-8-10z" fill="url(#g-magic)"/>
    <path d="M22.5 50c2-6 6-8.5 9.5-8.5s7.5 2.5 9.5 8.5z" fill="url(#g-magic)"/>
    <path d="M32 27v15" stroke="#9fe0ff" stroke-width="1.6" stroke-dasharray="2 2"/>
    <rect x="16" y="11" width="3.4" height="42" rx="1.5" fill="#c9801c"/><rect x="44.6" y="11" width="3.4" height="42" rx="1.5" fill="#c9801c"/>
    <rect x="13" y="7" width="38" height="5.5" rx="2.6" fill="url(#g-gold)"/><rect x="13" y="51.5" width="38" height="5.5" rx="2.6" fill="url(#g-gold)"/>
    ${sparkle(55, 22, 1, '#bff1ff')} ${sparkle(9, 34, 0.8, '#bff1ff')}`,
  'blue-treasure': svg`${shadow(22)}
    <rect x="10" y="30" width="44" height="25" rx="3" fill="url(#g-blue)"/>
    <path d="M10 31v-7c0-8 6-12 22-12s22 4 22 12v7z" fill="url(#g-blue)"/>
    <path d="M14 22c2-5 8-7 18-7" stroke="#bfe0ff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".7"/>
    <rect x="10" y="29" width="44" height="4" fill="url(#g-gold)"/>
    <path d="M17 13.5v41.5M47 13.5v41.5" stroke="url(#g-gold)" stroke-width="4"/>
    <rect x="27.5" y="29" width="9" height="11" rx="2" fill="url(#g-gold)"/>
    <circle cx="32" cy="33.5" r="1.6" fill="#5a3a0e"/><path d="M32 34.5v3" stroke="#5a3a0e" stroke-width="1.6" stroke-linecap="round"/>
    ${sparkle(53, 10, 1.1, '#fff3c4')}`,
};

// ------------------------------------------------------------------ witch powers

const POWERS: Record<string, SVGTemplateResult> = {
  'presents-gift': svg`${shadow(20)}
    <rect x="12" y="29" width="40" height="26" rx="3" fill="url(#g-violet)"/>
    <rect x="9" y="21" width="46" height="10" rx="3" fill="#9d72ee"/>
    <rect x="29" y="21" width="6" height="34" fill="url(#g-gold)"/>
    <path d="M32 21c-6-10-16-9-12-2 2 3 8 3 12 2zM32 21c6-10 16-9 12-2-2 3-8 3-12 2z" fill="url(#g-gold)"/>
    <circle cx="32" cy="21" r="2.8" fill="#c9801c"/>
    <path d="M15 34v16" stroke="#c4a6ff" stroke-width="2.2" stroke-linecap="round" opacity=".6"/>`,
  'vertue-of-patience': svg`${shadow(17)}
    <circle cx="32" cy="9.5" r="4" fill="none" stroke="#e5a52f" stroke-width="2.4"/>
    <rect x="29" y="12.5" width="6" height="5" rx="1.5" fill="#c9801c"/>
    <circle cx="32" cy="37" r="20" fill="url(#g-gold)"/>
    <circle cx="32" cy="37" r="15.5" fill="#fff8e8"/>
    <path d="M32 23.5v3M32 47.5v3M18.5 37h3M42.5 37h3" stroke="#8a6a3a" stroke-width="2" stroke-linecap="round"/>
    <path d="M32 37V27M32 37l7 4" stroke="#3b2a1a" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="32" cy="37" r="2" fill="#c8321c"/>`,
  'midas-was-a-trader': svg`${shadow(18)}
    ${[0, 1, 2, 3].map((i) => svg`<ellipse cx="32" cy=${53 - i * 6} rx="16" ry="5" fill="#b9761c"/><ellipse cx="32" cy=${51.5 - i * 6} rx="16" ry="5" fill="url(#g-gold)"/>`)}
    <path d="M17 26l4-14 7 8 4-11 4 11 7-8 4 14z" fill="url(#g-gold)" stroke="#b9761c" stroke-width="1.2" stroke-linejoin="round"/>
    <circle cx="32" cy="19" r="2.4" fill="#e0483a"/><circle cx="23" cy="22" r="1.8" fill="#4a86ff"/><circle cx="41" cy="22" r="1.8" fill="#4a86ff"/>`,
  camelization: svg`${shadow(22)}
    ${camel('#d9963a', 4, 12, 0.92)}
    <rect x="19" y="10" width="9" height="9" rx="2" fill="#3f6fb0"/><rect x="27" y="8" width="9" height="11" rx="2" fill="#b84a3a"/>
    <path d="M19 14h17" stroke="#f2c25a" stroke-width="1.2"/>
    <circle cx="52" cy="13" r="8" fill="#3f9e6e" stroke="#1e1714" stroke-width="2"/>
    <path d="M52 9v8M48 13h8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`,
  'time-is-money': svg`${shadow(18)}
    <circle cx="32" cy="34" r="22" fill="#9a5e12"/>
    <circle cx="32" cy="32" r="22" fill="url(#g-gold)"/>
    <circle cx="32" cy="32" r="16.5" fill="url(#g-gold-in)" stroke="#b9761c" stroke-width="2"/>
    <path d="M32 19.5v3M32 41.5v3M19.5 32h3M41.5 32h3" stroke="#8a5212" stroke-width="2" stroke-linecap="round"/>
    <path d="M32 32V22.5M32 32l6.5 5" stroke="#5a3a0e" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M16 23a18 18 0 0 1 10-8" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".7"/>`,
  'animal-lover': svg`${shadow(18)}
    <path d="M32 55C18 45 8 37 8 25c0-7 5-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 7 0 12 5 12 12 0 12-10 20-24 30z" fill="url(#g-heart)"/>
    <ellipse cx="32" cy="35" rx="7.5" ry="6.5" fill="#fff4f0"/>
    <circle cx="23.5" cy="27" r="3.2" fill="#fff4f0"/><circle cx="29" cy="22.5" r="3.2" fill="#fff4f0"/><circle cx="35" cy="22.5" r="3.2" fill="#fff4f0"/><circle cx="40.5" cy="27" r="3.2" fill="#fff4f0"/>
    <path d="M14 22c1-4 4-6 7-6" stroke="#ffc6cf" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/>`,
  'oasis-of-sanctifan': svg`
    <ellipse cx="32" cy="51" rx="27" ry="8.5" fill="#e9c27a"/>
    <ellipse cx="32" cy="51" rx="22" ry="6" fill="url(#g-water)"/>
    <path d="M22 50c4 1.5 9 1.5 13 0" stroke="#d4f4ff" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M30 49c2-10 2-21 6-31" stroke="#9a6236" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M30 41l4-1M31 33l4-1M32 25l4-1" stroke="#7a4824" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M36 18c-8-6-19-4-23 3 8-3 15-1 23-3z" fill="url(#g-leaf)"/>
    <path d="M36 18c8-7 19-5 23 2-8-2-15-1-23-2z" fill="url(#g-leaf)"/>
    <path d="M36 18c-4-8-12-11-18-9 7 1 12 5 18 9z" fill="#3f9e5e"/>
    <path d="M36 18c3-8 11-12 17-10-7 2-11 5-17 10z" fill="#3f9e5e"/>
    <circle cx="34" cy="21" r="2.3" fill="#7a4824"/><circle cx="38" cy="21.5" r="2.3" fill="#6a3c1c"/>`,
  'the-stonecutter': svg`
    ${small('marble', -2, 10, 0.8)}
    <g transform="rotate(38 44 22)">
      <rect x="40" y="0" width="9" height="20" rx="3.5" fill="url(#g-wood)"/>
      <rect x="41.8" y="19" width="5.4" height="17" fill="url(#g-steel)"/>
      <path d="M41.8 36h5.4l-2.7 5.5z" fill="#4a525c"/>
    </g>
    <path d="M30 26l-3-3M34 24l1-4M37 28l4 0" stroke="#ffe08a" stroke-width="1.8" stroke-linecap="round"/>`,
};

// ------------------------------------------------------------------ disasters

const DISASTER_ART: Record<string, SVGTemplateResult> = {
  steal: svg`${shadow(22)}
    <path d="M28 16c-2-4 0-7 4-7s6 3 4 7z" fill="#8a6a3a"/>
    <path d="M18 32c0-10 6-16 14-16s14 6 14 16c0 12-6 22-14 22S18 44 18 32z" fill="url(#g-canvas)"/>
    <path d="M26 18h12" stroke="#6a4a22" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M6 30c8-6 18-4 26 0 8-4 18-6 26 0-2 9-8 13-14 13-5 0-8-4-12-4s-7 4-12 4C14 43 8 39 6 30z" fill="#26201c"/>
    <ellipse cx="20.5" cy="33" rx="4.6" ry="3.2" fill="#f3e6d3"/><ellipse cx="43.5" cy="33" rx="4.6" ry="3.2" fill="#f3e6d3"/>
    <path d="M6 30l-4-3M58 30l4-3" stroke="#26201c" stroke-width="2.4" stroke-linecap="round"/>
    ${badge('down', 50, 51)}`,
  'broke-leg': svg`${shadow(20)}
    <g transform="rotate(-35 32 32)">
      <rect x="12" y="27.5" width="40" height="9" rx="4.5" fill="url(#g-bone)"/>
      <circle cx="11" cy="27.5" r="5.2" fill="url(#g-bone)"/><circle cx="11" cy="36.5" r="5.2" fill="url(#g-bone)"/>
      <circle cx="53" cy="27.5" r="5.2" fill="url(#g-bone)"/><circle cx="53" cy="36.5" r="5.2" fill="url(#g-bone)"/>
      <rect x="24" y="24.5" width="14" height="15" rx="2.5" fill="#fff" stroke="#d8cdbb" stroke-width="1"/>
      <path d="M31 28v8M27 32h8" stroke="#e0483a" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <path d="M44 14l-3 4 3 2-3 4" stroke="#e0483a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'traders-left': svg`${shadow(24)}
    <g transform="translate(2 10) scale(.85)" style="color:#b9a99a" fill="currentColor" opacity=".55">
      <path d="M15 14c0-5.5 4-9.5 9-9.5s9 4 9 9.5c0 1.3-.6 2-2 2H17c-1.4 0-2-.7-2-2z"/><circle cx="24" cy="19" r="6.2"/><path d="M11 44l2.6-12.6C14.6 27 18.8 25 24 25s9.4 2 10.4 6.4L37 44z"/>
    </g>
    <g transform="translate(18 8) scale(.9)" style="color:#e5a52f" fill="currentColor">
      <path d="M15 14c0-5.5 4-9.5 9-9.5s9 4 9 9.5c0 1.3-.6 2-2 2H17c-1.4 0-2-.7-2-2z"/><circle cx="24" cy="19" r="6.2"/><path d="M11 44l2.6-12.6C14.6 27 18.8 25 24 25s9.4 2 10.4 6.4L37 44z"/>
    </g>
    <path d="M46 30h12M53 25l5 5-5 5" stroke="#e5583f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'marble-crisis': svg`${small('marble')} ${badge('down')}`,
  'saving-crisis': svg`${shadow(22)}
    <ellipse cx="30" cy="37" rx="21" ry="15" fill="url(#g-pig)"/>
    <ellipse cx="50" cy="35" rx="6.5" ry="5.5" fill="#e0718f"/><circle cx="48.5" cy="35" r="1.1" fill="#8a2f48"/><circle cx="52" cy="35" r="1.1" fill="#8a2f48"/>
    <path d="M17 25l-3-7 8 3z" fill="#e0718f"/><circle cx="40" cy="29" r="1.8" fill="#3b2a1a"/>
    <rect x="15" y="48" width="6" height="8" rx="2" fill="#e0718f"/><rect x="34" y="48" width="6" height="8" rx="2" fill="#e0718f"/>
    <rect x="24" y="22" width="10" height="2.6" rx="1.3" fill="#8a2f48"/>
    <path d="M24 26l3 6-4 4 3 6-2 5" stroke="#5c1a2c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="23" cy="58" r="3.5" fill="url(#g-gold)"/>`,
  'silk-penury': svg`${small('silk')} ${badge('up')}`,
  seer: svg`${shadow(17)}
    <path d="M17 54l4-9h22l4 9z" fill="url(#g-wood)"/><rect x="15" y="53" width="34" height="5" rx="2" fill="#6b3d22"/>
    <circle cx="32" cy="28" r="19" fill="url(#g-crystal)"/>
    <ellipse cx="25" cy="20" rx="6" ry="4" transform="rotate(-30 25 20)" fill="#fff" opacity=".55"/>
    <path d="M24 34c4 3 10 3 15-2" stroke="#e7dcff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".7"/>
    ${sparkle(37, 25, 1.1, '#fff')} ${sparkle(29, 33, 0.7, '#e7dcff')}`,
  'heavy-food': svg`${shadow(22)}
    <path d="M14 56l5-22h26l5 22z" fill="url(#g-steel)"/>
    <path d="M24 34a8 8 0 0 1 16 0" stroke="#4a525c" stroke-width="4" fill="none"/>
    <text x="32" y="51" text-anchor="middle" font-family="Inter Variable, sans-serif" font-weight="800" font-size="10" fill="#d9dee5">KG</text>
    <g transform="translate(16 2) scale(.5)">${RESOURCE_ART.food}</g>
    <path d="M50 18v8M46 22l4 4 4-4" stroke="#e5583f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'jewelry-crisis': svg`${small('jewelry')}
    <path d="M26 18l4 7-3 5 4 6" stroke="#2a1f3d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    ${badge('down')}`,
  'silk-crisis': svg`${small('silk')} ${badge('down')}`,
  'food-crisis': svg`${small('food')} ${badge('up')}`,
  'camel-sick': svg`${shadow(22)}
    ${camel('#c99a6a', 2, 12, 0.9)}
    <path d="M44 14c-1 3-3 4-3 6a3 3 0 0 0 6 0c0-2-2-3-3-6z" fill="#6fc3ff"/>
    <rect x="50" y="8" width="7" height="30" rx="3.5" fill="#fff" stroke="#c9c2b5" stroke-width="1.2"/>
    <circle cx="53.5" cy="40" r="5.5" fill="#e0483a"/><rect x="52" y="16" width="3" height="22" rx="1.5" fill="#e0483a"/>`,
};

const render = (art: SVGTemplateResult | undefined, cls: string): TemplateResult =>
  html`<svg class="art ${cls}" viewBox="0 0 64 64" aria-hidden="true">${art ?? svg``}</svg>`;

export const itemArt = (id: string, cls = ''): TemplateResult => render(ITEMS[id], cls);
export const powerArt = (id: string, cls = ''): TemplateResult => render(POWERS[id], cls);
export const disasterArt = (id: string, cls = ''): TemplateResult => render(DISASTER_ART[id], cls);
export const ART_IDS = { items: Object.keys(ITEMS), powers: Object.keys(POWERS), disasters: Object.keys(DISASTER_ART) };
