// Application state and controller. Screens read `state` and call the functions
// below; every change schedules a re-render.

import {
  ACHIEVEMENTS,
  applyAction,
  capacity,
  computeStats,
  createGame,
  weightCarried,
  ERROR_MESSAGES,
  FACTIONS,
  gameUnlocks,
  getFaction,
  isPlayable,
  recordDefeat,
  recordVictory,
  type GameAction,
  type GameEvent,
  type GameState,
  type Mode,
  type Profile,
  type Quantities,
  type RecordResult,
} from '../engine';
import { clearGame, loadGame, loadProfile, loadSettings, saveGame, saveProfile, saveSettings, type Settings } from '../storage/storage';
import { playSfx, setMuted } from './audio';
import { fetchTop, isValidPlayerName, submitScore, type LeaderboardEntry } from '../online/leaderboard';

export type Screen = 'title' | 'factions' | 'prepare' | 'game';
export type Tab = 'buy' | 'sell' | 'crew' | 'save';
export type Modal = 'howto' | 'credits' | 'records' | 'achievements' | 'menu' | 'newGame' | 'item' | null;

export interface Toast {
  id: number;
  text: string;
  kind: 'error' | 'info' | 'success';
}

export interface OnlineBoard {
  faction: string;
  mode: Mode;
  status: 'idle' | 'loading' | 'ready' | 'error';
  entries: LeaderboardEntry[];
  error?: string;
}

export interface Submission {
  /** Seed of the game this submission is about. */
  seed: number | null;
  status: 'idle' | 'sending' | 'done' | 'error';
  rank?: number;
  error?: string;
}

export interface AppState {
  screen: Screen;
  profile: Profile;
  settings: Settings;
  game: GameState | null;
  modal: Modal;

  // Faction / mode selection
  factionIndex: number;
  mode: Mode;
  improvements: string[];

  // Game screen
  tab: Tab;
  buyDraft: Quantities;
  sellDraft: Quantities;
  merchantChoice: string;
  witchChoice: string;
  /** Increases on each new day to replay the "Day N" banner. */
  dayBanner: number;
  /** Result of the last finished game (victory screen). */
  lastResult: RecordResult | null;
  /** Online leaderboard */
  recordsTab: 'local' | 'world';
  board: OnlineBoard;
  submission: Submission;
  toasts: Toast[];
}

const initialGame = loadGame();

export const state: AppState = {
  screen: 'title',
  profile: loadProfile(),
  settings: loadSettings(),
  game: initialGame,
  modal: null,
  factionIndex: 0,
  mode: 'classical',
  improvements: [],
  tab: 'buy',
  buyDraft: {},
  sellDraft: {},
  merchantChoice: 'cornucopia',
  witchChoice: 'presents-gift',
  dayBanner: 0,
  lastResult: null,
  recordsTab: 'local',
  board: { faction: FACTIONS[0]!.id, mode: 'classical', status: 'idle', entries: [] },
  submission: { seed: null, status: 'idle' },
  toasts: [],
};

setMuted(state.settings.muted);

// ------------------------------------------------------------------ rendering hook

let renderer: () => void = () => undefined;
let scheduled = false;

export function onChange(fn: () => void): void {
  renderer = fn;
}

export function update(patch: Partial<AppState> = {}): void {
  Object.assign(state, patch);
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    renderer();
  });
}

// ------------------------------------------------------------------ toasts

let toastId = 0;

export function toast(text: string, kind: Toast['kind'] = 'info', duration = 2600): void {
  const id = ++toastId;
  update({ toasts: [...state.toasts, { id, text, kind }] });
  setTimeout(() => update({ toasts: state.toasts.filter((t) => t.id !== id) }), duration);
}

// ------------------------------------------------------------------ navigation

export function goTo(screen: Screen): void {
  playSfx('click');
  update({ screen, modal: null });
}

export function openModal(modal: Modal): void {
  playSfx('slideIn');
  update({ modal });
}

export function closeModal(): void {
  playSfx('slideOut');
  update({ modal: null });
}

export function toggleSound(): void {
  const settings = { ...state.settings, muted: !state.settings.muted };
  saveSettings(settings);
  setMuted(settings.muted);
  update({ settings });
}

export const selectedFaction = () => FACTIONS[state.factionIndex]!;

export function selectFaction(index: number): void {
  const n = FACTIONS.length;
  update({ factionIndex: ((index % n) + n) % n });
}

