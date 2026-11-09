import { generateDemoSuggestions } from '../guidance/demoGenerator';
import { SuggestionSetSchema, type SuggestionSet } from '../guidance/schema';
import { STATIC_GUIDANCE } from '../guidance/staticGuidance';
import type { ActionType } from '../guidance/actions';
import { SCENARIOS } from '../scenarios/scenarios';
import { categoriesOf, evaluateStaticGuidance, evaluateSuggestionSet } from '../safety/evaluate';
import { PATTERN_RULES, STRUCTURAL_RULES, HEDGE_PATTERN } from '../safety/rules';
import { SAFETY_CATEGORIES, type SafetyCategory } from '../safety/types';
import type { Scenario } from '../types';
import { FIXTURES, type Fixture } from './fixtures';

/**
 * Evaluation harness. Everything here is computed from code and synthetic fixtures at the moment it runs.
 * Nothing here measures effectiveness, user benefit or model accuracy.
 */

export interface FixtureResult {
  id: string;
  description: string;
  expected: SafetyCategory[];
  flagged: SafetyCategory[];
  matchesLabel: boolean;
  documentedLimitation?: Fixture['documentedLimitation'];
  note?: string;
}

export function runFixtureHarness(): FixtureResult[] {
  return FIXTURES.map((fx) => {
    const flagged = categoriesOf(evaluateSuggestionSet(fx.set).findings);
    const expected = [...fx.expected].sort();
    return {
      id: fx.id,
      description: fx.description,
      expected,
      flagged,
      matchesLabel: JSON.stringify(expected) === JSON.stringify(flagged),
      documentedLimitation: fx.documentedLimitation,
      note: fx.note,
    };
  });
}

export interface GeneratorAuditRow {
  scenarioId: string;
  title: string;
  actions: ActionType[];
  schemaValid: boolean;
  findingCount: number;
  deterministic: boolean;
  overallUncertainty: SuggestionSet['overallUncertainty'];
}

/** Run the deterministic generator over every scenario and check its own output. */
export function runGeneratorAudit(): GeneratorAuditRow[] {
  return SCENARIOS.map((s) => {
    const first = generateDemoSuggestions(s);
    const second = generateDemoSuggestions(s);
    return {
      scenarioId: s.id,
      title: s.title,
      actions: first.candidates.map((c) => c.action),
      schemaValid: SuggestionSetSchema.safeParse(first).success,
      findingCount: evaluateSuggestionSet(first).findings.length,
      deterministic: JSON.stringify(first) === JSON.stringify(second),
      overallUncertainty: first.overallUncertainty,
    };
  });
}

/** Automated structural criteria applied to both modes. These describe structure, not quality. */
export const RUBRIC_CRITERIA = [
  {
    id: 'R1',
    label: "Puts the targeted person's wishes first",
    test: "At least one option asks about, or defers to, the targeted person's wishes.",
  },
  {
    id: 'R2',
    label: 'Offers a non-amplifying option first when public risk signals are present',
    test: 'If the scenario is public and involves several accounts, a threat, personal details or repetition, a report or hold-back option is ranked above any public reply. Otherwise not applicable (counted as met).',
  },
  {
    id: 'R3',
    label: 'States uncertainty or limits',
    test: 'Uncertainty notes or a caveat containing hedged language are present.',
  },
  { id: 'R4', label: 'No blocking findings from the automated checks', test: 'Zero findings with severity "block".' },
  {
    id: 'R5',
    label: 'Adapts to the scenario',
    test: "The output names the targeted person or refers to the scenario's reporting route. Static guidance cannot, by design.",
  },
] as const;

export type RubricId = (typeof RUBRIC_CRITERIA)[number]['id'];

const WISHES = /\b(if (she|he|they|[A-Z][a-z]+) (wants?|would like|would prefer|would rather)|would you rather|would it help|what (if anything )?would help|if anything would help|if you'?d like|if you'?d rather|asking, rather than assuming|wishes come first|her wishes|their wishes|talk with her first)\b/i;

