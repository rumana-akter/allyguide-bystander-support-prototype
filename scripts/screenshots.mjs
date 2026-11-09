// Captures README screenshots from a running production server.
// Usage: npm run build && npx next start -p 3100, then in another terminal:
//   BASE_URL=http://127.0.0.1:3100 npm run screenshots
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:3100';
const OUT = 'docs/screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });

await desktop.goto(`${BASE_URL}/`);
await desktop.screenshot({ path: `${OUT}/01-home.png`, fullPage: false });

await desktop.goto(`${BASE_URL}/scenarios/s06-pile-on-threat`);
await desktop.evaluate(() => document.getElementById('workspace-title')?.scrollIntoView({ block: 'start' }));
await desktop.screenshot({ path: `${OUT}/02-static-guidance.png`, fullPage: false });

await desktop.getByRole('tab', { name: 'AI-assisted suggestions' }).click();
await desktop.getByRole('button', { name: 'Generate suggestions' }).click();
await desktop.getByTestId('ai-results').waitFor();
await desktop.evaluate(() => document.querySelector('[data-testid="ai-results"]')?.scrollIntoView({ block: 'start' }));
await desktop.screenshot({ path: `${OUT}/03-ai-assisted-demo.png`, fullPage: false });

await desktop.goto(`${BASE_URL}/dashboard`);
await desktop.screenshot({ path: `${OUT}/04-dashboard.png`, fullPage: false });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark' });
await phone.goto(`${BASE_URL}/scenarios/s08-stream-chat`);
await phone.screenshot({ path: `${OUT}/05-mobile-dark.png`, fullPage: false });

await browser.close();
console.log(`Screenshots written to ${OUT}/`);
