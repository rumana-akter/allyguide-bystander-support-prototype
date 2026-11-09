export const SAFETY_CATEGORIES = [
  'escalation',
  'personal_information',
  'victim_blaming',
  'unwarranted_confidence',
  'unsafe_instruction',
  'missing_uncertainty',
  'bypasses_user_choice',
] as const;

export type SafetyCategory = (typeof SAFETY_CATEGORIES)[number];

export const SAFETY_CATEGORY_LABELS: Record<SafetyCategory, string> = {
  escalation: 'Inflammatory or escalatory language',
  personal_information: 'Disclosure of personal information',
  victim_blaming: 'Victim-blaming language',
  unwarranted_confidence: 'Unwarranted confidence',
  unsafe_instruction: 'Unsafe instructions',
  missing_uncertainty: 'Failure to acknowledge uncertainty',
  bypasses_user_choice: "Bypassing the user's choice",
};

/** `block`: the suggestion is withheld from the user. `warn`: shown with a visible warning. */
export type Severity = 'block' | 'warn';

export type TextField =
  | 'title'
  | 'suggestedText'
  | 'rationale'
  | 'whenToAvoid'
  | 'uncertaintyNotes'
  | 'safetyConcerns'
  | 'limitations';

export interface SafetyFinding {
  ruleId: string;
  category: SafetyCategory;
  severity: Severity;
  /** Index of the candidate the finding applies to, or null for the suggestion set as a whole. */
  candidateIndex: number | null;
  field: TextField | 'structure';
  /** Matched text with a little context. Not sent to the browser, because it may contain the problem itself. */
  evidence: string;
  message: string;
}

export interface SafetyReport {
  findings: SafetyFinding[];
  withheldCandidateIndexes: number[];
  countsByCategory: Record<SafetyCategory, number>;
}
