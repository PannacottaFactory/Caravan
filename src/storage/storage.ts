// Browser persistence (localStorage). Every access is guarded: storage can be
// unavailable (private mode, blocked cookies) and the game must still work.

import { createProfile, type GameState, type Profile } from '../engine';

const KEYS = {
  profile: 'caravan.profile.v1',
  game: 'caravan.game.v1',
  settings: 'caravan.settings.v1',
} as const;

export interface Settings {
  muted: boolean;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the game keeps running without saving.
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function loadProfile(): Profile {
  const p = read<Profile>(KEYS.profile);
  if (!p || p.version !== 1) return createProfile();
  // Fill fields added later with defaults.
  return { ...createProfile(), ...p, totals: { ...createProfile().totals, ...p.totals } };
}

export const saveProfile = (profile: Profile): void => write(KEYS.profile, profile);

export function loadGame(): GameState | null {
  const g = read<GameState>(KEYS.game);
  return g && g.version === 1 && g.phase !== 'victory' ? g : null;
}

export const saveGame = (game: GameState): void => write(KEYS.game, game);
export const clearGame = (): void => remove(KEYS.game);

export function loadSettings(): Settings {
  return { muted: false, ...read<Settings>(KEYS.settings) };
}

export const saveSettings = (settings: Settings): void => write(KEYS.settings, settings);
