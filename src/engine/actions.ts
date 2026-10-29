import { getDisaster, getMerchantItem, getWitchPower } from './data/events';
import {
  addTrader,
  applyEffect,
  closeEvent,
  finishGame,
  openPendingEvent,
  recordAction,
  startNewDay,
  type DayAction,
  type GameEvent,
  type GameState,
} from './state';
import { capacity, computeStats, dailyFoodConsumption, merchantPrice, savingAmount, weightCarried } from './stats';
import { RESOURCE_IDS, type ResourceId } from './types';

export type Quantities = Partial<Record<ResourceId, number>>;

export type GameAction =
  | { type: 'buy'; quantities: Quantities }
  | { type: 'sell'; quantities: Quantities }
  | { type: 'recruit' }
  | { type: 'addCamel' }
  | { type: 'save' }
  | { type: 'saveOnce' }
  | { type: 'callMerchant' }
  | { type: 'buyMerchantItem'; itemId: string }
  | { type: 'leaveMerchant' }
  | { type: 'chooseWitchPower'; powerId: string }
  | { type: 'acknowledgeDisaster' }
  | { type: 'retryDay' };

export type ActionError =
  | 'wrongPhase'
  | 'invalidQuantity'
  | 'nothingToBuy'
  | 'nothingToSell'
  | 'notEnoughGold'
  | 'notEnoughCapacity'
  | 'notEnoughStock'
  | 'unavailable';

/** Messages shown to the player (original wording where it existed). */
export const ERROR_MESSAGES: Record<ActionError, string> = {
  wrongPhase: 'Not now',
  invalidQuantity: 'Invalid quantity',
  nothingToBuy: 'No resource to buy',
  nothingToSell: 'No resource to sell',
  notEnoughGold: 'Not enough gold',
  notEnoughCapacity: 'Not enough pods',
  notEnoughStock: 'Not enough resources',
  unavailable: 'Not available',
};

export type ActionResult =
  | { ok: true; state: GameState; events: GameEvent[] }
  | { ok: false; state: GameState; error: ActionError };

const fail = (state: GameState, error: ActionError): ActionResult => ({ ok: false, state, error });

/** Pure entry point: never mutates `state`. */
export function applyAction(state: GameState, action: GameAction): ActionResult {
  const s = structuredClone(state);
  const events: GameEvent[] = [];

  const needPhase = (phase: GameState['phase']): boolean => s.phase === phase;

  switch (action.type) {
    // ------------------------------------------------ day actions
    case 'buy': {
      if (!needPhase('playing')) return fail(state, 'wrongPhase');
      const preview = previewBuy(s, action.quantities);
      if (preview.error) return fail(state, preview.error);
      s.gold -= preview.cost;
      for (const id of RESOURCE_IDS) s.inventory[id] += action.quantities[id] ?? 0;
      endDay(s, state, events, action.type as DayAction);
      break;
    }
    case 'sell': {
      if (!needPhase('playing')) return fail(state, 'wrongPhase');
      const preview = previewSell(s, action.quantities);
      if (preview.error) return fail(state, preview.error);
      s.gold += preview.earnings;
      for (const id of RESOURCE_IDS) s.inventory[id] -= action.quantities[id] ?? 0;
      endDay(s, state, events, action.type as DayAction);
      break;
    }
    case 'recruit': {
      if (!needPhase('playing')) return fail(state, 'wrongPhase');
      const cost = computeStats(s).global.traderCost;
      if (s.gold < cost) return fail(state, 'notEnoughGold');
      s.gold -= cost;
      addTrader(s);
      endDay(s, state, events, action.type as DayAction);
      break;
    }
    case 'addCamel': {
      if (!needPhase('playing')) return fail(state, 'wrongPhase');
      const cost = computeStats(s).global.camelCost;
      if (s.gold < cost) return fail(state, 'notEnoughGold');
      s.gold -= cost;
      s.camels += 1;
      endDay(s, state, events, action.type as DayAction);
      break;
    }
    case 'save': {
      if (!needPhase('playing')) return fail(state, 'wrongPhase');
      s.gold += savingAmount(s);
      applyEffect(s, { kind: 'add', target: 'savingRate', value: -computeStats(s).global.savingDecay });
      s.counters.saves += 1;
      endDay(s, state, events, action.type as DayAction);
      break;
    }

    // ------------------------------------------------ free actions (no day spent)
    case 'saveOnce': {
      if (!needPhase('playing')) return fail(state, 'wrongPhase');
      if (!s.saveOnceAvailable) return fail(state, 'unavailable');
      s.gold += savingAmount(s);
      s.saveOnceAvailable = false;
      break;
    }
    case 'callMerchant': {
      if (!needPhase('playing')) return fail(state, 'wrongPhase');
      if (!s.canCallMerchant) return fail(state, 'unavailable');
      s.canCallMerchant = false;
      s.events.merchant = { day: s.day, done: false };
      openPendingEvent(s, events);
      break;
    }
    case 'buyMerchantItem': {
      if (!needPhase('merchant')) return fail(state, 'wrongPhase');
      const item = getMerchantItem(action.itemId);
      const price = merchantPrice(item.basePrice, computeStats(s));
      if (s.gold < price) return fail(state, 'notEnoughGold');
      s.gold -= price;
      s.merchantItem = item.id;
      for (const e of item.effects) applyEffect(s, e);
      closeEvent(s, 'merchant', events);
      break;
    }
    case 'leaveMerchant': {
      if (!needPhase('merchant')) return fail(state, 'wrongPhase');
      closeEvent(s, 'merchant', events);
      break;
    }
    case 'chooseWitchPower': {
      if (!needPhase('witch')) return fail(state, 'wrongPhase');
      const power = getWitchPower(action.powerId);
      s.witchPower = power.id;
      for (const e of power.effects) applyEffect(s, e);
      closeEvent(s, 'witch', events);
      break;
    }
    case 'acknowledgeDisaster': {
      if (!needPhase('disaster') || !s.disaster) return fail(state, 'wrongPhase');
      for (const e of getDisaster(s.disaster).effects) applyEffect(s, e);
      closeEvent(s, 'disaster', events);
      break;
    }
    case 'retryDay': {
      if (!needPhase('defeat') || !s.retryState) return fail(state, 'wrongPhase');
      const restored = structuredClone(s.retryState);
      restored.counters.retries = s.counters.retries + 1;
      return { ok: true, state: restored, events };
    }
  }

  return { ok: true, state: s, events };
}

