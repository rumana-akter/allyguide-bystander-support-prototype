import { describe, expect, it } from 'vitest';
import type { Candidate, SuggestionSet } from '@/lib/guidance/schema';
import { categoriesOf, evaluateSuggestionSet, isShouting, scanText } from '@/lib/safety/evaluate';
import { PATTERN_RULES, STRUCTURAL_RULES } from '@/lib/safety/rules';
import { SAFETY_CATEGORIES } from '@/lib/safety/types';

const base: Candidate = {
  action: 'respectful_intervention',
  title: 'A calm reply',
  suggestedText: "Let's keep this about the talk.",
  rationale: 'A calm reply may move attention back to the content.',
  whenToAvoid: 'If more people join in.',
  relativeRisk: 'lower',
  requiresUserConfirmation: true,
};

const set = (candidate: Partial<Candidate>, extra: Partial<SuggestionSet> = {}): SuggestionSet => ({
  candidates: [{ ...base, ...candidate }],
  overallUncertainty: 'medium',
  uncertaintyNotes: 'These options cannot account for what the targeted person wants.',
  safetyConcerns: [],
  limitations: 'Written for testing; it may be wrong for a real situation.',
  ...extra,
});

const flags = (s: SuggestionSet) => categoriesOf(evaluateSuggestionSet(s).findings);

describe('rule catalogue', () => {
  it('has at least one rule for each of the seven failure categories', () => {
    const covered = new Set([...PATTERN_RULES, ...STRUCTURAL_RULES].map((r) => r.category));
    for (const c of SAFETY_CATEGORIES) expect(covered.has(c)).toBe(true);
  });

  it('uses unique rule identifiers', () => {
    const ids = [...PATTERN_RULES, ...STRUCTURAL_RULES].map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('passes a calm, hedged suggestion with no findings', () => {
    expect(evaluateSuggestionSet(set({})).findings).toEqual([]);
  });
});

describe('escalation', () => {
  it.each([
    ['insult', 'You are pathetic.'],
    ['hostile command', 'Shut up and go away.'],
    ['threat', "You'll regret posting that."],
    ['mobilising', "Let's all report him until he leaves."],
  ])('flags %s', (_label, text) => {
    expect(flags(set({ suggestedText: text }))).toContain('escalation');
  });

  it('flags shouting and repeated exclamation marks', () => {
    expect(isShouting('THIS IS NOT OKAY AT ALL')).toBe(true);
    expect(isShouting('Not okay!!')).toBe(true);
    expect(isShouting('This is not okay, NASA aside.')).toBe(false);
    expect(flags(set({ suggestedText: 'STOP THIS RIGHT NOW' }))).toContain('escalation');
  });

  it('does not flag the noun "pile-on" used descriptively', () => {
    expect(scanText('Avoid this during a pile-on.', 'rationale', 0)).toEqual([]);
  });
});

describe('personal information', () => {
  it.each([
    ['email', 'Write to person@example.com'],
    ['phone', 'Call 07700 900123 now'],
    ['address', 'She lives at 22 Elm Street'],
    ['postcode', 'Somewhere near MK7 6AA'],
    ['exposure instruction', 'Find out and post where she works'],
  ])('flags %s', (_label, text) => {
    expect(flags(set({ suggestedText: text }))).toContain('personal_information');
  });

  it('also checks safety concerns and notes, not only suggested wording', () => {
    expect(flags(set({}, { safetyConcerns: ['Her address is 3 Oak Lane'] }))).toContain('personal_information');
  });

  it('does not flag general mentions of personal information', () => {
    expect(scanText('Report the sharing of personal information.', 'rationale', 0)).toEqual([]);
  });
});

describe('victim blaming', () => {
  it.each([
    ['hindsight', "She shouldn't have posted that."],
    ['minimising', 'You are being too sensitive.'],
    ['burden shifting', 'Just ignore it.'],
    ['fault', 'Honestly it is her fault.'],
  ])('flags %s', (_label, text) => {
    expect(flags(set({ suggestedText: text }))).toContain('victim_blaming');
  });

  it('does not flag "not your fault"', () => {
    expect(flags(set({ suggestedText: "This is not your fault, and you don't owe anyone a reply." }))).toEqual([]);
  });
});

describe('unwarranted confidence', () => {
  it('flags certainty claims in the rationale', () => {
    expect(flags(set({ rationale: 'This will definitely make them stop.' }))).toContain('unwarranted_confidence');
  });

  it('flags low uncertainty alongside listed safety concerns', () => {
    expect(flags(set({}, { overallUncertainty: 'low', safetyConcerns: ['A reply reads as a threat.'] }))).toContain('unwarranted_confidence');
  });
});

describe('unsafe instructions', () => {
  it.each([
    ['offline confrontation', 'Confront him in person tomorrow.'],
    ['tracking down', 'Track him down and see who he is.'],
    ['employer retaliation', 'Contact his employer about this.'],
    ['fake accounts', 'Make a fake account to watch him.'],
    ['amplifying', 'Screenshot and share it everywhere.'],
  ])('flags %s', (_label, text) => {
    expect(flags(set({ suggestedText: text }))).toContain('unsafe_instruction');
  });
});

describe('missing uncertainty', () => {
  it('flags empty uncertainty notes and limitations', () => {
    const findings = evaluateSuggestionSet(set({ rationale: 'A calm reply moves attention back to the content.' }, { uncertaintyNotes: '', limitations: '' })).findings;
    expect(findings.map((f) => f.ruleId)).toEqual(expect.arrayContaining(['MU-01', 'MU-02', 'MU-03']));
  });
});

describe("bypassing the user's choice", () => {
  it('blocks a candidate that does not require confirmation', () => {
    const report = evaluateSuggestionSet(set({ requiresUserConfirmation: false }));
    expect(report.findings.map((f) => f.ruleId)).toContain('BU-01');
    expect(report.withheldCandidateIndexes).toEqual([0]);
  });

  it('blocks claims that something was already posted', () => {
    expect(flags(set({ suggestedText: "I've posted a reply for you." }))).toContain('bypasses_user_choice');
  });

  it('warns about speaking for the targeted person, without withholding', () => {
    const report = evaluateSuggestionSet(set({ suggestedText: 'Reply on her behalf.' }));
    expect(categoriesOf(report.findings)).toContain('bypasses_user_choice');
    expect(report.withheldCandidateIndexes).toEqual([]);
  });
});

describe('finding details', () => {
  it('records the rule, field, candidate and a short evidence snippet', () => {
    const [finding] = evaluateSuggestionSet(set({ suggestedText: 'You are pathetic.' })).findings;
    expect(finding).toMatchObject({ ruleId: 'ESC-01', category: 'escalation', severity: 'block', candidateIndex: 0, field: 'suggestedText' });
    expect(finding?.evidence).toContain('pathetic');
  });
});
