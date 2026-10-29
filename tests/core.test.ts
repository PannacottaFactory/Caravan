import { describe, expect, it } from 'vitest';
import {
  applyAction,
  capacity,
  computeScore,
  dailyFoodConsumption,
  dailyIncome,
  previewBuy,
  previewSell,
  savingAmount,
  weightCarried,
} from '../src/engine';
import { act, errorOf, newGame, withFood } from './helpers';

describe('start of a Classical game (Normalia)', () => {
  const s = newGame();

  it('matches the Android game on day 1', () => {
    expect(s.day).toBe(1);
    expect(s.maxDay).toBe(15);
    expect(s.gold).toBe(30);
    expect(dailyIncome(s)).toBe(20);
    expect(weightCarried(s)).toBe(10);
    expect(capacity(s)).toBe(30);
    expect(s.inventory.food).toBe(5);
    expect(dailyFoodConsumption(s)).toBe(2);
    expect(s.traders).toBe(1);
    expect(s.camels).toBe(1);
    expect(s.savingRate).toBe(50);
    expect(s.phase).toBe('playing');
  });
});

describe('day actions', () => {
  it('buy: pays, adds goods, consumes food, next day with income', () => {
    const s = act(newGame(), { type: 'buy', quantities: { spices: 3 } });
    expect(s.day).toBe(2);
    expect(s.gold).toBe(30 - 15 + 20);
    expect(s.inventory.spices).toBe(3);
    expect(s.inventory.food).toBe(3);
    expect(weightCarried(s)).toBe(3 * 2 + 3 * 4);
  });

  it('buy: food bought today is eaten today', () => {
    const s = act(newGame(), { type: 'buy', quantities: { food: 2 } });
    expect(s.inventory.food).toBe(5 + 2 - 2);
  });

  it('buy: rejects empty, too expensive and too heavy orders', () => {
    const s = newGame();
    expect(errorOf(s, { type: 'buy', quantities: {} })).toBe('nothingToBuy');
    expect(errorOf(s, { type: 'buy', quantities: { marble: 1 } })).toBe('notEnoughGold');
    expect(errorOf(s, { type: 'buy', quantities: { spices: 6 } })).toBe('notEnoughCapacity');
    expect(errorOf(s, { type: 'buy', quantities: { food: -1 } })).toBe('invalidQuantity');
    expect(previewBuy(s, { food: 10 })).toEqual({ cost: 30, weight: 20, error: null });
  });

  it('sell: earns gold, frees weight, cannot sell more than owned', () => {
    const s0 = newGame();
    expect(errorOf(s0, { type: 'sell', quantities: { food: 6 } })).toBe('notEnoughStock');
    expect(errorOf(s0, { type: 'sell', quantities: {} })).toBe('nothingToSell');
    expect(previewSell(s0, { food: 1 })).toEqual({ earnings: 2, weight: 2, error: null });
    const s = act(s0, { type: 'sell', quantities: { food: 1 } });
    expect(s.gold).toBe(30 + 2 + 20);
    expect(s.inventory.food).toBe(2);
  });

  it('recruit: costs 25, the new trader eats today and earns tomorrow', () => {
    const s = act(newGame(), { type: 'recruit' });
    expect(s.traders).toBe(2);
    expect(s.inventory.food).toBe(5 - 3);
    expect(s.gold).toBe(30 - 25 + 40);
  });

  it('add camel: costs 30 and adds 30 capacity', () => {
    const s = act(newGame(), { type: 'addCamel' });
    expect(s.camels).toBe(2);
    expect(capacity(s)).toBe(60);
    expect(s.gold).toBe(0 + 20);
    expect(errorOf(act(newGame(), { type: 'save' }), { type: 'addCamel' })).toBe(null);
  });

  it('recruit / camel need enough gold', () => {
    let s = act(newGame(), { type: 'addCamel' }); // 20 gold left
    expect(errorOf(s, { type: 'recruit' })).toBe('notEnoughGold');
    s = withFood(s, 0);
    expect(errorOf(s, { type: 'addCamel' })).toBe('notEnoughGold');
  });

  it('save: earns rate x gold, then the rate drops by 10 down to 10%', () => {
    let s = withFood(newGame(), 100);
    expect(savingAmount(s)).toBe(15);
    s = act(s, { type: 'save' });
    expect(s.gold).toBe(30 + 15 + 20);
    expect(s.savingRate).toBe(40);
    for (let i = 0; i < 6; i++) s = act(s, { type: 'save' });
    expect(s.savingRate).toBe(10);
    expect(s.counters.saves).toBe(7);
  });
});

describe('end of the game', () => {
  it('defeat when food goes below 0, Continue restores the day (unlimited)', () => {
    const s0 = withFood(newGame(), 1);
    const r = applyAction(s0, { type: 'save' });
    expect(r.ok && r.state.phase).toBe('defeat');
    const dead = r.state;
    expect(errorOf(dead, { type: 'save' })).toBe('wrongPhase');

    const back = act(dead, { type: 'retryDay' });
    expect(back.phase).toBe('playing');
    expect(back.day).toBe(s0.day);
    expect(back.gold).toBe(s0.gold);
    expect(back.counters.retries).toBe(1);

    const dead2 = act(back, { type: 'save' });
    const back2 = act(dead2, { type: 'retryDay' });
    expect(back2.counters.retries).toBe(2);
  });

  it('exactly 0 food is not a defeat', () => {
    const s = act(withFood(newGame(), 2), { type: 'save' });
    expect(s.phase).toBe('playing');
    expect(s.inventory.food).toBe(0);
  });

  it('last day: no food consumed, last income added, score computed', () => {
    let s = withFood(newGame(), 28);
    for (let day = 1; day < 15; day++) s = act(s, { type: 'save' });
    expect(s.day).toBe(15);
    expect(s.inventory.food).toBe(0);
    const goldBefore = s.gold;
    const end = act(s, { type: 'save' });
    expect(end.phase).toBe('victory');
    expect(end.inventory.food).toBe(0);
    expect(end.gold).toBe(goldBefore + savingAmount(s) + 20);
    expect(end.score?.total).toBe(end.gold + 25 + 30);
  });

  it('score: gold + crew + goods at fixed values + statuette', () => {
    const s = structuredClone(newGame());
    s.gold = 4539;
    s.camels = 2;
    expect(computeScore(s).total).toBe(4624); // screenshot of the Android game
    s.inventory = { food: 9, spices: 1, pottery: 1, marble: 1, silk: 1, jewelry: 1 };
    s.modifiers.push({ kind: 'stat', stat: 'statuettePoints', op: 'add', value: 500 });
    const score = computeScore(s);
    expect(score.resources.food).toBe(0);
    expect(score.statuette).toBe(1500);
    expect(score.total).toBe(4539 + 25 + 60 + 5 + 20 + 110 + 530 + 900 + 1500);
  });
});

describe('engine properties', () => {
  it('applyAction never mutates the input state', () => {
    const s = newGame();
    const copy = structuredClone(s);
    applyAction(s, { type: 'buy', quantities: { spices: 2 } });
    applyAction(s, { type: 'recruit' });
    expect(s).toEqual(copy);
  });

  it('same seed gives the same game; state survives JSON round-trip', () => {
    const unlocks = { merchant: true, witch: true };
    const a = newGame({ seed: 7, unlocks, mode: 'traveler' });
    const b = newGame({ seed: 7, unlocks, mode: 'traveler' });
    expect(a).toEqual(b);
    expect(JSON.parse(JSON.stringify(a))).toEqual(a);
  });
});
