import { html, nothing, type TemplateResult } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import {
  ACHIEVEMENTS,
  CREW_POINTS,
  getDisaster,
  getFaction,
  MERCHANT_ITEMS,
  merchantPrice,
  RESOURCE_IDS,
  RESOURCES,
  WITCH_POWERS,
  type GameState,
  type Stats,
} from '../../engine';
import { img } from '../assets';
import { disasterArt, itemArt, powerArt } from '../art';
import { camelArt, coinArt, icon, resourceArt, traderArt } from '../icons';
import { fmt, num } from './common';
import { crest } from './ui';
import { backToMenu, dispatch, openRecords, retryDay, shareScore, startGame, state, submitCurrentScore, update } from '../store';

function dialog(kind: string, content: TemplateResult): TemplateResult {
  return html`<div class="overlay overlay--${kind}" role="dialog" aria-modal="true">
    <div class="dialog dialog--${kind}">${content}</div>
  </div>`;
}

function npcHeader(portrait: string, eyebrow: string, title: string, quote: string): TemplateResult {
  return html`<header class="npc">
    <div class="npc__portrait"><img src=${portrait} alt="" /></div>
    <div>
      <p class="dialog__eyebrow">${eyebrow}</p>
      <h3 class="dialog__title">${title}</h3>
      <p class="npc__quote">“${quote}”</p>
    </div>
  </header>`;
}

// ------------------------------------------------------------------ Mysterious Merchant

function merchant(g: GameState, stats: Stats): TemplateResult {
  const sel = MERCHANT_ITEMS.find((i) => i.id === state.merchantChoice) ?? MERCHANT_ITEMS[0]!;
  const price = merchantPrice(sel.basePrice, stats);
  const affordable = g.gold >= price;
  return dialog(
    'merchant',
    html`
      ${npcHeader(img('merchant'), 'A strange merchant appears…', 'The Mysterious Merchant',
        'Good evening traveler. You may be interested by some of my special products. Take your time… Hehehe…')}
      <div class="dialog__body dialog__body--split">
        <div class="pick-grid" role="listbox" aria-label="Artifacts">
          ${MERCHANT_ITEMS.map((item) => {
            const p = merchantPrice(item.basePrice, stats);
            const active = item.id === sel.id;
            return html`<button role="option" aria-selected=${active} class="pick ${active ? 'is-active' : ''} ${g.gold < p ? 'is-poor' : ''}"
              @click=${() => update({ merchantChoice: item.id })}>
              <span class="pick__icon">${itemArt(item.id)}</span>
              <span class="pick__name">${item.name}</span>
              <span class="pick__price">${p}${coinArt('pick__coin')}</span>
            </button>`;
          })}
        </div>
        <div class="pick-detail">
          ${keyed(sel.id, html`<span class="pick-detail__icon">${itemArt(sel.id)}</span>`)}
          <h4>${sel.name}</h4>
          <p>${sel.description}</p>
          <p class="pick-detail__price">${price}${coinArt('pick__coin')} <small>you have ${fmt(g.gold)}</small></p>
        </div>
      </div>
      <footer class="dialog__actions">
        <button class="btn btn--ghost btn--lg" @click=${() => dispatch({ type: 'leaveMerchant' })}>Leave</button>
        <button class="btn btn--primary btn--lg" ?disabled=${!affordable} @click=${() => dispatch({ type: 'buyMerchantItem', itemId: sel.id })}>
          ${affordable ? html`Buy ${sel.name}` : 'Not enough gold'}
        </button>
      </footer>
    `,
  );
}

// ------------------------------------------------------------------ Old Witch

