import type { Cell } from '../game/types';

interface GameCellProps {
  index: number;
  value: Cell;
  isWinning: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

export function GameCell({ index, value, isWinning, disabled, onSelect }: GameCellProps) {
  const cellNumber = index + 1;
  const label = value ? `Cell ${cellNumber}: ${value}` : `Cell ${cellNumber}: empty`;

  return (
    <button
      type="button"
      className={`game-cell ${isWinning ? 'game-cell-winning' : ''}`}
      aria-label={label}
      data-testid={`cell-${index}`}
      data-value={value ?? ''}
      data-empty={value === null ? 'true' : 'false'}
      disabled={disabled || value !== null}
      onClick={() => onSelect(index)}
    >
      {value && (
        <span className={`game-mark ${value === 'X' ? 'mark-x' : 'mark-o'}`} aria-hidden="true">
          {value}
        </span>
      )}
    </button>
  );
}
