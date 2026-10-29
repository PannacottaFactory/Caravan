import { html, nothing, type TemplateResult } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';
import {
  capacity,
  computeStats,
  dailyFoodConsumption,
  dailyIncome,
  ERROR_MESSAGES,
  getFaction,
  getMerchantItem,
  merchantArrivesTomorrow,
  previewBuy,
  previewSell,
  RESOURCE_IDS,
  RESOURCES,
  savingAmount,
  weightCarried,
  type GameState,
  type ResourceId,
  type Stats,
} from '../../engine';
import { itemIcon } from '../assets';
import { fmt, glyph, holdRepeat, num } from '../components/common';
import { eventOverlay } from '../components/events';
import { crest, iconButton, segmented } from '../components/ui';
import { camelArt, coinArt, icon, resourceArt, traderArt } from '../icons';
import { changeDraft, dispatch, maxQuantity, openModal, setTab, state, toggleMax, type Tab } from '../store';
import { soundToggle } from './title';

// ------------------------------------------------------------------ header: journey timeline

function timeline(g: GameState): TemplateResult {
  const days = Array.from({ length: g.maxDay }, (_, i) => i + 1);
  const progress = g.maxDay > 1 ? (g.day - 1) / (g.maxDay - 1) : 1;
  const warn = merchantArrivesTomorrow(g);
  return html`<div class="timeline" style="--progress:${progress}" aria-label="Day ${g.day} of ${g.maxDay}">
    <div class="timeline__label">
      <strong>${g.day >= g.maxDay ? 'Last day' : `Day ${g.day}`}</strong><span>of ${g.maxDay}</span>
    </div>
    <div class="timeline__track">
      <div class="timeline__fill"></div>
      ${days.map(
        (d) => html`<span class="timeline__dot ${d < g.day ? 'is-past' : ''} ${d === g.day ? 'is-today' : ''}
          ${warn && d === g.day + 1 ? 'is-merchant' : ''}" title=${warn && d === g.day + 1 ? 'A strange merchant is coming…' : `Day ${d}`}></span>`,
      )}
      <span class="timeline__caravan">${camelArt()}</span>
    </div>
  </div>`;
}

// ------------------------------------------------------------------ sidebar stats

function sidebar(g: GameState, stats: Stats): TemplateResult {
  const weight = weightCarried(g, stats);
  const cap = capacity(g, stats);
  const ratio = cap > 0 ? Math.min(1, weight / cap) : 1;
  const lastDay = g.day >= g.maxDay;
  const eat = lastDay ? 0 : dailyFoodConsumption(g, stats);
  const daysLeft = eat > 0 ? Math.floor(g.inventory.food / eat) : Infinity;
  const danger = !lastDay && eat > g.inventory.food;
  const goods = RESOURCE_IDS.filter((id) => id !== 'food' && g.inventory[id] > 0);

  return html`<aside class="game-sidebar">
    <div class="stat stat--gold">
      ${coinArt('stat__art')}
      <div class="stat__body">
        <span class="stat__label">Gold</span>
        <strong class="stat__value">${num(g.gold)}</strong>
        <span class="stat__delta stat__delta--up">${icon('arrowUp')} ${fmt(dailyIncome(g, stats))} per day</span>
      </div>
    </div>

    <div class="stat">
      <span class="stat__icon">${icon('weight')}</span>
      <div class="stat__body">
        <span class="stat__label">Cargo</span>
        <strong class="stat__value stat__value--md ${weight > cap ? 'is-bad' : ''}">${num(weight)}<small> / ${fmt(cap)}</small></strong>
        <div class="meter ${ratio > 0.9 ? 'is-hot' : ''}"><i style="transform:scaleX(${ratio})"></i></div>
      </div>
    </div>

    <div class="stat ${danger ? 'stat--danger' : ''}">
      <span class="stat__icon stat__icon--art">${resourceArt('food')}</span>
      <div class="stat__body">
        <span class="stat__label">Food</span>
        <strong class="stat__value stat__value--md">${num(g.inventory.food)}</strong>
        <span class="stat__delta ${danger ? 'stat__delta--bad' : ''}">
          ${lastDay ? 'No food needed today' : danger ? 'Not enough for tonight!' : `−${eat} per day · ${Number.isFinite(daysLeft) ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : 'no need'}`}
        </span>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat stat--small">
        <span class="stat__icon stat__icon--crew">${traderArt()}</span>
        <div class="stat__body"><span class="stat__label">Traders</span><strong class="stat__value stat__value--md">${num(g.traders)}</strong></div>
      </div>
      <div class="stat stat--small">
        <span class="stat__icon stat__icon--crew">${camelArt()}</span>
        <div class="stat__body"><span class="stat__label">Camels</span><strong class="stat__value stat__value--md">${num(g.camels)}</strong></div>
      </div>
    </div>

    <div class="stat stat--small">
      <span class="stat__icon">${icon('piggy')}</span>
      <div class="stat__body"><span class="stat__label">Saving rate</span><strong class="stat__value stat__value--md">${g.savingRate}%</strong></div>
    </div>

    <div class="inventory">
      <span class="stat__label">Goods</span>
      ${goods.length
        ? html`<ul>${goods.map((id) => html`<li>${resourceArt(id, 'inventory__art')}<span>${RESOURCES[id].name}</span><strong>${g.inventory[id]}</strong></li>`)}</ul>`
        : html`<p class="muted small">Your caravan carries no goods yet.</p>`}
    </div>
  </aside>`;
}

// ------------------------------------------------------------------ market (buy / sell)

function stepper(kind: 'buy' | 'sell', id: ResourceId, value: number): TemplateResult {
  const max = maxQuantity(kind, id);
  return html`<div class="stepper">
    <button class="stepper__btn" aria-label="Less" ?disabled=${value === 0} @pointerdown=${holdRepeat(() => changeDraft(kind, id, -1))}>${icon('minus')}</button>
    <span class="stepper__value ${value ? 'is-set' : ''}">${value}</span>
    <button class="stepper__btn" aria-label="More" ?disabled=${value >= max} @pointerdown=${holdRepeat(() => changeDraft(kind, id, 1))}>${icon('plus')}</button>
    <button class="stepper__max ${value > 0 && value === max ? 'is-on' : ''}" ?disabled=${max === 0} @click=${() => toggleMax(kind, id)}>Max</button>
  </div>`;
}

function market(kind: 'buy' | 'sell', g: GameState, stats: Stats): TemplateResult {
  const draft = kind === 'buy' ? state.buyDraft : state.sellDraft;
  return html`<div class="market">
    <div class="market__row market__row--head">
      <span>Goods</span><span>${kind === 'buy' ? 'Price' : 'Sells for'}</span><span>Weight</span><span>Quantity</span><span>${kind === 'buy' ? 'Cost' : 'Earnings'}</span>
    </div>
    ${RESOURCE_IDS.map((id) => {
      const r = stats.resource[id];
      const q = draft[id] ?? 0;
      const price = kind === 'buy' ? r.buyPrice : r.sellPrice;
      const owned = g.inventory[id];
      return html`<div class="market__row ${q ? 'is-active' : ''} ${kind === 'sell' && owned === 0 ? 'is-empty' : ''}">
        <span class="good">
          ${resourceArt(id, 'good__art')}
          <span class="good__text"><strong>${RESOURCES[id].name}</strong><small>Owned ${owned}${q ? html` <em>${kind === 'buy' ? '+' : '−'}${q}</em>` : nothing}</small></span>
        </span>
        <span class="price">${fmt(price)}${coinArt('price__coin')}</span>
        <span class="weight">${r.unitWeight}<small>kg</small></span>
        ${stepper(kind, id, q)}
        <span class="subtotal ${q ? 'is-set' : ''}">${q ? `${kind === 'buy' ? '−' : '+'}${fmt(q * price)}` : '—'}</span>
      </div>`;
    })}
  </div>`;
}

function marketFooter(kind: 'buy' | 'sell', g: GameState, stats: Stats): TemplateResult {
  const weight = weightCarried(g, stats);
  const cap = capacity(g, stats);
  if (kind === 'buy') {
    const p = previewBuy(g, state.buyDraft);
    const empty = p.error === 'nothingToBuy';
    return actionBar(
      html`${change('Gold', g.gold, g.gold - p.cost, p.error === 'notEnoughGold')}
        ${change('Cargo', weight, weight + p.weight, p.error === 'notEnoughCapacity', ` / ${fmt(cap)}`)}`,
      empty ? { text: 'Select goods to buy', error: false } : p.error ? { text: ERROR_MESSAGES[p.error], error: true } : null,
      html`${icon('cart')} Buy`,
      !p.error,
      () => dispatch({ type: 'buy', quantities: state.buyDraft }),
    );
  }
  const p = previewSell(g, state.sellDraft);
  const empty = p.error === 'nothingToSell';
  return actionBar(
    html`${change('Gold', g.gold, g.gold + p.earnings, false)} ${change('Cargo', weight, weight - p.weight, false, ` / ${fmt(cap)}`)}
      ${stats.global.sellBonus ? html`<span class="bonus-chip">${glyph(itemIcon('hand-of-midas'))} +${stats.global.sellBonus} Midas</span>` : nothing}`,
    empty ? { text: 'Select goods to sell', error: false } : p.error ? { text: ERROR_MESSAGES[p.error], error: true } : null,
    html`${icon('coins')} Sell`,
    !p.error,
    () => dispatch({ type: 'sell', quantities: state.sellDraft }),
  );
}

function change(label: string, from: number, to: number, bad: boolean, suffix = ''): TemplateResult {
  const dir = to > from ? 'up' : to < from ? 'down' : 'same';
  return html`<span class="change change--${dir} ${bad ? 'is-bad' : ''}">
    <span class="change__label">${label}</span>
    <span class="change__values">${fmt(from)}${dir === 'same' ? nothing : html` <span class="change__arrow">→</span> <strong>${fmt(to)}</strong>`}${suffix}</span>
  </span>`;
}

function actionBar(
  summary: TemplateResult,
  message: { text: string; error: boolean } | null,
  label: TemplateResult,
  enabled: boolean,
  onClick: () => void,
): TemplateResult {
  return html`<footer class="action-bar">
    <div class="action-bar__summary">${summary}</div>
    <div class="action-bar__cta">
      <span class="action-bar__msg ${message?.error ? '' : 'action-bar__msg--ok'}">${message?.text ?? 'Ends the day'}</span>
      <button class="btn btn--primary btn--lg" ?disabled=${!enabled} @click=${onClick}>${label}</button>
    </div>
  </footer>`;
}

// ------------------------------------------------------------------ crew & savings

function crew(g: GameState, stats: Stats): TemplateResult {
  const s = stats.global;
  const option = (art: TemplateResult, title: string, text: TemplateResult, facts: TemplateResult, cost: number, label: string, onClick: () => void) =>
    html`<div class="choice">
      <div class="choice__art">${art}</div>
      <h3 class="choice__title">${title}</h3>
      <p class="choice__text">${text}</p>
      <ul class="choice__facts">${facts}</ul>
      <button class="btn btn--primary btn--lg btn--block" ?disabled=${g.gold < cost} @click=${onClick}>
        ${label} · ${cost} ${coinArt('btn__coin')}
      </button>
    </div>`;
  return html`<div class="choices">
    ${option(
      traderArt(),
      'Hire a trader',
      html`Traders earn gold for you every single day.`,
      html`<li>${icon('arrowUp')} +${s.traderIncome} gold per day</li><li>${icon('food')} Eats ${s.traderFood} food per day</li>
        ${s.savingPerRecruit ? html`<li>${icon('piggy')} +${s.savingPerRecruit}% saving rate</li>` : nothing}`,
      s.traderCost,
      'Hire',
      () => dispatch({ type: 'recruit' }),
    )}
    <span class="choices__or">or</span>
    ${option(
      camelArt(),
      'Buy a camel',
      html`Camels carry your goods across the desert.`,
      html`<li>${icon('weight')} +${s.camelLoad} cargo capacity</li><li>${icon('food')} Eats ${s.camelFood} food per day</li>`,
      s.camelCost,
      'Buy',
      () => dispatch({ type: 'addCamel' }),
    )}
  </div>`;
}

function savings(g: GameState, stats: Stats): TemplateResult {
  const amount = savingAmount(g);
  const next = Math.max(10, g.savingRate - stats.global.savingDecay);
  return html`<div class="savings">
    <div class="savings__visual">
      ${coinArt('savings__coin savings__coin--3')} ${coinArt('savings__coin savings__coin--2')} ${coinArt('savings__coin savings__coin--1')}
    </div>
    <div class="savings__text">
      <p class="savings__rate"><strong>${g.savingRate}%</strong> of your gold</p>
      <p class="savings__amount">+${num(amount)}</p>
      <p class="muted">
        ${stats.global.savingDecay === 0 ? 'Your saving rate never decreases.' : html`The rate then drops to <strong>${next}%</strong>. Save while it's high — or once you're rich.`}
      </p>
      <div class="savings__actions">
        <button class="btn btn--primary btn--lg" @click=${() => dispatch({ type: 'save' })}>${icon('piggy')} Save · +${fmt(amount)}</button>
        ${g.saveOnceAvailable
          ? html`<button class="btn btn--secondary btn--lg" @click=${() => dispatch({ type: 'saveOnce' })} title="Sanctifan: free save, no day spent">
              ${icon('sparkle')} Free save (once)
            </button>`
          : nothing}
      </div>
    </div>
  </div>`;
}

// ------------------------------------------------------------------ screen

export function gameScreen(): TemplateResult {
  const g = state.game!;
  const stats = computeStats(g);
  const faction = getFaction(g.factionId);

  const body: Record<Tab, () => TemplateResult> = {
    buy: () => html`${market('buy', g, stats)}${marketFooter('buy', g, stats)}`,
    sell: () => html`${market('sell', g, stats)}${marketFooter('sell', g, stats)}`,
    crew: () => crew(g, stats),
    save: () => savings(g, stats),
  };

  return html`
    <section class="screen game-screen">
      <header class="game-header">
        <div class="game-header__left">
          ${iconButton('menu', 'Menu', () => openModal('menu'))}
          <div class="game-header__faction">
            ${crest(g.factionId, 'crest--sm')}
            <span><strong>${faction.name}</strong><small>${g.mode === 'classical' ? 'Classical' : 'Traveler'}</small></span>
          </div>
        </div>
        ${timeline(g)}
        <div class="game-header__right">
          ${g.canCallMerchant
            ? html`<button class="btn btn--secondary btn--sm pulse" @click=${() => dispatch({ type: 'callMerchant' })}>${icon('sparkle')} Call the merchant</button>`
            : nothing}
          ${g.merchantItem
            ? html`<button class="icon-btn icon-btn--item" @click=${() => openModal('item')} title=${getMerchantItem(g.merchantItem).name}
                aria-label="Your artifact">${glyph(itemIcon(g.merchantItem))}</button>`
            : nothing}
          ${soundToggle()}
        </div>
      </header>

      ${sidebar(g, stats)}

      <main class="card game-main">
        ${segmented(
          [
            { id: 'buy', label: 'Buy', icon: 'cart' },
            { id: 'sell', label: 'Sell', icon: 'coins' },
            { id: 'crew', label: 'Crew', icon: 'users' },
            { id: 'save', label: 'Save gold', icon: 'piggy' },
          ],
          state.tab,
          setTab,
          'segmented--tabs',
        )}
        ${keyed(state.tab, html`<div class="game-main__panel">${body[state.tab]()}</div>`)}
      </main>

      ${keyed(
        state.dayBanner,
        html`<div class="day-banner" aria-live="polite"><span class="day-banner__line"></span><span class="day-banner__text">${g.day >= g.maxDay ? 'Last day' : `Day ${g.day}`}</span><span class="day-banner__line"></span></div>`,
      )}
      ${eventOverlay(g, stats)}
    </section>
  `;
}