/**
 * End of a day action: food consumption (except on the last day), then defeat check,
 * then the next day — or victory if this was the last day.
 */
function endDay(s: GameState, before: GameState, events: GameEvent[], action: DayAction): void {
  recordAction(s, action);
  if (s.day >= s.maxDay) {
    finishGame(s, events);
    return;
  }
  s.inventory.food -= dailyFoodConsumption(s);
  if (s.inventory.food < 0) {
    s.phase = 'defeat';
    s.retryState = { ...structuredClone(before), retryState: null };
    events.push({ type: 'defeat' });
    return;
  }
  startNewDay(s, events);
}

// ------------------------------------------------------------------ previews (for the UI)

function readQuantities(q: Quantities): { valid: boolean; total: number } {
  let total = 0;
  for (const id of RESOURCE_IDS) {
    const n = q[id] ?? 0;
    if (!Number.isInteger(n) || n < 0) return { valid: false, total: 0 };
    total += n;
  }
  return { valid: true, total };
}

export interface BuyPreview {
  cost: number;
  weight: number;
  error: ActionError | null;
}

export function previewBuy(state: GameState, quantities: Quantities): BuyPreview {
  const stats = computeStats(state);
  const { valid, total } = readQuantities(quantities);
  let cost = 0;
  let weight = 0;
  for (const id of RESOURCE_IDS) {
    const n = quantities[id] ?? 0;
    cost += n * stats.resource[id].buyPrice;
    weight += n * stats.resource[id].unitWeight;
  }
  let error: ActionError | null = null;
  if (!valid) error = 'invalidQuantity';
  else if (total === 0) error = 'nothingToBuy';
  else if (cost > state.gold) error = 'notEnoughGold';
  else if (weight > 0 && weightCarried(state, stats) + weight > capacity(state, stats)) error = 'notEnoughCapacity';
  return { cost, weight, error };
}

export interface SellPreview {
  earnings: number;
  weight: number;
  error: ActionError | null;
}

export function previewSell(state: GameState, quantities: Quantities): SellPreview {
  const stats = computeStats(state);
  const { valid, total } = readQuantities(quantities);
  let earnings = 0;
  let weight = 0;
  let stockOk = true;
  for (const id of RESOURCE_IDS) {
    const n = quantities[id] ?? 0;
    if (n > state.inventory[id]) stockOk = false;
    earnings += n * stats.resource[id].sellPrice;
    weight += n * stats.resource[id].unitWeight;
  }
  if (total > 0) earnings += stats.global.sellBonus;
  let error: ActionError | null = null;
  if (!valid) error = 'invalidQuantity';
  else if (total === 0) error = 'nothingToSell';
  else if (!stockOk) error = 'notEnoughStock';
  return { earnings, weight, error };
}

/** True when the merchant will show up tomorrow (warning banner). */
export function merchantArrivesTomorrow(state: GameState): boolean {
  return state.events.merchant.day === state.day + 1 && !state.events.merchant.done;
}
