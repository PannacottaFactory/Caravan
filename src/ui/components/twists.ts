import { html, type TemplateResult } from 'lit-html';
import type { DailyTwist } from '../../engine';
import { icon } from '../icons';
import { withTip } from './tooltip';

const TWIST_ICON = { boom: 'arrowUp', slump: 'arrowDown', rule: 'sparkle' } as const;

const EXPLAIN: Record<DailyTwist['kind'], (t: DailyTwist) => string> = {
  boom: (t) => `${t.description} all day long. A great time to buy it cheap and sell it high.`,
  slump: (t) => `${t.description} today. Think twice before buying it to resell.`,
  rule: (t) => `${t.description}, for the whole journey.`,
};
const KIND_LABEL: Record<DailyTwist['kind'], string> = { boom: 'Market boom', slump: 'Market slump', rule: 'Special rule' };

/** The three twists of a daily challenge, as small chips with an explanation on hover. */
export function twistChips(twists: DailyTwist[], cls = ''): TemplateResult {
  return html`<ul class="twists ${cls}" aria-label="Today's twists">
    ${twists.map((t) => {
      const tip = withTip(`${KIND_LABEL[t.kind]} · ${t.title}`, EXPLAIN[t.kind](t));
      return html`<li class="twist twist--${t.kind}" tabindex="0" aria-label="${t.title}: ${t.description}"
        @pointerenter=${tip.show} @pointerleave=${tip.hide} @focus=${tip.show} @blur=${tip.hide}>
        ${icon(TWIST_ICON[t.kind])}<span><strong>${t.title}</strong><small>${t.description}</small></span>
      </li>`;
    })}
  </ul>`;
}
