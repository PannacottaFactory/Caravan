import { html, nothing, type TemplateResult } from 'lit-html';
import { ACHIEVEMENTS, bestScore, dailyChallenge, dateKey, FACTIONS, getFaction, getMerchantItem, isFactionUnlocked } from '../../engine';
import { itemArt } from '../art';
import { coinArt, icon, resourceArt } from '../icons';
import { fmt, formatDay } from './common';
import { crest, segmented } from './ui';
import {
  abandonGameAndChooseFaction,
  backToMenu,
  canShareImage,
  closeModal,
  copyShareText,
  loadBoard,
  loadDailyBoard,
  setRecordsTab,
  shareImage,
  startDaily,
  state,
} from '../store';

function modal(title: string, body: TemplateResult, actions?: TemplateResult, size: 'sm' | 'md' | 'lg' = 'md'): TemplateResult {
  const onBackdrop = (e: Event): void => {
    if (e.target === e.currentTarget) closeModal();
  };
  return html`<div class="overlay" role="dialog" aria-modal="true" aria-label=${title} @click=${onBackdrop}>
    <div class="dialog dialog--${size}">
      <button class="dialog__close icon-btn icon-btn--quiet" @click=${closeModal} aria-label="Close">${icon('close')}</button>
      <h3 class="dialog__title">${title}</h3>
      <div class="dialog__body">${body}</div>
      ${actions ? html`<footer class="dialog__actions">${actions}</footer>` : nothing}
    </div>
  </div>`;
}

const howTo = () =>
  modal(
    'How to play',
    html`
      <p class="lead">Be the richest trader of your faction when the journey ends.</p>
      <ol class="steps">
        <li><span class="steps__icon">${icon('sun')}</span><span><strong>One action per day.</strong> Buy, sell, grow your crew or save gold — then the day ends.</span></li>
        <li><span class="steps__icon">${resourceArt('silk')}</span><span><strong>Buy low, sell high.</strong> Every good has a buying and a selling price, and a weight.</span></li>
        <li><span class="steps__icon">${icon('users')}</span><span><strong>Traders</strong> earn gold every day. <strong>Camels</strong> carry more cargo.</span></li>
        <li><span class="steps__icon">${resourceArt('food')}</span><span><strong>Feed your crew.</strong> Each trader and camel eats one food per day. No food, no caravan!</span></li>
        <li><span class="steps__icon">${coinArt()}</span><span><strong>Save gold</strong> to earn a share of your fortune — the rate drops each time.</span></li>
      </ol>
      <p class="muted small">Final score: your gold plus the value of your goods and your crew. Watch out for a mysterious merchant and an old witch on the road…</p>
    `,
    html`<button class="btn btn--primary btn--lg" @click=${closeModal}>Good luck, merchant!</button>`,
  );

const credits = () =>
  modal(
    'Credits',
    html`<div class="credits">
      <div><small>Design, development & graphics</small><strong>Victor Roudaut</strong></div>
      <div><small>Music</small><strong>Tyler Cline</strong></div>
      <p class="muted">Big thanks to all the testers who made a lot for Caravan ❤</p>
    </div>`,
    undefined,
    'sm',
  );

const score = (n: number): string => (n > 0 ? fmt(n) : '—');

const localRecords = () => html`<div class="table-wrap"><table class="records">
    <thead><tr><th>Faction</th><th>Classical</th><th>Traveler</th></tr></thead>
    <tbody>
      ${FACTIONS.map((f) => {
        const open = isFactionUnlocked(state.profile, f.id);
        return html`<tr class=${open ? '' : 'is-locked'}>
          <td><span class="records__faction"><span class="crest-chip ${open ? '' : 'is-locked'}">${crest(f.id, 'crest--xs')}</span> ${f.name} ${open ? '' : icon('lock')}</span></td>
          <td>${score(bestScore(state.profile, f.id, 'classical'))}</td>
          <td>${score(bestScore(state.profile, f.id, 'traveler'))}</td>
        </tr>`;
      })}
    </tbody>
  </table></div>`;

