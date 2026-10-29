import { BASE_STATS, MODES } from './data/modes';
import { RESOURCES } from './data/resources';
import { RESOURCE_IDS, type GlobalStat, type ModifierOp, type ResourceId, type ResourceStat } from './types';
import type { GameState } from './state';

export interface Stats {
  global: Record<GlobalStat, number>;
  resource: Record<ResourceId, Record<ResourceStat, number>>;
}

function applyOp(current: number, op: ModifierOp, value: number): number {
  switch (op) {
    case 'add':
      return current + value;
    case 'mul':
      return current * value;
    case 'set':
      return value;
  }
}

/**
 * Effective stats: base values with every active modifier applied in order.
 * Prices, weights, costs and consumptions never go below 0.
 */
export function computeStats(state: Pick<GameState, 'modifiers'>): Stats {
  const global = { ...BASE_STATS };
  const resource = {} as Stats['resource'];
  for (const id of RESOURCE_IDS) {
    const def = RESOURCES[id];
    resource[id] = { buyPrice: def.buyPrice, sellPrice: def.sellPrice, unitWeight: def.unitWeight };
  }

  for (const m of state.modifiers) {
    if (m.kind === 'stat') global[m.stat] = applyOp(global[m.stat], m.op, m.value);
    else resource[m.resource][m.stat] = applyOp(resource[m.resource][m.stat], m.op, m.value);
  }

  // capacityBonus may be negative (Broke leg disaster); the total capacity is clamped instead.
  for (const key of Object.keys(global) as GlobalStat[]) {
    if (key !== 'capacityBonus') global[key] = Math.max(0, global[key]);
  }
  for (const id of RESOURCE_IDS) {
    const r = resource[id];
    // Percentage modifiers (daily twists) can produce decimals: prices stay whole numbers.
    r.buyPrice = Math.max(0, Math.round(r.buyPrice));
    r.sellPrice = Math.max(0, Math.round(r.sellPrice));
    r.unitWeight = Math.max(0, r.unitWeight);
  }
  return { global, resource };
}

// ------------------------------------------------------------------ derived values

export function weightCarried(state: GameState, stats = computeStats(state)): number {
  return RESOURCE_IDS.reduce((sum, id) => sum + state.inventory[id] * stats.resource[id].unitWeight, 0);
}

export function capacity(state: GameState, stats = computeStats(state)): number {
  return Math.max(0, MODES[state.mode].baseCapacity + stats.global.camelLoad * state.camels + stats.global.capacityBonus);
}

export function dailyIncome(state: GameState, stats = computeStats(state)): number {
  return stats.global.traderIncome * state.traders + stats.global.incomeBonus;
}

export function dailyFoodConsumption(state: GameState, stats = computeStats(state)): number {
  const raw = state.traders * stats.global.traderFood + state.camels * stats.global.camelFood - stats.global.foodReduction;
  return Math.max(0, raw);
}

/** Gold earned by the Save action right now. */
export function savingAmount(state: GameState): number {
  return Math.round((state.gold * state.savingRate) / 100);
}

export function merchantPrice(basePrice: number, stats: Stats): number {
  return Math.round((basePrice * stats.global.merchantPricePct) / 100);
}
