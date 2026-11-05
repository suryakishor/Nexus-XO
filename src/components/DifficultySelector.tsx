import type { Difficulty } from '../game/types';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const DIFFICULTIES: ReadonlyArray<{
  value: Difficulty;
  label: string;
  description: string;
}> = [
  { value: 'easy', label: 'Easy', description: 'Casual' },
  { value: 'medium', label: 'Medium', description: 'Strategic' },
  { value: 'hard', label: 'Hard', description: 'Unbeatable' },
];

export function DifficultySelector({
  difficulty,
  onChange,
  disabled = false,
}: DifficultySelectorProps) {
  return (
    <section className="glass-panel p-4 sm:p-5" aria-labelledby="difficulty-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="difficulty-heading" className="section-label">
          Difficulty
        </h2>
        <span className="section-hint">Fresh round on change</span>
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Computer difficulty">
        {DIFFICULTIES.map((option) => {
          const isActive = difficulty === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`difficulty-button ${isActive ? 'difficulty-button-active' : ''}`}
              aria-label={`${option.label} difficulty`}
              aria-pressed={isActive}
              data-testid={`difficulty-${option.value}`}
              disabled={disabled}
              onClick={() => onChange(option.value)}
            >
              <span className="difficulty-label">{option.label}</span>
              <span className="difficulty-description">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