const worldRecords = () => {
  const b = state.board;
  const onFaction = (e: Event): void => void loadBoard((e.target as HTMLSelectElement).value, b.mode);
  return html`<div class="world">
    <div class="world__controls">
      <label class="select">
        <span class="crest-chip">${crest(b.faction, 'crest--xs')}</span>
        <select @change=${onFaction} aria-label="Faction">
          ${FACTIONS.map((f) => html`<option value=${f.id} ?selected=${f.id === b.faction}>${f.name}</option>`)}
        </select>
        ${icon('chevronRight', 'select__chevron')}
      </label>
      ${segmented(
        [
          { id: 'classical', label: 'Classical' },
          { id: 'traveler', label: 'Traveler' },
        ],
        b.mode,
        (mode) => void loadBoard(b.faction, mode),
      )}
    </div>
    ${b.status === 'error'
      ? html`<div class="world__empty">${icon('warning')}<p>${b.error}</p>
          <button class="btn btn--secondary btn--sm" @click=${() => void loadBoard(b.faction, b.mode)}>${icon('refresh')} Retry</button></div>`
      : b.status === 'ready' && b.entries.length === 0
        ? html`<div class="world__empty">${icon('podium')}<p>No score yet for this faction and mode. Be the first!</p></div>`
        : html`<ol class="world__list ${b.status === 'loading' ? 'is-loading' : ''}">
            ${b.entries.map(
              (e, i) => html`<li class=${e.client_id === state.settings.clientId ? 'is-me' : ''} style="--d:${i}">
                <span class="world__rank rank-${i + 1}">${i + 1}</span>
                <span class="world__player">${e.player}${e.client_id === state.settings.clientId ? html` <small>(you)</small>` : nothing}</span>
                <span class="world__date">${new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                <strong>${fmt(e.score)}</strong>
              </li>`,
            )}
            ${b.status === 'loading' && b.entries.length === 0 ? Array.from({ length: 6 }, () => html`<li class="skeleton"></li>`) : nothing}
          </ol>`}
  </div>`;
};

