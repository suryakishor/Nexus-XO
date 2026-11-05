import { TARGET_WINS } from '../game/gameLogic';
import type { Scores } from '../game/types';

interface ScoreBoardProps {
  scores: Scores;
}

interface ScoreCardProps {
  label: string;
  value: number;
  tone: 'x' | 'o' | 'neutral';
  isLeader: boolean;
  showProgress: boolean;
  testId: string;
}

function ScoreCard({ label, value, tone, isLeader, showProgress, testId }: ScoreCardProps) {
  const filledPips = Math.min(value, TARGET_WINS);

  return (
    <div
      className={`score-card score-card-${tone} ${isLeader ? 'score-card-leader' : ''}`}
      aria-label={`${label}: ${value}${isLeader ? ', current leader' : ''}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="score-label">{label}</span>
        {isLeader && <span className="leader-dot" title="Current leader" aria-hidden="true" />}
      </div>

      <span className="score-value" data-testid={testId}>
        {value}
      </span>

      {showProgress ? (
        <div className="score-pips" role="img" aria-label={`${value} of ${TARGET_WINS} wins`}>
          {Array.from({ length: TARGET_WINS }, (_, index) => (
            <span
              key={index}
              className={`score-pip ${index < filledPips ? 'score-pip-filled' : ''}`}
            />
          ))}
        </div>
      ) : (
        <span className="score-note">No points</span>
      )}
    </div>
  );
}

export function ScoreBoard({ scores }: ScoreBoardProps) {
  const leader =
    scores.human > scores.computer ? 'human' : scores.computer > scores.human ? 'computer' : null;

  return (
    <section className="glass-panel p-4 sm:p-5" aria-labelledby="scoreboard-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="scoreboard-heading" className="section-label">
          Scoreboard
        </h2>
        <span className="section-hint">First to {TARGET_WINS}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ScoreCard
          label="You"
          value={scores.human}
          tone="x"
          isLeader={leader === 'human'}
          showProgress
          testId="score-human"
        />
        <ScoreCard
          label="Computer"
          value={scores.computer}
          tone="o"
          isLeader={leader === 'computer'}
          showProgress
          testId="score-computer"
        />
        <ScoreCard
          label="Draws"
          value={scores.draws}
          tone="neutral"
          isLeader={false}
          showProgress={false}
          testId="score-draws"
        />
      </div>
    </section>
  );
}
