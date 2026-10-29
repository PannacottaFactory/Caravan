import { applyAction, createGame, type GameAction, type GameState, type NewGameConfig } from '../src/engine';

export function newGame(overrides: Partial<NewGameConfig> = {}): GameState {
  return createGame({
    mode: 'classical',
    factionId: 'normalia',
    seed: 42,
    unlocks: { merchant: false, witch: false },
    ...overrides,
  });
}

/** Applies an action and fails the test if it is rejected. */
export function act(state: GameState, action: GameAction): GameState {
  const result = applyAction(state, action);
  if (!result.ok) throw new Error(`Action ${action.type} rejected: ${result.error}`);
  return result.state;
}

export function errorOf(state: GameState, action: GameAction): string | null {
  const result = applyAction(state, action);
  return result.ok ? null : result.error;
}

/** Forces an event to happen on the next day (tests only). */
export function scheduleTomorrow(state: GameState, kind: 'merchant' | 'witch' | 'disaster'): GameState {
  const s = structuredClone(state);
  s.events[kind] = { day: s.day + 1, done: false };
  return s;
}

/** Gives food so that the caravan never starves during a test. */
export function withFood(state: GameState, food: number): GameState {
  const s = structuredClone(state);
  s.inventory.food = food;
  return s;
}
