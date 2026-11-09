import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readLiveConfig } from '@/lib/config';
import { createDefaultLiveSuggester } from '@/lib/guidance/liveModel';
import { getSuggestions, type SuggestErrorCode } from '@/lib/guidance/suggest';

export const dynamic = 'force-dynamic';

/** Only a scenario identifier and a provider are accepted. There is no free-text input. */
const RequestSchema = z
  .object({
    scenarioId: z.string().min(1).max(40),
    provider: z.enum(['demo', 'live']).default('demo'),
  })
  .strict();

const STATUS: Record<SuggestErrorCode, number> = {
  unknown_scenario: 404,
  live_mode_disabled: 503,
  model_unavailable: 502,
  model_refused: 502,
  model_output_invalid: 502,
};

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json', message: 'The request body must be JSON.' }, { status: 400, headers: NO_STORE });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Send { "scenarioId": string, "provider": "demo" | "live" } and nothing else.' },
      { status: 400, headers: NO_STORE },
    );
  }

  const result = await getSuggestions(parsed.data, {
    liveConfig: readLiveConfig(),
    createLiveSuggester: createDefaultLiveSuggester,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, message: result.message }, { status: STATUS[result.error], headers: NO_STORE });
  }
  return NextResponse.json(result.value, { headers: NO_STORE });
}
