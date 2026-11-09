import { describe, expect, it } from 'vitest';
import { chooseActionOrder, generateDemoSuggestions } from '@/lib/guidance/demoGenerator';
import { SuggestionSetSchema } from '@/lib/guidance/schema';
import { evaluateSuggestionSet } from '@/lib/safety/evaluate';
import { SCENARIOS, getScenario } from '@/lib/scenarios/scenarios';

const byId = (id: string) => {
  const s = getScenario(id);
  if (!s) throw new Error(`missing scenario ${id}`);
  return s;
};

describe('deterministic demo generator', () => {
  it.each(SCENARIOS.map((s) => [s.id, s] as const))('%s: output is schema-valid', (_id, s) => {
    expect(SuggestionSetSchema.safeParse(generateDemoSuggestions(s)).success).toBe(true);
  });

  it.each(SCENARIOS.map((s) => [s.id, s] as const))('%s: output raises no safety findings', (_id, s) => {
    expect(evaluateSuggestionSet(generateDemoSuggestions(s)).findings).toEqual([]);
  });

  it('is deterministic: the same scenario always gives identical output', () => {
    for (const s of SCENARIOS) {
      expect(JSON.stringify(generateDemoSuggestions(s))).toBe(JSON.stringify(generateDemoSuggestions(s)));
    }
  });

  it('labels itself as rules rather than a language model', () => {
    expect(generateDemoSuggestions(byId('s01-talk-comment')).limitations).toMatch(/not by a language model/);
  });

  it('never claims low uncertainty, and requires confirmation for every option', () => {
    for (const s of SCENARIOS) {
      const out = generateDemoSuggestions(s);
      expect(out.overallUncertainty).not.toBe('low');
      expect(out.candidates.every((c) => c.requiresUserConfirmation)).toBe(true);
    }
  });
});

describe('context sensitivity of the demo rules', () => {
  it('does not suggest a public reply when there is a threat and exposed personal details', () => {
    const order = chooseActionOrder(byId('s06-pile-on-threat'));
    expect(order).not.toContain('respectful_intervention');
    expect(order[0]).toBe('report');
    expect(generateDemoSuggestions(byId('s06-pile-on-threat')).safetyConcerns.join(' ')).toMatch(/threat/);
  });

  it('puts support first when the targeted person has asked for help', () => {
    expect(chooseActionOrder(byId('s09-friend-asks'))[0]).toBe('support_target');
  });

  it('ranks reporting above a public reply during a public pile-on', () => {
    const order = chooseActionOrder(byId('s02-match-chat'));
    expect(order.indexOf('report')).toBeLessThan(order.indexOf('respectful_intervention'));
  });

  it('reports high uncertainty for ambiguous banter and offers no formal report', () => {
    const out = generateDemoSuggestions(byId('s10-banter-or-not'));
    expect(out.overallUncertainty).toBe('high');
    expect(out.candidates.map((c) => c.action)).not.toContain('report');
  });

  it('notes intersecting identity factors when present', () => {
    expect(generateDemoSuggestions(byId('s08-stream-chat')).uncertaintyNotes).toMatch(/gender and religion/);
  });
});
