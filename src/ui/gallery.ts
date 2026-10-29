// Dev-only artwork gallery (open /#art with `npm run dev`).
import { html, render } from 'lit-html';
import { RESOURCE_IDS } from '../engine';
import { artDefs, camelArt, coinArt, icon, resourceArt, traderArt, brand, type IconName } from './icons';

const ICON_NAMES: IconName[] = ['menu','back','close','plus','minus','lock','check','soundOn','soundOff','trophy','podium','help','info','user','share','play','refresh','sun','weight','food','piggy','market','cart','coins','users','sparkle','warning','skull','crown','arrowUp','arrowDown','max'];

export function showGallery(root: HTMLElement): void {
  render(html`${artDefs()}
    <div style="padding:24px;background:#1d1714;min-height:100vh;color:#f3e6d3;display:flex;flex-direction:column;gap:24px">
      <div style="display:flex;gap:24px;flex-wrap:wrap">${RESOURCE_IDS.map((id) => html`<div style="width:128px;height:128px;background:#2a211c;border-radius:20px;display:grid;place-items:center">${resourceArt(id)}</div>`)}
        <div style="width:128px;height:128px;background:#2a211c;border-radius:20px;display:grid;place-items:center">${coinArt()}</div>
        <div style="width:128px;height:128px;background:#2a211c;border-radius:20px;display:grid;place-items:center;color:#f4b740">${camelArt()}</div>
        <div style="width:128px;height:128px;background:#2a211c;border-radius:20px;display:grid;place-items:center;color:#f4b740">${traderArt()}</div>
      </div>
      <div style="display:flex;gap:18px;flex-wrap:wrap;font-size:32px">${ICON_NAMES.map((n) => html`<span title=${n} style="width:48px;height:48px;display:grid;place-items:center;background:#2a211c;border-radius:12px">${icon(n)}</span>`)}
        ${(['instagram','twitter','discord','reddit'] as const).map((n) => html`<span style="width:48px;height:48px;display:grid;place-items:center;background:#2a211c;border-radius:12px">${brand(n)}</span>`)}
      </div>
    </div>
    <style>.art{width:96px;height:96px}.icon{width:28px;height:28px}.art-defs{position:absolute}</style>`, root);
}
