import { expect, test } from '@playwright/test';

test.describe('POST /api/suggest', () => {
  test('returns validated demo suggestions with no-store caching', async ({ request }) => {
    const res = await request.post('/api/suggest', { data: { scenarioId: 's01-talk-comment', provider: 'demo' } });
    expect(res.status()).toBe(200);
    expect(res.headers()['cache-control']).toBe('no-store');
    const body = await res.json();
    expect(body.generator.kind).toBe('deterministic-rules');
    expect(body.candidates.length).toBeGreaterThan(0);
  });

  test('rejects malformed JSON with 400', async ({ request }) => {
    const res = await request.post('/api/suggest', { headers: { 'content-type': 'application/json' }, data: '{not json' });
    expect(res.status()).toBe(400);
  });

  test('rejects extra fields such as free text with 400', async ({ request }) => {
    const res = await request.post('/api/suggest', { data: { scenarioId: 's01-talk-comment', text: 'user-written content' } });
    expect(res.status()).toBe(400);
  });

  test('returns 404 for an unknown scenario', async ({ request }) => {
    const res = await request.post('/api/suggest', { data: { scenarioId: 'unknown' } });
    expect(res.status()).toBe(404);
  });

  test('returns 503 when live mode is requested but turned off', async ({ request }) => {
    const res = await request.post('/api/suggest', { data: { scenarioId: 's01-talk-comment', provider: 'live' } });
    expect(res.status()).toBe(503);
    expect((await res.json()).error).toBe('live_mode_disabled');
  });

  test('does not accept GET', async ({ request }) => {
    expect((await request.get('/api/suggest')).status()).toBe(405);
  });
});

test('pages send basic security headers and do not advertise the framework', async ({ request }) => {
  const res = await request.get('/');
  const headers = res.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('no-referrer');
  expect(headers['x-powered-by']).toBeUndefined();
});

test('no API key or key variable name reaches the browser', async ({ page }) => {
  const bodies: string[] = [];
  page.on('response', async (response) => {
    const type = response.headers()['content-type'] ?? '';
    if (type.includes('javascript') || type.includes('html')) bodies.push(await response.text().catch(() => ''));
  });
  await page.goto('/scenarios/s01-talk-comment');
  await page.getByRole('tab', { name: 'AI-assisted suggestions' }).click();
  await page.getByRole('button', { name: 'Generate suggestions' }).click();
  await expect(page.getByTestId('ai-results')).toBeVisible();
  const all = bodies.join('\n');
  expect(all.length).toBeGreaterThan(1000);
  expect(all).not.toContain('ANTHROPIC_API_KEY');
  expect(all).not.toMatch(new RegExp('sk-' + 'ant-'));
});
