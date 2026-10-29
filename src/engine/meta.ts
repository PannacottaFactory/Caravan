// Meta-progression: best scores, unlocked factions/modes/characters and local achievements.
// Pure functions over a serializable Profile; storage is handled outside the engine.

import { FACTIONS, MERCHANT_UNLOCK_FACTION, TRAVELER_UNLOCK_FACTION, WITCH_UNLOCK_FACTION, type FactionId } from './data/factions';
import type { GameState } from './state';
import type { Mode } from './types';

export interface Profile {
  version: 1;
  bestScores: Record<FactionId, { classical: number; traveler: number }>;
  achievements: string[];
  totals: { gamesFinished: number; defeats: number; tradersAtEnd: number; camelsAtEnd: number };
  /** Ids of one-time popups already shown (merchant unlocked, witch unlocked, traveler unlocked). */
  seenPopups: string[];
  /** Last daily challenge played to the end. */
  daily?: { date: string; score: number };
}

export function createProfile(): Profile {
  return {
    version: 1,
    bestScores: {},
    achievements: [],
    totals: { gamesFinished: 0, defeats: 0, tradersAtEnd: 0, camelsAtEnd: 0 },
    seenPopups: [],
  };
}

export function bestScore(profile: Profile, factionId: FactionId, mode: Mode): number {
  return profile.bestScores[factionId]?.[mode] ?? 0;
}

// ------------------------------------------------------------------ unlocks

/** A faction is unlocked in Classical when the previous one reached its threshold. */
export function isFactionUnlocked(profile: Profile, factionId: FactionId): boolean {
  const index = FACTIONS.findIndex((f) => f.id === factionId);
  if (index <= 0) return index === 0;
  const previous = FACTIONS[index - 1]!;
  return previous.unlockNextScore !== null && bestScore(profile, previous.id, 'classical') >= previous.unlockNextScore;
}

export function isTravelerModeUnlocked(profile: Profile): boolean {
  return isFactionUnlocked(profile, TRAVELER_UNLOCK_FACTION);
}

export function isTravelerUnlockedFor(profile: Profile, factionId: FactionId): boolean {
  const faction = FACTIONS.find((f) => f.id === factionId);
  if (!faction || !isTravelerModeUnlocked(profile) || !isFactionUnlocked(profile, factionId)) return false;
  return bestScore(profile, factionId, 'classical') >= faction.unlockTravelerScore;
}

export function isPlayable(profile: Profile, factionId: FactionId, mode: Mode): boolean {
  return mode === 'classical' ? isFactionUnlocked(profile, factionId) : isTravelerUnlockedFor(profile, factionId);
}

export function gameUnlocks(profile: Profile): { merchant: boolean; witch: boolean } {
  return {
    merchant: isFactionUnlocked(profile, MERCHANT_UNLOCK_FACTION),
    witch: isFactionUnlocked(profile, WITCH_UNLOCK_FACTION),
  };
}

/** Text for the faction screen: what is needed to unlock this faction in this mode. */
export function unlockRequirement(profile: Profile, factionId: FactionId, mode: Mode): string | null {
  if (isPlayable(profile, factionId, mode)) return null;
  const index = FACTIONS.findIndex((f) => f.id === factionId);
  const faction = FACTIONS[index]!;
  if (mode === 'traveler') {
    if (!isTravelerModeUnlocked(profile)) return 'Unlock the Sanctifan faction to unlock the Traveler Mode';
    return `Make ${faction.unlockTravelerScore} points with ${faction.name} in Classical Mode to unlock this faction`;
  }
  const previous = FACTIONS[index - 1]!;
  let extra = '';
  if (factionId === MERCHANT_UNLOCK_FACTION) extra = ' and the MYSTERIOUS MERCHANT';
  else if (factionId === WITCH_UNLOCK_FACTION) extra = ' and the OLD WITCH';
  else if (factionId === TRAVELER_UNLOCK_FACTION) extra = ' and the TRAVELER MODE';
  return `Make ${previous.unlockNextScore} points with ${previous.name} to unlock this faction${extra}`;
}

