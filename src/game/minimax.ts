import { countMarks, getAvailableMoves, getWinner, isBoardFull } from './gameLogic';
import type { Board, Player, ScoredMove } from './types';

const COMPUTER: Player = 'O';

/**
 * Terminal scores are relative to the computer (O).
 *
 * Using the total number of marks makes the score depth-aware: a faster O win is
 * worth more, while an unavoidable O loss is worth more the longer it is delayed.
 */
function evaluateTerminal(board: Board): number | null {
  const winner = getWinner(board);

  if (winner) {
    const marks = countMarks(board);
    return winner.winner === COMPUTER ? 10 - marks : marks - 10;
  }

  if (isBoardFull(board)) {
    return 0;
  }

  return null;
}

function boardKey(board: Board, isMaximizing: boolean): string {
  const cells = board.map((cell) => cell ?? '-').join('');
  return `${cells}:${isMaximizing ? 'max' : 'min'}`;
}

const scoreCache = new Map<string, number>();

/**
 * Classic minimax with the computer maximizing and the human minimizing.
 * Board positions are immutable, so memoizing by position + turn is safe and
 * keeps the full game-tree tests fast.
 */
export function minimax(board: Board, isMaximizing: boolean): number {
  const terminalScore = evaluateTerminal(board);

  if (terminalScore !== null) {
    return terminalScore;
  }

  const key = boardKey(board, isMaximizing);
  const cachedScore = scoreCache.get(key);

  if (cachedScore !== undefined) {
    return cachedScore;
  }

  const availableMoves = getAvailableMoves(board);
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const index of availableMoves) {
    const nextBoard = board.slice();
    nextBoard[index] = isMaximizing ? COMPUTER : 'X';
    const score = minimax(nextBoard, !isMaximizing);

    bestScore = isMaximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
  }

  scoreCache.set(key, bestScore);
  return bestScore;
}

export function scoreMovesForComputer(board: Board): ScoredMove[] {
  return getAvailableMoves(board).map((index) => {
    const nextBoard = board.slice();
    nextBoard[index] = COMPUTER;

    return {
      index,
      score: minimax(nextBoard, false),
    };
  });
}

export function getBestMoves(board: Board): number[] {
  if (getWinner(board) !== null || isBoardFull(board)) {
    return [];
  }

  const scoredMoves = scoreMovesForComputer(board);

  if (scoredMoves.length === 0) {
    return [];
  }

  const bestScore = Math.max(...scoredMoves.map((move) => move.score));
  return scoredMoves.filter((move) => move.score === bestScore).map((move) => move.index);
}

export function chooseMinimaxMove(board: Board, random: () => number = Math.random): number | null {
  const bestMoves = getBestMoves(board);

  if (bestMoves.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.max(0, Math.min(random(), 0.999999)) * bestMoves.length);
  return bestMoves[randomIndex];
}
