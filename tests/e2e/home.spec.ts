import { expect, test } from '@playwright/test';

test('home page says what the demonstrator is and is not, with a content note', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'AllyGuide' })).toBeVisible();
  await expect(page.getByText('No human-subject study has been carried out with it')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Content note' })).toContainText('fictional');
  await expect(page.locator('.scenario-grid > li')).toHaveCount(10);
});

test('main navigation reaches the evaluation and about pages', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await nav.getByRole('link', { name: 'Evaluation' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Evaluation dashboard' })).toBeVisible();
  await nav.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'About this demonstrator' })).toBeVisible();
  await expect(page.getByText('No human-subject study has been carried out')).toBeVisible();
});

test('a scenario card opens its scenario page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'A pile-on with a veiled threat' }).click();
  await expect(page).toHaveURL(/\/scenarios\/s06-pile-on-threat$/);
  await expect(page.getByRole('complementary', { name: 'Content note' })).toContainText('veiled threat');
});

test('an unknown scenario returns a 404 page', async ({ page }) => {
  const response = await page.goto('/scenarios/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
