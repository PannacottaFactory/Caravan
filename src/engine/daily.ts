// Daily challenge: the same game for every player on a given (UTC) day,
// with three "twists" that make each day different from the base game.

import { FACTIONS } from './data/factions';
import { RESOURCES } from './data/resources';
import { randomInt } from './rng';
import type { Effect, Mode, ResourceId } from './types';

export interface DailyTwist {
  id: string;
  /** Short title, e.g. "Silk boom". */
  title: string;
  /** What it does, e.g. "Silk sells for 40% more". */
  description: string;
  kind: 'boom' | 'slump' | 'rule';
  effects: Effect[];
}

export interface DailyChallenge {
  /** UTC date, YYYY-MM-DD. */
  date: string;
  seed: number;
  factionId: string;
  mode: Mode;
  twists: DailyTwist[];
}

/** Goods that can boom or slump (food is excluded: it would only change survival). */
const TRADE_GOODS: ResourceId[] = ['spices', 'pottery', 'marble', 'silk', 'jewelry'];
export const BOOM_PERCENT = 40;
export const SLUMP_PERCENT = 30;

/** Special rules: mild and always positive, so every day stays winnable. */
const RULES: Omit<DailyTwist, 'kind'>[] = [
  { id: 'kind-merchant', title: 'Kind merchant', description: 'Mysterious merchant prices are 30% lower', effects: [{ kind: 'stat', stat: 'merchantPricePct', op: 'add', value: -30 }] },
  { id: 'cheap-camels', title: 'Cheap camels', description: 'Camels cost 10 gold less', effects: [{ kind: 'stat', stat: 'camelCost', op: 'add', value: -10 }] },
  { id: 'eager-traders', title: 'Eager traders', description: 'Traders cost 10 gold less', effects: [{ kind: 'stat', stat: 'traderCost', op: 'add', value: -10 }] },
  { id: 'harvest', title: 'Good harvest', description: 'Food costs only 1 gold', effects: [{ kind: 'resourceStat', stat: 'buyPrice', resource: 'food', op: 'set', value: 1 }] },
  { id: 'thrifty', title: 'Thrifty day', description: 'Saving rate +10%', effects: [{ kind: 'add', target: 'savingRate', value: 10 }] },
  { id: 'strong-backs', title: 'Strong backs', description: '+15 cargo capacity', effects: [{ kind: 'stat', stat: 'capacityBonus', op: 'add', value: 15 }] },
  { id: 'long-road', title: 'Long road', description: 'One more day', effects: [{ kind: 'add', target: 'maxDay', value: 1 }] },
  { id: 'head-start', title: 'Head start', description: '+20 gold to start', effects: [{ kind: 'add', target: 'gold', value: 20 }] },
];

/** UTC date key of a moment, e.g. "2026-10-29". */
export function dateKey(at: Date = new Date()): string {
  return at.toISOString().slice(0, 10);
}

/** FNV-1a 32-bit hash. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pickTwists(date: string): DailyTwist[] {
  let rng = hash(`caravan-twists-${date}`) | 0;
  const pick = (count: number): number => {
    const [v, next] = randomInt(rng, 0, count - 1);
    rng = next;
    return v;
  };
  const boomGood = TRADE_GOODS[pick(TRADE_GOODS.length)]!;
  const others = TRADE_GOODS.filter((g) => g !== boomGood);
  const slumpGood = others[pick(others.length)]!;
  const rule = RULES[pick(RULES.length)]!;
  const name = (id: ResourceId) => RESOURCES[id].name;
  return [
    {
      id: `boom-${boomGood}`,
      title: `${name(boomGood)} boom`,
      description: `${name(boomGood)} sells for ${BOOM_PERCENT}% more`,
      kind: 'boom',
      effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: boomGood, op: 'mul', value: 1 + BOOM_PERCENT / 100 }],
    },
    {
      id: `slump-${slumpGood}`,
      title: `${name(slumpGood)} slump`,
      description: `${name(slumpGood)} sells for ${SLUMP_PERCENT}% less`,
      kind: 'slump',
      effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: slumpGood, op: 'mul', value: 1 - SLUMP_PERCENT / 100 }],
    },
    { ...rule, kind: 'rule' },
  ];
}

/** The challenge of a date: faction, seed and twists are derived from the date only. */
export function dailyChallenge(date: string = dateKey()): DailyChallenge {
  const h = hash(`caravan-daily-${date}`);
  return {
    date,
    seed: (h ^ 0x5bd1e995) | 0,
    factionId: FACTIONS[h % FACTIONS.length]!.id,
    mode: 'classical',
    twists: pickTwists(date),
  };
}

/** Effects to pass to createGame({ extraEffects }) for a challenge. */
export const dailyEffects = (c: DailyChallenge): Effect[] => c.twists.flatMap((t) => t.effects);

/** Milliseconds until the next challenge (midnight UTC). */
export function msUntilNextDaily(at: Date = new Date()): number {
  const next = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1);
  return next - at.getTime();
}

/** Same unlocks for everyone: the merchant and the witch are always on the road. */
export const DAILY_UNLOCKS = { merchant: true, witch: true } as const;
