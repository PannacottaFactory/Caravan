import { html, type TemplateResult } from 'lit-html';
import { computeStats, IMPROVEMENTS, MODES, type StatModifier } from '../../engine';
import { img } from '../assets';
import { backButton } from '../components/topbar';
import { goTo, selectedFaction, startGame, state, toggleImprovement } from '../store';

/** Traveler mode: spend 3 points on improvements before leaving. */
export function prepareScreen(): TemplateResult {
  const mode = MODES.traveler;
  const left = mode.improvementPoints - state.improvements.length;
  const has = (id: string) => state.improvements.includes(id);

  // Preview of the starting caravan with the chosen improvements.
  const preview = computeStats({
    modifiers: IMPROVEMENTS.filter((i) => has(i.id))
      .flatMap((i) => i.effects)
      .filter((e): e is StatModifier => e.kind === 'stat' || e.kind === 'resourceStat'),
  });
  const gold = mode.startGold + (has('gold') ? 10 : 0);
  const weight = mode.baseCapacity + preview.global.capacityBonus;

  const stat = (icon: string, label: string, value: number | string) =>
    html`<div class="prep-stat"><img src=${img(icon)} alt="" /><span>${label}</span><strong>${value}</strong></div>`;

  return html`
    <section class="screen prepare-screen">
      <header class="topbar">${backButton(() => goTo('factions'))}</header>
      <h2 class="screen-title">Prepare your caravan</h2>
      <p class="screen-subtitle">${selectedFaction().name} · Traveler Mode</p>

      <div class="prepare-layout">
        <div class="panel prep-summary">
          ${stat('coin', 'Gold', gold)} ${stat('weight', 'Weight', weight)} ${stat('trader', 'Traders', mode.startTraders)}
          ${stat('camel', 'Camels', mode.startCamels)}
          <div class="prep-stat prep-stat--days"><span class="days-icon">☀</span><span>Days</span><strong>${mode.maxDay}</strong></div>
        </div>

        <div class="panel prep-board">
          <div class="prep-points">
            Improvement points <span class="points-badge ${left === 0 ? 'is-empty' : ''}">${left}</span>
          </div>
          <div class="improvement-grid">
            ${IMPROVEMENTS.map(
              (i) => html`<button class="improvement ${has(i.id) ? 'is-selected' : ''}" aria-pressed=${has(i.id)}
                ?disabled=${!has(i.id) && left === 0} @click=${() => toggleImprovement(i.id)}>
                <strong>${i.name}</strong><span>${i.description}</span>
              </button>`,
            )}
          </div>
          <button class="btn btn--green btn--big" @click=${startGame}>Let's go!</button>
        </div>
      </div>
    </section>
  `;
}
