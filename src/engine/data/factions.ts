import type { ModeEffect } from '../types';

export type FactionSpecial = 'callMerchant' | 'saveOnce';

export interface FactionDef {
  id: string;
  name: string;
  history: string;
  bonus: string;
  effects: ModeEffect[];
  special?: FactionSpecial;
  /** Classical best score needed with this faction to unlock the next one (null = last faction). */
  unlockNextScore: number | null;
  /** Classical best score needed with this faction to unlock its Traveler mode. */
  unlockTravelerScore: number;
}

// Source: Faction.unity (FactionManager.FactionsInfos) for texts and thresholds,
// GlobalVariables.FactionImpact and other scripts for effects.
// Mehaz and Ipartus were unlocked by the "No Ads" purchase in the Android game;
// on the web they are unlocked by score (Sanctifan -> Mehaz: 12000, Mehaz -> Ipartus: 15000).
export const FACTIONS: readonly FactionDef[] = [
  {
    id: 'normalia',
    name: 'Normalia',
    history:
      "They weren't the richest merchants. They weren't the smartest or the most famous. However they were always in this world and they don't seem to want to leave.",
    bonus: 'No effect',
    effects: [],
    unlockNextScore: 3000,
    unlockTravelerScore: 14000,
  },
  {
    id: 'fang-mo',
    name: 'Fang-Mô',
    history:
      'Oriental myths and legends are painted on Fang-Mô pottery. If you have the chance to hold some in your hands, be careful not to stumble. The ancient gods will make you regret it… The merchants too.',
    bonus: 'Begin with 1 pottery',
    effects: [{ kind: 'inventory', resource: 'pottery', op: 'add', value: 1 }],
    unlockNextScore: 5000,
    unlockTravelerScore: 18000,
  },
  {
    id: 'lexquise',
    name: "L'Exquise",
    history:
      'It is in the verdant West that L\'Exquise has made its fortune. Perfume and wine can be more persuasive than gold coins ... But they can just as easily cost you as well.',
    bonus: "Traders don't need food",
    effects: [{ kind: 'stat', stat: 'traderFood', op: 'set', value: 0 }],
    unlockNextScore: 12000,
    unlockTravelerScore: 24000,
  },
  {
    id: 'mahaji',
    name: 'Mahaji',
    history:
      'The wind regularly brings the scent of Mahaji spices. These odors have attracted more than one stranger into the Mahaji nets. It seems these spices can make someone crazy. Maybe even forever.',
    bonus: 'Selling price of spices increased from 10 to 15',
    effects: [{ kind: 'resourceStat', stat: 'sellPrice', resource: 'spices', op: 'add', value: 5 }],
    unlockNextScore: 8000,
    unlockTravelerScore: 14000,
  },
  {
    id: 'tocaccialli',
    name: 'Tocaccialli',
    history:
      'For generations the Tocacciali have been investing in jewels and their intuition has kept them ahead of their competition. However, good luck being part of this secretive family.',
    bonus: 'You have one more day',
    effects: [{ kind: 'add', target: 'maxDay', value: 1 }],
    unlockNextScore: 12000,
    unlockTravelerScore: 15000,
  },
  {
    id: 'bajaar',
    name: 'Bajaar',
    history:
      'The ambitious Bajaar faction was the first to discover the desert of the West. No matter where you go, there will always be a Baajarian to trade with you.',
    bonus: 'Traders income is doubled',
    effects: [
      { kind: 'stat', stat: 'traderIncome', op: 'mul', value: 2 },
      // Classical only: compensates the doubled income of day 1 (start with 30 gold).
      { kind: 'add', target: 'gold', value: -20, mode: 'classical' },
    ],
    unlockNextScore: 20000,
    unlockTravelerScore: 42000,
  },
  {
    id: 'doba-lao',
    name: 'Doba Lao',
    history:
      "The jungle is full of hidden gold and some fools have even tried to steal it. They probably didn't expect all the handmade arrows from the the protectors of nature, the Doba Lao.",
    bonus: 'Initial saving rate increased by 20%',
    effects: [{ kind: 'add', target: 'savingRate', value: 20 }],
    unlockNextScore: 10000,
    unlockTravelerScore: 15000,
  },
  {
    id: 'huangoz',
    name: 'Huangoz',
    history:
      "Can you imagine a city built entirely out of marble? If you can't then ask a Huangoz merchant to describe it to you. For the Huangoz, marble is as common as brick.",
    bonus: "Marble's buying price decreased from 110 to 90",
    effects: [{ kind: 'resourceStat', stat: 'buyPrice', resource: 'marble', op: 'add', value: -20 }],
    unlockNextScore: 11000,
    unlockTravelerScore: 18000,
  },
  {
    id: 'port-willam',
    name: 'Port-Willam',
    history:
      'The first boats capable of crossing oceans came from Port-Willam. Any time you taste exotic fruits and other delicacies, you can thank the sailors and traders of this Faction.',
    bonus: 'Initial weight increased by 15',
    effects: [{ kind: 'stat', stat: 'capacityBonus', op: 'add', value: 15 }],
    unlockNextScore: 10000,
    unlockTravelerScore: 13000,
  },
  {
    id: 'moonin',
    name: 'Moonin',
    history:
      'Moonin people seem to know everyone which made them excellent bounty-hunters. As civilization and laws developed they had to change their habits and occupations to suit a less primitive society. Trading did the job just fine.',
    bonus: 'Call the merchant at any moment',
    effects: [],
    special: 'callMerchant',
    unlockNextScore: 9000,
    unlockTravelerScore: 15000,
  },
  {
    id: 'cornecopea',
    name: 'Cornecopea',
    history:
      'All children know the myth of the lost city of Cornecopea. There are legends of magical trees that can grow in a few hours and waterfalls everywhere you look… Can this place really exist?',
    bonus: 'Food is free',
    effects: [{ kind: 'resourceStat', stat: 'buyPrice', resource: 'food', op: 'set', value: 0 }],
    unlockNextScore: 10000,
    unlockTravelerScore: 20000,
  },
  {
    id: 'eduming',
    name: 'Eduming',
    history:
      "Eduming means “human” in the old tongue. They understand that success doesn't depend on what resources you have but how you invest them. Build your future legacy, not your current riches.",
    bonus: 'Every new trader increases the saving rate by 10%',
    effects: [{ kind: 'stat', stat: 'savingPerRecruit', op: 'add', value: 10 }],
    unlockNextScore: 10000,
    unlockTravelerScore: 15000,
  },
  {
    id: 'octoyashi',
    name: 'Octoyashi',
    history:
      'In Octoyashi culture, everything is represented in multiples of eight. This is imposed by the religion but respecting it is no easy task.',
    bonus: 'Begins the game with 8 food',
    effects: [{ kind: 'inventory', resource: 'food', op: 'set', value: 8 }],
    unlockNextScore: 10000,
    unlockTravelerScore: 18000,
  },
  {
    id: 'kifuai',
    name: 'Kifuaï',
    history:
      "When they can walk well enough, all the orphans go to Kifuaï's capital. There they raise them in the art of trading. Yes, it is an investment, but it's a damn good one.",
    bonus: 'Initial gold increased by 10',
    effects: [{ kind: 'add', target: 'gold', value: 10 }],
    unlockNextScore: 8000,
    unlockTravelerScore: 12000,
  },
  {
    id: 'skjollird',
    name: 'Skjollird',
    history:
      'We thought it was impossible for anyone to live in the north. Somehow, the brave people of Skjollird did it though. With their mammoths, Skjollird traders can carry a lot of stuff… and sell a lot of stuff as well.',
    bonus: 'Camels are more expensive but carry more',
    effects: [
      { kind: 'stat', stat: 'camelCost', op: 'add', value: 5 },
      { kind: 'stat', stat: 'camelLoad', op: 'add', value: 10 },
    ],
    unlockNextScore: 10000,
    unlockTravelerScore: 25000,
  },
  {
    id: 'petrinov',
    name: 'Petrinov',
    history:
      'The real masters of industry come from the East. Their burning machines allowed the Petrinov to have a slight advantage over their competition. A slight advantage is sometimes all you need though.',
    bonus: 'Always saves at the same rate',
    effects: [{ kind: 'stat', stat: 'savingDecay', op: 'set', value: 0 }],
    unlockNextScore: 8000,
    unlockTravelerScore: 14000,
  },
  {
    id: 'jilliqo',
    name: 'Jilliqo',
    history:
      "When you see them you'll think the Jilliqo people are sickly, but they are as healthy as anyone. They just choose to keep their money for business instead of food. Trading is their priority, not eating.",
    bonus: 'Daily income increased by 10',
    effects: [
      { kind: 'stat', stat: 'incomeBonus', op: 'add', value: 10 },
      // Compensates the bonus received on day 1.
      { kind: 'add', target: 'gold', value: -10 },
    ],
    unlockNextScore: 9000,
    unlockTravelerScore: 14000,
  },
  {
    id: 'gayawaku',
    name: 'Gayawaku',
    history:
      "Being nomadic isn't all that bad of an idea. You will meet plenty of Gayawaku on the road who will trade with you, and many of these goods are made by the Gayawaku people themselves.",
    bonus: 'Food weigh nothing',
    effects: [{ kind: 'resourceStat', stat: 'unitWeight', resource: 'food', op: 'set', value: 0 }],
    unlockNextScore: 12000,
    unlockTravelerScore: 18000,
  },
  {
    id: 'vilparino',
    name: 'Vilparino',
    history:
      'There are two ways to negotiate with someone... speaking and threatening. The Vilparino are well known for their liberal use of the second option. If it has worked so far why change?',
    bonus: "Merchant's prices decreased by 20%",
    effects: [{ kind: 'stat', stat: 'merchantPricePct', op: 'add', value: -20 }],
    unlockNextScore: 8000,
    unlockTravelerScore: 14000,
  },
  {
    id: 'sanctifan',
    name: 'Sanctifan',
    history:
      'There is a legendary place where you can swim in a sea of pure gold. This place is home to the Sanctifan. Many people try to find this place but their chances of succeeding are remarkably low.',
    bonus: 'Can save once for free',
    effects: [],
    special: 'saveOnce',
    unlockNextScore: 12000,
    unlockTravelerScore: 16000,
  },
  {
    id: 'mehaz',
    name: 'Mehaz',
    history:
      "Mehaz camels have a special diet. That's why they travel further than others easily. Of course, they won't tell you the recipe.",
    bonus: "Camels don't need food",
    effects: [{ kind: 'stat', stat: 'camelFood', op: 'set', value: 0 }],
    unlockNextScore: 15000,
    unlockTravelerScore: 20000,
  },
  {
    id: 'ipartus',
    name: 'Ipartus',
    history:
      "The most famous professional weavers were born among Ipartus people. If you are invited to an Ipartus trade meeting, please choose your clothes carefully. If you don't, you may regret it. They will make you regret it.",
    bonus: 'Buying price of silk decreased by 100',
    effects: [{ kind: 'resourceStat', stat: 'buyPrice', resource: 'silk', op: 'add', value: -100 }],
    unlockNextScore: null,
    unlockTravelerScore: 20000,
  },
];

export type FactionId = string;

export function getFaction(id: FactionId): FactionDef {
  const faction = FACTIONS.find((f) => f.id === id);
  if (!faction) throw new Error(`Unknown faction: ${id}`);
  return faction;
}

/** Index of the faction whose unlock gives access to the Mysterious Merchant / Old Witch / Traveler mode. */
export const MERCHANT_UNLOCK_FACTION = 'tocaccialli';
export const WITCH_UNLOCK_FACTION = 'kifuai';
export const TRAVELER_UNLOCK_FACTION = 'sanctifan';
