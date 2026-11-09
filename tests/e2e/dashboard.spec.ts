import { expect, test } from '@playwright/test';

test('dashboard labels its numbers as synthetic and shows documented rule failures', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { level: 1, name: 'Evaluation dashboard' })).toBeVisible();
  await expect(page.getByText('There are no participants, no model accuracy figures')).toBeVisible();

  const stat = (label: string) => page.locator('.stat').filter({ has: page.getByText(label, { exact: true }) }).locator('dd');
  await expect(stat('Fictional scenarios')).toHaveText('10');
  await expect(stat('Failure-mode categories checked')).toHaveText('7');
  await expect(stat('Labelled synthetic fixtures')).toHaveText('16');
  await expect(stat('Fixtures where the rules agree with the label')).toHaveText('12 of 16');
  await expect(stat('Documented rule failures')).toHaveText('4');

  const fixtures = page.getByRole('table', { name: 'Fixture results (evaluated on page load)' });
  await expect(fixtures.locator('tbody tr')).toHaveCount(16);
  await expect(fixtures.getByText('Documented miss (false negative)')).toHaveCount(2);
  await expect(fixtures.getByText('Documented over-flag (false positive)')).toHaveCount(2);
  await expect(fixtures.getByText('Unexpected disagreement')).toHaveCount(0);
});

test('dashboard audits the demo generator for every scenario', async ({ page }) => {
  await page.goto('/dashboard');
  const audit = page.getByRole('table', { name: 'Demo output per scenario' });
  await expect(audit.locator('tbody tr')).toHaveCount(10);
  // The findings column (the fourth td, after the row header) is 0 for every scenario.
  const findings = await audit.locator('tbody tr td:nth-of-type(4)').allInnerTexts();
  expect(findings).toEqual(Array(10).fill('0'));
  await expect(page.getByRole('table', { name: 'Scenarios meeting each criterion' }).locator('tbody tr')).toHaveCount(5);
});
