'use client';

import { useId, useState } from 'react';
import { ACTION_LABELS } from '@/lib/guidance/actions';
import type { Provider, ShownCandidate, SuggestionResponse } from '@/lib/guidance/suggest';
import { SAFETY_CATEGORY_LABELS } from '@/lib/safety/types';

export interface LiveAvailability {
  enabled: boolean;
  model: string | null;
  reason: string | null;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; data: SuggestionResponse };

const NONE = '__none__';
const MORE_INFO = '__more_info__';

function CandidateCard({ shown }: { shown: ShownCandidate }) {
  if (shown.withheld) {
    return (
      <li className="card option withheld">
        <p className="eyebrow">{ACTION_LABELS[shown.action]}</p>
        <h4>Option withheld by the automated checks</h4>
        <ul>
          {shown.reasons.map((r) => (
            <li key={`${r.ruleId}-${r.message}`}>
              {SAFETY_CATEGORY_LABELS[r.category]}: {r.message} ({r.ruleId})
            </li>
          ))}
        </ul>
        <p className="small">The text of a withheld option is not shown.</p>
      </li>
    );
  }
  const c = shown.candidate;
  return (
    <li className="card option">
      <p className="eyebrow">{ACTION_LABELS[c.action]}</p>
      <h4>{c.title}</h4>
      <p>
        <span className="chip">Relative risk of escalation: {c.relativeRisk}</span>
      </p>
      {c.suggestedText ? (
        <figure className="wording">
          <figcaption>Possible wording, if you choose to use it. Edit it or ignore it.</figcaption>
          <blockquote>{c.suggestedText}</blockquote>
        </figure>
      ) : null}
      <p>
        <strong>Why:</strong> {c.rationale}
      </p>
      <p>
        <strong>When to avoid:</strong> {c.whenToAvoid}
      </p>
      {shown.warnings.length > 0 ? (
        <p className="check check-warn">
          Automated checks raised a warning: {shown.warnings.map((w) => `${w.message} (${w.ruleId})`).join(' ')}
        </p>
      ) : (
        <p className="check check-ok">Automated checks found no problems. That does not mean this option is safe.</p>
      )}
    </li>
  );
}

export function AiAssistPanel({ scenarioId, targetName, live }: { scenarioId: string; targetName: string; live: LiveAvailability }) {
  const [provider, setProvider] = useState<Provider>('demo');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [choice, setChoice] = useState<string | null>(null);
  const groupName = useId();

  async function generate() {
    setStatus({ kind: 'loading' });
    setChoice(null);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scenarioId, provider }),
      });
      const body: unknown = await res.json();
      if (!res.ok) {
        const message =
          typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
            ? body.message
            : 'Something went wrong.';
        setStatus({ kind: 'error', message });
        return;
      }
      setStatus({ kind: 'done', data: body as SuggestionResponse });
    } catch {
      setStatus({ kind: 'error', message: 'The request failed. Check your connection, or use the static guidance.' });
    }
  }

  const visible = status.kind === 'done' ? status.data.candidates.filter((c) => !c.withheld) : [];
  const choiceLabel = (() => {
    if (!choice) return null;
    if (choice === NONE) return 'none of these';
    if (choice === MORE_INFO) return 'you would want more information first';
    const match = visible.find((c) => String(c.index) === choice);
    return match && !match.withheld ? `"${match.candidate.title}"` : null;
  })();

  return (
    <div>
      <div className="notice notice-warn" role="note">
        <p>
          <strong>Before you use this:</strong> suggestions may be inaccurate or inappropriate. They are options to think about, not
          instructions. Nothing is posted or sent from this page, and your choices are not saved.
        </p>
      </div>

      {live.enabled ? (
        <fieldset>
          <legend>Where should suggestions come from?</legend>
          <label className="radio">
            <input type="radio" name="provider" value="demo" checked={provider === 'demo'} onChange={() => setProvider('demo')} />
            <span>Deterministic demo rules (no language model, works offline)</span>
          </label>
          <label className="radio">
            <input type="radio" name="provider" value="live" checked={provider === 'live'} onChange={() => setProvider('live')} />
            <span>Live language model on the server ({live.model})</span>
          </label>
        </fieldset>
      ) : (
        <p className="small muted">
          Source: deterministic demo rules, not a language model. {live.reason}
        </p>
      )}

      <button type="button" className="button" onClick={generate} disabled={status.kind === 'loading'}>
        {status.kind === 'done' ? 'Generate again' : 'Generate suggestions'}
      </button>

      <p className="visually-hidden" aria-live="polite">
        {status.kind === 'loading' ? 'Generating suggestions.' : status.kind === 'done' ? 'Suggestions ready.' : ''}
      </p>

      {status.kind === 'error' ? (
        <div className="notice notice-error" role="alert">
          <p>{status.message}</p>
        </div>
      ) : null}

      {status.kind === 'done' ? (
        <div className="stack" data-testid="ai-results">
          <p className="small">
            <span className="tag">Source</span> {status.data.generator.label}
          </p>

          <div className="card">
            <h3>How uncertain is this?</h3>
            <p>
              <span className="chip">Overall uncertainty: {status.data.overallUncertainty}</span>
            </p>
            <p>{status.data.uncertaintyNotes}</p>
          </div>

          {status.data.safetyConcerns.length > 0 ? (
            <div className="card">
              <h3>Safety concerns noticed</h3>
              <ul>
                {status.data.safetyConcerns.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {status.data.setWarnings.length > 0 ? (
            <div className="notice notice-warn">
              <p>Automated checks raised warnings about the suggestions as a whole:</p>
              <ul>
                {status.data.setWarnings.map((w) => (
                  <li key={`${w.ruleId}-${w.message}`}>
                    {w.message} ({w.ruleId})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <h3>Options to consider</h3>
          <ol className="options">
            {status.data.candidates.map((shown) => (
              <CandidateCard key={shown.index} shown={shown} />
            ))}
          </ol>

          <p className="small muted">
            <strong>Limitations:</strong> {status.data.limitations}
          </p>

          <fieldset>
            <legend>Which option, if any, would you consider?</legend>
            {visible.map((shown) =>
              shown.withheld ? null : (
                <label key={shown.index} className="radio">
                  <input
                    type="radio"
                    name={groupName}
                    value={String(shown.index)}
                    checked={choice === String(shown.index)}
                    onChange={() => setChoice(String(shown.index))}
                  />
                  <span>{shown.candidate.title}</span>
                </label>
              ),
            )}
            <label className="radio">
              <input type="radio" name={groupName} value={NONE} checked={choice === NONE} onChange={() => setChoice(NONE)} />
              <span>None of these</span>
            </label>
            <label className="radio">
              <input type="radio" name={groupName} value={MORE_INFO} checked={choice === MORE_INFO} onChange={() => setChoice(MORE_INFO)} />
              <span>I would want more information first</span>
            </label>
          </fieldset>
          <p aria-live="polite" data-testid="choice-feedback">
            {choiceLabel
              ? `You chose ${choiceLabel}. In a real situation, whether and how to act would be up to you and, where possible, ${targetName}. This choice is not saved.`
              : ''}
          </p>
        </div>
      ) : null}
    </div>
  );
}