// ------------------------------------------------------------------ achievements
// Same list as the Google Play achievements of the Android game, stored locally.

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'do-you-call-it-gold', name: 'Do you call it gold?', description: 'Make 5,000 points' },
  { id: 'trading-beginner', name: 'Trading beginner', description: 'Make 15,000 points' },
  { id: 'king-of-traders', name: 'King of traders', description: 'Make 30,000 points' },
  { id: 'call-me-midas', name: 'Call me Midas', description: 'Make 60,000 points' },
  { id: 'its-raining-gold', name: "It's raining gold", description: 'Make 80,000 points' },
  { id: 'capitalism-my-love', name: 'Capitalism, my love', description: 'Make 100,000 points' },
  { id: 'camel-lover', name: 'Camel lover', description: 'Finish a game with 5 camels or more' },
  { id: 'im-your-boss-now', name: "I'm your boss now", description: 'Finish a game with 5 traders or more' },
  { id: 'save-like-squirrel', name: 'Save like a squirrel', description: 'Save gold 3 times in one game' },
  { id: 'why-do-you-follow-me', name: 'Why do you follow me?', description: 'Unlock the Mysterious Merchant' },
  { id: 'old-and-scary', name: 'Old and scary', description: 'Unlock the Old Witch' },
  { id: 'travel-makes-you-richer', name: 'Travel makes you richer', description: 'Unlock the Traveler Mode' },
  { id: 'human-resource', name: 'Human resource', description: 'Finish games with 50 traders in total' },
  { id: 'the-camel-whisperer', name: 'The camel whisperer', description: 'Finish games with 50 camels in total' },
  { id: 'i-again-forgot-the-water', name: 'I again forgot the water', description: 'Lose 20 times' },
  { id: 'business-newbie', name: 'Business newbie', description: 'Finish 10 games' },
  { id: 'business-man', name: 'Business man', description: 'Finish 100 games' },
  { id: 'business-prince', name: 'Business prince', description: 'Finish 1,000 games' },
];

const SCORE_ACHIEVEMENTS: [number, string][] = [
  [5000, 'do-you-call-it-gold'],
  [15000, 'trading-beginner'],
  [30000, 'king-of-traders'],
  [60000, 'call-me-midas'],
  [80000, 'its-raining-gold'],
  [100000, 'capitalism-my-love'],
];

function unlockedAchievements(profile: Profile, game: GameState | null): string[] {
  const ids: string[] = [];
  const t = profile.totals;
  if (game?.score) {
    for (const [threshold, id] of SCORE_ACHIEVEMENTS) if (game.score.total >= threshold) ids.push(id);
    if (game.camels >= 5) ids.push('camel-lover');
    if (game.traders >= 5) ids.push('im-your-boss-now');
  }
  if (game && game.counters.saves >= 3) ids.push('save-like-squirrel');
  if (gameUnlocks(profile).merchant) ids.push('why-do-you-follow-me');
  if (gameUnlocks(profile).witch) ids.push('old-and-scary');
  if (isTravelerModeUnlocked(profile)) ids.push('travel-makes-you-richer');
  if (t.tradersAtEnd >= 50) ids.push('human-resource');
  if (t.camelsAtEnd >= 50) ids.push('the-camel-whisperer');
  if (t.defeats >= 20) ids.push('i-again-forgot-the-water');
  if (t.gamesFinished >= 10) ids.push('business-newbie');
  if (t.gamesFinished >= 100) ids.push('business-man');
  if (t.gamesFinished >= 1000) ids.push('business-prince');
  return ids;
}

// ------------------------------------------------------------------ recording results

export interface RecordResult {
  profile: Profile;
  newRecord: boolean;
  newAchievements: string[];
  newlyUnlockedFactions: FactionId[];
}

function withAchievements(before: Profile, after: Profile, game: GameState | null) {
  const newAchievements = unlockedAchievements(after, game).filter((id) => !after.achievements.includes(id));
  after.achievements = [...after.achievements, ...newAchievements];
  const newlyUnlockedFactions = FACTIONS.filter((f) => !isFactionUnlocked(before, f.id) && isFactionUnlocked(after, f.id)).map((f) => f.id);
  return { newAchievements, newlyUnlockedFactions };
}

/** Records a finished (victorious) game. */
export function recordVictory(profile: Profile, game: GameState): RecordResult {
  if (game.phase !== 'victory' || !game.score) throw new Error('Game is not finished');
  const after = structuredClone(profile);
  const previous = bestScore(profile, game.factionId, game.mode);
  const newRecord = game.score.total > previous;
  const entry = after.bestScores[game.factionId] ?? { classical: 0, traveler: 0 };
  if (newRecord) entry[game.mode] = game.score.total;
  after.bestScores[game.factionId] = entry;
  after.totals.gamesFinished += 1;
  after.totals.tradersAtEnd += game.traders;
  after.totals.camelsAtEnd += game.camels;
  if (game.daily) after.daily = { date: game.daily, score: game.score.total };
  return { profile: after, newRecord, ...withAchievements(profile, after, game) };
}

/** Records a defeat (counted even if the player continues afterwards). */
export function recordDefeat(profile: Profile): RecordResult {
  const after = structuredClone(profile);
  after.totals.defeats += 1;
  return { profile: after, newRecord: false, ...withAchievements(profile, after, null) };
}
