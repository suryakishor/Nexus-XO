import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createEmptyBoard,
  getAvailableMoves,
  getRoundResult,
  getWinner,
  isBoardFull,
  isRoundComplete,
  isValidMove,
  WINNING_LINES,
} from '../gameLogic';
import type { Board } from '../types';

function boardFrom(cells: string): Board {
  return cells.split('').map((cell) => (cell === 'X' || cell === 'O' ? cell : null));
}

describe('gameLogic', () => {
  it('initializes an empty 3x3 board', () => {
    const board = createEmptyBoard();

    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === null)).toBe(true);
    expect(isBoardFull(board)).toBe(false);
    expect(isRoundComplete(board)).toBe(false);
    expect(getRoundResult(board)).toEqual({ status: 'playing' });
  });

  it('executes a valid move without mutating the previous board', () => {
    const board = createEmptyBoard();
    const nextBoard = applyMove(board, 4, 'X');

    expect(nextBoard[4]).toBe('X');
    expect(board[4]).toBeNull();
    expect(nextBoard).not.toBe(board);
  });

  it('prevents selecting an occupied cell', () => {
    const board = boardFrom('X........');

    expect(isValidMove(board, 0)).toBe(false);
    expect(applyMove(board, 0, 'O')).toBe(board);
  });

  it('detects horizontal wins', () => {
    const board = boardFrom('XXXOO....');
    const winner = getWinner(board);

    expect(winner).toEqual({ winner: 'X', line: [0, 1, 2] });
    expect(getRoundResult(board)).toEqual({
      status: 'win',
      winner: 'X',
      line: [0, 1, 2],
    });
  });

  it('detects vertical wins', () => {
    const board = boardFrom('O..O..O..');
    const winner = getWinner(board);

    expect(winner).toEqual({ winner: 'O', line: [0, 3, 6] });
  });

  it('detects both diagonal wins', () => {
    expect(getWinner(boardFrom('X...X...X'))).toEqual({
      winner: 'X',
      line: [0, 4, 8],
    });
    expect(getWinner(boardFrom('O.O.O.O..'))).toEqual({
      winner: 'O',
      line: [2, 4, 6],
    });
  });

  it('detects a draw when the board is full without a winner', () => {
    const board = boardFrom('XOXXOOOXX');

    expect(getWinner(board)).toBeNull();
    expect(isBoardFull(board)).toBe(true);
    expect(isRoundComplete(board)).toBe(true);
    expect(getRoundResult(board)).toEqual({ status: 'draw' });
  });

  it('handles invalid move indexes safely', () => {
    const board = createEmptyBoard();

    for (const index of [-1, 9, 1.5, Number.NaN]) {
      expect(isValidMove(board, index)).toBe(false);
      expect(applyMove(board, index, 'X')).toBe(board);
    }
  });

  it('prevents moves after the round has been completed', () => {
    const board = boardFrom('XXXOO.O..');

    expect(isRoundComplete(board)).toBe(true);
    expect(isValidMove(board, 5)).toBe(false);
    expect(applyMove(board, 5, 'O')).toBe(board);
  });

  it('reports the correct round result for playing, won, and drawn boards', () => {
    expect(getRoundResult(createEmptyBoard())).toEqual({ status: 'playing' });
    expect(getRoundResult(boardFrom('XXX......'))).toEqual({
      status: 'win',
      winner: 'X',
      line: [0, 1, 2],
    });
    expect(getRoundResult(boardFrom('XOXXOOOXX'))).toEqual({ status: 'draw' });
  });

  it('lists available moves and exposes all eight winning lines', () => {
    expect(getAvailableMoves(boardFrom('XO.......'))).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(WINNING_LINES).toHaveLength(8);
  });
});
