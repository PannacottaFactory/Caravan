import { html, type TemplateResult } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import {
  bestScore,
  FACTIONS,
  isFactionUnlocked,
  isPlayable,
  isTravelerModeUnlocked,
  MODES,
  unlockRequirement,
} from '../../engine';
import { fmt } from '../components/common';
import { backButton } from '../components/topbar';
import { goTo, playSelectedFaction, selectedFaction, selectFaction, setMode, state, toast } from '../store';

function toggleMode(): void {
  if (state.mode === 'classical') {
    if (!isTravelerModeUnlocked(state.profile)) {
      toast('Unlock the Sanctifan faction to play the Traveler Mode', 'error', 3200);
      return;
    }
    setMode('traveler');
  } else setMode('classical');
}

export function factionScreen(): TemplateResult {
  const f = selectedFaction();
  const mode = MODES[state.mode];
  const playable = isPlayable(state.profile, f.id, state.mode);
  const requirement = unlockRequirement(state.profile, f.id, state.mode);
  const travelerOpen = isTravelerModeUnlocked(state.profile);

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight') selectFaction(state.factionIndex + 1);
    if (e.key === 'ArrowLeft') selectFaction(state.factionIndex - 1);
  };

  return html`
    <section class="screen faction-screen" @keydown=${onKey}>
      <header class="topbar">${backButton(() => goTo('title'))}</header>
      <h2 class="screen-title">Choose your Mode<br />and your Faction</h2>

      <div class="faction-layout">
        <div class="mode-column">
          <button class="mode-bar" @click=${toggleMode} aria-label="Switch mode">
            <span class="mode-bar__desc">${mode.description}</span>
            <span class="mode-tag ${state.mode === 'traveler' ? 'mode-tag--traveler' : ''}">
              ${state.mode === 'classical' ? 'Classical' : 'Traveler'}<br />Mode
              ${travelerOpen ? null : html`<span class="lock-dot" title="Locked">🔒</span>`}
            </span>
          </button>

          <div class="faction-strip" role="listbox" aria-label="Factions">
            ${FACTIONS.map((x, i) => {
              const open = isPlayable(state.profile, x.id, state.mode);
              return html`<button
                role="option"
                aria-selected=${i === state.factionIndex}
                class="faction-chip ${i === state.factionIndex ? 'is-active' : ''} ${open ? '' : 'is-locked'}"
                title=${isFactionUnlocked(state.profile, x.id) ? x.name : 'Locked faction'}
                @click=${() => selectFaction(i)}
              >${i + 1}</button>`;
            })}
          </div>
        </div>

        <div class="faction-stage">
          <button class="arrow-btn arrow-btn--left" @click=${() => selectFaction(state.factionIndex - 1)} aria-label="Previous faction"></button>

          ${keyed(
            f.id,
            html`<article class="panel faction-card">
              <h3 class="faction-card__name">${f.name}</h3>
              <p class="faction-card__history">${f.history}</p>
              <h4 class="faction-card__label">Effect :</h4>
              <div class="faction-card__effect ${playable ? '' : 'is-hidden'}">${playable ? f.bonus : '?'}</div>
              <p class="faction-card__req ${requirement ? 'is-locked' : ''}">${requirement ?? 'Faction unlocked'}</p>
              <button class="btn ${playable ? 'btn--green' : 'btn--red'} btn--big" ?disabled=${!playable} @click=${playSelectedFaction}>
                ${playable ? 'Play' : 'Locked'}
              </button>
            </article>`,
          )}

          <button class="arrow-btn arrow-btn--right" @click=${() => selectFaction(state.factionIndex + 1)} aria-label="Next faction"></button>
        </div>
      </div>

      <div class="highscore-pill">High Score : ${fmt(bestScore(state.profile, f.id, state.mode))}</div>
    </section>
  `;
}
