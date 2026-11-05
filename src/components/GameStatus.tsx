import type { MatchWinner, RoundResult } from '../game/types';
import type { StatusTone } from './Header';

interface GameStatusProps {
  result: RoundResult;
  isComputerThinking: boolean;
  matchWinner: MatchWinner;
}

interface StatusContent {
  message: string;
  detail: string;
  tone: StatusTone;
  mark: string;
}

function getStatusContent(
  result: RoundResult,
  isComputerThinking: boolean,
  matchWinner: MatchWinner,
): StatusContent {
  if (matchWinner === 'human') {
    return {
      message: 'Match won!',
      detail: 'You reached five wins. Play again to start fresh.',
      tone: 'x',
      mark: 'X',
    };
  }

  if (matchWinner === 'computer') {
    return {
      message: 'Match complete.',
      detail: 'The computer reached five wins. Play again to start fresh.',
      tone: 'o',
      mark: 'O',
    };
  }

  if (result.status === 'win') {
    return result.winner === 'X'
      ? {
          message: 'You won the round!',
          detail: 'Keep the momentum going.',
          tone: 'x',
          mark: 'X',
        }
      : {
          message: 'Computer won the round!',
          detail: 'Line up your next move.',
          tone: 'o',
          mark: 'O',
        };
  }

  if (result.status === 'draw') {
    return {
      message: 'Round ended in a draw.',
      detail: 'No points awarded. Next round starts fresh.',
      tone: 'neutral',
      mark: '=',
    };
  }

  if (isComputerThinking) {
    return {
      message: 'Computer is thinking...',
      detail: 'Calculating the next move.',
      tone: 'o',
      mark: 'O',
    };
  }

  return {
    message: 'Your turn.',
    detail: 'Choose any open cell.',
    tone: 'x',
    mark: 'X',
  };
}

export function GameStatus({ result, isComputerThinking, matchWinner }: GameStatusProps) {
  const content = getStatusContent(result, isComputerThinking, matchWinner);

  return (
    <div
      className={`game-status game-status-${content.tone}`}
      role="status"
      aria-live="polite"
      data-testid="game-status"
    >
      <span className={`status-mark status-mark-${content.tone}`} aria-hidden="true">
        {content.mark}
      </span>
      <div className="min-w-0">
        <p className="status-message">{content.message}</p>
        <p className="status-detail">{content.detail}</p>
      </div>
      {isComputerThinking && result.status === 'playing' && (
        <span className="thinking-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}
    </div>
  );
}
