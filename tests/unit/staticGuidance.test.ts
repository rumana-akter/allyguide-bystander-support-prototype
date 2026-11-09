import { describe, expect, it } from 'vitest';
import { ACTION_TYPES } from '@/lib/guidance/actions';
import { STATIC_GUIDANCE } from '@/lib/guidance/staticGuidance';
import { evaluateStaticGuidance } from '@/lib/safety/evaluate';

describe('static-guidance baseline', () => {
  it('covers each of the four action types exactly once', () => {
    expect(STATIC_GUIDANCE.items.map((i) => i.action).sort()).toEqual([...ACTION_TYPES].sort());
  });

  it('puts the targeted person\'s wishes and immediate safety in the checklist', () => {
    const checklist = STATIC_GUIDANCE.checklist.join(' ');
    expect(checklist).toMatch(/wishes come first/i);
    expect(checklist).toMatch(/emergency services/i);
  });

  it('states that it is not professional safeguarding advice', () => {
    expect(STATIC_GUIDANCE.caveat).toMatch(/not professional safeguarding advice/i);
  });

  it('raises no findings from the automated safety rules', () => {
    expect(evaluateStaticGuidance(STATIC_GUIDANCE)).toEqual([]);
  });
});
