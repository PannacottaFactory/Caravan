import { html, type TemplateResult } from 'lit-html';
import { computeStats, IMPROVEMENTS, MODES, type StatModifier } from '../../engine';
import { crest, iconButton } from '../components/ui';
import { coinArt, icon, traderArt, camelArt, type IconName } from '../icons';
import { goTo, selectedFaction, startGame, state, toggleImprovement } from '../store';

const IMPROVEMENT_ICONS: Record<string, IconName> = {
  weight: 'weight',
  gold: 'coins',
  pottery: 'market',
  marble: 'arrowDown',
  jewelry: 'sparkle',
  trader: 'users',
  camel: 'check',
  'traders-income': 'arrowUp',
  'load-capacity': 'max',
  saving: 'piggy',
};

/** Traveler mode: spend 3 points on improvements before leaving. */
export function prepareScreen(): TemplateResult {
  const mode = MODES.traveler;
  const left = mode.improvementPoints - state.improvements.length;
  const has = (id: string) => state.improvements.includes(id);
  const faction = selectedFaction();

  const preview = computeStats({
    modifiers: IMPROVEMENTS.filter((i) => has(i.id))
      .flatMap((i) => i.effects)
      .filter((e): e is StatModifier => e.kind === 'stat' || e.kind === 'resourceStat'),
  });
  const gold = mode.startGold + (has('gold') ? 10 : 0);
  const weight = mode.baseCapacity + preview.global.capacityBonus;

  return html`
    <section class="screen prepare-screen">
      <header class="page-header">
        ${iconButton('back', 'Back', () => goTo('factions'))}
        <div>
          <p class="page-header__eyebrow">Traveler mode · ${faction.name}</p>
          <h2 class="page-header__title">Prepare your caravan</h2>
        </div>
      </header>

      <div class="prepare-layout">
        <div class="card prepare-board">
          <div class="prepare-board__head">
            <p>Choose up to three improvements for this long journey.</p>
            <div class="points" aria-label="${left} points left">
              ${[0, 1, 2].map((i) => html`<span class="points__pip ${i < left ? 'is-full' : ''}"></span>`)}
              <strong>${left} left</strong>
            </div>
          </div>
          <div class="improvement-grid">
            ${IMPROVEMENTS.map(
              (i) => html`<button class="improvement ${has(i.id) ? 'is-selected' : ''}" aria-pressed=${has(i.id)}
                ?disabled=${!has(i.id) && left === 0} @click=${() => toggleImprovement(i.id)}>
                <span class="improvement__icon">${icon(IMPROVEMENT_ICONS[i.id] ?? 'sparkle')}</span>
                <span class="improvement__text"><strong>${i.name}</strong><span>${i.description}</span></span>
                <span class="improvement__check">${icon('check')}</span>
              </button>`,
            )}
          </div>
        </div>

        <aside class="card prepare-summary">
          ${crest(faction.id, 'crest--lg')}
          <h3>${faction.name}</h3>
          <p class="muted">${faction.bonus}</p>
          <ul class="summary-list">
            <li>${coinArt('summary-art')}<span>Gold</span><strong>${gold}</strong></li>
            <li><span class="summary-icon">${icon('weight')}</span><span>Capacity</span><strong>${weight}</strong></li>
            <li><span class="summary-icon summary-icon--crew">${traderArt()}</span><span>Traders</span><strong>${mode.startTraders}</strong></li>
            <li><span class="summary-icon summary-icon--crew">${camelArt()}</span><span>Camels</span><strong>${mode.startCamels}</strong></li>
            <li><span class="summary-icon">${icon('sun')}</span><span>Days</span><strong>${mode.maxDay}</strong></li>
          </ul>
          <p class="muted small">Disasters may strike near the end of the journey.</p>
          <button class="btn btn--primary btn--xl btn--block" @click=${startGame}>${icon('play')} Let's go</button>
        </aside>
      </div>
    </section>
  `;
}
