// Online leaderboard (Supabase REST API, no SDK needed).
// The publishable key is meant to be public: access is restricted by the
// Row Level Security rules defined in supabase/schema.sql.

import type { GameState, Mode } from '../engine';

const SUPABASE_URL = 'https://pjsjupwauzuiasyuvdqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HK5GsU6FXU_E1c8nAnvsxA_qVTXYQWG';
const API = `${SUPABASE_URL}/rest/v1`;
const TIMEOUT_MS = 8000;

export interface LeaderboardEntry {
  client_id: string;
  player: string;
  faction: string;
  mode: Mode;
  score: number;
  created_at: string;
}

export const PLAYER_NAME_PATTERN = /^[\p{L}\p{N} _.-]{2,20}$/u;

export function isValidPlayerName(name: string): boolean {
  return PLAYER_NAME_PATTERN.test(name.trim());
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...init.headers },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { message?: string; code?: string } | null;
      if (body?.code === '23505') throw new Error('This journey was already submitted');
      if (body?.code === 'PGRST205' || body?.code === '42P01') throw new Error('The online leaderboard is not available yet.');
      throw new Error(body?.message ?? `Server error (${res.status})`);
    }
    return res;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('The server did not answer. Check your connection.');
    if (e instanceof TypeError) throw new Error('Cannot reach the leaderboard. Check your connection.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Top players (best score per player) for one faction and mode. */
export async function fetchTop(faction: string, mode: Mode, limit = 20): Promise<LeaderboardEntry[]> {
  const q = new URLSearchParams({
    select: 'client_id,player,faction,mode,score,created_at',
    faction: `eq.${faction}`,
    mode: `eq.${mode}`,
    order: 'score.desc,created_at.asc',
    limit: String(limit),
  });
  const res = await request(`/leaderboard?${q}`);
  return (await res.json()) as LeaderboardEntry[];
}

/** Rank a score would have on the board (1 = first). */
export async function rankOf(faction: string, mode: Mode, score: number): Promise<number> {
  const q = new URLSearchParams({ select: 'client_id', faction: `eq.${faction}`, mode: `eq.${mode}`, score: `gt.${score}`, limit: '1' });
  const res = await request(`/leaderboard?${q}`, { headers: { Prefer: 'count=exact' } });
  const total = Number(res.headers.get('content-range')?.split('/')[1] ?? 0);
  return (Number.isFinite(total) ? total : 0) + 1;
}

/** Sends the score of a finished game. Returns the player's rank. */
export async function submitScore(game: GameState, player: string, clientId: string): Promise<number> {
  if (!game.score) throw new Error('The game is not finished');
  await request('/scores', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      client_id: clientId,
      player: player.trim(),
      faction: game.factionId,
      mode: game.mode,
      score: game.score.total,
      days: game.maxDay,
      seed: game.seed,
    }),
  });
  return rankOf(game.factionId, game.mode, game.score.total);
}