function witch(): TemplateResult {
  const sel = WITCH_POWERS.find((p) => p.id === state.witchChoice) ?? WITCH_POWERS[0]!;
  return dialog(
    'witch',
    html`
      ${npcHeader(img('witch'), 'An old witch comes close to you', 'The Old Witch',
        'I have watched you traveler. You seem to like gold. But you must learn that every success requires a sacrifice… Hehehe…')}
      <div class="dialog__body dialog__body--split">
        <div class="pick-grid" role="listbox" aria-label="Powers">
          ${WITCH_POWERS.map((p) => {
            const active = p.id === sel.id;
            return html`<button role="option" aria-selected=${active} class="pick ${active ? 'is-active' : ''}" @click=${() => update({ witchChoice: p.id })}>
              <span class="pick__icon">${powerArt(p.id)}</span>
              <span class="pick__name">${p.name}</span>
            </button>`;
          })}
        </div>
        <div class="pick-detail">
          ${keyed(sel.id, html`<span class="pick-detail__icon">${powerArt(sel.id)}</span>`)}
          <h4>${sel.name}</h4>
          <div class="tradeoff">
            <p class="tradeoff__gain">${icon('arrowUp')} ${sel.bonus}</p>
            <p class="tradeoff__cost">${icon('arrowDown')} ${sel.malus}</p>
          </div>
        </div>
      </div>
      <footer class="dialog__actions">
        <span class="muted small">You must choose one.</span>
        <button class="btn btn--primary btn--lg" @click=${() => dispatch({ type: 'chooseWitchPower', powerId: sel.id })}>Accept ${sel.name}</button>
      </footer>
    `,
  );
}

// ------------------------------------------------------------------ Disaster

function disaster(g: GameState): TemplateResult {
  const d = getDisaster(g.disaster!);
  return dialog(
    'disaster',
    html`
      <div class="alert-icon alert-icon--art">${disasterArt(d.id)}</div>
      <p class="dialog__eyebrow">Disaster</p>
      <h3 class="dialog__title">Bad news, traveler</h3>
      <p class="dialog__text">${d.description}</p>
      <p class="tradeoff__cost tradeoff__cost--big">${icon('arrowDown')} ${d.effectText}</p>
      <footer class="dialog__actions dialog__actions--center">
        <button class="btn btn--primary btn--lg" @click=${() => dispatch({ type: 'acknowledgeDisaster' })}>Continue</button>
      </footer>
    `,
  );
}

// ------------------------------------------------------------------ Defeat

function defeat(): TemplateResult {
  return dialog(
    'defeat',
    html`
      <div class="alert-icon alert-icon--bad">${icon('skull')}</div>
      <p class="dialog__eyebrow">Defeat</p>
      <h3 class="dialog__title">Your caravan starved</h3>
      <p class="dialog__text">Your traders and camels ran out of food in the middle of the desert.</p>
      <p class="muted small">Traders and camels eat every day. Always keep enough food for tonight!</p>
      <footer class="dialog__actions dialog__actions--center">
        <button class="btn btn--ghost btn--lg" @click=${backToMenu}>Menu</button>
        <button class="btn btn--primary btn--lg" @click=${retryDay}>${icon('refresh')} Try this day again</button>
      </footer>
    `,
  );
}

// ------------------------------------------------------------------ Victory

const PUNCHLINES = [
  "That's all? I'm sure you can do better!",
  'Not bad. For a beginner.',
  "Did you meet the mysterious merchant? He is... Special, isn't it?",
  'Did I see you stealing money from that old trader? You better not being cheating!',
  'Congrats, you really know how to take care of camels!',
  'Sorry to tell you that but everyone loves you because of your money.',
  "Look at your gold! It's too much for one person. Give me some.",
  "That was a nice score. I'm impressed. And i'm almost serious.",
  'You are almost as rich as the King of Bajaar!',
  'If an Old Witch asks you to make a sacrifice, you should do it!',
  'Did you beat your best score? Challenge your friends!',
  "Please don't make a higher score than the developer of this game. He will be disappointed.",
  "Don't be afraid to try different strategies. The craziest may be very effective...",
];

