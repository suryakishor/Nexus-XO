import { getAvailableMoves, getWinner } from './gameLogic';
import { chooseMinimaxMove } from './minimax';
import type { Board, Difficulty, Player } from './types';

export type RandomFn = () => number;

const CORNERS = [0, 2, 6, 8] as const;

function pickRandom<T>(items: readonly T[], random: RandomFn): T {
  const index = Math.floor(Math.max(0, Math.min(random(), 0.999999)) * items.length);
  return items[index];
}

function findImmediateWinningMove(board: Board, player: Player): number | null {
  for (const index of getAvailableMoves(board)) {
    const nextBoard = board.slice();
    nextBoard[index] = player;

    if (getWinner(nextBoard)?.winner === player) {
      return index;
    }
  }

  return null;
}

export function chooseEasyMove(board: Board, random: RandomFn = Math.random): number | null {
  if (getWinner(board) !== null) {
    return null;
  }

  const availableMoves = getAvailableMoves(board);

  if (availableMoves.length === 0) {
    return null;
  }

  return pickRandom(availableMoves, random);
}

export function chooseMediumMove(board: Board, random: RandomFn = Math.random): number | null {
  if (getWinner(board) !== null) {
    return null;
  }

  const availableMoves = getAvailableMoves(board);

  if (availableMoves.length === 0) {
    return null;
  }

  const winningMove = findImmediateWinningMove(board, 'O');
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findImmediateWinningMove(board, 'X');
  if (blockingMove !== null) {
    return blockingMove;
  }

  if (board[4] === null) {
    return 4;
  }

  const availableCorners = CORNERS.filter((index) => board[index] === null);
  if (availableCorners.length > 0) {
    return pickRandom(availableCorners, random);
  }

  return pickRandom(availableMoves, random);
}

export function getComputerMove(
  board: Board,
  difficulty: Difficulty,
  random: RandomFn = Math.random,
): number | null {
  if (getWinner(board) !== null || getAvailableMoves(board).length === 0) {
    return null;
  }

  switch (difficulty) {
    case 'easy':
      return chooseEasyMove(board, random);
    case 'medium':
      return chooseMediumMove(board, random);
    case 'hard':
      return chooseMinimaxMove(board, random);
    default:
      return null;
  }
}
