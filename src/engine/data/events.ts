import type { Effect } from '../types';

// ---------------------------------------------------------------- Traveler improvements
// Source: PrepareCaravan.unity (Prepare.ImprovmentsInfos) + effects spread across scripts.

export interface ImprovementDef {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
}

export const IMPROVEMENTS: readonly ImprovementDef[] = [
  { id: 'weight', name: 'Weight', description: '+10 initial weight', effects: [{ kind: 'stat', stat: 'capacityBonus', op: 'add', value: 10 }] },
  { id: 'gold', name: 'Gold', description: '+10 initial gold', effects: [{ kind: 'add', target: 'gold', value: 10 }] },
  { id: 'pottery', name: 'Pottery', description: 'Pottery buying price decreased by 5', effects: [{ kind: 'resourceStat', stat: 'buyPrice', resource: 'pottery', op: 'add', value: -5 }] },
  { id: 'marble', name: 'Marble', description: 'Marble weight decreased by 5', effects: [{ kind: 'resourceStat', stat: 'unitWeight', resource: 'marble', op: 'add', value: -5 }] },
  { id: 'jewelry', name: 'Jewelry', description: 'Jewelry selling price increased by 300', effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: 'jewelry', op: 'add', value: 300 }] },
  { id: 'trader', name: 'Trader', description: 'Trader cost decreased by 10', effects: [{ kind: 'stat', stat: 'traderCost', op: 'add', value: -10 }] },
  { id: 'camel', name: 'Camel', description: 'Your camels cost nothing', effects: [{ kind: 'stat', stat: 'camelCost', op: 'mul', value: 0 }] },
  { id: 'traders-income', name: 'Traders income', description: 'Traders income increased by 5', effects: [{ kind: 'stat', stat: 'traderIncome', op: 'add', value: 5 }] },
  { id: 'load-capacity', name: 'Load capacity', description: 'Camels load capacity increased by 5', effects: [{ kind: 'stat', stat: 'camelLoad', op: 'add', value: 5 }] },
  { id: 'saving', name: 'Saving', description: 'Saving rate increased by 5%', effects: [{ kind: 'add', target: 'savingRate', value: 5 }] },
];

// ---------------------------------------------------------------- Mysterious Merchant
// Source: MerchantPanel.cs. Prices are scaled by the merchantPricePct stat (Vilparino: 80%).

export interface MerchantItemDef {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  effects: Effect[];
}

export const MERCHANT_ITEMS: readonly MerchantItemDef[] = [
  { id: 'cornucopia', name: 'Cornucopia', description: 'Reduce food consumption by 2', basePrice: 25, effects: [{ kind: 'stat', stat: 'foodReduction', op: 'add', value: 2 }] },
  { id: 'route-to-mahaji', name: 'Route to Mahaji', description: 'Increase selling price of spices by 20', basePrice: 25, effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: 'spices', op: 'add', value: 20 }] },
  { id: 'wooden-statuette', name: 'Wooden statuette', description: '+500 victory points for each camel and trader you own at the end of the game', basePrice: 25, effects: [{ kind: 'stat', stat: 'statuettePoints', op: 'add', value: 500 }] },
  { id: 'canvas-bag', name: 'Canvas bag', description: '+20 weight capacity', basePrice: 50, effects: [{ kind: 'stat', stat: 'capacityBonus', op: 'add', value: 20 }] },
  { id: 'leaders-necklace', name: "Leader's necklace", description: 'Add a trader to your crew', basePrice: 50, effects: [{ kind: 'recruitTrader' }] },
  { id: 'hand-of-midas', name: 'Hand of Midas', description: '+100 gold when you sell your resources', basePrice: 50, effects: [{ kind: 'stat', stat: 'sellBonus', op: 'add', value: 100 }] },
  { id: 'sturdy-saddle', name: 'Sturdy saddle', description: 'Camels load capacity increased by 20', basePrice: 100, effects: [{ kind: 'stat', stat: 'camelLoad', op: 'add', value: 20 }] },
  { id: 'magic-clepsydra', name: 'Magic Clepsydra', description: 'One more day', basePrice: 100, effects: [{ kind: 'add', target: 'maxDay', value: 1 }] },
  { id: 'blue-treasure', name: 'Blue Treasure', description: 'Increase your saving rate by 20%', basePrice: 100, effects: [{ kind: 'add', target: 'savingRate', value: 20 }] },
];

