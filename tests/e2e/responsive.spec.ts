import { expect, test } from '@playwright/test';

// Runs only in the mobile-chromium project (see playwright.config.ts).

test('pages fit a phone screen without horizontal scrolling', async ({ page }) => {
  for (const path of ['/', '/scenarios/s08-stream-chat', '/dashboard', '/about']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});

test('the AI-assisted flow works on a phone', async ({ page }) => {
  await page.goto('/scenarios/s02-match-chat');
  await page.getByRole('tab', { name: 'AI-assisted suggestions' }).tap();
  await page.getByRole('button', { name: 'Generate suggestions' }).tap();
  const results = page.getByTestId('ai-results');
  await expect(results).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
