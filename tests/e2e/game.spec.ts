import { expect, test, type Page } from '@playwright/test';

const SESSION_KEY = 'nexus-xo:session:v1';

async function mockRandomness(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
}

async function playEasyWinningRound(page: Page) {
  await page.getByTestId('cell-0').click();
  await expect(page.getByTestId('cell-1')).toHaveAttribute('data-value', 'O');

  await page.getByTestId('cell-4').click();
  await expect(page.getByTestId('cell-2')).toHaveAttribute('data-value', 'O');

  await page.getByTestId('cell-8').click();
  await expect(page.getByTestId('game-status')).toContainText(/You won the round!|Match won!/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
}

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}

test('complete match journey across all difficulties', async ({ page }) => {
  const consoleErrors = trackConsoleErrors(page);
  await mockRandomness(page);
  await page.goto('/');

  await expect(page.getByTestId('game-status')).toContainText('Your turn.');
  await expect(page.getByTestId('score-human')).toHaveText('0');

  // Easy: play and win a complete round.
  await page.getByTestId('difficulty-easy').click();
  await playEasyWinningRound(page);
  await expect(page.getByTestId('score-human')).toHaveText('1');
  await expect(page.getByTestId('score-computer')).toHaveText('0');

  await page.getByRole('button', { name: 'Next Round' }).click();
  await expect(page.getByTestId('game-status')).toContainText('Your turn.');

  // Medium: complete another controlled round. The medium AI blocks, then wins.
  await page.getByTestId('difficulty-medium').click();
  await page.getByTestId('cell-0').click();
  await expect(page.getByTestId('cell-4')).toHaveAttribute('data-value', 'O');
  await page.getByTestId('cell-1').click();
  await expect(page.getByTestId('cell-2')).toHaveAttribute('data-value', 'O');
  await page.getByTestId('cell-3').click();
  await expect(page.getByTestId('game-status')).toContainText('Computer won the round!');
  await expect(page.getByTestId('score-computer')).toHaveText('1');

  // Hard: verify the minimax computer takes the center and blocks a threat.
  await page.getByTestId('difficulty-hard').click();
  await page.getByTestId('cell-0').click();
  await expect(page.getByTestId('cell-4')).toHaveAttribute('data-value', 'O');
  await page.getByTestId('cell-1').click();
  await expect(page.getByTestId('cell-2')).toHaveAttribute('data-value', 'O');

  // Reset the match and play a controlled first-to-five scenario.
  await page.getByRole('button', { name: /New Match/i }).click();
  await expect(page.getByTestId('score-human')).toHaveText('0');
  await expect(page.getByTestId('score-computer')).toHaveText('0');
  await expect(page.getByTestId('score-draws')).toHaveText('0');

  await page.getByTestId('difficulty-easy').click();

  for (let round = 1; round <= 5; round += 1) {
    await playEasyWinningRound(page);
    await expect(page.getByTestId('score-human')).toHaveText(String(round));

    if (round < 5) {
      await page.getByRole('button', { name: 'Next Round' }).click();
      await expect(page.getByTestId('game-status')).toContainText('Your turn.');
    }
  }

  const modal = page.getByTestId('match-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('YOU WON THE MATCH!');
  await expect(modal).toContainText('You defeated the computer. Great game!');
  await expect(page.getByTestId('final-score-human')).toHaveText('5');
  await expect(page.getByTestId('final-score-computer')).toHaveText('0');

  await page.getByTestId('play-again').click();
  await expect(modal).not.toBeVisible();
  await expect(page.getByTestId('score-human')).toHaveText('0');
  await expect(page.getByTestId('score-computer')).toHaveText('0');
  await expect(page.getByTestId('score-draws')).toHaveText('0');
  await expect(page.getByTestId('difficulty-easy')).toHaveAttribute('aria-pressed', 'true');
  expect(consoleErrors).toEqual([]);
});

test('restores the session after a page refresh and starts a new tab independently', async ({
  page,
  browser,
}) => {
  const consoleErrors = trackConsoleErrors(page);
  await mockRandomness(page);
  await page.goto('/');

  await page.getByTestId('difficulty-easy').click();
  await playEasyWinningRound(page);
  await expect(page.getByTestId('score-human')).toHaveText('1');

  await page.reload();
  await expect(page.getByTestId('score-human')).toHaveText('1');
  await expect(page.getByTestId('score-computer')).toHaveText('0');
  await expect(page.getByTestId('difficulty-easy')).toHaveAttribute('aria-pressed', 'true');

  const newContext = await browser.newContext();
  const newTab = await newContext.newPage();

  await newTab.goto(page.url());
  await expect(newTab.getByTestId('score-human')).toHaveText('0');
  await expect(newTab.getByTestId('score-computer')).toHaveText('0');
  await expect(newTab.getByTestId('score-draws')).toHaveText('0');

  await newContext.close();
  expect(consoleErrors).toEqual([]);
});

test('stays usable without horizontal overflow at common viewport sizes', async ({ page }) => {
  const consoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.addInitScript(
    ({ sessionKey }) => {
      try {
        sessionStorage.setItem(
          sessionKey,
          JSON.stringify({
            scores: { human: 4, computer: 0, draws: 0 },
            difficulty: 'easy',
            soundEnabled: false,
          }),
        );
      } catch {
        // The origin storage may not be available on the initial blank document.
      }

      Math.random = () => 0;
    },
    { sessionKey: SESSION_KEY },
  );

  await page.goto('/');
  await expect(page.getByTestId('score-human')).toHaveText('4');

  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 640 : 900 });
    await expectNoHorizontalOverflow(page);
    await expect(page.getByTestId('cell-0')).toBeVisible();
    await expect(page.getByTestId('cell-8')).toBeVisible();
  }

  await page.setViewportSize({ width: 360, height: 640 });
  await playEasyWinningRound(page);

  const modal = page.getByTestId('match-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('YOU WON THE MATCH!');

  const box = await modal.boundingBox();

  expect(box).not.toBeNull();

  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(box.y + box.height).toBeLessThanOrEqual(640);
  }

  await expectNoHorizontalOverflow(page);
  await page.getByTestId('play-again').click();
  await expect(modal).not.toBeVisible();
  await expect(page.getByTestId('score-human')).toHaveText('0');
  expect(consoleErrors).toEqual([]);
});
