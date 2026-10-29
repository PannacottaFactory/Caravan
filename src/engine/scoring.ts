import { CREW_POINTS, RESOURCES } from './data/resources';
import { computeStats } from './stats';
import { RESOURCE_IDS, type ResourceId } from './types';
import type { GameState } from './state';

export interface ScoreBreakdown {
  gold: number;
  traders: number;
  camels: number;
  resources: Record<ResourceId, number>;
  statuette: number;
  total: number;
}

/**
 * Final score: gold + crew + goods at their fixed point value + Wooden statuette bonus.
 * Food is worth nothing. Point values do not follow price modifiers (unchanged from Unity).
 */
export function computeScore(state: GameState): ScoreBreakdown {
  const stats = computeStats(state);
  const resources = {} as Record<ResourceId, number>;
  for (const id of RESOURCE_IDS) resources[id] = state.inventory[id] * RESOURCES[id].points;

  const traders = state.traders * CREW_POINTS.trader;
  const camels = state.camels * CREW_POINTS.camel;
  const statuette = stats.global.statuettePoints * (state.traders + state.camels);
  const goods = RESOURCE_IDS.reduce((sum, id) => sum + resources[id], 0);

  return {
    gold: state.gold,
    traders,
    camels,
    resources,
    statuette,
    total: state.gold + traders + camels + goods + statuette,
  };
}
