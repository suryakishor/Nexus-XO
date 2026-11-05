import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { saveSession } from '../../utils/sessionStorage';

function renderApp() {
  return render(<App />);
}

function expectBoardEmpty() {
  for (const cell of screen.getAllByTestId(/^cell-/)) {
    expect(cell).toHaveAttribute('data-empty', 'true');
  }
}

describe('NEXUS XO interface', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('renders a nine-cell board and the default difficulty', () => {
    renderApp();

    expect(screen.getAllByTestId(/^cell-/)).toHaveLength(9);
    expect(screen.getByTestId('difficulty-medium')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('game-status')).toHaveTextContent('Your turn.');
    expect(screen.getByTestId('score-human')).toHaveTextContent('0');
    expect(screen.getByTestId('score-computer')).toHaveTextContent('0');
    expect(screen.getByTestId('score-draws')).toHaveTextContent('0');
  });

  it('lets the human select an empty cell and responds automatically', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Easy difficulty' }));
    await user.click(screen.getByTestId('cell-0'));

    expect(screen.getByTestId('cell-0')).toHaveTextContent('X');
    await waitFor(() => {
      expect(screen.getByTestId('cell-1')).toHaveTextContent('O');
    });
  });

  it('does not allow an occupied cell to be selected again', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Easy difficulty' }));
    await user.click(screen.getByTestId('cell-0'));
    await waitFor(() => {
      expect(screen.getByTestId('cell-1')).toHaveTextContent('O');
    });

    expect(screen.getByTestId('cell-0')).toBeDisabled();
    expect(screen.getByTestId('cell-1')).toBeDisabled();

    fireEvent.click(screen.getByTestId('cell-0'));
    fireEvent.click(screen.getByTestId('cell-1'));

    expect(screen.getByTestId('cell-0')).toHaveTextContent('X');
    expect(screen.getByTestId('cell-1')).toHaveTextContent('O');
  });

  it('switches difficulty, starts a fresh round, and keeps the match score', async () => {
    const user = userEvent.setup();
    saveSession({
      scores: { human: 2, computer: 1, draws: 3 },
      difficulty: 'easy',
      soundEnabled: false,
    });

    renderApp();

    expect(screen.getByTestId('score-human')).toHaveTextContent('2');
    expect(screen.getByTestId('score-computer')).toHaveTextContent('1');
    expect(screen.getByTestId('score-draws')).toHaveTextContent('3');

    await user.click(screen.getByTestId('cell-0'));
    await waitFor(() => {
      expect(screen.getByTestId('cell-1')).toHaveTextContent('O');
    });

    await user.click(screen.getByRole('button', { name: 'Hard difficulty' }));

    expect(screen.getByTestId('difficulty-hard')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('score-human')).toHaveTextContent('2');
    expect(screen.getByTestId('score-computer')).toHaveTextContent('1');
    expect(screen.getByTestId('score-draws')).toHaveTextContent('3');
    expectBoardEmpty();
  });

  it('shows the match popup at five wins and resets the match with Play Again', async () => {
    const user = userEvent.setup();
    saveSession({
      scores: { human: 4, computer: 0, draws: 0 },
      difficulty: 'easy',
      soundEnabled: false,
    });

    renderApp();

    await user.click(screen.getByTestId('cell-0'));
    await waitFor(() => expect(screen.getByTestId('cell-1')).toHaveTextContent('O'));
    await user.click(screen.getByTestId('cell-4'));
    await waitFor(() => expect(screen.getByTestId('cell-2')).toHaveTextContent('O'));
    await user.click(screen.getByTestId('cell-8'));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('YOU WON THE MATCH!');
    expect(dialog).toHaveTextContent('You defeated the computer. Great game!');
    expect(screen.getByTestId('final-score-human')).toHaveTextContent('5');
    expect(screen.getByTestId('final-score-computer')).toHaveTextContent('0');

    await user.click(screen.getByTestId('play-again'));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByTestId('score-human')).toHaveTextContent('0');
    expect(screen.getByTestId('score-computer')).toHaveTextContent('0');
    expect(screen.getByTestId('score-draws')).toHaveTextContent('0');
    expect(screen.getByTestId('difficulty-easy')).toHaveAttribute('aria-pressed', 'true');
    expectBoardEmpty();
  });

  it('resets the match and toggles sound with the game controls', async () => {
    const user = userEvent.setup();
    saveSession({
      scores: { human: 3, computer: 2, draws: 1 },
      difficulty: 'medium',
      soundEnabled: true,
    });

    renderApp();

    await user.click(screen.getByRole('button', { name: 'Mute sound' }));
    expect(screen.getByRole('button', { name: 'Enable sound' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await user.click(screen.getByRole('button', { name: /New Match/i }));

    expect(screen.getByTestId('score-human')).toHaveTextContent('0');
    expect(screen.getByTestId('score-computer')).toHaveTextContent('0');
    expect(screen.getByTestId('score-draws')).toHaveTextContent('0');
    expectBoardEmpty();
  });

  it('restores scores from session storage on a remount', () => {
    saveSession({
      scores: { human: 4, computer: 2, draws: 1 },
      difficulty: 'hard',
      soundEnabled: true,
    });

    renderApp();

    expect(screen.getByTestId('score-human')).toHaveTextContent('4');
    expect(screen.getByTestId('score-computer')).toHaveTextContent('2');
    expect(screen.getByTestId('score-draws')).toHaveTextContent('1');
    expect(screen.getByTestId('difficulty-hard')).toHaveAttribute('aria-pressed', 'true');
  });
});
