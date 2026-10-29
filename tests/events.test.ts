import { describe, expect, it } from 'vitest';
import {
  capacity,
  computeStats,
  dailyFoodConsumption,
  dailyIncome,
  DISASTERS,
  merchantArrivesTomorrow,
  MERCHANT_ITEMS,
  WITCH_POWERS,
  weightCarried,
  type GameState,
} from '../src/engine';
import { act, errorOf, newGame, scheduleTomorrow, withFood } from './helpers';

const unlocked = { merchant: true, witch: true };

describe('event days', () => {
  it('locked characters never come', () => {
    const s = newGame();
    expect(s.events.merchant.day).toBeNull();
    expect(s.events.witch.day).toBeNull();
    expect(s.events.disaster.day).toBeNull();
  });

  it('days are drawn in the right windows', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const c = newGame({ seed, unlocks: unlocked });
      expect(c.events.merchant.day).toBeGreaterThanOrEqual(5);
      expect(c.events.merchant.day).toBeLessThanOrEqual(7);
      expect(c.events.witch.day).toBeGreaterThanOrEqual(9);
      expect(c.events.witch.day).toBeLessThanOrEqual(11);
      const t = newGame({ seed, unlocks: unlocked, mode: 'traveler' });
      expect(t.events.merchant.day).toBeGreaterThanOrEqual(7);
      expect(t.events.merchant.day).toBeLessThanOrEqual(9);
      expect(t.events.witch.day).toBeGreaterThanOrEqual(11);
      expect(t.events.witch.day).toBeLessThanOrEqual(13);
    }
  });
});

function meetMerchant(state: GameState = newGame(), gold = 1000): GameState {
  const s = scheduleTomorrow(withFood(state, 50), 'merchant');
  s.gold = gold;
  expect(merchantArrivesTomorrow(s)).toBe(true);
  const met = act(s, { type: 'save' });
  expect(met.phase).toBe('merchant');
  return met;
}

describe('Mysterious Merchant', () => {
  it('blocks day actions until the player buys or leaves', () => {
    const s = meetMerchant();
    expect(errorOf(s, { type: 'save' })).toBe('wrongPhase');
    const left = act(s, { type: 'leaveMerchant' });
    expect(left.phase).toBe('playing');
    expect(left.merchantItem).toBeNull();
    expect(left.day).toBe(s.day);
  });

  it('buying costs gold, does not spend a day, only once', () => {
    const s = meetMerchant();
    const after = act(s, { type: 'buyMerchantItem', itemId: 'canvas-bag' });
    expect(after.gold).toBe(s.gold - 50);
    expect(after.day).toBe(s.day);
    expect(after.merchantItem).toBe('canvas-bag');
    expect(capacity(after)).toBe(capacity(s) + 20);
    expect(errorOf(after, { type: 'buyMerchantItem', itemId: 'cornucopia' })).toBe('wrongPhase');
  });

  it('refuses an item the player cannot afford', () => {
    const s = meetMerchant(newGame(), 0);
    s.gold = 20;
    expect(errorOf(s, { type: 'buyMerchantItem', itemId: 'cornucopia' })).toBe('notEnoughGold');
  });

  const buy = (itemId: string, base?: GameState) => act(meetMerchant(base), { type: 'buyMerchantItem', itemId });

  it('every item has an effect', () => {
    expect(MERCHANT_ITEMS).toHaveLength(9);
    const s = meetMerchant();
    expect(dailyFoodConsumption(buy('cornucopia'))).toBe(0);
    expect(computeStats(buy('route-to-mahaji')).resource.spices.sellPrice).toBe(30);
    expect(buy('leaders-necklace').traders).toBe(s.traders + 1);
    expect(computeStats(buy('sturdy-saddle')).global.camelLoad).toBe(50);
    expect(buy('magic-clepsydra').maxDay).toBe(16);
    expect(buy('blue-treasure').savingRate).toBe(s.savingRate + 20);
  });

  it('Hand of Midas: +100 gold on every sale', () => {
    const s = act(buy('hand-of-midas'), { type: 'sell', quantities: { food: 1 } });
    const midasGold = s.gold;
    const plain = act(act(meetMerchant(), { type: 'leaveMerchant' }), { type: 'sell', quantities: { food: 1 } });
    expect(midasGold - plain.gold).toBe(100 - 50);
  });

  it("Leader's necklace triggers Eduming's saving bonus", () => {
    const met = meetMerchant(newGame({ factionId: 'eduming' }));
    const s = act(met, { type: 'buyMerchantItem', itemId: 'leaders-necklace' });
    expect(s.savingRate).toBe(met.savingRate + 10);
  });

  it('fix: Cornucopia never makes consumption negative', () => {
    const s = structuredClone(buy('cornucopia'));
    s.traders = 0;
    expect(dailyFoodConsumption(s)).toBe(0);
  });
});

