import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, gameReducer } from '../../game/gameState';
import type { SessionSnapshot } from '../../game/types';
import { clearSession, loadSession, saveSession, SESSION_KEY } from '../sessionStorage';

const SNAPSHOT: SessionSnapshot = {
  scores: { human: 3, computer: 2, draws: 1 },
  difficulty: 'hard',
  soundEnabled: false,
};

describe('sessionStorage score handling', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('starts a new session with zero scores', () => {
    const state = createInitialState(loadSession());

    expect(loadSession()).toBeNull();
    expect(state.scores).toEqual({ human: 0, computer: 0, draws: 0 });
    expect(state.matchWinner).toBeNull();
  });

  it('restores scores and preferences after a page refresh', () => {
    saveSession(SNAPSHOT);

    const restoredState = createInitialState(loadSession());

    expect(loadSession()).toEqual(SNAPSHOT);
    expect(restoredState.scores).toEqual(SNAPSHOT.scores);
    expect(restoredState.difficulty).toBe('hard');
    expect(restoredState.soundEnabled).toBe(false);
  });

  it('restores a completed match from session scores', () => {
    saveSession({
      scores: { human: 5, computer: 2, draws: 1 },
      difficulty: 'medium',
      soundEnabled: true,
    });

    expect(createInitialState(loadSession()).matchWinner).toBe('human');
  });

  it('starts independently in a new tab or after session storage is cleared', () => {
    saveSession(SNAPSHOT);
    expect(loadSession()).not.toBeNull();

    sessionStorage.clear();

    expect(loadSession()).toBeNull();
    expect(createInitialState(loadSession()).scores).toEqual({
      human: 0,
      computer: 0,
      draws: 0,
    });
  });

  it('never writes scores to localStorage', () => {
    saveSession(SNAPSHOT);

    expect(localStorage.length).toBe(0);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('resets session scores when a new match starts', () => {
    saveSession(SNAPSHOT);

    const state = createInitialState(loadSession());
    const resetState = gameReducer(state, { type: 'newMatch' });

    saveSession({
      scores: resetState.scores,
      difficulty: resetState.difficulty,
      soundEnabled: resetState.soundEnabled,
    });

    expect(loadSession()?.scores).toEqual({ human: 0, computer: 0, draws: 0 });
    expect(loadSession()?.difficulty).toBe('hard');
  });

  it('ignores corrupted session data and clears the session safely', () => {
    sessionStorage.setItem(SESSION_KEY, '{not-valid-json');

    expect(loadSession()).toBeNull();

    saveSession(SNAPSHOT);
    clearSession();

    expect(loadSession()).toBeNull();
  });

  it('sanitizes malformed scores and difficulty values', () => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        scores: { human: -2, computer: '4', draws: 2.8 },
        difficulty: 'impossible',
        soundEnabled: 'yes',
      }),
    );

    expect(loadSession()).toEqual({
      scores: { human: 0, computer: 0, draws: 2 },
      difficulty: 'medium',
      soundEnabled: true,
    });
  });
});
