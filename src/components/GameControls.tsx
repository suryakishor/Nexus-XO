interface GameControlsProps {
  showNextRound: boolean;
  soundEnabled: boolean;
  onNextRound: () => void;
  onNewMatch: () => void;
  onToggleSound: () => void;
}

export function GameControls({
  showNextRound,
  soundEnabled,
  onNextRound,
  onNewMatch,
  onToggleSound,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {showNextRound && (
        <button type="button" className="button-primary" onClick={onNextRound}>
          Next Round
          <svg viewBox="0 0 20 20" aria-hidden="true" className="button-icon">
            <path
              d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="button-secondary"
          onClick={onNewMatch}
          title="Reset the board and both match scores"
        >
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
          New Match
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          aria-pressed={soundEnabled}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="button-icon">
            <path
              d="M4 8v4h3l4 3V5L7 8H4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {soundEnabled ? (
              <path
                d="M13.6 7.2a4 4 0 0 1 0 5.6M15.8 5a7 7 0 0 1 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="m13.5 8 4 4m0-4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
          {soundEnabled ? 'Sound on' : 'Sound off'}
        </button>
      </div>
    </div>
  );
}
