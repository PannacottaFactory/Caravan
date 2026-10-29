import type { GlobalStat, Inventory, Mode } from '../types';

export interface ModeConfig {
  id: Mode;
  name: string;
  description: string;
  startGold: number;
  startTraders: number;
  startCamels: number;
  startInventory: Inventory;
  maxDay: number;
  /** Capacity that does not depend on camels (Traveler starts with 20). */
  baseCapacity: number;
  /** Event days are drawn uniformly in [min, max] (both included). */
  merchantDays: [number, number];
  witchDays: [number, number];
  disasterDays: [number, number] | null;
  improvementPoints: number;
}

export const BASE_STATS: Record<GlobalStat, number> = {
  traderIncome: 20,
  incomeBonus: 0,
  traderCost: 25,
  camelCost: 30,
  camelLoad: 30,
  capacityBonus: 0,
  traderFood: 1,
  camelFood: 1,
  foodReduction: 0,
  sellBonus: 0,
  statuettePoints: 0,
  savingDecay: 10,
  savingPerRecruit: 0,
  merchantPricePct: 100,
};

export const START_SAVING_RATE = 50; // percent
export const MIN_SAVING_RATE = 10; // percent

const EMPTY: Inventory = { food: 0, spices: 0, pottery: 0, marble: 0, silk: 0, jewelry: 0 };

// Source: GlobalVariables (PlayScene.unity), PrepareUpdate, Prepare (PrepareCaravan.unity).
export const MODES: Record<Mode, ModeConfig> = {
  classical: {
    id: 'classical',
    name: 'Classical Mode',
    description: '15 days - No Disasters',
    startGold: 10, // + 20 income on day 1 = 30
    startTraders: 1,
    startCamels: 1,
    startInventory: { ...EMPTY, food: 5 },
    maxDay: 15,
    baseCapacity: 0,
    merchantDays: [5, 7],
    witchDays: [9, 11],
    disasterDays: null,
    improvementPoints: 0,
  },
  traveler: {
    id: 'traveler',
    name: 'Traveler Mode',
    description: '20 days - Manage your Caravan - Disasters',
    startGold: 10,
    startTraders: 0,
    startCamels: 0,
    startInventory: { ...EMPTY },
    maxDay: 20,
    baseCapacity: 20,
    merchantDays: [7, 9],
    witchDays: [11, 13],
    disasterDays: [15, 17],
    improvementPoints: 3,
  },
};
