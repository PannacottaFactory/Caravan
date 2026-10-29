// Dev-only artwork gallery (open /#art with `npm run dev`).
import { html, render, type TemplateResult } from 'lit-html';
import { RESOURCE_IDS } from '../engine';
import { ART_IDS, disasterArt, itemArt, powerArt } from './art';
import { artDefs, camelArt, coinArt, resourceArt, traderArt } from './icons';

const tile = (art: TemplateResult, label: string) =>
  html`<figure style="margin:0;width:120px;display:flex;flex-direction:column;align-items:center;gap:6px">
    <div style="width:112px;height:112px;background:#2a211c;border-radius:20px;display:grid;place-items:center">${art}</div>
    <figcaption style="font:12px sans-serif;color:#cdbba5;text-align:center">${label}</figcaption></figure>`;

const row = (title: string, tiles: TemplateResult[]) =>
  html`<h3 style="font:600 16px sans-serif;margin:8px 0 0">${title}</h3><div style="display:flex;gap:12px;flex-wrap:wrap">${tiles}</div>`;

export function showGallery(root: HTMLElement): void {
  render(html`${artDefs()}
    <div style="padding:20px;background:#1d1714;min-height:100vh;color:#f3e6d3;display:flex;flex-direction:column;gap:8px">
      ${row('Resources & crew', [...RESOURCE_IDS.map((id) => tile(resourceArt(id), id)), tile(coinArt(), 'coin'),
        tile(html`<span style="color:#f4b740;width:80px">${camelArt()}</span>`, 'camel'), tile(html`<span style="color:#f4b740;width:64px">${traderArt()}</span>`, 'trader')])}
      ${row('Merchant', ART_IDS.items.map((id) => tile(itemArt(id), id)))}
      ${row('Witch', ART_IDS.powers.map((id) => tile(powerArt(id), id)))}
      ${row('Disasters', ART_IDS.disasters.map((id) => tile(disasterArt(id), id)))}
    </div>
    <style>body{overflow:auto!important}.art{width:88px;height:88px;display:block}.art-defs{position:absolute}</style>`, root);
}