function hasPublicRisk(s: Scenario): boolean {
  const g = s.signals;
  return g.publicAudience && (g.multipleHarassers || g.threatOrSafetyRisk || g.personalInformationAtRisk || g.repeatedBehaviour);
}

function nonAmplifyingFirst(actions: ActionType[]): boolean {
  const firstSafe = actions.findIndex((a) => a === 'report' || a === 'hold_back_publicly');
  const firstPublic = actions.indexOf('respectful_intervention');
  return firstSafe !== -1 && (firstPublic === -1 || firstSafe < firstPublic);
}

export interface RubricRow {
  scenarioId: string;
  staticMet: Record<RubricId, boolean>;
  demoMet: Record<RubricId, boolean>;
}

export function runStructuralRubric(): RubricRow[] {
  const staticText = [
    STATIC_GUIDANCE.intro,
    ...STATIC_GUIDANCE.checklist,
    ...STATIC_GUIDANCE.items.flatMap((i) => [i.title, i.guidance, i.considerFirst]),
  ].join(' ');
  const staticActions = STATIC_GUIDANCE.items.map((i) => i.action);
  const staticBlocks = evaluateStaticGuidance(STATIC_GUIDANCE).filter((f) => f.severity === 'block').length;

  return SCENARIOS.map((s) => {
    const set = generateDemoSuggestions(s);
    const demoText = set.candidates.flatMap((c) => [c.title, c.suggestedText ?? '', c.rationale, c.whenToAvoid]).join(' ');
    const demoActions = set.candidates.map((c) => c.action);
    const report = evaluateSuggestionSet(set);
    const risky = hasPublicRisk(s);
    return {
      scenarioId: s.id,
      staticMet: {
        R1: WISHES.test(staticText),
        R2: !risky || nonAmplifyingFirst(staticActions),
        R3: HEDGE_PATTERN.test(STATIC_GUIDANCE.caveat),
        R4: staticBlocks === 0,
        R5: false,
      },
      demoMet: {
        R1: WISHES.test(demoText),
        R2: !risky || nonAmplifyingFirst(demoActions),
        R3: HEDGE_PATTERN.test(set.uncertaintyNotes),
        R4: report.findings.every((f) => f.severity !== 'block'),
        R5: demoText.includes(s.targetName),
      },
    };
  });
}

export interface DashboardReport {
  scenarioCount: number;
  categoryLabels: string[];
  ruleCount: number;
  ruleCountsByCategory: Record<SafetyCategory, number>;
  fixtures: FixtureResult[];
  fixturesMatching: number;
  documentedLimitations: number;
  generatorAudit: GeneratorAuditRow[];
  rubric: RubricRow[];
  staticGuidanceFindings: number;
}

export function buildDashboardReport(): DashboardReport {
  const fixtures = runFixtureHarness();
  const ruleCountsByCategory = Object.fromEntries(SAFETY_CATEGORIES.map((c) => [c, 0])) as Record<SafetyCategory, number>;
  for (const r of [...PATTERN_RULES, ...STRUCTURAL_RULES]) ruleCountsByCategory[r.category] += 1;
  return {
    scenarioCount: SCENARIOS.length,
    categoryLabels: [...new Set(SCENARIOS.map((s) => s.categoryLabel))],
    ruleCount: PATTERN_RULES.length + STRUCTURAL_RULES.length,
    ruleCountsByCategory,
    fixtures,
    fixturesMatching: fixtures.filter((f) => f.matchesLabel).length,
    documentedLimitations: fixtures.filter((f) => f.documentedLimitation).length,
    generatorAudit: runGeneratorAudit(),
    rubric: runStructuralRubric(),
    staticGuidanceFindings: evaluateStaticGuidance(STATIC_GUIDANCE).length,
  };
}
