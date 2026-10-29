import { html, type TemplateResult } from 'lit-html';

/** Back / menu button shared by the screens (arrow + burger, like the original). */
export function backButton(onClick: () => void, label = 'Back'): TemplateResult {
  return html`<button class="icon-btn back-btn" @click=${onClick} aria-label=${label} title=${label}>
    <svg viewBox="0 0 32 28" aria-hidden="true">
      <path d="M3 7h16M3 7l5-5M3 7l5 5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 16h20M9 23h20" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" />
    </svg>
  </button>`;
}
