import { html, nothing, render } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import { installScene, scene } from './components/scene';
import { modalLayer } from './components/modals';
import { tooltipLayer } from './components/tooltip';
import { artDefs, icon } from './icons';
import { unlockAudio } from './audio';
import { factionScreen } from './screens/factions';
import { gameScreen } from './screens/game';
import { prepareScreen } from './screens/prepare';
import { titleScreen } from './screens/title';
import { closeModal, dangerTheme, onChange, state } from './store';
import { devPanel, installDevShortcut } from './dev';

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
    ${scene(state.screen === 'title' ? 'hero' : 'game', dangerTheme())}
    <main class="app app--${state.screen} ${dangerTheme() ? 'theme-danger' : ''}">${keyed(state.screen, currentScreen())}</main>
    ${modalLayer()}
    ${tooltipLayer()}
    ${import.meta.env.DEV ? devPanel() : nothing}
    <div class="toasts" aria-live="polite">
      ${state.toasts.map((t) => html`<div class="toast toast--${t.kind}">${icon(TOAST_ICON[t.kind])}<span>${t.text}</span></div>`)}
    </div>
  `;
}

export function startApp(root: HTMLElement): void {
  installScene();
  if (import.meta.env.DEV) installDevShortcut();
  onChange(() => render(view(), root));
  render(view(), root);
  window.addEventListener('pointerdown', unlockAudio, { capture: true });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.modal) closeModal();
  });
}
