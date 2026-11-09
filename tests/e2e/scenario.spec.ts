import { expect, test, type Page } from '@playwright/test';

async function openAiTab(page: Page, scenarioId: string) {
  await page.goto(`/scenarios/${scenarioId}`);
  await page.getByRole('tab', { name: 'AI-assisted suggestions' }).click();
  return page.getByRole('tabpanel', { name: 'AI-assisted suggestions' });
}

test('static guidance is shown first and offers the four options', async ({ page }) => {
  await page.goto('/scenarios/s01-talk-comment');
  await expect(page.getByRole('tab', { name: 'Static guidance' })).toHaveAttribute('aria-selected', 'true');
  const panel = page.getByRole('tabpanel', { name: 'Static guidance' });
  await expect(panel.locator('.option')).toHaveCount(4);
  await expect(panel).toContainText('not professional safeguarding advice');
  await expect(panel).toContainText('The same text for every scenario');
});

test('AI-assisted mode labels its source, warns the user and adapts to a threat scenario', async ({ page }) => {
  const panel = await openAiTab(page, 's06-pile-on-threat');
  await expect(panel).toContainText('suggestions may be inaccurate or inappropriate');
  await expect(panel).toContainText('Nothing is posted or sent from this page');
  await panel.getByRole('button', { name: 'Generate suggestions' }).click();

  const results = panel.getByTestId('ai-results');
  await expect(results).toContainText('Deterministic demo rules (not a language model)');
  await expect(results).toContainText('Overall uncertainty: medium');
  await expect(results).toContainText('A reply reads as a threat');
  await expect(results.locator('.option')).toHaveCount(3);
  // No public reply is suggested when there is a threat and exposed personal details.
  await expect(results.locator('.option .eyebrow')).not.toContainText(['Respectful, non-escalatory intervention']);
  await expect(results.locator('.check-ok').first()).toContainText('does not mean this option is safe');
});

test('the demo gives identical output when generated twice', async ({ page }) => {
  const panel = await openAiTab(page, 's03-group-project');
  await panel.getByRole('button', { name: 'Generate suggestions' }).click();
  const options = panel.getByTestId('ai-results').locator('.options');
  await expect(options).toBeVisible();
  const first = await options.innerText();
  await panel.getByRole('button', { name: 'Generate again' }).click();
  await expect(options).toBeVisible();
  expect(await options.innerText()).toBe(first);
});

test('ambiguous banter is presented with high uncertainty', async ({ page }) => {
  const panel = await openAiTab(page, 's10-banter-or-not');
  await panel.getByRole('button', { name: 'Generate suggestions' }).click();
  await expect(panel.getByTestId('ai-results')).toContainText('Overall uncertainty: high');
});

test('the user makes the final choice, and nothing is stored in the browser', async ({ page }) => {
  const panel = await openAiTab(page, 's09-friend-asks');
  await panel.getByRole('button', { name: 'Generate suggestions' }).click();
  await panel.getByRole('radio', { name: 'None of these' }).check();
  await expect(panel.getByTestId('choice-feedback')).toContainText('This choice is not saved');
  const stored = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }));
  expect(stored).toEqual({ local: 0, session: 0, cookies: '' });
});

test('live model mode is not offered when the server has it turned off', async ({ page }) => {
  const panel = await openAiTab(page, 's01-talk-comment');
  await expect(panel).toContainText('Live model mode is turned off on this server');
  await expect(panel.getByRole('radio', { name: /Live language model/ })).toHaveCount(0);
});

test('tabs can be used with the keyboard', async ({ page }) => {
  await page.goto('/scenarios/s05-pay-gap-post');
  await page.getByRole('tab', { name: 'Static guidance' }).focus();
  await page.keyboard.press('ArrowRight');
  const aiTab = page.getByRole('tab', { name: 'AI-assisted suggestions' });
  await expect(aiTab).toBeFocused();
  await expect(aiTab).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Static guidance' })).toBeFocused();
  await page.keyboard.press('End');
  await page.keyboard.press('Tab'); // into the panel
  await page.keyboard.press('Tab'); // the generate button
  await expect(page.getByRole('button', { name: 'Generate suggestions' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('ai-results')).toBeVisible();
});

test('a server error is shown clearly and static guidance remains available', async ({ page }) => {
  await page.route('**/api/suggest', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'model_unavailable', message: 'The language model could not be reached. Try the deterministic demo or the static guidance instead.' }),
    }),
  );
  const panel = await openAiTab(page, 's01-talk-comment');
  await panel.getByRole('button', { name: 'Generate suggestions' }).click();
  await expect(panel.getByRole('alert')).toContainText('could not be reached');
  await page.getByRole('tab', { name: 'Static guidance' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Static guidance' }).locator('.option')).toHaveCount(4);
});

test('a network failure is handled without crashing', async ({ page }) => {
  await page.route('**/api/suggest', (route) => route.abort());
  const panel = await openAiTab(page, 's01-talk-comment');
  await panel.getByRole('button', { name: 'Generate suggestions' }).click();
  await expect(panel.getByRole('alert')).toContainText('The request failed');
});
