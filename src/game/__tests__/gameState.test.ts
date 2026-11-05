import { describe, expect, it } from 'vitest';
import { createInitialState, gameReducer, type GameState } from '../gameState';
import type { Board } from '../types';

function boardFrom(cells: string): Board {
  return cells.split('').map((cell) => (cell === 'X' || cell === 'O' ? cell : null));
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    ...overrides,
  };
}

describe('gameReducer scoring', () => {
  it('increments the human score after a human round win', () => {
    const state = createState({
      board: boardFrom('XX.XX....'),
      currentPlayer: 'X',
    });

    const nextState = gameReducer(state, { type: 'humanMove', index: 2 });

    expect(nextState.result).toEqual({ status: 'win', winner: 'X', line: [0, 1, 2] });
    expect(nextState.scores.human).toBe(1);
    expect(nextState.scores.computer).toBe(0);
    expect(nextState.scores.draws).toBe(0);
  });

  it('increments the computer score after a computer round win', () => {
    const state = createState({
      board: boardFrom('OO.OO....'),
      currentPlayer: 'O',
      isComputerThinking: true,
    });

    const nextState = gameReducer(state, { type: 'computerMove', index: 2 });

    expect(nextState.result).toEqual({ status: 'win', winner: 'O', line: [0, 1, 2] });
    expect(nextState.scores.human).toBe(0);
    expect(nextState.scores.computer).toBe(1);
    expect(nextState.scores.draws).toBe(0);
  });

  it('increments the draw count without awarding points', () => {
    const state = createState({
      board: boardFrom('XOXXOOOX.'),
      currentPlayer: 'X',
      scores: { human: 2, computer: 1, draws: 3 },
    });

    const nextState = gameReducer(state, { type: 'humanMove', index: 8 });

    expect(nextState.result).toEqual({ status: 'draw' });
    expect(nextState.scores).toEqual({ human: 2, computer: 1, draws: 4 });
  });

  it('never updates scores more than once for the same round', () => {
    const state = createState({
      board: boardFrom('XX.XX....'),
      currentPlayer: 'X',
    });

    const wonState = gameReducer(state, { type: 'humanMove', index: 2 });
    const duplicateHumanMove = gameReducer(wonState, { type: 'humanMove', index: 5 });
    const duplicateComputerMove = gameReducer(wonState, { type: 'computerMove', index: 5 });
    const nextRoundState = gameReducer(wonState, { type: 'nextRound' });

    expect(duplicateHumanMove).toBe(wonState);
    expect(duplicateComputerMove).toBe(wonState);
    expect(nextRoundState.scores).toEqual(wonState.scores);
  });

  it('ends the match when the human reaches five wins', () => {
    const state = createState({
      board: boardFrom('XX.XX....'),
      currentPlayer: 'X',
      scores: { human: 4, computer: 2, draws: 1 },
    });

    const nextState = gameReducer(state, { type: 'humanMove', index: 2 });

    expect(nextState.scores.human).toBe(5);
    expect(nextState.matchWinner).toBe('human');
    expect(gameReducer(nextState, { type: 'nextRound' })).toBe(nextState);
  });

  it('ends the match when the computer reaches five wins', () => {
    const state = createState({
      board: boardFrom('OO.OO....'),
      currentPlayer: 'O',
      scores: { human: 1, computer: 4, draws: 2 },
    });

    const nextState = gameReducer(state, { type: 'computerMove', index: 2 });

    expect(nextState.scores.computer).toBe(5);
    expect(nextState.matchWinner).toBe('computer');
    expect(gameReducer(nextState, { type: 'nextRound' })).toBe(nextState);
  });

  it('resets all match scores and the board on Play Again while preserving difficulty', () => {
    const state = createState({
      board: boardFrom('XXX......'),
      currentPlayer: 'X',
      difficulty: 'hard',
      scores: { human: 5, computer: 3, draws: 2 },
      result: { status: 'win', winner: 'X', line: [0, 1, 2] },
      matchWinner: 'human',
    });

    const nextState = gameReducer(state, { type: 'newMatch' });

    expect(nextState.scores).toEqual({ human: 0, computer: 0, draws: 0 });
    expect(nextState.board.every((cell) => cell === null)).toBe(true);
    expect(nextState.matchWinner).toBeNull();
    expect(nextState.result).toEqual({ status: 'playing' });
    expect(nextState.currentPlayer).toBe('X');
    expect(nextState.difficulty).toBe('hard');
  });

  it('starts a fresh round when difficulty changes without erasing scores', () => {
    const state = createState({
      board: boardFrom('XO.X.O...'),
      currentPlayer: 'X',
      difficulty: 'easy',
      scores: { human: 3, computer: 2, draws: 1 },
    });

    const nextState = gameReducer(state, { type: 'setDifficulty', difficulty: 'hard' });

    expect(nextState.difficulty).toBe('hard');
    expect(nextState.scores).toEqual({ human: 3, computer: 2, draws: 1 });
    expect(nextState.board.every((cell) => cell === null)).toBe(true);
    expect(nextState.currentPlayer).toBe('X');
    expect(nextState.result).toEqual({ status: 'playing' });
  });

  it('does not reset the round when the selected difficulty is unchanged', () => {
    const state = createState({
      board: boardFrom('XO.X.O...'),
      difficulty: 'medium',
    });

    expect(gameReducer(state, { type: 'setDifficulty', difficulty: 'medium' })).toBe(state);
  });

  it('starts the next round with the human and preserves the score', () => {
    const state = createState({
      board: boardFrom('XXXOO.O..'),
      result: { status: 'win', winner: 'X', line: [0, 1, 2] },
      scores: { human: 2, computer: 1, draws: 0 },
    });

    const nextState = gameReducer(state, { type: 'nextRound' });

    expect(nextState.board.every((cell) => cell === null)).toBe(true);
    expect(nextState.currentPlayer).toBe('X');
    expect(nextState.result).toEqual({ status: 'playing' });
    expect(nextState.scores).toEqual({ human: 2, computer: 1, draws: 0 });
  });

  it('ignores moves from the wrong player or after the round has finished', () => {
    const computerTurn = createState({ currentPlayer: 'O', isComputerThinking: true });
    const finishedRound = createState({
      board: boardFrom('XXXOO.O..'),
      result: { status: 'win', winner: 'X', line: [0, 1, 2] },
    });

    expect(gameReducer(computerTurn, { type: 'humanMove', index: 0 })).toBe(computerTurn);
    expect(gameReducer(finishedRound, { type: 'humanMove', index: 5 })).toBe(finishedRound);
  });

  it('toggles sound without changing the board or scores', () => {
    const state = createState();
    const nextState = gameReducer(state, { type: 'toggleSound' });

    expect(nextState.soundEnabled).toBe(!state.soundEnabled);
    expect(nextState.board).toBe(state.board);
    expect(nextState.scores).toBe(state.scores);
  });
});
