import type { LiveConfig } from '../config';
import { evaluateSuggestionSet, scanText } from '../safety/evaluate';
import type { SafetyCategory, Severity } from '../safety/types';
import { getScenario } from '../scenarios/scenarios';
import { DEMO_GENERATOR_LABEL, generateDemoSuggestions } from './demoGenerator';
import type { LiveFailure, LiveSuggester } from './liveModel';
import { SuggestionSetSchema, type Candidate, type SuggestionSet } from './schema';

/**
 * Orchestrates one request for AI-assisted suggestions:
 * scenario lookup, provider choice, schema validation, safety evaluation and withholding.
 * Nothing is logged or stored.
 */

export type Provider = 'demo' | 'live';

export interface SuggestRequest {
  scenarioId: string;
  provider: Provider;
}

/** A finding as shown to the user. The matched evidence is deliberately left out. */
export interface PublicFinding {
  ruleId: string;
  category: SafetyCategory;
  severity: Severity;
  message: string;
}

export type ShownCandidate =
  | { index: number; withheld: false; candidate: Candidate; warnings: PublicFinding[] }
  | { index: number; withheld: true; action: Candidate['action']; reasons: PublicFinding[] };

export interface SuggestionResponse {
  scenarioId: string;
  provider: Provider;
  generator: { kind: 'deterministic-rules' | 'language-model'; label: string; model: string | null };
  overallUncertainty: SuggestionSet['overallUncertainty'];
  uncertaintyNotes: string;
  safetyConcerns: string[];
  limitations: string;
  candidates: ShownCandidate[];
  setWarnings: PublicFinding[];
}

export type SuggestErrorCode = 'unknown_scenario' | 'live_mode_disabled' | LiveFailure;

export type SuggestResult = { ok: true; value: SuggestionResponse } | { ok: false; error: SuggestErrorCode; message: string };

export interface SuggestDeps {
  liveConfig: LiveConfig;
  createLiveSuggester: (model: string) => LiveSuggester;
}

const ERROR_MESSAGES: Record<SuggestErrorCode, string> = {
  unknown_scenario: 'That scenario does not exist.',
  live_mode_disabled: 'Live model mode is not available on this server. The deterministic demo is still available.',
  model_unavailable: 'The language model could not be reached. Try the deterministic demo or the static guidance instead.',
  model_refused: 'The language model declined to produce suggestions for this scenario. The static guidance is still available.',
  model_output_invalid: 'The language model returned output that failed validation, so nothing was shown. The static guidance is still available.',
};

function toPublic(f: { ruleId: string; category: SafetyCategory; severity: Severity; message: string }): PublicFinding {
  return { ruleId: f.ruleId, category: f.category, severity: f.severity, message: f.message };
}

export function buildResponse(scenarioId: string, provider: Provider, set: SuggestionSet, model: string | null): SuggestionResponse {
  const report = evaluateSuggestionSet(set);
  const withheld = new Set(report.withheldCandidateIndexes);
  const candidates: ShownCandidate[] = set.candidates.map((candidate, index) => {
    const own = report.findings.filter((f) => f.candidateIndex === index).map(toPublic);
    return withheld.has(index)
      ? { index, withheld: true, action: candidate.action, reasons: own }
      : { index, withheld: false, candidate, warnings: own };
  });
  return {
    scenarioId,
    provider,
    generator:
      provider === 'demo'
        ? { kind: 'deterministic-rules', label: DEMO_GENERATOR_LABEL, model: null }
        : { kind: 'language-model', label: `Language model (${model ?? 'unknown'})`, model },
    overallUncertainty: set.overallUncertainty,
    uncertaintyNotes: set.uncertaintyNotes,
    // A safety concern is only shown if it passes the blocking checks on its own.
    safetyConcerns: set.safetyConcerns.filter((c) => scanText(c, 'safetyConcerns', null).every((f) => f.severity !== 'block')),
    limitations: set.limitations,
    candidates,
    setWarnings: report.findings.filter((f) => f.candidateIndex === null).map(toPublic),
  };
}

export async function getSuggestions(req: SuggestRequest, deps: SuggestDeps): Promise<SuggestResult> {
  const scenario = getScenario(req.scenarioId);
  if (!scenario) return { ok: false, error: 'unknown_scenario', message: ERROR_MESSAGES.unknown_scenario };

  if (req.provider === 'demo') {
    return { ok: true, value: buildResponse(scenario.id, 'demo', generateDemoSuggestions(scenario), null) };
  }

  if (!deps.liveConfig.enabled) {
    return { ok: false, error: 'live_mode_disabled', message: ERROR_MESSAGES.live_mode_disabled };
  }
  const live = await deps.createLiveSuggester(deps.liveConfig.model)(scenario);
  if (!live.ok) return { ok: false, error: live.error, message: ERROR_MESSAGES[live.error] };

  const parsed = SuggestionSetSchema.safeParse(live.set);
  if (!parsed.success) return { ok: false, error: 'model_output_invalid', message: ERROR_MESSAGES.model_output_invalid };
  return { ok: true, value: buildResponse(scenario.id, 'live', parsed.data, deps.liveConfig.model) };
}
