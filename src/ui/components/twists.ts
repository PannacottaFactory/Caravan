import { html, type TemplateResult } from 'lit-html';
import type { DailyTwist } from '../../engine';
import { icon } from '../icons';

const TWIST_ICON = { boom: 'arrowUp', slump: 'arrowDown', rule: 'sparkle' } as const;

/** The three twists of a daily challenge, as small chips. */
export function twistChips(twists: DailyTwist[], cls = ''): TemplateResult {
  return html`<ul class="twists ${cls}" aria-label="Today's twists">
    ${twists.map(
      (t) => html`<li class="twist twist--${t.kind}" title=${t.description}>
        ${icon(TWIST_ICON[t.kind])}<span><strong>${t.title}</strong><small>${t.description}</small></span>
      </li>`,
    )}
  </ul>`;
}