const dailyRecords = () => {
  const c = dailyChallenge(dateKey());
  const b = state.dailyBoard;
  return html`<div class="world">
    <div class="daily-head">
      ${crest(c.factionId, 'crest--sm')}
      <div>
        <strong>Daily challenge · ${formatDay(c.date)}</strong>
        <span class="muted small">${getFaction(c.factionId).name} · Classical · same journey for everyone</span>
      </div>
    </div>
    ${b.status === 'error'
      ? html`<div class="world__empty">${icon('warning')}<p>${b.error}</p>
          <button class="btn btn--secondary btn--sm" @click=${() => void loadDailyBoard()}>${icon('refresh')} Retry</button></div>`
      : b.status === 'ready' && b.entries.length === 0
        ? html`<div class="world__empty">${icon('podium')}<p>Nobody has finished today's challenge yet. Be the first!</p></div>`
        : html`<ol class="world__list ${b.status === 'loading' ? 'is-loading' : ''}">
            ${b.entries.map(
              (e, i) => html`<li class=${e.client_id === state.settings.clientId ? 'is-me' : ''} style="--d:${i}">
                <span class="world__rank rank-${i + 1}">${i + 1}</span>
                <span class="world__player">${e.player}${e.client_id === state.settings.clientId ? html` <small>(you)</small>` : nothing}</span>
                <span class="world__date">${new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                <strong>${fmt(e.score)}</strong>
              </li>`,
            )}
            ${b.status === 'loading' && b.entries.length === 0 ? Array.from({ length: 6 }, () => html`<li class="skeleton"></li>`) : nothing}
          </ol>`}
  </div>`;
};

const records = () =>
  modal(
    'Best scores',
    html`${segmented(
        [
          { id: 'local', label: 'My records', icon: 'trophy' },
          { id: 'world', label: 'World', icon: 'podium' },
          { id: 'daily', label: 'Today', icon: 'sun' },
        ],
        state.recordsTab,
        setRecordsTab,
      )}
      ${state.recordsTab === 'local' ? localRecords() : state.recordsTab === 'world' ? worldRecords() : dailyRecords()}`,
    undefined,
    'lg',
  );

const achievements = () => {
  const done = new Set(state.profile.achievements);
  return modal(
    `Achievements · ${done.size}/${ACHIEVEMENTS.length}`,
    html`<ul class="achievements">
      ${ACHIEVEMENTS.map(
        (a) => html`<li class=${done.has(a.id) ? 'is-done' : ''}>
          <span class="achievements__icon">${icon(done.has(a.id) ? 'trophy' : 'lock')}</span>
          <span><strong>${a.name}</strong><small>${a.description}</small></span>
        </li>`,
      )}
    </ul>`,
    undefined,
    'lg',
  );
};

const menu = () =>
  modal(
    'Pause',
    html`<p>Your journey is saved automatically. You can continue it later from the title screen.</p>`,
    html`<button class="btn btn--ghost btn--lg" @click=${closeModal}>Resume</button>
      <button class="btn btn--primary btn--lg" @click=${backToMenu}>Back to menu</button>`,
    'sm',
  );

const newGame = () =>
  modal(
    'Start a new journey?',
    html`<p>A journey is in progress. Starting a new one will abandon it.</p>`,
    html`<button class="btn btn--ghost btn--lg" @click=${closeModal}>Cancel</button>
      <button class="btn btn--danger btn--lg" @click=${abandonGameAndChooseFaction}>Abandon and start</button>`,
    'sm',
  );

const newDaily = () =>
  modal(
    "Play today's challenge?",
    html`<p>A journey is in progress. Playing the daily challenge will abandon it.</p>`,
    html`<button class="btn btn--ghost btn--lg" @click=${closeModal}>Cancel</button>
      <button class="btn btn--danger btn--lg" @click=${startDaily}>Abandon and play</button>`,
    'sm',
  );

const share = () => {
  const c = state.shareCard;
  return modal(
    'Share your score',
    html`<div class="share-preview">
      ${c.status === 'ready'
        ? html`<img src=${c.url} alt="Your score card" />`
        : c.status === 'error'
          ? html`<p class="muted">The image could not be created.</p>`
          : html`<div class="share-preview__loading skeleton"></div>`}
    </div>`,
    html`<button class="btn btn--ghost btn--lg" @click=${copyShareText}>${icon('share')} Copy text</button>
      ${canShareImage() ? html`<button class="btn btn--secondary btn--lg" @click=${shareImage}>${icon('share')} Share…</button>` : nothing}
      <a class="btn btn--primary btn--lg ${c.status === 'ready' ? '' : 'is-disabled'}" href=${c.url ?? '#'} download="caravan-score.png">${icon('arrowDown')} Download image</a>`,
    'lg',
  );
};

const item = () => {
  const id = state.game?.merchantItem;
  if (!id) return nothing;
  const def = getMerchantItem(id);
  return modal(
    def.name,
    html`<div class="item-recap"><span class="pick-detail__icon">${itemArt(id)}</span><p>${def.description}</p></div>`,
    undefined,
    'sm',
  );
};

export function modalLayer(): TemplateResult | typeof nothing {
  switch (state.modal) {
    case 'howto':
      return howTo();
    case 'credits':
      return credits();
    case 'records':
      return records();
    case 'achievements':
      return achievements();
    case 'menu':
      return menu();
    case 'newGame':
      return newGame();
    case 'newDaily':
      return newDaily();
    case 'share':
      return share();
    case 'item':
      return item();
    default:
      return nothing;
  }
}
