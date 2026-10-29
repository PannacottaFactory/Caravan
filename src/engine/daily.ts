// Daily challenge: the same game for every player on a given (UTC) day.

import { FACTIONS } from './data/factions';
import type { Mode } from './types';

export interface DailyChallenge {
  /** UTC date, YYYY-MM-DD. */
  date: string;
  seed: number;
  factionId: string;
  mode: Mode;
}

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

/** The challenge of a date: faction and seed are derived from the date only. */
export function dailyChallenge(date: string = dateKey()): DailyChallenge {
  const h = hash(`caravan-daily-${date}`);
  return {
    date,
    seed: (h ^ 0x5bd1e995) | 0,
    factionId: FACTIONS[h % FACTIONS.length]!.id,
    mode: 'classical',
  };
}

/** Milliseconds until the next challenge (midnight UTC). */
export function msUntilNextDaily(at: Date = new Date()): number {
  const next = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1);
  return next - at.getTime();
}

/** Same unlocks for everyone: the merchant and the witch are always on the road. */
export const DAILY_UNLOCKS = { merchant: true, witch: true } as const;
