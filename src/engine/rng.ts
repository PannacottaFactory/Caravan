// Seeded pseudo-random generator (mulberry32). The state is a plain number stored in
// the game state, so a game can be saved, reloaded and replayed identically.

export function nextRandom(state: number): [value: number, next: number] {
  const next = (state + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

/** Random integer in [min, max], both included. */
export function randomInt(state: number, min: number, max: number): [value: number, next: number] {
  const [r, next] = nextRandom(state);
  return [min + Math.floor(r * (max - min + 1)), next];
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) | 0;
}