export function setMode(mode: Mode): void {
  update({ mode });
}

// ------------------------------------------------------------------ new game

export function playSelectedFaction(): void {
  const faction = selectedFaction();
  if (!isPlayable(state.profile, faction.id, state.mode)) return;
  playSfx('click');
  if (state.mode === 'traveler') update({ screen: 'prepare', improvements: [] });
  else startGame();
}

export function toggleImprovement(id: string): void {
  const has = state.improvements.includes(id);
  if (!has && state.improvements.length >= 3) {
    toast('No points left', 'error');
    return;
  }
  playSfx('click');
  update({ improvements: has ? state.improvements.filter((x) => x !== id) : [...state.improvements, id] });
}

export function startGame(): void {
  const game = createGame({
    mode: state.mode,
    factionId: selectedFaction().id,
    improvements: state.mode === 'traveler' ? state.improvements : [],
    unlocks: gameUnlocks(state.profile),
  });
  saveGame(game);
  update({
    game,
    screen: 'game',
    modal: null,
    tab: 'buy',
    buyDraft: {},
    sellDraft: {},
    lastResult: null,
    dayBanner: state.dayBanner + 1,
  });
}

export function continueGame(): void {
  const game = state.game;
  if (!game) return;
  playSfx('click');
  // Restore the selection so "Play again" replays the same faction and mode.
  update({
    screen: 'game',
    modal: null,
    dayBanner: state.dayBanner + 1,
    factionIndex: Math.max(0, FACTIONS.findIndex((f) => f.id === game.factionId)),
    mode: game.mode,
    improvements: [...game.improvements],
  });
}

/** "Play" on the title screen: asks before overwriting a game in progress. */
export function newGameFromTitle(): void {
  if (state.game && state.game.phase !== 'victory') openModal('newGame');
  else goTo('factions');
}

export function abandonGameAndChooseFaction(): void {
  clearGame();
  update({ game: null });
  goTo('factions');
}

/** Back to the title screen. The game in progress stays saved, except a finished one. */
export function backToMenu(): void {
  if (state.game?.phase === 'victory') {
    clearGame();
    update({ game: null });
  }
  goTo('title');
}

// ------------------------------------------------------------------ game actions

export function setTab(tab: Tab): void {
  if (tab === state.tab) return;
  playSfx('slideIn');
  update({ tab, buyDraft: {}, sellDraft: {} });
}

export function changeDraft(kind: 'buy' | 'sell', id: keyof Quantities, delta: number): void {
  const key = kind === 'buy' ? 'buyDraft' : 'sellDraft';
  const draft = { ...state[key] };
  const next = Math.min(Math.max(0, (draft[id] ?? 0) + delta), maxQuantity(kind, id));
  draft[id] = next;
  update({ [key]: draft } as Partial<AppState>);
}

/** Largest quantity of one resource that can be bought/sold with the rest of the draft. */
export function maxQuantity(kind: 'buy' | 'sell', id: keyof Quantities): number {
  const g = state.game;
  if (!g) return 0;
  if (kind === 'sell') return g.inventory[id];
  const stats = computeStats(g);
  let goldLeft = g.gold;
  let capLeft = capacity(g, stats) - weightCarried(g, stats);
  for (const [rid, q] of Object.entries(state.buyDraft) as [keyof Quantities, number][]) {
    if (rid === id || !q) continue;
    goldLeft -= q * stats.resource[rid].buyPrice;
    capLeft -= q * stats.resource[rid].unitWeight;
  }
  const { buyPrice, unitWeight } = stats.resource[id];
  const byGold = buyPrice > 0 ? Math.floor(goldLeft / buyPrice) : Infinity;
  const byWeight = unitWeight > 0 ? Math.floor(capLeft / unitWeight) : Infinity;
  const max = Math.min(byGold, byWeight);
  return Math.max(0, Number.isFinite(max) ? max : 99);
}

/** "Max" button: fills the quantity to the maximum, or resets it if already there. */
export function toggleMax(kind: 'buy' | 'sell', id: keyof Quantities): void {
  const key = kind === 'buy' ? 'buyDraft' : 'sellDraft';
  const max = maxQuantity(kind, id);
  const current = state[key][id] ?? 0;
  playSfx('click');
  update({ [key]: { ...state[key], [id]: current === max ? 0 : max } } as Partial<AppState>);
}

