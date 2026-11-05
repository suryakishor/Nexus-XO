import { describe, expect, it } from 'vitest';
import { chooseEasyMove, chooseMediumMove, getComputerMove } from '../ai';
import { applyMove, createEmptyBoard, getAvailableMoves, getRoundResult } from '../gameLogic';
import { chooseMinimaxMove, getBestMoves } from '../minimax';
import type { Board } from '../types';

function boardFrom(cells: string): Board {
  return cells.split('').map((cell) => (cell === 'X' || cell === 'O' ? cell : null));
}

describe('Easy AI', () => {
  it('always selects an available cell for any random value', () => {
    const boards = [
      createEmptyBoard(),
      boardFrom('XO.X.O...'),
      boardFrom('X.O.X.O..'),
      boardFrom('XOXXOOO.X'),
    ];

    for (const board of boards) {
      const availableMoves = getAvailableMoves(board);

      for (const randomValue of [0, 0.1, 0.33, 0.5, 0.87, 0.999]) {
        const move = chooseEasyMove(board, () => randomValue);

        expect(move).not.toBeNull();
        expect(availableMoves).toContain(move);
        expect(board[move as number]).toBeNull();
      }
    }
  });

  it('returns null when there are no available cells or the round is complete', () => {
    expect(chooseEasyMove(boardFrom('XOXXOOOXX'))).toBeNull();
    expect(chooseEasyMove(boardFrom('XXXOO.O..'))).toBeNull();
  });
});

describe('Medium AI', () => {
  it('takes an immediate winning move', () => {
    const board = boardFrom('OO.X.X...');

    expect(chooseMediumMove(board, () => 0)).toBe(2);
  });

  it('blocks an immediate human winning move', () => {
    const board = boardFrom('XX......O');

    expect(chooseMediumMove(board, () => 0)).toBe(2);
  });

  it('prefers the center when no win or block is available', () => {
    const board = boardFrom('X.......O');

    expect(chooseMediumMove(board, () => 0)).toBe(4);
  });

  it('prefers an available corner when the center is occupied', () => {
    const board = boardFrom('X...X...O');
    const move = chooseMediumMove(board, () => 0);

    expect([2, 6]).toContain(move);
  });

  it('returns null when the round is already complete', () => {
    expect(chooseMediumMove(boardFrom('XXXOO.O..'))).toBeNull();
  });

  it('only selects valid moves across varied positions', () => {
    const boards = [
      createEmptyBoard(),
      boardFrom('X........'),
      boardFrom('XO.X.O...'),
      boardFrom('X.O.X.O..'),
      boardFrom('XOXXOOO.X'),
    ];

    for (const board of boards) {
      const move = chooseMediumMove(board, () => 0.6);

      if (getAvailableMoves(board).length === 0) {
        expect(move).toBeNull();
      } else {
        expect(getAvailableMoves(board)).toContain(move);
      }
    }
  });
});

describe('Hard AI', () => {
  it('takes an immediate winning move', () => {
    const board = boardFrom('OO.X.X...');

    expect(chooseMinimaxMove(board, () => 0)).toBe(2);
  });

  it('blocks an immediate human winning move', () => {
    const board = boardFrom('XX.......');

    expect(getBestMoves(board)).toContain(2);
  });

  it('never selects an invalid move', () => {
    const boards = [
      createEmptyBoard(),
      boardFrom('X........'),
      boardFrom('XO.X.O...'),
      boardFrom('X.O.X.O..'),
      boardFrom('XOXXOOO.X'),
    ];

    for (const board of boards) {
      const move = chooseMinimaxMove(board, () => 0.42);

      if (getAvailableMoves(board).length === 0) {
        expect(move).toBeNull();
      } else {
        expect(getAvailableMoves(board)).toContain(move);
        expect(board[move as number]).toBeNull();
      }
    }
  });

  it('returns null when the round is already complete', () => {
    expect(chooseMinimaxMove(boardFrom('XXXOO.O..'))).toBeNull();
    expect(chooseMinimaxMove(boardFrom('XOXXOOOXX'))).toBeNull();
  });

  it('cannot lose against any legal human strategy', () => {
    const canHumanWin = (board: Board, turn: 'X' | 'O'): boolean => {
      const result = getRoundResult(board);

      if (result.status === 'win') {
        return result.winner === 'X';
      }

      if (result.status === 'draw') {
        return false;
      }

      if (turn === 'X') {
        return getAvailableMoves(board).some((index) =>
          canHumanWin(applyMove(board, index, 'X'), 'O'),
        );
      }

      const bestComputerMoves = getBestMoves(board);

      return bestComputerMoves.some((index) => canHumanWin(applyMove(board, index, 'O'), 'X'));
    };

    expect(canHumanWin(createEmptyBoard(), 'X')).toBe(false);
  });

  it('uses the configured difficulty dispatcher', () => {
    const board = boardFrom('OO.X.X...');

    expect(getComputerMove(board, 'hard', () => 0)).toBe(2);
    expect(getComputerMove(board, 'easy', () => 0)).toBe(2);
    expect(getComputerMove(board, 'medium', () => 0)).toBe(2);
  });
});
