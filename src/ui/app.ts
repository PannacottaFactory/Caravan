import { html, render } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import { backdrop } from './components/backdrop';
import { modalLayer } from './components/modals';
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

function view() {
  return html`
    ${backdrop(state.screen === 'game')}
    <main class="app">${keyed(state.screen, currentScreen())}</main>
    ${modalLayer()}
    <div class="toasts" aria-live="polite">
      ${state.toasts.map((t) => html`<div class="toast toast--${t.kind}">${t.text}</div>`)}
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