export function dispatch(action: GameAction): boolean {
  const game = state.game;
  if (!game) return false;
  const result = applyAction(game, action);
  if (!result.ok) {
    toast(ERROR_MESSAGES[result.error], 'error');
    return false;
  }
  playSfx('click');
  saveGame(result.state);
  update({ game: result.state, buyDraft: {}, sellDraft: {} });
  handleEvents(result.state, result.events);
  return true;
}

function handleEvents(game: GameState, events: GameEvent[]): void {
  for (const e of events) {
    switch (e.type) {
      case 'newDay':
        update({ dayBanner: state.dayBanner + 1 });
        if (game.events.merchant.day === game.day + 1 && !game.events.merchant.done) {
          setTimeout(() => toast('Rumors say a strange merchant will come tomorrow…', 'info', 3800), 1200);
        }
        break;
      case 'eventOpened':
        if (e.kind === 'merchant') {
          playSfx('merchant');
          update({ merchantChoice: 'cornucopia' });
        }
        if (e.kind === 'witch') {
          playSfx('witch');
          update({ witchChoice: 'presents-gift' });
        }
        if (e.kind === 'disaster') playSfx('slideIn');
        break;
      case 'defeat': {
        const r = recordDefeat(state.profile);
        commitProfile(r);
        break;
      }
      case 'victory': {
        const r = recordVictory(state.profile, game);
        commitProfile(r, false); // achievements are listed in the victory panel
        clearGame();
        update({ lastResult: r });
        break;
      }
    }
  }
}

function commitProfile(r: RecordResult, toastAchievements = true): void {
  saveProfile(r.profile);
  update({ profile: r.profile });
  if (!toastAchievements) return;
  r.newAchievements.forEach((id, i) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (a) setTimeout(() => toast(`🏆 Achievement unlocked: ${a.name}`, 'success', 4200), 900 + i * 700);
  });
}

export function retryDay(): void {
  dispatch({ type: 'retryDay' });
}

export async function shareScore(): Promise<void> {
  const g = state.game;
  if (!g?.score) return;
  const text = `I made ${g.score.total.toLocaleString('en-US')} points with ${getFaction(g.factionId).name} in Caravan! Can you beat my score?`;
  const url = location.href.split('#')[0] ?? '';
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Caravan', text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast('Score copied to the clipboard', 'success');
  } catch {
    // Share cancelled by the user.
  }
}

// ------------------------------------------------------------------ online leaderboard

export function openRecords(tab: 'local' | 'world', faction?: string, mode?: Mode): void {
  update({ recordsTab: tab });
  openModal('records');
  if (tab === 'world') void loadBoard(faction ?? state.board.faction, mode ?? state.board.mode);
}

export function setRecordsTab(tab: 'local' | 'world'): void {
  update({ recordsTab: tab });
  if (tab === 'world' && state.board.status !== 'ready') void loadBoard(state.board.faction, state.board.mode);
}

let boardRequest = 0;

export async function loadBoard(faction: string, mode: Mode): Promise<void> {
  const id = ++boardRequest;
  update({ board: { faction, mode, status: 'loading', entries: state.board.faction === faction && state.board.mode === mode ? state.board.entries : [] } });
  try {
    const entries = await fetchTop(faction, mode);
    if (id === boardRequest) update({ board: { faction, mode, status: 'ready', entries } });
  } catch (e) {
    if (id === boardRequest) update({ board: { faction, mode, status: 'error', entries: [], error: (e as Error).message } });
  }
}

export function setPlayerName(name: string): void {
  const settings = { ...state.settings, playerName: name.trim() };
  saveSettings(settings);
  update({ settings });
}

export async function submitCurrentScore(name: string): Promise<void> {
  const game = state.game;
  if (!game?.score) return;
  const player = name.trim();
  if (!isValidPlayerName(player)) {
    update({ submission: { seed: game.seed, status: 'error', error: '2 to 20 letters, digits, spaces, . _ -' } });
    return;
  }
  setPlayerName(player);
  if (import.meta.env.DEV) {
    // Local test server: never pollute the real leaderboard.
    update({ submission: { seed: game.seed, status: 'error', error: 'Test mode (local server): scores are not sent online.' } });
    return;
  }
  update({ submission: { seed: game.seed, status: 'sending' } });
  try {
    const rank = await submitScore(game, player, state.settings.clientId);
    playSfx('click');
    update({ submission: { seed: game.seed, status: 'done', rank } });
  } catch (e) {
    update({ submission: { seed: game.seed, status: 'error', error: (e as Error).message } });
  }
}