// ---------------------------------------------------------------- Old Witch
// Source: WitchPanel.cs. Each power has a bonus and a malus.

export interface WitchPowerDef {
  id: string;
  name: string;
  bonus: string;
  malus: string;
  effects: Effect[];
}

export const WITCH_POWERS: readonly WitchPowerDef[] = [
  {
    id: 'presents-gift', name: "Present's Gift",
    bonus: 'Maximum weight increased by 20', malus: 'Saving rate decreased by 20%',
    effects: [{ kind: 'stat', stat: 'capacityBonus', op: 'add', value: 20 }, { kind: 'add', target: 'savingRate', value: -20 }],
  },
  {
    id: 'vertue-of-patience', name: 'Vertue of Patience',
    bonus: "Saving rate doesn't decrease anymore", malus: 'Buying price of jewelry increased by 100',
    effects: [{ kind: 'stat', stat: 'savingDecay', op: 'set', value: 0 }, { kind: 'resourceStat', stat: 'buyPrice', resource: 'jewelry', op: 'add', value: 100 }],
  },
  {
    id: 'midas-was-a-trader', name: 'Midas Was a Trader',
    bonus: 'Earn 150 more gold everyday for every trader you have', malus: 'Marble selling price decreased to 0',
    effects: [{ kind: 'stat', stat: 'traderIncome', op: 'add', value: 150 }, { kind: 'resourceStat', stat: 'sellPrice', resource: 'marble', op: 'set', value: 0 }],
  },
  {
    id: 'camelization', name: 'Camelization',
    bonus: 'Every camel can carry 10 more weight', malus: 'Camels consume twice more food',
    effects: [{ kind: 'stat', stat: 'camelLoad', op: 'add', value: 10 }, { kind: 'stat', stat: 'camelFood', op: 'mul', value: 2 }],
  },
  {
    id: 'time-is-money', name: 'Time Is Money',
    bonus: 'You have 1 more day', malus: 'Jewelry selling price decreased by 500',
    effects: [{ kind: 'add', target: 'maxDay', value: 1 }, { kind: 'resourceStat', stat: 'sellPrice', resource: 'jewelry', op: 'add', value: -500 }],
  },
  {
    id: 'animal-lover', name: 'Animal Lover',
    bonus: 'Add two camels to your crew', malus: 'You have one less day',
    effects: [{ kind: 'add', target: 'camels', value: 2 }, { kind: 'add', target: 'maxDay', value: -1 }],
  },
  {
    id: 'oasis-of-sanctifan', name: 'Oasis of Sanctifan',
    bonus: "Traders and camels don't consume food anymore", malus: 'Silk buying price increased by 200',
    effects: [
      { kind: 'stat', stat: 'traderFood', op: 'set', value: 0 },
      { kind: 'stat', stat: 'camelFood', op: 'set', value: 0 },
      { kind: 'resourceStat', stat: 'buyPrice', resource: 'silk', op: 'add', value: 200 },
    ],
  },
  {
    id: 'the-stonecutter', name: 'The Stonecutter',
    bonus: 'Marble weight decreased by 15', malus: 'Marble buying price increased by 60',
    effects: [{ kind: 'resourceStat', stat: 'unitWeight', resource: 'marble', op: 'add', value: -15 }, { kind: 'resourceStat', stat: 'buyPrice', resource: 'marble', op: 'add', value: 60 }],
  },
];

// ---------------------------------------------------------------- Disasters (Traveler only)
// Source: PlayScene.unity (Disaster.DisastersInfos) + Disaster.cs.
// `available` restores the filter that was commented out in the Unity code, plus guards
// against impossible effects (no camel to lose, no trader to lose, food that weighs nothing).

export interface DisasterContext {
  gold: number;
  traders: number;
  camels: number;
  freeCapacity: number;
  camelLoad: number;
  foodOwned: number;
  foodUnitWeight: number;
}

export interface DisasterDef {
  id: string;
  description: string;
  effectText: string;
  effects: Effect[];
  available: (ctx: DisasterContext) => boolean;
}

const always = (): boolean => true;

