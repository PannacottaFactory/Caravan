import { html, nothing, type TemplateResult } from 'lit-html';
import { hideTip, showTip, state, type Tip } from '../store';

/** Event handlers to attach a tooltip to an element (mouse and keyboard). */
export function withTip(title: string, body: string, side: Tip['side'] = 'right') {
  return {
    show: (e: Event) => showTip(e, title, body, side),
    hide: () => hideTip(),
  };
}

export function tooltipLayer(): TemplateResult | typeof nothing {
  const t = state.tip;
  if (!t) return nothing;
  return html`<div class="tooltip tooltip--${t.side}" role="tooltip" style="left:${t.x}px;top:${t.y}px">
    <strong>${t.title}</strong><span>${t.body}</span>
  </div>`;
}
