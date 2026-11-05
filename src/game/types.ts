export type Player = 'X' | 'O';

export type Cell = Player | null;

export type Board = Cell[];

export type Difficulty = 'easy' | 'medium' | 'hard';

export type MatchWinner = 'human' | 'computer' | null;

export type RoundResult =
  | { status: 'playing' }
  | { status: 'win'; winner: Player; line: readonly number[] }
  | { status: 'draw' };

export interface Scores {
  human: number;
  computer: number;
  draws: number;
}

export interface WinningCombination {
  winner: Player;
  line: readonly number[];
}

export interface ScoredMove {
  index: number;
  score: number;
}

export interface SessionSnapshot {
  scores: Scores;
  difficulty: Difficulty;
  soundEnabled: boolean;
}
