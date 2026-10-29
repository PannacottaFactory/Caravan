// Test panel — only rendered by the local dev server (`npm run dev`), never in the
// published build. Toggle it with the "Test" button or the F2 key.

import { html, nothing, type TemplateResult } from 'lit-html';
import { createProfile, DISASTERS, FACTIONS, type GameState } from '../engine';
import { saveGame, saveProfile } from '../storage/storage';
import { state, toast, update } from './store';

let open = false;

function setProfile(scores: number): void {
  const profile = createProfile();
  profile.achievements = state.profile.achievements;
  if (scores > 0) for (const f of FACTIONS) profile.bestScores[f.id] = { classical: scores, traveler: 0 };
  saveProfile(profile);
  update({ profile });
}

/** Applies a change to the game in progress (copy, change, save, re-render). */
function patchGame(change: (g: GameState) => void, message: string): void {
  if (!state.game) {
    toast('Start a game first', 'error');
    return;
  }
  const g = structuredClone(state.game);
  change(g);
  saveGame(g);
  update({ game: g });
  toast(message, 'success', 1600);
}

/** Opens an event right now (merchant, witch or a given disaster). */
function openEvent(kind: 'merchant' | 'witch' | 'disaster', disasterId?: string): void {
  patchGame((g) => {
    g.events[kind] = { day: g.day, done: false };
    if (kind === 'disaster') g.disaster = disasterId ?? DISASTERS[0]!.id;
    g.phase = kind;
  }, `${kind} opened`);
  if (kind === 'merchant') update({ merchantChoice: 'cornucopia' });
  if (kind === 'witch') update({ witchChoice: 'presents-gift' });
}

export function devPanel(): TemplateResult {
  const toggle = (): void => {
    open = !open;
    update({});
  };
  const inGame = state.screen === 'game' && !!state.game && state.game.phase === 'playing';
  return html`<div class="dev ${open ? 'is-open' : ''}">
    <button class="dev__toggle" @click=${toggle} title="Test panel (F2)">Test</button>
    ${open
      ? html`<div class="dev__panel">
          <p class="dev__title">Progress</p>
          <div class="dev__row">
            <button @click=${() => (setProfile(1_000_000), toast('All factions unlocked', 'success', 1600))}>Unlock everything</button>
            <button @click=${() => (setProfile(0), toast('Progress reset', 'success', 1600))}>Reset progress</button>
          </div>

          <p class="dev__title">Game in progress ${inGame ? nothing : html`<small>(start a game)</small>`}</p>
          <div class="dev__row">
            <button ?disabled=${!inGame} @click=${() => patchGame((g) => (g.gold += 1000), '+1000 gold')}>+1000 gold</button>
            <button ?disabled=${!inGame} @click=${() => patchGame((g) => (g.inventory.food += 20), '+20 food')}>+20 food</button>
            <button ?disabled=${!inGame} @click=${() => patchGame((g) => (g.camels += 1), '+1 camel')}>+1 camel</button>
            <button ?disabled=${!inGame} @click=${() => patchGame((g) => (g.day = g.maxDay), 'Last day')}>Go to last day</button>
          </div>
          <div class="dev__row">
            <button ?disabled=${!inGame} @click=${() => openEvent('merchant')}>Merchant now</button>
            <button ?disabled=${!inGame} @click=${() => openEvent('witch')}>Witch now</button>
          </div>
          <label class="dev__select">
            Disaster now
            <select ?disabled=${!inGame} @change=${(e: Event) => {
              const select = e.target as HTMLSelectElement;
              if (select.value) openEvent('disaster', select.value);
              select.value = '';
            }}>
              <option value="">Choose…</option>
              ${DISASTERS.map((d) => html`<option value=${d.id}>${d.id}</option>`)}
            </select>
          </label>
        </div>`
      : nothing}
  </div>`;
}

export function installDevShortcut(): void {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      open = !open;
      update({});
    }
  });
}
