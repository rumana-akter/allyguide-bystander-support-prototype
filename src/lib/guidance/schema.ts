import { z } from 'zod';
import { ACTION_TYPES } from './actions';

/**
 * Structured output contract for AI-assisted suggestions.
 * Both the deterministic demo and the optional live model must produce data that passes this schema.
 * The schema checks shape only. Content quality is checked separately by the safety rules,
 * which is why fields such as `uncertaintyNotes` may be empty here but are flagged there.
 */
export const CandidateSchema = z
  .object({
    action: z.enum(ACTION_TYPES),
    title: z.string().min(3).max(90),
    /** Optional wording the bystander could adapt. Null when no wording is needed (for example, reporting). */
    suggestedText: z.string().min(1).max(450).nullable(),
    rationale: z.string().min(10).max(600),
    whenToAvoid: z.string().min(5).max(400),
    relativeRisk: z.enum(['lower', 'moderate', 'higher']),
    /** Must be true: nothing is ever acted on without the user's own decision. Enforced by a safety rule. */
    requiresUserConfirmation: z.boolean(),
  })
  .strict();

export const SuggestionSetSchema = z
  .object({
    candidates: z.array(CandidateSchema).min(1).max(5),
    overallUncertainty: z.enum(['low', 'medium', 'high']),
    uncertaintyNotes: z.string().max(800),
    safetyConcerns: z.array(z.string().min(3).max(300)).max(6),
    limitations: z.string().max(800),
  })
  .strict();

export type Candidate = z.infer<typeof CandidateSchema>;
export type SuggestionSet = z.infer<typeof SuggestionSetSchema>;