describe('Old Witch', () => {
  function meetWitch(state: GameState = newGame()): GameState {
    const met = act(scheduleTomorrow(withFood(state, 50), 'witch'), { type: 'save' });
    expect(met.phase).toBe('witch');
    return met;
  }
  const choose = (powerId: string, base?: GameState) => act(meetWitch(base), { type: 'chooseWitchPower', powerId });

  it('the choice is mandatory and spends no day', () => {
    const s = meetWitch();
    expect(errorOf(s, { type: 'save' })).toBe('wrongPhase');
    expect(errorOf(s, { type: 'leaveMerchant' })).toBe('wrongPhase');
    const after = choose('presents-gift');
    expect(after.phase).toBe('playing');
    expect(after.day).toBe(s.day);
  });

  it('every power applies its bonus and malus', () => {
    expect(WITCH_POWERS).toHaveLength(8);
    const s = meetWitch();

    const gift = choose('presents-gift');
    expect(capacity(gift)).toBe(capacity(s) + 20);
    expect(gift.savingRate).toBe(Math.max(10, s.savingRate - 20));

    const patience = act(withFood(choose('vertue-of-patience'), 50), { type: 'save' });
    expect(patience.savingRate).toBe(s.savingRate);
    expect(computeStats(patience).resource.jewelry.buyPrice).toBe(1000);

    const midas = choose('midas-was-a-trader');
    expect(dailyIncome(midas)).toBe(170);
    expect(computeStats(midas).resource.marble.sellPrice).toBe(0);

    const camel = choose('camelization');
    expect(computeStats(camel).global.camelLoad).toBe(40);
    expect(dailyFoodConsumption(camel)).toBe(3);

    const time = choose('time-is-money');
    expect(time.maxDay).toBe(16);
    expect(computeStats(time).resource.jewelry.sellPrice).toBe(2000);

    const animals = choose('animal-lover');
    expect(animals.camels).toBe(s.camels + 2);
    expect(animals.maxDay).toBe(14);

    const oasis = choose('oasis-of-sanctifan');
    expect(dailyFoodConsumption(oasis)).toBe(0);
    expect(computeStats(oasis).resource.silk.buyPrice).toBe(730);

    const stone = choose('the-stonecutter');
    expect(computeStats(stone).resource.marble.unitWeight).toBe(5);
    expect(computeStats(stone).resource.marble.buyPrice).toBe(170);
  });

  it('fix: Stonecutter lowers the weight of marble already carried by 15 each', () => {
    const base = structuredClone(newGame());
    base.inventory.marble = 2;
    const met = meetWitch(base);
    const after = act(met, { type: 'chooseWitchPower', powerId: 'the-stonecutter' });
    expect(weightCarried(met) - weightCarried(after)).toBe(2 * 15);
  });

  it('fix: Camelization keeps weight consistent with food after recruiting', () => {
    let s = choose('camelization');
    s = act(s, { type: 'recruit' });
    expect(weightCarried(s)).toBe(s.inventory.food * 2);
  });
});

describe('Disasters (Traveler)', () => {
  function strike(disasterId: string, tweak?: (s: GameState) => void): { before: GameState; after: GameState } {
    const s = structuredClone(newGame({ mode: 'traveler' }));
    s.traders = 2;
    s.camels = 2;
    s.gold = 8000;
    s.inventory.food = 50;
    tweak?.(s);
    const met = act(scheduleTomorrow(s, 'disaster'), { type: 'save' });
    expect(met.phase).toBe('disaster');
    met.disaster = disasterId; // force the drawn disaster
    return { before: met, after: act(met, { type: 'acknowledgeDisaster' }) };
  }

  it('there are 12 disasters', () => {
    expect(DISASTERS).toHaveLength(12);
  });

  it('effects', () => {
    let r = strike('steal');
    expect(r.after.gold).toBe(Math.round(r.before.gold * 0.75));
    r = strike('broke-leg');
    expect(capacity(r.after)).toBe(capacity(r.before) - 10);
    expect(strike('traders-left').after.traders).toBe(0);
    expect(computeStats(strike('marble-crisis').after).resource.marble.sellPrice).toBe(0);
    expect(computeStats(strike('silk-penury').after).resource.silk.buyPrice).toBe(730);
    r = strike('seer');
    expect(r.after.camels).toBe(1);
    expect(r.after.maxDay).toBe(r.before.maxDay + 1);
    r = strike('heavy-food');
    expect(weightCarried(r.after)).toBe(weightCarried(r.before) * 2);
    expect(computeStats(strike('jewelry-crisis').after).resource.jewelry.sellPrice).toBe(1800);
    expect(computeStats(strike('silk-crisis').after).resource.silk.sellPrice).toBe(800);
    expect(computeStats(strike('food-crisis').after).resource.food.buyPrice).toBe(15);
    expect(dailyFoodConsumption(strike('camel-sick').after)).toBe(2 + 4);
  });

  it('fix: saving crisis never pushes the rate below 10%', () => {
    expect(strike('saving-crisis', (s) => (s.savingRate = 20)).after.savingRate).toBe(10);
  });

  it('fix: the drawn disaster is always possible', () => {
    const impossible = new Set(['steal', 'traders-left', 'seer', 'heavy-food', 'broke-leg']);
    const drawn = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) {
      const s = structuredClone(newGame({ mode: 'traveler', seed }));
      s.gold = 100; // steal impossible (< 5000)
      s.traders = 0; // traders-left impossible
      s.camels = 0; // seer impossible
      s.inventory.food = 4; // 8 weight of 20: heavy-food would not fit... after doubling it needs 8 more
      s.inventory.marble = 0;
      s.inventory.pottery = 2; // 10 weight -> 2 free: broke-leg and heavy-food impossible
      const met = act(scheduleTomorrow(s, 'disaster'), { type: 'save' });
      expect(met.phase).toBe('disaster');
      drawn.add(met.disaster!);
    }
    for (const id of drawn) expect(impossible.has(id)).toBe(false);
    expect(drawn.size).toBe(DISASTERS.length - impossible.size);
  });
});
