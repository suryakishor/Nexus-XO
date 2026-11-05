import { useEffect, useRef } from 'react';
import { DifficultySelector } from './components/DifficultySelector';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { GameModal } from './components/GameModal';
import { GameStatus } from './components/GameStatus';
import { Header, type StatusTone } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { TARGET_WINS } from './game/gameLogic';
import type { Difficulty, MatchWinner, RoundResult } from './game/types';
import { useGame } from './hooks/useGame';
import { playSound } from './utils/sound';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

function getHeaderStatus(
  matchWinner: MatchWinner,
  result: RoundResult,
  isComputerThinking: boolean,
): { label: string; tone: StatusTone } {
  if (matchWinner === 'human') {
    return { label: 'Match won', tone: 'x' };
  }

  if (matchWinner === 'computer') {
    return { label: 'Match lost', tone: 'o' };
  }

  if (result.status === 'win') {
    return result.winner === 'X'
      ? { label: 'Round won', tone: 'x' }
      : { label: 'Round lost', tone: 'o' };
  }

  if (result.status === 'draw') {
    return { label: 'Draw', tone: 'neutral' };
  }

  if (isComputerThinking) {
    return { label: 'Thinking', tone: 'o' };
  }

  return { label: 'Your turn', tone: 'x' };
}

export default function App() {
  const { state, selectCell, nextRound, newMatch, setDifficulty, toggleSound } = useGame();

  const previousMarkCount = useRef(0);
  const previousRoundStatus = useRef<RoundResult['status']>('playing');

  const isMatchOver = state.matchWinner !== null;
  const isRoundOver = state.result.status !== 'playing';
  const canSelect = !isMatchOver && !isRoundOver && state.currentPlayer === 'X';
  const winningLine = state.result.status === 'win' ? state.result.line : [];
  const headerStatus = getHeaderStatus(state.matchWinner, state.result, state.isComputerThinking);

  useEffect(() => {
    const markCount = state.board.filter((cell) => cell !== null).length;

    if (state.soundEnabled && markCount > previousMarkCount.current) {
      playSound('place');
    }

    previousMarkCount.current = markCount;
  }, [state.board, state.soundEnabled]);

  useEffect(() => {
    const currentStatus = state.result.status;

    if (
      state.soundEnabled &&
      currentStatus !== 'playing' &&
      previousRoundStatus.current === 'playing'
    ) {
      if (state.result.status === 'win') {
        playSound(state.result.winner === 'X' ? 'win' : 'lose');
      } else {
        playSound('draw');
      }
    }

    previousRoundStatus.current = currentStatus;
  }, [state.result, state.soundEnabled]);

  return (
    <div className="app-shell">
      <div className="ambient-layer" aria-hidden="true">
        <div className="ambient-orb ambient-orb-cyan" />
        <div className="ambient-orb ambient-orb-violet" />
        <div className="ambient-grid" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:gap-8 lg:py-10">
        <Header statusLabel={headerStatus.label} statusTone={headerStatus.tone} />

        <main className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <DifficultySelector
              difficulty={state.difficulty}
              onChange={setDifficulty}
              disabled={isMatchOver}
            />
            <ScoreBoard scores={state.scores} />
            <p className="px-1 text-xs leading-relaxed text-slate-500">
              Win {TARGET_WINS} rounds to take the match. Draws are tracked separately and award no
              points.
            </p>
          </div>

          <section className="glass-panel board-panel min-w-0 p-4 sm:p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="section-label">Nexus Grid</p>
                <p className="mt-0.5 text-xs text-slate-500">First to {TARGET_WINS} wins</p>
              </div>
              <span className="round-badge">{DIFFICULTY_LABELS[state.difficulty]} AI</span>
            </div>

            <div className="mx-auto w-full max-w-[32rem]">
              <GameBoard
                board={state.board}
                winningLine={winningLine}
                disabled={!canSelect}
                onSelect={selectCell}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <GameStatus
                result={state.result}
                isComputerThinking={state.isComputerThinking}
                matchWinner={state.matchWinner}
              />
              <GameControls
                showNextRound={isRoundOver && !isMatchOver}
                soundEnabled={state.soundEnabled}
                onNextRound={nextRound}
                onNewMatch={newMatch}
                onToggleSound={toggleSound}
              />
            </div>
          </section>
        </main>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
          <span>Local algorithms · No network required</span>
          <span className="hidden sm:inline">Human X · Computer O</span>
        </footer>
      </div>

      {state.matchWinner !== null && (
        <GameModal matchWinner={state.matchWinner} scores={state.scores} onPlayAgain={newMatch} />
      )}
    </div>
  );
}