function victory(g: GameState): TemplateResult {
  const s = g.score!;
  const r = state.lastResult;
  const punchline = PUNCHLINES[Math.abs(g.seed) % PUNCHLINES.length];
  let i = 0;
  const row = (art: TemplateResult, label: string, count: number, unit: number, value: number) =>
    html`<li style="--d:${i++}">
      <span class="score__art">${art}</span><span class="score__label">${label}<small>${count} × ${fmt(unit)}</small></span>
      <strong>${fmt(value)}</strong>
    </li>`;

  return dialog(
    'victory',
    html`
      <div class="confetti" aria-hidden="true">${Array.from({ length: 24 }, (_, k) => html`<i style="--i:${k}"></i>`)}</div>
      <div class="victory">
        <div class="victory__side">
          ${crest(g.factionId, 'crest--lg')}
          <p class="dialog__eyebrow">Journey complete</p>
          <h3 class="victory__title">Victory</h3>
          <p class="muted">${getFaction(g.factionId).name} · ${g.mode === 'classical' ? 'Classical' : 'Traveler'}</p>
          <div class="victory__total">
            <span>Total score</span>
            <strong>${num(s.total)}</strong>
            ${r?.newRecord ? html`<span class="record-badge">${icon('crown')} New record</span>` : nothing}
          </div>
          <p class="punchline">${punchline}</p>
        </div>
        <div class="victory__main">
          <ul class="score">
            ${row(coinArt(), 'Gold', s.gold, 1, s.gold)}
            ${row(html`<span class="score__crew">${traderArt()}</span>`, 'Traders', g.traders, CREW_POINTS.trader, s.traders)}
            ${row(html`<span class="score__crew">${camelArt()}</span>`, 'Camels', g.camels, CREW_POINTS.camel, s.camels)}
            ${RESOURCE_IDS.filter((id) => id !== 'food' && g.inventory[id] > 0).map((id) =>
              row(resourceArt(id), RESOURCES[id].name, g.inventory[id], RESOURCES[id].points, s.resources[id]),
            )}
            ${s.statuette ? row(itemArt('wooden-statuette'), 'Wooden statuette', g.traders + g.camels, 500, s.statuette) : nothing}
          </ul>
          ${r?.newlyUnlockedFactions.length || r?.newAchievements.length
            ? html`<div class="unlocks">
                ${r.newlyUnlockedFactions.map((id) => html`<span class="unlock-chip">${crest(id, 'crest--xs')} ${getFaction(id).name} unlocked</span>`)}
                ${r.newAchievements.map((id) => html`<span class="unlock-chip unlock-chip--gold">${icon('trophy')} ${ACHIEVEMENTS.find((x) => x.id === id)?.name ?? id}</span>`)}
              </div>`
            : nothing}
          ${onlineSubmit(g)}
          <footer class="dialog__actions">
            <button class="btn btn--ghost btn--lg" @click=${backToMenu}>Menu</button>
            <button class="btn btn--secondary btn--lg" @click=${shareScore}>${icon('share')} Share</button>
            <button class="btn btn--primary btn--lg" @click=${startGame}>${icon('refresh')} Play again</button>
          </footer>
        </div>
      </div>
    `,
  );
}

function onlineSubmit(g: GameState): TemplateResult {
  const sub = state.submission.seed === g.seed ? state.submission : { status: 'idle' as const, rank: undefined, error: undefined };
  const board = `${getFaction(g.factionId).name} · ${g.mode === 'classical' ? 'Classical' : 'Traveler'}`;
  if (sub.status === 'done') {
    return html`<div class="online online--done">
      <span class="online__icon">${icon('podium')}</span>
      <span>You are <strong>#${sub.rank}</strong> on the ${board} leaderboard</span>
      <button class="btn btn--ghost btn--sm" @click=${() => openRecords('world', g.factionId, g.mode)}>View</button>
    </div>`;
  }
  const sending = sub.status === 'sending';
  const onSubmit = (e: Event): void => {
    e.preventDefault();
    const input = (e.currentTarget as HTMLFormElement).elements.namedItem('player') as HTMLInputElement;
    void submitCurrentScore(input.value);
  };
  return html`<form class="online" @submit=${onSubmit}>
    <span class="online__icon">${icon('podium')}</span>
    <div class="online__body">
      <label for="player-name">Online leaderboard · ${board}</label>
      <div class="online__row">
        <input id="player-name" name="player" class="input" maxlength="20" autocomplete="nickname" placeholder="Your name"
          .value=${state.settings.playerName} ?disabled=${sending} />
        <button class="btn btn--secondary" type="submit" ?disabled=${sending}>${sending ? 'Sending…' : 'Submit score'}</button>
      </div>
      ${sub.status === 'error' ? html`<p class="online__error">${sub.error}</p>` : nothing}
    </div>
  </form>`;
}

// ------------------------------------------------------------------

export function eventOverlay(g: GameState, stats: Stats): TemplateResult | typeof nothing {
  switch (g.phase) {
    case 'merchant':
      return merchant(g, stats);
    case 'witch':
      return witch();
    case 'disaster':
      return disaster(g);
    case 'defeat':
      return defeat();
    case 'victory':
      return victory(g);
    default:
      return nothing;
  }
}
