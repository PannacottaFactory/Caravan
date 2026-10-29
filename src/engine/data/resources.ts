import type { ResourceId } from '../types';

export interface ResourceDef {
  id: ResourceId;
  name: string;
  unitWeight: number;
  buyPrice: number;
  sellPrice: number;
  /** Points per unit owned at the end of the game. */
  points: number;
}

// Source: PlayScene.unity (BuyGlobalPanel / SellPanel) and GlobalVariables.DayUpdate.
export const RESOURCES: Record<ResourceId, ResourceDef> = {
  food: { id: 'food', name: 'Food', unitWeight: 2, buyPrice: 3, sellPrice: 2, points: 0 },
  spices: { id: 'spices', name: 'Spices', unitWeight: 4, buyPrice: 5, sellPrice: 10, points: 5 },
  pottery: { id: 'pottery', name: 'Pottery', unitWeight: 5, buyPrice: 20, sellPrice: 33, points: 20 },
  marble: { id: 'marble', name: 'Marble', unitWeight: 20, buyPrice: 110, sellPrice: 300, points: 110 },
  silk: { id: 'silk', name: 'Silk', unitWeight: 8, buyPrice: 530, sellPrice: 1150, points: 530 },
  jewelry: { id: 'jewelry', name: 'Jewelry', unitWeight: 12, buyPrice: 900, sellPrice: 2500, points: 900 },
};

export const CREW_POINTS = { trader: 25, camel: 30 } as const;
