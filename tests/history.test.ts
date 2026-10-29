import { describe, expect, it } from 'vitest';
import { createGame, DAILY_UNLOCKS, dailyChallenge, dateKey, FACTIONS, msUntilNextDaily } from '../src/engine';
import { act, newGame, withFood } from './helpers';

describe('journey history', () => {
  it('records each day with the action played, then a final record', () => {
    let s = newGame();
    expect(s.history).toEqual([{ day: 1, gold: 30, worth: 30 + 25 + 30, action: null }]);
    s = act(s, { type: 'buy', quantities: { spices: 2 } });
    s = act(withFood(s, 40), { type: 'save' });
    expect(s.history?.map((r) => r.action)).toEqual(['buy', 'save', null]);
    expect(s.history?.[1]).toMatchObject({ day: 2, gold: 30 - 10 + 20 });
    while (s.phase === 'playing') s = act(s, { type: 'save' });
    const last = s.history!.at(-1)!;
    expect(last).toMatchObject({ final: true, gold: s.gold, worth: s.score!.total });
    expect(s.history).toHaveLength(16);
  });

  it('a defeat followed by Continue does not record the failed action', () => {
    const s = withFood(newGame(), 1);
    const dead = act(s, { type: 'save' });
    const back = act(dead, { type: 'retryDay' });
    expect(back.history?.at(-1)?.action).toBeNull();
  });
});

describe('daily challenge', () => {
  it('is the same for everyone on a given date, different the next day', () => {
    expect(dailyChallenge('2026-10-29')).toEqual(dailyChallenge('2026-10-29'));
    expect(dailyChallenge('2026-10-29').seed).not.toBe(dailyChallenge('2026-10-30').seed);
    expect(FACTIONS.map((f) => f.id)).toContain(dailyChallenge('2026-10-29').factionId);
  });

  it('spreads over many factions across a month', () => {
    const ids = new Set(Array.from({ length: 30 }, (_, d) => dailyChallenge(`2026-11-${String(d + 1).padStart(2, '0')}`).factionId));
    expect(ids.size).toBeGreaterThan(10);
  });

  it('creates identical games and marks them as daily', () => {
    const c = dailyChallenge('2026-10-29');
    const make = () => createGame({ mode: c.mode, factionId: c.factionId, seed: c.seed, unlocks: DAILY_UNLOCKS, daily: c.date });
    expect(make()).toEqual(make());
    expect(make().daily).toBe('2026-10-29');
    expect(make().events.merchant.day).not.toBeNull();
  });

  it('date helpers use UTC', () => {
    expect(dateKey(new Date('2026-10-29T23:30:00Z'))).toBe('2026-10-29');
    expect(msUntilNextDaily(new Date('2026-10-29T23:00:00Z'))).toBe(3600_000);
  });
});
