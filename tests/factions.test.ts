import { describe, expect, it } from 'vitest';
import { capacity, computeStats, dailyFoodConsumption, dailyIncome, FACTIONS, merchantPrice, weightCarried } from '../src/engine';
import { act, errorOf, newGame, withFood } from './helpers';

const start = (factionId: string) => newGame({ factionId });

describe('factions (Classical)', () => {
  it('there are 22 factions with unique ids', () => {
    expect(FACTIONS).toHaveLength(22);
    expect(new Set(FACTIONS.map((f) => f.id)).size).toBe(22);
  });

  it('Fang-Mô starts with 1 pottery (weight counted)', () => {
    const s = start('fang-mo');
    expect(s.inventory.pottery).toBe(1);
    expect(weightCarried(s)).toBe(15);
  });

  it("L'Exquise: traders don't eat", () => {
    expect(dailyFoodConsumption(start('lexquise'))).toBe(1);
  });

  it('Mahaji: spices sell for 15', () => {
    expect(computeStats(start('mahaji')).resource.spices.sellPrice).toBe(15);
  });

  it('Tocaccialli: 16 days', () => {
    expect(start('tocaccialli').maxDay).toBe(16);
  });

  it('Bajaar: income doubled, 30 gold on day 1', () => {
    const s = start('bajaar');
    expect(dailyIncome(s)).toBe(40);
    expect(s.gold).toBe(30);
  });

  it('Doba Lao: 70% saving rate', () => {
    expect(start('doba-lao').savingRate).toBe(70);
  });

  it('Huangoz: marble costs 90', () => {
    expect(computeStats(start('huangoz')).resource.marble.buyPrice).toBe(90);
  });

  it('Port-Willam: +15 capacity', () => {
    expect(capacity(start('port-willam'))).toBe(45);
  });

  it('Moonin: no random merchant day, can call it once', () => {
    const s = newGame({ factionId: 'moonin', unlocks: { merchant: true, witch: false } });
    expect(s.events.merchant.day).toBeNull();
    const called = act(s, { type: 'callMerchant' });
    expect(called.phase).toBe('merchant');
    const left = act(called, { type: 'leaveMerchant' });
    expect(left.phase).toBe('playing');
    expect(errorOf(left, { type: 'callMerchant' })).toBe('unavailable');
    expect(errorOf(start('normalia'), { type: 'callMerchant' })).toBe('unavailable');
  });

  it('Cornecopea: free food can be bought', () => {
    const s = act(start('cornecopea'), { type: 'buy', quantities: { food: 10 } });
    expect(s.gold).toBe(30 + 20);
    expect(s.inventory.food).toBe(13);
  });

  it('Eduming: each new trader adds 10% saving rate', () => {
    expect(act(start('eduming'), { type: 'recruit' }).savingRate).toBe(60);
  });

  it('Octoyashi: 8 food weighing 16', () => {
    const s = start('octoyashi');
    expect(s.inventory.food).toBe(8);
    expect(weightCarried(s)).toBe(16);
  });

  it('Kifuaï: 40 gold on day 1', () => {
    expect(start('kifuai').gold).toBe(40);
  });

  it('Skjollird: camels cost 35 and carry 40', () => {
    const stats = computeStats(start('skjollird'));
    expect(stats.global.camelCost).toBe(35);
    expect(stats.global.camelLoad).toBe(40);
  });

  it('Petrinov: saving rate never drops', () => {
    const s = act(withFood(start('petrinov'), 50), { type: 'save' });
    expect(s.savingRate).toBe(50);
  });

  it('Jilliqo: +10 daily income, 30 gold on day 1', () => {
    const s = start('jilliqo');
    expect(dailyIncome(s)).toBe(30);
    expect(s.gold).toBe(30);
  });

  it('Gayawaku: food weighs nothing', () => {
    expect(weightCarried(start('gayawaku'))).toBe(0);
  });

  it('Vilparino: merchant 20% cheaper', () => {
    const stats = computeStats(start('vilparino'));
    expect([25, 50, 100].map((p) => merchantPrice(p, stats))).toEqual([20, 40, 80]);
  });

  it('Sanctifan: one free save that does not spend a day nor lower the rate', () => {
    const s = act(start('sanctifan'), { type: 'saveOnce' });
    expect(s.day).toBe(1);
    expect(s.gold).toBe(45);
    expect(s.savingRate).toBe(50);
    expect(errorOf(s, { type: 'saveOnce' })).toBe('unavailable');
    expect(errorOf(start('normalia'), { type: 'saveOnce' })).toBe('unavailable');
  });

  it("Mehaz: camels don't eat", () => {
    expect(dailyFoodConsumption(start('mehaz'))).toBe(1);
  });

  it('Ipartus: silk costs 430', () => {
    expect(computeStats(start('ipartus')).resource.silk.buyPrice).toBe(430);
  });
});

describe('Traveler mode and improvements', () => {
  const traveler = (factionId: string, improvements: string[] = []) =>
    newGame({ mode: 'traveler', factionId, improvements });

  it('starts with 10 gold, no crew, no food, 20 capacity, 20 days', () => {
    const s = traveler('normalia');
    expect(s.gold).toBe(10);
    expect(s.traders + s.camels).toBe(0);
    expect(s.inventory.food).toBe(0);
    expect(capacity(s)).toBe(20);
    expect(s.maxDay).toBe(20);
    expect(s.events.disaster.day).toBeGreaterThanOrEqual(15);
    expect(s.events.disaster.day).toBeLessThanOrEqual(17);
  });

  it('weight and gold improvements', () => {
    const s = traveler('normalia', ['weight', 'gold']);
    expect(capacity(s)).toBe(30);
    expect(s.gold).toBe(20);
  });

  it('improvements are limited to 3, unique, and Traveler only', () => {
    expect(() => traveler('normalia', ['weight', 'gold', 'saving', 'camel'])).toThrow();
    expect(() => traveler('normalia', ['weight', 'weight'])).toThrow();
    expect(() => newGame({ improvements: ['weight'] })).toThrow();
  });

  it('fix: Pottery + Marble both apply (buy and sell sides share the same stats)', () => {
    const stats = computeStats(traveler('normalia', ['pottery', 'marble']));
    expect(stats.resource.pottery.buyPrice).toBe(15);
    expect(stats.resource.marble.unitWeight).toBe(15);
  });

  it('fix: Trader + Traders income both apply', () => {
    const stats = computeStats(traveler('normalia', ['trader', 'traders-income']));
    expect(stats.global.traderCost).toBe(15);
    expect(stats.global.traderIncome).toBe(25);
  });

  it('Bajaar doubles the improved income (50), as in the Android game', () => {
    expect(computeStats(traveler('bajaar', ['traders-income'])).global.traderIncome).toBe(50);
    expect(traveler('bajaar').gold).toBe(10);
  });

  it('Skjollird + Camel improvement: camels are free', () => {
    expect(computeStats(traveler('skjollird', ['camel'])).global.camelCost).toBe(0);
  });

  it('fix: Octoyashi in Traveler, 8 food weigh 16', () => {
    expect(weightCarried(traveler('octoyashi'))).toBe(16);
  });

  it('saving improvement: +5%', () => {
    expect(traveler('normalia', ['saving']).savingRate).toBe(55);
  });
});
