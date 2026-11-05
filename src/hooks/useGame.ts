import { useCallback, useEffect, useReducer } from 'react';
import { getComputerMove } from '../game/ai';
import { gameReducer, createInitialState } from '../game/gameState';
import type { Difficulty } from '../game/types';
import { loadSession, saveSession } from '../utils/sessionStorage';

const COMPUTER_MOVE_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 520;

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, () => createInitialState(loadSession()));

  useEffect(() => {
    saveSession({
      scores: state.scores,
      difficulty: state.difficulty,
      soundEnabled: state.soundEnabled,
    });
  }, [state.scores, state.difficulty, state.soundEnabled]);

  useEffect(() => {
    if (
      !state.isComputerThinking ||
      state.result.status !== 'playing' ||
      state.matchWinner !== null
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const index = getComputerMove(state.board, state.difficulty);

      if (index !== null) {
        dispatch({ type: 'computerMove', index });
      }
    }, COMPUTER_MOVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    state.board,
    state.difficulty,
    state.isComputerThinking,
    state.matchWinner,
    state.result.status,
  ]);

  const selectCell = useCallback((index: number) => {
    dispatch({ type: 'humanMove', index });
  }, []);

  const nextRound = useCallback(() => {
    dispatch({ type: 'nextRound' });
  }, []);

  const newMatch = useCallback(() => {
    dispatch({ type: 'newMatch' });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'setDifficulty', difficulty });
  }, []);

  const toggleSound = useCallback(() => {
    dispatch({ type: 'toggleSound' });
  }, []);

  return {
    state,
    selectCell,
    nextRound,
    newMatch,
    setDifficulty,
    toggleSound,
  };
}
