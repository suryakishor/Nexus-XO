import { useEffect, useRef } from 'react';
import { TARGET_WINS } from '../game/gameLogic';
import type { MatchWinner, Scores } from '../game/types';

interface GameModalProps {
  matchWinner: Exclude<MatchWinner, null>;
  scores: Scores;
  onPlayAgain: () => void;
}

export function GameModal({ matchWinner, scores, onPlayAgain }: GameModalProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const isHumanWinner = matchWinner === 'human';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    playAgainRef.current?.focus();

    const keepFocusInDialog = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        playAgainRef.current?.focus();
      }
    };

    document.addEventListener('keydown', keepFocusInDialog);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keepFocusInDialog);
    };
  }, []);

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        aria-describedby="match-description"
        data-testid="match-modal"
      >
        <div className={`modal-emblem ${isHumanWinner ? 'modal-emblem-win' : 'modal-emblem-loss'}`}>
          <span aria-hidden="true">{isHumanWinner ? 'X' : 'O'}</span>
        </div>

        <p className="modal-eyebrow">Match complete</p>
        <h2 id="match-title" className="modal-title">
          {isHumanWinner ? 'YOU WON THE MATCH!' : 'COMPUTER WINS!'}
        </h2>
        <p id="match-description" className="modal-description">
          {isHumanWinner
            ? 'You defeated the computer. Great game!'
            : 'The computer won this match. Try again!'}
        </p>

        <div className="modal-scoreboard" aria-label="Final scoreboard">
          <div className="modal-score modal-score-x">
            <span className="modal-score-label">You</span>
            <span className="modal-score-value" data-testid="final-score-human">
              {scores.human}
            </span>
          </div>
          <div className="modal-score modal-score-o">
            <span className="modal-score-label">Computer</span>
            <span className="modal-score-value" data-testid="final-score-computer">
              {scores.computer}
            </span>
          </div>
          <div className="modal-score modal-score-neutral">
            <span className="modal-score-label">Draws</span>
            <span className="modal-score-value" data-testid="final-score-draws">
              {scores.draws}
            </span>
          </div>
        </div>

        <p className="modal-target">First to {TARGET_WINS} wins</p>

        <button
          ref={playAgainRef}
          type="button"
          className="button-primary modal-button"
          onClick={onPlayAgain}
          data-testid="play-again"
        >
          Play Again
          <svg viewBox="0 0 20 20" aria-hidden="true" className="button-icon">
            <path
              d="M4.6 7.2A6.2 6.2 0 1 1 4 11.2M4.6 7.2V3.7m0 3.5h3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
