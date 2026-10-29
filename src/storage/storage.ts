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
  /** Name shown on the online leaderboard. */
  playerName: string;
  /** Random anonymous id of this browser, used by the online leaderboard. */
  clientId: string;
}

function newClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback for old browsers: RFC 4122 v4 from Math.random.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
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
  const saved = read<Partial<Settings>>(KEYS.settings) ?? {};
  const settings: Settings = { muted: false, playerName: '', ...saved, clientId: saved.clientId || newClientId() };
  if (!saved.clientId) write(KEYS.settings, settings);
  return settings;
}

export const saveSettings = (settings: Settings): void => write(KEYS.settings, settings);
