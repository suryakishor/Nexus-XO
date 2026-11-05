import { applyMove, createEmptyBoard, getRoundResult, isValidMove, TARGET_WINS } from './gameLogic';
import type {
  Board,
  Difficulty,
  MatchWinner,
  Player,
  RoundResult,
  Scores,
  SessionSnapshot,
} from './types';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  difficulty: Difficulty;
  scores: Scores;
  result: RoundResult;
  matchWinner: MatchWinner;
  isComputerThinking: boolean;
  soundEnabled: boolean;
}

export type GameAction =
  | { type: 'humanMove'; index: number }
  | { type: 'computerMove'; index: number }
  | { type: 'nextRound' }
  | { type: 'newMatch' }
  | { type: 'setDifficulty'; difficulty: Difficulty }
  | { type: 'toggleSound' };

export const EMPTY_SCORES: Scores = {
  human: 0,
  computer: 0,
  draws: 0,
};

export const DEFAULT_DIFFICULTY: Difficulty = 'medium';

function matchWinnerFromScores(scores: Scores): MatchWinner {
  if (scores.human >= TARGET_WINS) {
    return 'human';
  }

  if (scores.computer >= TARGET_WINS) {
    return 'computer';
  }

  return null;
}

export function createInitialState(session?: SessionSnapshot | null): GameState {
  const scores = session?.scores ? { ...session.scores } : { ...EMPTY_SCORES };

  return {
    board: createEmptyBoard(),
    currentPlayer: 'X',
    difficulty: session?.difficulty ?? DEFAULT_DIFFICULTY,
    scores,
    result: { status: 'playing' },
    matchWinner: matchWinnerFromScores(scores),
    isComputerThinking: false,
    soundEnabled: session?.soundEnabled ?? true,
  };
}

function finishRound(state: GameState, board: Board, result: RoundResult): GameState {
  let scores = state.scores;
  let matchWinner = state.matchWinner;

  if (result.status === 'win') {
    if (result.winner === 'X') {
      scores = { ...scores, human: scores.human + 1 };
    } else {
      scores = { ...scores, computer: scores.computer + 1 };
    }

    matchWinner = matchWinnerFromScores(scores);
  } else if (result.status === 'draw') {
    scores = { ...scores, draws: scores.draws + 1 };
  }

  return {
    ...state,
    board,
    scores,
    result,
    matchWinner,
    isComputerThinking: false,
  };
}

function resetRound(state: GameState): GameState {
  return {
    ...state,
    board: createEmptyBoard(),
    currentPlayer: 'X',
    result: { status: 'playing' },
    isComputerThinking: false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'humanMove': {
      if (
        state.matchWinner !== null ||
        state.result.status !== 'playing' ||
        state.currentPlayer !== 'X' ||
        !isValidMove(state.board, action.index)
      ) {
        return state;
      }

      const board = applyMove(state.board, action.index, 'X');
      const result = getRoundResult(board);

      if (result.status === 'playing') {
        return {
          ...state,
          board,
          currentPlayer: 'O',
          isComputerThinking: true,
        };
      }

      return finishRound(state, board, result);
    }

    case 'computerMove': {
      if (
        state.matchWinner !== null ||
        state.result.status !== 'playing' ||
        state.currentPlayer !== 'O' ||
        !isValidMove(state.board, action.index)
      ) {
        return state;
      }

      const board = applyMove(state.board, action.index, 'O');
      const result = getRoundResult(board);

      if (result.status === 'playing') {
        return {
          ...state,
          board,
          currentPlayer: 'X',
          isComputerThinking: false,
        };
      }

      return finishRound(state, board, result);
    }

    case 'nextRound': {
      if (state.matchWinner !== null || state.result.status === 'playing') {
        return state;
      }

      return resetRound(state);
    }

    case 'newMatch': {
      return {
        ...resetRound(state),
        scores: { ...EMPTY_SCORES },
        matchWinner: null,
      };
    }

    case 'setDifficulty': {
      if (state.matchWinner !== null || state.difficulty === action.difficulty) {
        return state;
      }

      return {
        ...resetRound(state),
        difficulty: action.difficulty,
      };
    }

    case 'toggleSound':
      return {
        ...state,
        soundEnabled: !state.soundEnabled,
      };

    default:
      return state;
  }
}
