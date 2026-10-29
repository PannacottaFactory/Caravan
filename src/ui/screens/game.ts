import { html, nothing, type TemplateResult } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import {
  capacity,
  computeStats,
  dailyFoodConsumption,
  dailyIncome,
  getFaction,
  getMerchantItem,
  previewBuy,
  previewSell,
  RESOURCE_IDS,
  RESOURCES,
  savingAmount,
  weightCarried,
  type GameState,
  type Stats,
} from '../../engine';
import { img, itemIcon, resourceIcon } from '../assets';
import { coin, fmt, glyph, holdRepeat, num } from '../components/common';
import { backButton } from '../components/topbar';
import { eventOverlay } from '../components/events';
import { changeDraft, dispatch, openModal, setTab, state, type Tab } from '../store';

// ------------------------------------------------------------------ HUD

function hud(g: GameState, stats: Stats): TemplateResult {
  const weight = weightCarried(g, stats);
  const cap = capacity(g, stats);
  const ratio = cap > 0 ? Math.min(1, weight / cap) : 1;
  const lastDay = g.day >= g.maxDay;
  const food = lastDay ? 0 : dailyFoodConsumption(g, stats);

  return html`
    <div class="hud">
      <div class="hud-card hud-card--gold">
        <span class="hud-card__label">Gold <img src=${img('coin-small')} alt="" /></span>
        <strong class="hud-card__value">${num(g.gold)}</strong>
        <span class="hud-card__sub">(+${fmt(dailyIncome(g, stats))})</span>
      </div>
      <div class="hud-card">
        <span class="hud-card__label">Weight</span>
        <strong class="hud-card__value hud-card__value--small ${weight > cap ? 'is-over' : ''}">${num(weight)}/${fmt(cap)}</strong>
        <div class="weight-bar ${ratio > 0.9 ? 'is-full' : ''}"><i style="width:${ratio * 100}%"></i></div>
      </div>
      <div class="hud-card">
        <span class="hud-card__label">Food</span>
        <strong class="hud-card__value hud-card__value--icon">${num(g.inventory.food)}<img src=${resourceIcon('food')} alt="" /></strong>
        <span class="hud-card__sub ${!lastDay && food > g.inventory.food ? 'is-danger' : 'is-food'}">(-${food})</span>
      </div>
      <div class="hud-card hud-card--crew">
        <span class="hud-card__label">Crew</span>
        <span class="crew-line">${num(g.traders)} ${glyph(img('trader'), 'crew-glyph')}</span>
        <span class="crew-line">${num(g.camels)} ${glyph(img('camel'), 'crew-glyph crew-glyph--camel')}</span>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------ trade tables (buy / sell)

function qtyControl(kind: 'buy' | 'sell', id: (typeof RESOURCE_IDS)[number], value: number): TemplateResult {
  return html`<div class="qty">
    <button class="qty__btn qty__btn--minus" aria-label="Less" ?disabled=${value === 0}
      @pointerdown=${holdRepeat(() => changeDraft(kind, id, -1))}></button>
    <span class="qty__value">${value}</span>
    <button class="qty__btn qty__btn--plus" aria-label="More"
      @pointerdown=${holdRepeat(() => changeDraft(kind, id, 1))}></button>
  </div>`;
}

function buyPanel(g: GameState, stats: Stats): TemplateResult {
  const draft = state.buyDraft;
  const p = previewBuy(g, draft);
  const goldBad = p.cost > g.gold;
  const weightBad = p.weight > 0 && weightCarried(g, stats) + p.weight > capacity(g, stats);
  return html`
    <div class="trade">
      <div class="trade__head">
        <h3 class="pill-title pill-title--blue">Buy</h3>
        <div class="totals">
          <span class="total total--blue ${goldBad ? 'is-bad' : ''}">${p.cost ? `-${fmt(p.cost)}` : 0}</span>
          <span class="total total--gold ${weightBad ? 'is-bad' : ''}">${p.weight ? `+${fmt(p.weight)}` : 0}</span>
        </div>
      </div>
      <div class="trade__table" role="table">
        <div class="trade__row trade__row--header" role="row">
          <span></span><span>Owned</span><span>Price</span><span>Weight</span><span>Quantity</span><span>Cost</span><span>Weight</span>
        </div>
        ${RESOURCE_IDS.map((id) => {
          const r = stats.resource[id];
          const q = draft[id] ?? 0;
          return html`<div class="trade__row ${q ? 'is-active' : ''}" role="row">
            <img class="res-icon" src=${resourceIcon(id)} alt=${RESOURCES[id].name} title=${RESOURCES[id].name} />
            <span class="cell-owned">${g.inventory[id] + q}</span>
            <span class="cell-price">${fmt(r.buyPrice)}${coin()}</span>
            <span>${r.unitWeight}</span>
            ${qtyControl('buy', id, q)}
            <span class="cell-box cell-box--blue">${fmt(q * r.buyPrice)}</span>
            <span class="cell-box cell-box--gold">${q * r.unitWeight}</span>
          </div>`;
        })}
      </div>
      <button class="btn btn--green btn--big trade__go" @click=${() => dispatch({ type: 'buy', quantities: draft })}>Buy now</button>
    </div>
  `;
}

function sellPanel(g: GameState, stats: Stats): TemplateResult {
  const draft = state.sellDraft;
  const p = previewSell(g, draft);
  return html`
    <div class="trade">
      <div class="trade__head">
        <h3 class="pill-title pill-title--orange">Sell</h3>
        <div class="totals">
          <span class="total total--green">${p.earnings ? `+${fmt(p.earnings)}` : 0}</span>
          <span class="total total--gold">${p.weight ? `-${fmt(p.weight)}` : 0}</span>
        </div>
      </div>
      <div class="trade__table" role="table">
        <div class="trade__row trade__row--header" role="row">
          <span></span><span>Owned</span><span>Price</span><span>Weight</span><span>Quantity</span><span>Earns</span><span>Weight</span>
        </div>
        ${RESOURCE_IDS.map((id) => {
          const r = stats.resource[id];
          const q = draft[id] ?? 0;
          return html`<div class="trade__row ${q ? 'is-active' : ''} ${g.inventory[id] === 0 ? 'is-empty' : ''}" role="row">
            <img class="res-icon" src=${resourceIcon(id)} alt=${RESOURCES[id].name} title=${RESOURCES[id].name} />
            <span class="cell-owned">${g.inventory[id] - q}</span>
            <span class="cell-price">${fmt(r.sellPrice)}${coin()}</span>
            <span>${r.unitWeight}</span>
            ${qtyControl('sell', id, q)}
            <span class="cell-box cell-box--green">${fmt(q * r.sellPrice)}</span>
            <span class="cell-box cell-box--gold">${q ? `-${q * r.unitWeight}` : 0}</span>
          </div>`;
        })}
      </div>
      ${stats.global.sellBonus ? html`<p class="panel-note">Hand of Midas: +${stats.global.sellBonus} gold on every sale</p>` : nothing}
      <button class="btn btn--green btn--big trade__go" @click=${() => dispatch({ type: 'sell', quantities: draft })}>Sell now</button>
    </div>
  `;
}

// ------------------------------------------------------------------ crew & save

function crewPanel(_g: GameState, stats: Stats): TemplateResult {
  const s = stats.global;
  return html`
    <div class="crew">
      <h3 class="pill-title pill-title--sand">Manage your crew</h3>
      <div class="crew__choices">
        <div class="crew-choice">
          <div class="crew-choice__circle">${glyph(img('trader'), 'crew-choice__glyph')}<span class="plus">+</span></div>
          <div class="crew-choice__cost">${s.traderCost} ${coin()}</div>
          <p>Recruit a trader to earn <strong>${s.traderIncome}</strong> gold everyday</p>
          <button class="btn btn--green" @click=${() => dispatch({ type: 'recruit' })}>Recruit</button>
        </div>
        <div class="crew__or">OR</div>
        <div class="crew-choice">
          <div class="crew-choice__circle">${glyph(img('camel'), 'crew-choice__glyph crew-choice__glyph--camel')}<span class="plus">+</span></div>
          <div class="crew-choice__cost">${s.camelCost} ${coin()}</div>
          <p>Add a camel to increase your maximum weight by <strong>${s.camelLoad}</strong></p>
          <button class="btn btn--green" @click=${() => dispatch({ type: 'addCamel' })}>Add</button>
        </div>
      </div>
      <p class="panel-note panel-note--warn">Info : traders and camels each consume ${s.traderFood === s.camelFood ? s.traderFood : 'some'} food per day</p>
    </div>
  `;
}

function savePanel(g: GameState, stats: Stats): TemplateResult {
  const next = Math.max(10, g.savingRate - stats.global.savingDecay);
  return html`
    <div class="save">
      <h3 class="pill-title pill-title--gold">Save your gold</h3>
      <div class="save__body">
        <img class="save__coin" src=${img('coin')} alt="" />
        <p class="save__rate">Earn <strong>${g.savingRate}%</strong> of your current gold</p>
        <p class="save__amount">+${num(savingAmount(g))} ${coin()}</p>
        <p class="panel-note">
          ${stats.global.savingDecay === 0 ? 'Your saving rate never decreases.' : `After saving, your rate drops to ${next}%.`}
        </p>
      </div>
      <div class="save__actions">
        ${g.saveOnceAvailable
          ? html`<button class="btn btn--gold" @click=${() => dispatch({ type: 'saveOnce' })} title="Sanctifan: free save, no day spent">
              Save once (free)
            </button>`
          : nothing}
        <button class="btn btn--green btn--big" @click=${() => dispatch({ type: 'save' })}>Save</button>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------ screen

const TABS: { id: Tab; label: string }[] = [
  { id: 'buy', label: 'Buy' },
  { id: 'sell', label: 'Sell' },
  { id: 'crew', label: 'Crew' },
  { id: 'save', label: 'Save gold' },
];

export function gameScreen(): TemplateResult {
  const g = state.game!;
  const stats = computeStats(g);
  const lastDay = g.day >= g.maxDay;
  const panels: Record<Tab, () => TemplateResult> = {
    buy: () => buyPanel(g, stats),
    sell: () => sellPanel(g, stats),
    crew: () => crewPanel(g, stats),
    save: () => savePanel(g, stats),
  };

  return html`
    <section class="screen game-screen">
      <header class="game-top">
        ${backButton(() => openModal('menu'), 'Menu')}
        <h2 class="day-title">${lastDay ? 'Last day !' : html`Day ${g.day}/${g.maxDay}`}</h2>
        <div class="game-top__right">
          ${g.canCallMerchant
            ? html`<button class="chip-btn" @click=${() => dispatch({ type: 'callMerchant' })}>
                <img src=${img('merchant')} alt="" /> Call the merchant
              </button>`
            : nothing}
          ${g.merchantItem
            ? html`<button class="chip-btn chip-btn--item" @click=${() => openModal('item')} title=${getMerchantItem(g.merchantItem).name}>
                ${glyph(itemIcon(g.merchantItem), 'chip-glyph')}
              </button>`
            : nothing}
          <span class="faction-badge">${getFaction(g.factionId).name}</span>
        </div>
      </header>

      ${hud(g, stats)}

      <div class="game-body">
        <nav class="tabs" aria-label="Actions">
          ${TABS.map(
            (t) => html`<button class="tab ${state.tab === t.id ? 'is-active' : ''}" aria-pressed=${state.tab === t.id} @click=${() => setTab(t.id)}>
              ${t.label}
            </button>`,
          )}
        </nav>
        <div class="panel action-panel">${keyed(state.tab, html`<div class="panel-anim">${panels[state.tab]()}</div>`)}</div>
      </div>

      ${keyed(state.dayBanner, html`<div class="day-banner" aria-live="polite"><span>${lastDay ? 'Last day !' : `Day ${g.day}`}</span></div>`)}
      ${eventOverlay(g, stats)}
    </section>
  `;
}
