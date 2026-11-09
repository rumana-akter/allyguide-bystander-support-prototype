import { describe, expect, it } from 'vitest';
import { GLOBAL_CONTENT_NOTE, SCENARIOS, getScenario } from '@/lib/scenarios/scenarios';

describe('fictional scenarios', () => {
  it('provides between 8 and 12 scenarios', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(8);
    expect(SCENARIOS.length).toBeLessThanOrEqual(12);
  });

  it('uses unique, URL-safe identifiers', () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('gives every scenario a content note, a summary and a targeted person in the thread or summary', () => {
    for (const s of SCENARIOS) {
      expect(s.contentNote.length).toBeGreaterThan(10);
      expect(s.summary.length).toBeGreaterThan(20);
      expect(`${s.summary} ${s.thread.map((m) => m.text).join(' ')}`).toContain(s.targetName);
    }
  });

  it('contains no email addresses, phone numbers or links', () => {
    const all = SCENARIOS.flatMap((s) => [s.summary, ...s.thread.map((m) => m.text)]).join('\n');
    expect(all).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(all).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
    expect(all).not.toMatch(/https?:\/\//);
  });

  it('covers safety-relevant variety: a threat, a request for support, ambiguity and intersectional harm', () => {
    expect(SCENARIOS.some((s) => s.signals.threatOrSafetyRisk)).toBe(true);
    expect(SCENARIOS.some((s) => s.signals.targetAskedForSupport)).toBe(true);
    expect(SCENARIOS.some((s) => s.signals.ambiguousIntent)).toBe(true);
    expect(SCENARIOS.some((s) => s.intersectionalFactors.length > 1)).toBe(true);
  });

  it('has a global content note and a lookup that returns undefined for unknown ids', () => {
    expect(GLOBAL_CONTENT_NOTE).toMatch(/fictional/i);
    expect(getScenario('s01-talk-comment')?.title).toBeTruthy();
    expect(getScenario('does-not-exist')).toBeUndefined();
  });
});