export const DISASTERS: readonly DisasterDef[] = [
  {
    id: 'steal',
    description: "You didn't notice this man searching in your pocket last night... Yes, he stole you. And that was pretty easy!",
    effectText: 'You lose 25% of your gold',
    effects: [{ kind: 'scaleGold', factor: 0.75 }],
    available: (c) => c.gold >= 5000,
  },
  {
    id: 'broke-leg',
    description: "One of your camels broke his leg. He won't be able to carry as much as before!",
    effectText: 'You lose 10 maximum weight',
    effects: [{ kind: 'stat', stat: 'capacityBonus', op: 'add', value: -10 }],
    available: (c) => c.freeCapacity >= 10,
  },
  {
    id: 'traders-left',
    description: "All your traders left your crew! You shouldn't keep all the gold for you.",
    effectText: 'You lose your traders',
    effects: [{ kind: 'set', target: 'traders', value: 0 }],
    available: (c) => c.traders > 0,
  },
  {
    id: 'marble-crisis',
    description: "You didn't notice that you arrived in a rich city. Here everyone has marble, they don't need it.",
    effectText: 'Marble selling price decreased to 0',
    effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: 'marble', op: 'set', value: 0 }],
    available: always,
  },
  {
    id: 'saving-crisis',
    description: "Investors don't believe in your business anymore. Your saving rate is bad now. Really bad.",
    effectText: 'Your saving rate is decreased by 30%',
    effects: [{ kind: 'add', target: 'savingRate', value: -30 }],
    available: always,
  },
  {
    id: 'silk-penury',
    description: 'The new trend is to have silk everywhere at home. The prices have never been so high!',
    effectText: 'Silk buying price increased by 200',
    effects: [{ kind: 'resourceStat', stat: 'buyPrice', resource: 'silk', op: 'add', value: 200 }],
    available: always,
  },
  {
    id: 'seer',
    description: 'A seer announced you the death of one of your camels. But she also tells you that your journey will last longer.',
    effectText: 'You lose one camel. You have one more day',
    effects: [{ kind: 'add', target: 'camels', value: -1 }, { kind: 'add', target: 'maxDay', value: 1 }],
    available: (c) => c.camels > 0 && c.freeCapacity >= c.camelLoad,
  },
  {
    id: 'heavy-food',
    description: 'You enter in a region where food is heavier. How can they eat all of this?!',
    effectText: 'Food weight is doubled',
    effects: [{ kind: 'resourceStat', stat: 'unitWeight', resource: 'food', op: 'mul', value: 2 }],
    available: (c) => c.foodUnitWeight > 0 && c.freeCapacity >= c.foodOwned * c.foodUnitWeight,
  },
  {
    id: 'jewelry-crisis',
    description: 'The king of this kingdom offered jewelries to all families. He must be appreciated.',
    effectText: 'Jewelry selling price decreased by 700',
    effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: 'jewelry', op: 'add', value: -700 }],
    available: always,
  },
  {
    id: 'silk-crisis',
    description: 'The "silk everywhere" trend is over. You didn\'t see it coming. Are you old-fashioned?',
    effectText: 'Silk selling price decreased by 350',
    effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: 'silk', op: 'add', value: -350 }],
    available: always,
  },
  {
    id: 'food-crisis',
    description: 'You have to cross this desert. And everyone knows that food and water are rare there. It will be rude!',
    effectText: 'Food buying prices increased to 15',
    effects: [{ kind: 'resourceStat', stat: 'buyPrice', resource: 'food', op: 'set', value: 15 }],
    available: always,
  },
  {
    id: 'camel-sick',
    description: 'One of your camels is sick. He needs much more food and water!',
    effectText: 'Camels food consumption is doubled',
    effects: [{ kind: 'stat', stat: 'camelFood', op: 'mul', value: 2 }],
    available: always,
  },
];

function findById<T extends { id: string }>(list: readonly T[], id: string, label: string): T {
  const found = list.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown ${label}: ${id}`);
  return found;
}

export const getImprovement = (id: string): ImprovementDef => findById(IMPROVEMENTS, id, 'improvement');
export const getMerchantItem = (id: string): MerchantItemDef => findById(MERCHANT_ITEMS, id, 'merchant item');
export const getWitchPower = (id: string): WitchPowerDef => findById(WITCH_POWERS, id, 'witch power');
export const getDisaster = (id: string): DisasterDef => findById(DISASTERS, id, 'disaster');
