import { html, nothing, type TemplateResult } from 'lit-html';
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
import { img, itemIcon, powerIcon, resourceIcon } from '../assets';
import { coin, fmt, glyph, num } from './common';
import { backToMenu, dispatch, retryDay, shareScore, startGame, state, update } from '../store';

function overlay(kind: string, content: TemplateResult): TemplateResult {
  return html`<div class="overlay overlay--${kind}" role="dialog" aria-modal="true">
    <div class="overlay__card">${content}</div>
  </div>`;
}

// ------------------------------------------------------------------ Mysterious Merchant

function merchant(g: GameState, stats: Stats): TemplateResult {
  const sel = MERCHANT_ITEMS.find((i) => i.id === state.merchantChoice) ?? MERCHANT_ITEMS[0]!;
  const price = merchantPrice(sel.basePrice, stats);
  const affordable = g.gold >= price;
  return overlay(
    'merchant',
    html`
      <img class="npc-portrait" src=${img('merchant')} alt="The mysterious merchant" />
      <h3 class="ribbon ribbon--purple">A strange merchant appears …</h3>
      <p class="npc-quote">“ Good evening traveler. You may be interested by some of my special products. Take your time… Hehehe… ”</p>
      <div class="pick-list" role="listbox">
        ${MERCHANT_ITEMS.map((item) => {
          const p = merchantPrice(item.basePrice, stats);
          const active = item.id === sel.id;
          return html`<button role="option" aria-selected=${active} class="pick ${active ? 'is-active' : ''} ${g.gold < p ? 'is-poor' : ''}"
            @click=${() => update({ merchantChoice: item.id })}>
            ${glyph(itemIcon(item.id), 'pick__glyph')}
            <span class="pick__name">${item.name}</span>
            <span class="price-pill">${p} ${coin()}</span>
          </button>`;
        })}
      </div>
      <p class="pick-effect"><strong>Effect :</strong> ${sel.description}</p>
      <div class="overlay__actions">
        <button class="btn btn--red" @click=${() => dispatch({ type: 'leaveMerchant' })}>Leave</button>
        <button class="btn btn--green" ?disabled=${!affordable} @click=${() => dispatch({ type: 'buyMerchantItem', itemId: sel.id })}>
          ${affordable ? 'Buy' : 'Not enough gold'}
        </button>
      </div>
    `,
  );
}

// ------------------------------------------------------------------ Old Witch

function witch(): TemplateResult {
  const sel = WITCH_POWERS.find((p) => p.id === state.witchChoice) ?? WITCH_POWERS[0]!;
  return overlay(
    'witch',
    html`
      <img class="npc-portrait" src=${img('witch')} alt="The old witch" />
      <h3 class="ribbon ribbon--olive">An old witch comes close to you</h3>
      <p class="npc-quote">I have watched you traveler. You seem to like gold. But you must learn that every success requires a sacrifice … Hehehe …</p>
      <div class="pick-list" role="listbox">
        ${WITCH_POWERS.map((p) => {
          const active = p.id === sel.id;
          return html`<button role="option" aria-selected=${active} class="pick ${active ? 'is-active' : ''}" @click=${() => update({ witchChoice: p.id })}>
            ${glyph(powerIcon(p.id), 'pick__glyph')}
            <span class="pick__name">${p.name}</span>
          </button>`;
        })}
      </div>
      <div class="bonus-malus">
        <div class="bonus">${sel.bonus}</div>
        <span class="bonus-malus__plus">+</span>
        <div class="malus">${sel.malus}</div>
      </div>
      <div class="overlay__actions">
        <button class="btn btn--green" @click=${() => dispatch({ type: 'chooseWitchPower', powerId: sel.id })}>Choose</button>
      </div>
    `,
  );
}

// ------------------------------------------------------------------ Disaster

function disaster(g: GameState): TemplateResult {
  const d = getDisaster(g.disaster!);
  return overlay(
    'disaster',
    html`
      <h3 class="ribbon ribbon--red">Disaster !</h3>
      <p class="npc-quote">${d.description}</p>
      <div class="malus malus--big">${d.effectText}</div>
      <div class="overlay__actions">
        <button class="btn btn--sand" @click=${() => dispatch({ type: 'acknowledgeDisaster' })}>Continue</button>
      </div>
    `,
  );
}

// ------------------------------------------------------------------ Defeat

function defeat(): TemplateResult {
  return overlay(
    'defeat',
    html`
      <h3 class="end-title end-title--defeat">Defeat</h3>
      <p class="end-text">Your caravan ran out of food… Your traders and camels starved in the desert.</p>
      <p class="end-hint">Info : your traders and camels consume food every day. Anticipate !</p>
      <div class="overlay__actions overlay__actions--column">
        <button class="btn btn--green btn--big" @click=${retryDay}>Try this day again</button>
        <button class="btn btn--ghost" @click=${backToMenu}>Menu</button>
      </div>
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
  const row = (icon: TemplateResult, count: number, unit: number, value: number) =>
    html`<li>${icon}<span class="score-mul">x ${fmt(unit)}</span><span class="score-count">(${count})</span><strong>${fmt(value)}</strong></li>`;

  return overlay(
    'victory',
    html`
      <div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => html`<i style="--i:${i}"></i>`)}</div>
      <h3 class="end-title end-title--victory">Victory</h3>
      <p class="end-text">You won, but now the real question is : was it enough?</p>
      <div class="victory-grid">
        <div>
          <p class="victory-meta">Faction : <strong>${getFaction(g.factionId).name}</strong></p>
          <p class="victory-meta">Difficulty : <strong>${g.mode === 'classical' ? 'Classical' : 'Traveler'}</strong></p>
          <ul class="score-list">
            ${row(glyph(img('trader'), 'score-glyph'), g.traders, CREW_POINTS.trader, s.traders)}
            ${row(glyph(img('camel'), 'score-glyph score-glyph--camel'), g.camels, CREW_POINTS.camel, s.camels)}
            ${RESOURCE_IDS.filter((id) => id !== 'food').map((id) =>
              row(html`<img src=${resourceIcon(id)} alt=${RESOURCES[id].name} />`, g.inventory[id], RESOURCES[id].points, s.resources[id]),
            )}
            ${s.statuette ? row(glyph(itemIcon('wooden-statuette'), 'score-glyph'), g.traders + g.camels, 500, s.statuette) : nothing}
            <li class="score-gold">${coin()}<span class="score-mul">x 1</span><span></span><strong>${fmt(s.gold)}</strong></li>
          </ul>
        </div>
        <div class="victory-side">
          <p class="punchline">${punchline}</p>
          ${r?.newRecord ? html`<p class="new-record">New record!</p>` : nothing}
          ${r?.newlyUnlockedFactions.length
            ? html`<p class="unlocked">Unlocked : ${r.newlyUnlockedFactions.map((id) => getFaction(id).name).join(', ')}</p>`
            : nothing}
          ${r?.newAchievements.length
            ? html`<ul class="new-achievements">
                ${r.newAchievements.map((id) => html`<li>🏆 ${ACHIEVEMENTS.find((x) => x.id === id)?.name ?? id}</li>`)}
              </ul>`
            : nothing}
        </div>
      </div>
      <div class="total-bar">Total : ${num(s.total)}</div>
      <div class="overlay__actions">
        <button class="btn btn--ghost" @click=${backToMenu}>Menu</button>
        <button class="btn btn--sand" @click=${shareScore}><img class="btn-icon" src=${img('share')} alt="" /> Share</button>
        <button class="btn btn--green" @click=${startGame}>Play again</button>
      </div>
    `,
  );
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
