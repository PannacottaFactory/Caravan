import { html, render } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import { scene } from './components/scene';
import { modalLayer } from './components/modals';
import { artDefs, icon } from './icons';
import { unlockAudio } from './audio';
import { factionScreen } from './screens/factions';
import { gameScreen } from './screens/game';
import { prepareScreen } from './screens/prepare';
import { titleScreen } from './screens/title';
import { closeModal, onChange, state } from './store';

function currentScreen() {
  switch (state.screen) {
    case 'title':
      return titleScreen();
    case 'factions':
      return factionScreen();
    case 'prepare':
      return prepareScreen();
    case 'game':
      return state.game ? gameScreen() : titleScreen();
  }
}

const TOAST_ICON = { error: 'warning', info: 'info', success: 'trophy' } as const;

function view() {
  return html`
    ${artDefs()}
    ${scene(state.screen === 'title' ? 'hero' : 'game')}
    <main class="app app--${state.screen}">${keyed(state.screen, currentScreen())}</main>
    ${modalLayer()}
    <div class="toasts" aria-live="polite">
      ${state.toasts.map((t) => html`<div class="toast toast--${t.kind}">${icon(TOAST_ICON[t.kind])}<span>${t.text}</span></div>`)}
    </div>
  `;
}

export function startApp(root: HTMLElement): void {
  onChange(() => render(view(), root));
  render(view(), root);
  window.addEventListener('pointerdown', unlockAudio, { capture: true });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.modal) closeModal();
  });
}
