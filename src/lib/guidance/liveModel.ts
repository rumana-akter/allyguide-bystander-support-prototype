import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { Scenario } from '../types';
import { buildUserPrompt, SYSTEM_PROMPT } from './livePrompt';
import { SuggestionSetSchema } from './schema';

/**
 * Optional live-model adapter (server-side only).
 * The model's structured output is validated against SuggestionSetSchema here, and again by the
 * orchestrator, before the safety checks run. Nothing reaches the browser without both.
 */

export type LiveFailure = 'model_unavailable' | 'model_refused' | 'model_output_invalid';

export type LiveResult = { ok: true; set: unknown } | { ok: false; error: LiveFailure; detail: string };

export type LiveSuggester = (scenario: Scenario) => Promise<LiveResult>;

/** The part of the SDK client this adapter uses. Tests pass a fake with the same shape. */
export type MessagesClient = Pick<Anthropic, 'messages'>;

export function createLiveSuggester(client: MessagesClient, model: string): LiveSuggester {
  return async (scenario) => {
    try {
      const response = await client.messages.parse({
        model,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(scenario) }],
        output_config: { format: zodOutputFormat(SuggestionSetSchema) },
      });
      if (response.stop_reason === 'refusal') {
        return { ok: false, error: 'model_refused', detail: 'The model declined to answer.' };
      }
      if (response.stop_reason === 'max_tokens') {
        return { ok: false, error: 'model_output_invalid', detail: 'The model output was cut off.' };
      }
      if (response.parsed_output == null) {
        return { ok: false, error: 'model_output_invalid', detail: 'The model output did not match the schema.' };
      }
      return { ok: true, set: response.parsed_output };
    } catch (err) {
      // Most specific first. Error messages are not passed on, in case they echo request details.
      if (err instanceof Anthropic.RateLimitError) return { ok: false, error: 'model_unavailable', detail: 'Rate limited.' };
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
        return { ok: false, error: 'model_unavailable', detail: 'The server could not authenticate with the model provider.' };
      }
      if (err instanceof Anthropic.APIConnectionError) return { ok: false, error: 'model_unavailable', detail: 'Could not reach the model provider.' };
      if (err instanceof Anthropic.APIError) return { ok: false, error: 'model_unavailable', detail: `Provider error (status ${String(err.status)}).` };
      // Anything else (for example, a schema validation error raised while parsing) is treated as invalid output.
      return { ok: false, error: 'model_output_invalid', detail: 'The model output could not be parsed.' };
    }
  };
}

export function createDefaultLiveSuggester(model: string): LiveSuggester {
  // Reads ANTHROPIC_API_KEY from the server environment.
  const client = new Anthropic({ timeout: 30_000, maxRetries: 1 });
  return createLiveSuggester(client, model);
}
