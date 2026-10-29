// Core types shared by the whole engine. No DOM access anywhere in src/engine.

export const RESOURCE_IDS = ['food', 'spices', 'pottery', 'marble', 'silk', 'jewelry'] as const;
export type ResourceId = (typeof RESOURCE_IDS)[number];

export type Inventory = Record<ResourceId, number>;

export type Mode = 'classical' | 'traveler';

/** Numeric stats that modifiers can change. Per-resource stats need a `resource`. */
export type ResourceStat = 'buyPrice' | 'sellPrice' | 'unitWeight';
export type GlobalStat =
  | 'traderIncome' // gold per trader per day
  | 'incomeBonus' // flat gold per day
  | 'traderCost'
  | 'camelCost'
  | 'camelLoad' // capacity per camel
  | 'capacityBonus' // flat capacity
  | 'traderFood' // food eaten per trader per day
  | 'camelFood' // food eaten per camel per day
  | 'foodReduction' // flat reduction of the daily food consumption
  | 'sellBonus' // flat gold added to every sale
  | 'statuettePoints' // end-game points per trader and camel
  | 'savingDecay' // saving rate lost after each save (percentage points)
  | 'savingPerRecruit' // saving rate gained for each new trader (percentage points)
  | 'merchantPricePct'; // merchant prices, in % of the base price

export type ModifierOp = 'add' | 'mul' | 'set';

export type StatModifier =
  | { kind: 'stat'; stat: GlobalStat; op: ModifierOp; value: number }
  | { kind: 'resourceStat'; stat: ResourceStat; resource: ResourceId; op: ModifierOp; value: number };

/** Counters stored directly in the game state. */
export type Counter = 'gold' | 'traders' | 'camels' | 'maxDay' | 'savingRate';

/** Everything a faction, improvement, merchant item, witch power or disaster can do. */
export type Effect =
  | StatModifier
  | { kind: 'add'; target: Counter; value: number }
  | { kind: 'set'; target: Counter; value: number }
  | { kind: 'scaleGold'; factor: number }
  | { kind: 'inventory'; resource: ResourceId; op: 'add' | 'set'; value: number }
  /** Adds a trader as if recruited (triggers savingPerRecruit). */
  | { kind: 'recruitTrader' };

/** An effect restricted to one game mode. */
export type ModeEffect = Effect & { mode?: Mode };
