import { describe, expect, it } from 'vitest';
import { SuggestionSetSchema } from '@/lib/guidance/schema';
import { FIXTURES } from '@/lib/evaluation/fixtures';

const valid = FIXTURES[0]!.set;

describe('structured output schema', () => {
  it('accepts a well-formed suggestion set', () => {
    expect(SuggestionSetSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an unknown action type', () => {
    const bad = { ...valid, candidates: [{ ...valid.candidates[0]!, action: 'confront_offline' }] };
    expect(SuggestionSetSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { rationale: _drop, ...rest } = valid.candidates[0]!;
    expect(SuggestionSetSchema.safeParse({ ...valid, candidates: [rest] }).success).toBe(false);
  });

  it('rejects extra fields, such as an instruction to auto-post', () => {
    const bad = { ...valid, candidates: [{ ...valid.candidates[0]!, autoPost: true }] };
    expect(SuggestionSetSchema.safeParse(bad).success).toBe(false);
    expect(SuggestionSetSchema.safeParse({ ...valid, postNow: true }).success).toBe(false);
  });

  it('rejects over-long wording and empty or oversized candidate lists', () => {
    const long = { ...valid, candidates: [{ ...valid.candidates[0]!, suggestedText: 'x'.repeat(451) }] };
    expect(SuggestionSetSchema.safeParse(long).success).toBe(false);
    expect(SuggestionSetSchema.safeParse({ ...valid, candidates: [] }).success).toBe(false);
    expect(SuggestionSetSchema.safeParse({ ...valid, candidates: Array(6).fill(valid.candidates[0]) }).success).toBe(false);
  });

  it('allows null wording for options that need none', () => {
    const ok = { ...valid, candidates: [{ ...valid.candidates[0]!, suggestedText: null }] };
    expect(SuggestionSetSchema.safeParse(ok).success).toBe(true);
  });
});
