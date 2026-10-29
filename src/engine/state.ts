import { getFaction, type FactionId } from './data/factions';
import { DISASTERS, getImprovement } from './data/events';
import { MIN_SAVING_RATE, MODES, START_SAVING_RATE } from './data/modes';
import { randomInt, randomSeed } from './rng';
import { computeScore, type ScoreBreakdown } from './scoring';
import { capacity, computeStats, dailyIncome, weightCarried } from './stats';
import type { Effect, Inventory, Mode, ModeEffect, ModifierOp, StatModifier } from './types';

export type Phase = 'playing' | 'merchant' | 'witch' | 'disaster' | 'defeat' | 'victory';
export type EventKind = 'merchant' | 'witch' | 'disaster';

export interface EventSlot {
  /** Day the event happens (null = never). */
  day: number | null;
  done: boolean;
}

export interface GameState {
  version: 1;
  seed: number;
  /** Current state of the random generator. */
  rng: number;
  mode: Mode;
  factionId: FactionId;
  improvements: string[];

  day: number;
  maxDay: number;
  gold: number;
  traders: number;
  camels: number;
  /** Saving rate in percent (50 = 50%). Integer, never below MIN_SAVING_RATE. */
  savingRate: number;
  inventory: Inventory;
  /** Active stat modifiers, applied in order by computeStats. */
  modifiers: StatModifier[];

  events: Record<EventKind, EventSlot>;
  merchantItem: string | null;
  witchPower: string | null;
  disaster: string | null;
  canCallMerchant: boolean;
  saveOnceAvailable: boolean;

  phase: Phase;
  counters: { saves: number; retries: number };
  /** State right before the action that caused the defeat ("Continue" restores it). */
  retryState: GameState | null;
  score: ScoreBreakdown | null;
  /** Day-by-day record for the end-of-journey recap (missing in saves made before it existed). */
  history?: DayRecord[];
  /** Date (YYYY-MM-DD, UTC) when this game is the daily challenge, otherwise null. */
  daily?: string | null;
}

export type DayAction = 'buy' | 'sell' | 'recruit' | 'addCamel' | 'save';

export interface DayRecord {
  day: number;
  /** Gold at the start of the day (after income), or at the end for the final record. */
  gold: number;
  /** Fortune: what the score would be at that moment. */
  worth: number;
  /** Action chosen that day. */
  action: DayAction | null;
  /** True for the last record, taken when the journey ends. */
  final?: boolean;
}

export interface NewGameConfig {
  mode: Mode;
  factionId: FactionId;
  improvements?: string[];
  seed?: number;
  /** Meta-progression unlocks (see meta.ts). */
  unlocks: { merchant: boolean; witch: boolean };
  /** Marks the game as the daily challenge of this date (YYYY-MM-DD). */
  daily?: string;
}

export type GameEvent =
  | { type: 'newDay'; day: number; income: number }
  | { type: 'eventOpened'; kind: EventKind }
  | { type: 'defeat' }
  | { type: 'victory'; score: ScoreBreakdown };

// ------------------------------------------------------------------ effects

const OP_ORDER: Record<ModifierOp, number> = { add: 0, mul: 1, set: 2 };

function isStatModifier(e: Effect): e is StatModifier {
  return e.kind === 'stat' || e.kind === 'resourceStat';
}

/** Applies one effect to a mutable state. */
export function applyEffect(s: GameState, effect: Effect): void {
  if (isStatModifier(effect)) {
    s.modifiers.push(stripMode(effect));
    return;
  }
  switch (effect.kind) {
    case 'add':
      s[effect.target] += effect.value;
      break;
    case 'set':
      s[effect.target] = effect.value;
      break;
    case 'scaleGold':
      s.gold = Math.round(s.gold * effect.factor);
      break;
    case 'inventory':
      s.inventory[effect.resource] = effect.op === 'add' ? s.inventory[effect.resource] + effect.value : effect.value;
      break;
    case 'recruitTrader':
      addTrader(s);
      break;
  }
  normalize(s);
}

function stripMode<T extends Effect>(effect: T): T {
  const { mode: _mode, ...rest } = effect as T & { mode?: Mode };
  return rest as T;
}

export function addTrader(s: GameState): void {
  s.traders += 1;
  s.savingRate += computeStats(s).global.savingPerRecruit;
  normalize(s);
}

/** Keeps counters inside valid bounds. */
function normalize(s: GameState): void {
  s.traders = Math.max(0, s.traders);
  s.camels = Math.max(0, s.camels);
  s.savingRate = Math.max(MIN_SAVING_RATE, s.savingRate);
  s.maxDay = Math.max(s.day, 1, s.maxDay);
  for (const key of Object.keys(s.inventory) as (keyof Inventory)[]) s.inventory[key] = Math.max(0, s.inventory[key]);
}

// ------------------------------------------------------------------ creation

