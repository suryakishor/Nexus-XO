export type StatusTone = 'x' | 'o' | 'neutral';

interface HeaderProps {
  statusLabel: string;
  statusTone: StatusTone;
}

export function Header({ statusLabel, statusTone }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="logo-mark" aria-hidden="true">
          <span className="logo-mark-x">X</span>
          <span className="logo-mark-o">O</span>
        </div>
        <div className="min-w-0">
          <h1 className="brand-title">
            NEXUS <span className="brand-title-accent">XO</span>
          </h1>
          <p className="brand-subtitle">Human vs Computer</p>
        </div>
      </div>

      <div className={`status-pill status-pill-${statusTone}`} data-testid="header-status">
        <span className="status-pill-dot" aria-hidden="true" />
        <span>{statusLabel}</span>
      </div>
    </header>
  );
}
