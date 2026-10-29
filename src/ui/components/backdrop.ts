import { html, type TemplateResult } from 'lit-html';
import { img } from '../assets';

/**
 * Desert scenery shared by every screen: sky, sun, drifting clouds, layered dunes
 * with a slow parallax, the caravan walking along the dunes and blowing sand.
 * `dim` darkens it behind the game panels.
 */
export function backdrop(dim: boolean): TemplateResult {
  return html`
    <div class="backdrop ${dim ? 'backdrop--dim' : ''}" aria-hidden="true">
      <div class="sky"></div>
      <img class="sun" src=${img('sun')} alt="" />
      <img class="cloud cloud--1" src=${img('cloud')} alt="" />
      <img class="cloud cloud--2" src=${img('cloud')} alt="" />
      <div class="dunes dunes--far" style="--src:url('${img('dunes')}')"></div>
      <div class="caravan-walk"><span class="glyph caravan-glyph" style="--src:url('${img('caravan')}')"></span></div>
      <div class="dunes dunes--near" style="--src:url('${img('dunes')}')"></div>
      <div class="sand">${Array.from({ length: 14 }, (_, i) => html`<i style="--i:${i}"></i>`)}</div>
    </div>
  `;
}
