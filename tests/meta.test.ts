import { describe, expect, it } from 'vitest';
import {
  createProfile,
  FACTIONS,
  gameUnlocks,
  isFactionUnlocked,
  isPlayable,
  isTravelerModeUnlocked,
  recordDefeat,
  recordVictory,
  unlockRequirement,
  type GameState,
  type Profile,
} from '../src/engine';
import { newGame } from './helpers';

function withScores(scores: Record<string, number>): Profile {
  const p = createProfile();
  for (const [id, classical] of Object.entries(scores)) p.bestScores[id] = { classical, traveler: 0 };
  return p;
}

/** Profile where every faction reached its unlock threshold in Classical. */
function allUnlocked(): Profile {
  return withScores(Object.fromEntries(FACTIONS.map((f) => [f.id, f.unlockNextScore ?? 0])));
}

function victory(score: number, factionId = 'normalia', extra: Partial<GameState> = {}): GameState {
  const s = structuredClone(newGame({ factionId }));
  Object.assign(s, extra);
  s.phase = 'victory';
  s.score = { gold: score, traders: 0, camels: 0, resources: { food: 0, spices: 0, pottery: 0, marble: 0, silk: 0, jewelry: 0 }, statuette: 0, total: score };
  return s;
}

describe('faction unlocks', () => {
  it('only Normalia is unlocked at first', () => {
    const p = createProfile();
    expect(FACTIONS.filter((f) => isFactionUnlocked(p, f.id)).map((f) => f.id)).toEqual(['normalia']);
    expect(gameUnlocks(p)).toEqual({ merchant: false, witch: false });
    expect(isTravelerModeUnlocked(p)).toBe(false);
  });

  it('a faction unlocks when the previous one reaches its threshold (>=)', () => {
    expect(isFactionUnlocked(withScores({ normalia: 2999 }), 'fang-mo')).toBe(false);
    expect(isFactionUnlocked(withScores({ normalia: 3000 }), 'fang-mo')).toBe(true);
    expect(unlockRequirement(withScores({ normalia: 2999 }), 'fang-mo', 'classical')).toBe(
      'Make 3000 points with Normalia to unlock this faction',
    );
    expect(unlockRequirement(withScores({ normalia: 3000 }), 'fang-mo', 'classical')).toBeNull();
  });

  it('fix: Mehaz and Ipartus unlock by score (12000 with Sanctifan, 15000 with Mehaz)', () => {
    expect(isFactionUnlocked(withScores({ sanctifan: 11999 }), 'mehaz')).toBe(false);
    expect(isFactionUnlocked(withScores({ sanctifan: 12000 }), 'mehaz')).toBe(true);
    expect(isFactionUnlocked(withScores({ mehaz: 15000 }), 'ipartus')).toBe(true);
  });

  it('merchant, witch and Traveler mode follow their factions', () => {
    expect(gameUnlocks(withScores({ mahaji: 8000 })).merchant).toBe(true);
    expect(gameUnlocks(withScores({ octoyashi: 10000 })).witch).toBe(true);
    expect(isTravelerModeUnlocked(withScores({ vilparino: 8000 }))).toBe(true);
    expect(unlockRequirement(createProfile(), 'tocaccialli', 'classical')).toContain('MYSTERIOUS MERCHANT');
  });

  it('Traveler per faction needs the mode and the Classical score', () => {
    const p = allUnlocked();
    expect(isPlayable(p, 'normalia', 'traveler')).toBe(false);
    p.bestScores['normalia'] = { classical: 14000, traveler: 0 };
    expect(isPlayable(p, 'normalia', 'traveler')).toBe(true);
    expect(isPlayable(withScores({ normalia: 14000 }), 'normalia', 'traveler')).toBe(false);
    expect(unlockRequirement(withScores({ normalia: 14000 }), 'normalia', 'traveler')).toContain('Sanctifan');
  });
});

describe('recording results', () => {
  it('keeps the best score per faction and mode, and flags new records', () => {
    let r = recordVictory(createProfile(), victory(4000));
    expect(r.newRecord).toBe(true);
    expect(r.profile.bestScores['normalia']?.classical).toBe(4000);
    expect(r.newlyUnlockedFactions).toEqual(['fang-mo']);
    r = recordVictory(r.profile, victory(3500));
    expect(r.newRecord).toBe(false);
    expect(r.profile.bestScores['normalia']?.classical).toBe(4000);
    expect(r.profile.totals.gamesFinished).toBe(2);
  });

  it('does not mutate the profile', () => {
    const p = createProfile();
    recordVictory(p, victory(4000));
    expect(p).toEqual(createProfile());
  });

  it('local achievements', () => {
    const r = recordVictory(createProfile(), victory(16000, 'normalia', { camels: 5, traders: 5, counters: { saves: 3, retries: 0 } }));
    expect(r.newAchievements).toEqual(
      expect.arrayContaining(['do-you-call-it-gold', 'trading-beginner', 'camel-lover', 'im-your-boss-now', 'save-like-squirrel']),
    );
    expect(r.newAchievements).not.toContain('king-of-traders');
    const again = recordVictory(r.profile, victory(16000));
    expect(again.newAchievements).toEqual([]);

    let p = createProfile();
    for (let i = 0; i < 20; i++) p = recordDefeat(p).profile;
    expect(p.achievements).toContain('i-again-forgot-the-water');
  });
});
