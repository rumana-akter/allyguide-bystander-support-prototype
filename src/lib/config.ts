import 'server-only';

/**
 * Server-side configuration. Values come from environment variables only.
 * The API key is read here and passed to the SDK client; it is never returned to the browser.
 */

/** Default live model: an efficient, previous-generation model, overridable with ALLYGUIDE_MODEL. */
export const DEFAULT_LIVE_MODEL = 'claude-haiku-4-5';

export interface LiveConfig {
  enabled: boolean;
  model: string;
  /** Why live mode is off, for display. Never contains secret values. */
  reason: string | null;
}

export function readLiveConfig(env: Record<string, string | undefined> = process.env): LiveConfig {
  const model = env.ALLYGUIDE_MODEL?.trim() || DEFAULT_LIVE_MODEL;
  if (env.ALLYGUIDE_LIVE_MODEL !== 'on') {
    return { enabled: false, model, reason: 'Live model mode is turned off on this server (ALLYGUIDE_LIVE_MODEL is not "on").' };
  }
  if (!env.ANTHROPIC_API_KEY?.trim()) {
    return { enabled: false, model, reason: 'Live model mode is on, but no API key is configured on the server.' };
  }
  return { enabled: true, model, reason: null };
}
