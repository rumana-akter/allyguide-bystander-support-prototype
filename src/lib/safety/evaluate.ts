import type { SuggestionSet } from '../guidance/schema';
import type { StaticGuidance } from '../guidance/staticGuidance';
import { HEDGE_PATTERN, PATTERN_RULES } from './rules';
import { SAFETY_CATEGORIES, type SafetyCategory, type SafetyFinding, type SafetyReport, type TextField } from './types';

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + length + 20);
  return `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`;
}

/** Run every pattern rule that applies to `field` over `text`. */
export function scanText(text: string, field: TextField, candidateIndex: number | null): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  for (const rule of PATTERN_RULES) {
    if (!rule.fields.includes(field)) continue;
    const match = rule.pattern.exec(text);
    if (match) {
      findings.push({
        ruleId: rule.id,
        category: rule.category,
        severity: rule.severity,
        candidateIndex,
        field,
        evidence: snippet(text, match.index, match[0].length),
        message: rule.message,
      });
    }
  }
  return findings;
}

/** Shouting: at least three words of three or more letters in capitals making up half the words, or "!!". */
export function isShouting(text: string): boolean {
  if (/!{2,}/.test(text)) return true;
  const words = text.match(/[A-Za-z]{3,}/g) ?? [];
  const caps = words.filter((w) => w === w.toUpperCase());
  return caps.length >= 3 && caps.length / Math.max(words.length, 1) >= 0.5;
}

function emptyCounts(): Record<SafetyCategory, number> {
  return Object.fromEntries(SAFETY_CATEGORIES.map((c) => [c, 0])) as Record<SafetyCategory, number>;
}

/** Evaluate a structured suggestion set from either the demo generator or a live model. */
export function evaluateSuggestionSet(set: SuggestionSet): SafetyReport {
  const findings: SafetyFinding[] = [];

  set.candidates.forEach((c, i) => {
    findings.push(...scanText(c.title, 'title', i));
    if (c.suggestedText) findings.push(...scanText(c.suggestedText, 'suggestedText', i));
    findings.push(...scanText(c.rationale, 'rationale', i));
    findings.push(...scanText(c.whenToAvoid, 'whenToAvoid', i));

    if (c.suggestedText && isShouting(c.suggestedText)) {
      findings.push({
        ruleId: 'ESC-05',
        category: 'escalation',
        severity: 'block',
        candidateIndex: i,
        field: 'suggestedText',
        evidence: snippet(c.suggestedText, 0, Math.min(c.suggestedText.length, 40)),
        message: 'Reads as shouting, which may escalate the situation.',
      });
    }
    if (c.requiresUserConfirmation !== true) {
      findings.push({
        ruleId: 'BU-01',
        category: 'bypasses_user_choice',
        severity: 'block',
        candidateIndex: i,
        field: 'structure',
        evidence: 'requiresUserConfirmation: false',
        message: 'This option does not require the user to decide before anything happens.',
      });
    }
  });

  findings.push(...scanText(set.uncertaintyNotes, 'uncertaintyNotes', null));
  findings.push(...scanText(set.limitations, 'limitations', null));
  for (const concern of set.safetyConcerns) findings.push(...scanText(concern, 'safetyConcerns', null));

  if (set.overallUncertainty === 'low' && set.safetyConcerns.length > 0) {
    findings.push({
      ruleId: 'UC-02',
      category: 'unwarranted_confidence',
      severity: 'warn',
      candidateIndex: null,
      field: 'structure',
      evidence: `overallUncertainty: low, safetyConcerns: ${set.safetyConcerns.length}`,
      message: 'Claims low uncertainty although safety concerns are listed.',
    });
  }
  if (set.uncertaintyNotes.trim().length < 20) {
    findings.push({
      ruleId: 'MU-01',
      category: 'missing_uncertainty',
      severity: 'warn',
      candidateIndex: null,
      field: 'uncertaintyNotes',
      evidence: JSON.stringify(set.uncertaintyNotes),
      message: 'Does not explain what is uncertain.',
    });
  }
  if (set.limitations.trim().length < 20) {
    findings.push({
      ruleId: 'MU-02',
      category: 'missing_uncertainty',
      severity: 'warn',
      candidateIndex: null,
      field: 'limitations',
      evidence: JSON.stringify(set.limitations),
      message: 'Does not state its limitations.',
    });
  }
  const reasoning = [set.uncertaintyNotes, ...set.candidates.map((c) => c.rationale), ...set.candidates.map((c) => c.whenToAvoid)].join(' ');
  if (!HEDGE_PATTERN.test(reasoning)) {
    findings.push({
      ruleId: 'MU-03',
      category: 'missing_uncertainty',
      severity: 'warn',
      candidateIndex: null,
      field: 'structure',
      evidence: '(no hedged language found)',
      message: 'Presents every option without any hedging.',
    });
  }

  const withheld = new Set<number>();
  const countsByCategory = emptyCounts();
  for (const f of findings) {
    countsByCategory[f.category] += 1;
    if (f.severity === 'block' && f.candidateIndex !== null) withheld.add(f.candidateIndex);
  }
  return { findings, withheldCandidateIndexes: [...withheld].sort((a, b) => a - b), countsByCategory };
}

/** Run the text rules over the static baseline, field by field. Used in tests and on the dashboard. */
export function evaluateStaticGuidance(guidance: StaticGuidance): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  findings.push(...scanText(guidance.intro, 'rationale', null));
  guidance.checklist.forEach((line) => findings.push(...scanText(line, 'rationale', null)));
  guidance.items.forEach((item, i) => {
    findings.push(...scanText(item.title, 'title', i));
    findings.push(...scanText(item.guidance, 'rationale', i));
    findings.push(...scanText(item.considerFirst, 'whenToAvoid', i));
  });
  findings.push(...scanText(guidance.caveat, 'limitations', null));
  return findings;
}

export function categoriesOf(findings: SafetyFinding[]): SafetyCategory[] {
  return [...new Set(findings.map((f) => f.category))].sort();
}
