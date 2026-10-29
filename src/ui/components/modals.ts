import { html, nothing, type TemplateResult } from 'lit-html';
import { ACHIEVEMENTS, bestScore, FACTIONS, getMerchantItem, isFactionUnlocked } from '../../engine';
import { itemIcon } from '../assets';
import { fmt, glyph } from './common';
import { abandonGameAndChooseFaction, backToMenu, closeModal, state } from '../store';

function modal(title: string, body: TemplateResult, actions?: TemplateResult, wide = false): TemplateResult {
  const onBackdrop = (e: Event): void => {
    if (e.target === e.currentTarget) closeModal();
  };
  return html`<div class="overlay overlay--modal" role="dialog" aria-modal="true" aria-label=${title} @click=${onBackdrop}>
    <div class="overlay__card modal ${wide ? 'modal--wide' : ''}">
      <button class="modal__close" @click=${closeModal} aria-label="Close">×</button>
      <h3 class="modal__title">${title}</h3>
      <div class="modal__body">${body}</div>
      ${actions ? html`<div class="overlay__actions">${actions}</div>` : nothing}
    </div>
  </div>`;
}

const howTo = () =>
  modal(
    'How to play',
    html`
      <p>Hey you! Aren't you a famous trader? Your goal is to be the richest trader of your Faction at the end of the last day.</p>
      <p>To accomplish this, every day you can choose <strong>ONE</strong> action :</p>
      <ul class="howto-list">
        <li>Buy resources with your gold</li>
        <li>Sell them at better price</li>
        <li>Recruit a trader who earns gold everyday</li>
        <li>Add a camel to your caravan to increase your load capacity</li>
        <li>Save money</li>
      </ul>
      <p class="howto-warn">But be careful : camels and traders each need one food to travel. Manage your resources carefully!</p>
      <p>At the end, your score is your gold plus the value of your goods and your crew.</p>
    `,
    html`<button class="btn btn--green" @click=${closeModal}>Good luck merchant!</button>`,
  );

const credits = () =>
  modal(
    'Credits',
    html`<div class="credits">
      <p><small>Designer / Developer / Graphics</small><br /><strong>Victor Roudaut</strong></p>
      <p><small>Music</small><br /><strong>Tyler Cline</strong></p>
      <p>Big thanks to all my testers who made a lot for Caravan ❤</p>
    </div>`,
  );

const records = () =>
  modal(
    'Best scores',
    html`<table class="records">
      <thead><tr><th>Faction</th><th>Classical</th><th>Traveler</th></tr></thead>
      <tbody>
        ${FACTIONS.map((f) => {
          const open = isFactionUnlocked(state.profile, f.id);
          return html`<tr class=${open ? '' : 'is-locked'}>
            <td>${open ? f.name : '???'}</td>
            <td>${fmt(bestScore(state.profile, f.id, 'classical'))}</td>
            <td>${fmt(bestScore(state.profile, f.id, 'traveler'))}</td>
          </tr>`;
        })}
      </tbody>
    </table>`,
    undefined,
    true,
  );

const achievements = () => {
  const done = new Set(state.profile.achievements);
  return modal(
    `Achievements ${done.size}/${ACHIEVEMENTS.length}`,
    html`<ul class="achievements">
      ${ACHIEVEMENTS.map(
        (a) => html`<li class=${done.has(a.id) ? 'is-done' : ''}>
          <span class="achievement__icon">${done.has(a.id) ? '🏆' : '🔒'}</span>
          <span><strong>${a.name}</strong><small>${a.description}</small></span>
        </li>`,
      )}
    </ul>`,
    undefined,
    true,
  );
};

const menu = () =>
  modal(
    'Back to menu?',
    html`<p>Your journey is saved. You can continue it later from the title screen.</p>`,
    html`<button class="btn btn--ghost" @click=${closeModal}>No</button>
      <button class="btn btn--green" @click=${backToMenu}>Yes</button>`,
  );

const newGame = () =>
  modal(
    'Start a new journey?',
    html`<p>A journey is in progress. Starting a new one will abandon it.</p>`,
    html`<button class="btn btn--ghost" @click=${closeModal}>Cancel</button>
      <button class="btn btn--red" @click=${abandonGameAndChooseFaction}>New journey</button>`,
  );

const item = () => {
  const id = state.game?.merchantItem;
  if (!id) return nothing;
  const def = getMerchantItem(id);
  return modal(
    def.name,
    html`<div class="item-recap">${glyph(itemIcon(id), 'item-recap__glyph')}<p><strong>Effect :</strong> ${def.description}</p></div>`,
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
    case 'item':
      return item();
    default:
      return nothing;
  }
}
