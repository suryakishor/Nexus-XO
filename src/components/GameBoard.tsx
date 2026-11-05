import type { Board } from '../game/types';
import { GameCell } from './GameCell';

interface GameBoardProps {
  board: Board;
  winningLine: readonly number[];
  disabled: boolean;
  onSelect: (index: number) => void;
}

export function GameBoard({ board, winningLine, disabled, onSelect }: GameBoardProps) {
  const winningCells = new Set(winningLine);

  return (
    <div className="game-board" role="group" aria-label="Tic-tac-toe board">
      {board.map((value, index) => (
        <GameCell
          key={index}
          index={index}
          value={value}
          isWinning={winningCells.has(index)}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
