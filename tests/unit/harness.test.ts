import { describe, expect, it } from 'vitest';
import { FIXTURES } from '@/lib/evaluation/fixtures';
import { buildDashboardReport, runFixtureHarness, runGeneratorAudit, runStructuralRubric } from '@/lib/evaluation/harness';

describe('fixture harness', () => {
  const results = runFixtureHarness();

  it('runs every labelled fixture', () => {
    expect(results).toHaveLength(FIXTURES.length);
  });

  it('matches the label for every fixture that is not a documented limitation', () => {
    const unexpected = results.filter((r) => !r.documentedLimitation && !r.matchesLabel);
    expect(unexpected).toEqual([]);
  });

  it('still disagrees with the label for each documented limitation (update the docs if this changes)', () => {
    const limitations = results.filter((r) => r.documentedLimitation);
    expect(limitations.map((r) => r.id)).toEqual(['F13', 'F14', 'F15', 'F16']);
    expect(limitations.every((r) => !r.matchesLabel)).toBe(true);
  });
});

describe('generator audit and structural rubric', () => {
  it('reports every scenario as schema-valid, deterministic and free of findings', () => {
    for (const row of runGeneratorAudit()) {
      expect(row).toMatchObject({ schemaValid: true, deterministic: true, findingCount: 0 });
    }
  });

  it('records that static guidance cannot adapt to a scenario (R5), by design', () => {
    expect(runStructuralRubric().every((row) => row.staticMet.R5 === false)).toBe(true);
  });

  it('builds a dashboard report whose counts agree with its parts', () => {
    const report = buildDashboardReport();
    expect(report.fixturesMatching + report.documentedLimitations).toBe(report.fixtures.length);
    expect(Object.values(report.ruleCountsByCategory).reduce((a, b) => a + b, 0)).toBe(report.ruleCount);
    expect(report.staticGuidanceFindings).toBe(0);
  });
});
