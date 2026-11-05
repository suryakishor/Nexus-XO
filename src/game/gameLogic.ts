import type { Board, Cell, Player, RoundResult, WinningCombination } from './types';

export const BOARD_SIZE = 9;
export const TARGET_WINS = 5;

export const WINNING_LINES: readonly (readonly number[])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createEmptyBoard(): Board {
  return Array<Cell>(BOARD_SIZE).fill(null);
}

export function getAvailableMoves(board: Board): number[] {
  const moves: number[] = [];

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (board[index] === null) {
      moves.push(index);
    }
  }

  return moves;
}

export function countMarks(board: Board): number {
  return board.reduce((total, cell) => (cell === null ? total : total + 1), 0);
}

export function getWinner(board: Board): WinningCombination | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const first = board[a];

    if (first !== null && first === board[b] && first === board[c]) {
      return { winner: first, line };
    }
  }

  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function isRoundComplete(board: Board): boolean {
  return getWinner(board) !== null || isBoardFull(board);
}

export function getRoundResult(board: Board): RoundResult {
  const winner = getWinner(board);

  if (winner) {
    return { status: 'win', winner: winner.winner, line: winner.line };
  }

  if (isBoardFull(board)) {
    return { status: 'draw' };
  }

  return { status: 'playing' };
}

export function isValidMove(board: Board, index: number): boolean {
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < BOARD_SIZE &&
    board[index] === null &&
    !isRoundComplete(board)
  );
}

export function applyMove(board: Board, index: number, player: Player): Board {
  if (!isValidMove(board, index)) {
    return board;
  }

  const nextBoard = board.slice();
  nextBoard[index] = player;
  return nextBoard;
}
