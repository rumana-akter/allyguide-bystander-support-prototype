import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ id: v.id, impact: v.impact, targets: v.nodes.map((n) => n.target.join(' ')) }));
}

for (const scheme of ['light', 'dark'] as const) {
  for (const path of ['/', '/scenarios/s01-talk-comment', '/dashboard', '/about']) {
    test(`no serious or critical axe violations on ${path} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      expect(await seriousViolations(page)).toEqual([]);
    });
  }

  test(`no serious or critical axe violations with AI-assisted results open (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/scenarios/s08-stream-chat');
    await page.getByRole('tab', { name: 'AI-assisted suggestions' }).click();
    await page.getByRole('button', { name: 'Generate suggestions' }).click();
    await expect(page.getByTestId('ai-results')).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });
}
