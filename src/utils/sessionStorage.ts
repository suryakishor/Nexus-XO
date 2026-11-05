import { DEFAULT_DIFFICULTY } from '../game/gameState';
import type { Difficulty, Scores, SessionSnapshot } from '../game/types';

export const SESSION_KEY = 'nexus-xo:session:v1';

const DEFAULT_SCORES: Scores = {
  human: 0,
  computer: 0,
  draws: 0,
};

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

function sanitizeScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

export function loadSession(): SessionSnapshot | null {
  const storage = getSessionStorage();

  if (!storage) {
    return null;
  }

  let rawSession: string | null;

  try {
    rawSession = storage.getItem(SESSION_KEY);
  } catch {
    return null;
  }

  if (!rawSession) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawSession);

    if (!isRecord(parsed)) {
      return null;
    }

    const rawScores = isRecord(parsed.scores) ? parsed.scores : {};

    return {
      scores: {
        human: sanitizeScore(rawScores.human),
        computer: sanitizeScore(rawScores.computer),
        draws: sanitizeScore(rawScores.draws),
      },
      difficulty: isDifficulty(parsed.difficulty) ? parsed.difficulty : DEFAULT_DIFFICULTY,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    };
  } catch {
    return null;
  }
}

export function saveSession(snapshot: SessionSnapshot): void {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable in private browsing modes. Scores then remain in React state only.
  }
}

export function clearSession(): void {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage access failures.
  }
}

export function createEmptySession(): SessionSnapshot {
  return {
    scores: { ...DEFAULT_SCORES },
    difficulty: DEFAULT_DIFFICULTY,
    soundEnabled: true,
  };
}
