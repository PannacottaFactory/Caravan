import { html, nothing, type TemplateResult } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import {
  bestScore,
  FACTIONS,
  isFactionUnlocked,
  isPlayable,
  isTravelerModeUnlocked,
  MODES,
  unlockRequirement,
  type Mode,
} from '../../engine';
import { fmt } from '../components/common';
import { crest, iconButton, segmented } from '../components/ui';
import { icon } from '../icons';
import { goTo, playSelectedFaction, selectedFaction, selectFaction, setMode, state, toast } from '../store';

function chooseMode(mode: Mode): void {
  if (mode === 'traveler' && !isTravelerModeUnlocked(state.profile)) {
    toast('Unlock the Sanctifan faction to play the Traveler Mode', 'error', 3200);
    return;
  }
  setMode(mode);
}

export function factionScreen(): TemplateResult {
  const f = selectedFaction();
  const p = state.profile;
  const mode = MODES[state.mode];
  const known = isFactionUnlocked(p, f.id);
  const playable = isPlayable(p, f.id, state.mode);
  const requirement = unlockRequirement(p, f.id, state.mode);

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      selectFaction(state.factionIndex + 1);
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      selectFaction(state.factionIndex - 1);
    }
    if (e.key === 'Enter' && playable) playSelectedFaction();
  };

  return html`
    <section class="screen faction-screen" @keydown=${onKey}>
      <header class="page-header">
        ${iconButton('back', 'Back', () => goTo('title'))}
        <div>
          <p class="page-header__eyebrow">New journey</p>
          <h2 class="page-header__title">Choose your mode and your faction</h2>
        </div>
      </header>

      <div class="faction-layout">
        <aside class="card faction-list" aria-label="Factions">
          ${segmented(
            [
              { id: 'classical', label: 'Classical' },
              { id: 'traveler', label: 'Traveler', locked: !isTravelerModeUnlocked(p), hint: MODES.traveler.description },
            ],
            state.mode,
            chooseMode,
            'segmented--full',
          )}
          <p class="faction-list__mode">${mode.description}</p>
          <ul class="faction-list__items" role="listbox" tabindex="0">
            ${FACTIONS.map((x, i) => {
              const open = isPlayable(p, x.id, state.mode);
              const seen = isFactionUnlocked(p, x.id);
              const score = bestScore(p, x.id, state.mode);
              return html`<li>
                <button role="option" aria-selected=${i === state.factionIndex}
                  class="faction-item ${i === state.factionIndex ? 'is-active' : ''} ${open ? '' : 'is-locked'}"
                  @click=${() => selectFaction(i)}>
                  ${seen ? crest(x.id, 'crest--sm') : html`<span class="crest-placeholder crest-placeholder--sm">${icon('lock')}</span>`}
                  <span class="faction-item__name">${seen ? x.name : 'Unknown faction'}</span>
                  <span class="faction-item__score">${open ? (score ? fmt(score) : '—') : icon('lock')}</span>
                </button>
              </li>`;
            })}
          </ul>
        </aside>

        ${keyed(
          `${f.id}-${state.mode}`,
          html`<article class="card faction-detail">
            <div class="faction-detail__head">
              ${known ? crest(f.id, 'crest--lg') : html`<span class="crest-placeholder crest-placeholder--lg">${icon('lock')}</span>`}
              <div>
                <p class="faction-detail__index">Faction ${state.factionIndex + 1} of ${FACTIONS.length}</p>
                <h3 class="faction-detail__name">${known ? f.name : 'Unknown faction'}</h3>
                <div class="faction-detail__scores">
                  <span>${icon('trophy')} Classical <strong>${fmt(bestScore(p, f.id, 'classical'))}</strong></span>
                  <span>${icon('trophy')} Traveler <strong>${fmt(bestScore(p, f.id, 'traveler'))}</strong></span>
                </div>
              </div>
            </div>

            <p class="faction-detail__history">${known ? f.history : 'Who knows what this faction hides? Prove your worth to discover it.'}</p>

            <div class="effect-box ${playable ? '' : 'is-locked'}">
              <span class="effect-box__label">${icon('sparkle')} Faction effect</span>
              <strong>${playable ? f.bonus : '???'}</strong>
            </div>

            ${requirement
              ? html`<p class="requirement">${icon('lock')} ${requirement}</p>`
              : html`<p class="requirement requirement--ok">${icon('check')} Ready to travel — ${mode.description}</p>`}

            <div class="faction-detail__actions">
              <div class="pager">
                ${iconButton('chevronLeft', 'Previous faction', () => selectFaction(state.factionIndex - 1))}
                ${iconButton('chevronRight', 'Next faction', () => selectFaction(state.factionIndex + 1))}
              </div>
              <button class="btn btn--primary btn--xl" ?disabled=${!playable} @click=${playSelectedFaction}>
                ${playable ? html`${icon('play')} ${state.mode === 'traveler' ? 'Prepare caravan' : 'Start journey'}` : html`${icon('lock')} Locked`}
              </button>
            </div>
            ${playable ? html`<p class="hint">Tip: use the arrow keys to browse, Enter to play.</p>` : nothing}
          </article>`,
        )}
      </div>
    </section>
  `;
}