export function createGame(config: NewGameConfig): GameState {
  const mode = MODES[config.mode];
  const faction = getFaction(config.factionId);
  const improvements = config.improvements ?? [];

  if (improvements.length > 0 && config.mode !== 'traveler') throw new Error('Improvements are Traveler only');
  if (new Set(improvements).size !== improvements.length) throw new Error('Duplicate improvement');
  if (improvements.length > mode.improvementPoints) throw new Error('Too many improvements');

  const seed = config.seed ?? randomSeed();
  const s: GameState = {
    version: 1,
    seed,
    rng: seed,
    mode: config.mode,
    factionId: faction.id,
    improvements: [...improvements],
    day: 0,
    maxDay: mode.maxDay,
    gold: mode.startGold,
    traders: mode.startTraders,
    camels: mode.startCamels,
    savingRate: START_SAVING_RATE,
    inventory: { ...mode.startInventory },
    modifiers: [],
    events: {
      merchant: { day: null, done: false },
      witch: { day: null, done: false },
      disaster: { day: null, done: false },
    },
    merchantItem: null,
    witchPower: null,
    disaster: null,
    canCallMerchant: faction.special === 'callMerchant',
    saveOnceAvailable: faction.special === 'saveOnce',
    phase: 'playing',
    counters: { saves: 0, retries: 0 },
    retryState: null,
    score: null,
    history: [],
    daily: config.daily ?? null,
  };

  // Starting effects: improvements first, then the faction. Stat modifiers are sorted
  // add -> mul -> set so the result does not depend on the order of the sources
  // (e.g. Bajaar doubles the income including the "Traders income" improvement).
  const startEffects: Effect[] = [
    ...improvements.flatMap((id) => getImprovement(id).effects),
    ...faction.effects.filter((e: ModeEffect) => !e.mode || e.mode === config.mode),
  ];
  const statMods = startEffects.filter(isStatModifier).map((m, i) => ({ m, i }));
  statMods.sort((a, b) => OP_ORDER[a.m.op] - OP_ORDER[b.m.op] || a.i - b.i);
  for (const { m } of statMods) s.modifiers.push(stripMode(m));
  for (const e of startEffects) if (!isStatModifier(e)) applyEffect(s, e);

  // Event days.
  if (config.unlocks.merchant && faction.special !== 'callMerchant') s.events.merchant.day = draw(s, mode.merchantDays);
  if (config.unlocks.witch) s.events.witch.day = draw(s, mode.witchDays);
  if (mode.disasterDays) s.events.disaster.day = draw(s, mode.disasterDays);

  startNewDay(s, []);
  return s;
}

function draw(s: GameState, [min, max]: [number, number]): number {
  const [value, next] = randomInt(s.rng, min, max);
  s.rng = next;
  return value;
}

// ------------------------------------------------------------------ day flow

/** Moves to the next day: income, then the events planned for that day. */
export function startNewDay(s: GameState, events: GameEvent[]): void {
  s.day += 1;
  const income = dailyIncome(s);
  s.gold += income;
  s.phase = 'playing';
  (s.history ??= []).push({ day: s.day, gold: s.gold, worth: computeScore(s).total, action: null });
  events.push({ type: 'newDay', day: s.day, income });
  openPendingEvent(s, events);
}

/** Remembers which action was played today (for the recap). */
export function recordAction(s: GameState, action: DayAction): void {
  const last = s.history?.[s.history.length - 1];
  if (last && last.day === s.day && !last.final) last.action = action;
}

/** Opens the next event planned for today, if any. */
export function openPendingEvent(s: GameState, events: GameEvent[]): void {
  for (const kind of ['merchant', 'witch', 'disaster'] as const) {
    const slot = s.events[kind];
    if (slot.day === s.day && !slot.done) {
      if (kind === 'disaster') s.disaster = pickDisaster(s);
      s.phase = kind;
      events.push({ type: 'eventOpened', kind });
      return;
    }
  }
  s.phase = 'playing';
}

function pickDisaster(s: GameState): string {
  const stats = computeStats(s);
  const ctx = {
    gold: s.gold,
    traders: s.traders,
    camels: s.camels,
    freeCapacity: capacity(s, stats) - weightCarried(s, stats),
    camelLoad: stats.global.camelLoad,
    foodOwned: s.inventory.food,
    foodUnitWeight: stats.resource.food.unitWeight,
  };
  const candidates = DISASTERS.filter((d) => d.available(ctx));
  const pool = candidates.length > 0 ? candidates : DISASTERS;
  const [index, next] = randomInt(s.rng, 0, pool.length - 1);
  s.rng = next;
  return pool[index]!.id;
}

/** Ends the game: last income, then score. */
export function finishGame(s: GameState, events: GameEvent[]): void {
  s.gold += dailyIncome(s);
  s.score = computeScore(s);
  (s.history ??= []).push({ day: s.day, gold: s.gold, worth: s.score.total, action: null, final: true });
  s.phase = 'victory';
  events.push({ type: 'victory', score: s.score });
}

export function closeEvent(s: GameState, kind: EventKind, events: GameEvent[]): void {
  s.events[kind].done = true;
  openPendingEvent(s, events);
}
