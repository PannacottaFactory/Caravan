import { describe, expect, it } from 'vitest';
import { isValidPlayerName } from '../src/online/leaderboard';

describe('player names', () => {
  it('accepts 2 to 20 letters, digits, spaces, . _ -', () => {
    expect(isValidPlayerName('Victor')).toBe(true);
    expect(isValidPlayerName('Élodie_42')).toBe(true);
    expect(isValidPlayerName('A')).toBe(false);
    expect(isValidPlayerName('x'.repeat(21))).toBe(false);
    expect(isValidPlayerName('<script>')).toBe(false);
  });
});
