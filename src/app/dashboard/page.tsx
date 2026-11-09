import type { Metadata } from 'next';
import { ACTION_LABELS } from '@/lib/guidance/actions';
import { buildDashboardReport, RUBRIC_CRITERIA, type FixtureResult } from '@/lib/evaluation/harness';
import { PATTERN_RULES, STRUCTURAL_RULES } from '@/lib/safety/rules';
import { SAFETY_CATEGORIES, SAFETY_CATEGORY_LABELS, type SafetyCategory } from '@/lib/safety/types';

// Computed on every request from code and synthetic fixtures, so it cannot show stale numbers.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Evaluation' };

const list = (cats: SafetyCategory[]) => (cats.length ? cats.map((c) => SAFETY_CATEGORY_LABELS[c]).join('; ') : 'None');

function resultCell(r: FixtureResult) {
  if (r.matchesLabel) return <td className="result-ok">Agrees with label</td>;
  if (r.documentedLimitation === 'false-negative') return <td className="result-limit">Documented miss (false negative)</td>;
  if (r.documentedLimitation === 'false-positive') return <td className="result-limit">Documented over-flag (false positive)</td>;
  return <td className="result-bad">Unexpected disagreement</td>;
}

export default function DashboardPage() {
  const r = buildDashboardReport();
  const allRules = [...PATTERN_RULES, ...STRUCTURAL_RULES];

  return (
    <>
      <h1>Evaluation dashboard</h1>
      <div className="notice" role="note">
        <p>
          Everything on this page is computed when the page loads, from synthetic fixtures and the code&apos;s own output. There are no
          participants, no model accuracy figures and no claims about effectiveness. Fixture labels were assigned by the developer and
          have not been validated by experts.
        </p>
      </div>

      <dl className="stats" aria-label="Summary figures">
        <div className="card stat">
          <dt>Fictional scenarios</dt>
          <dd>{r.scenarioCount}</dd>
        </div>
        <div className="card stat">
          <dt>Failure-mode categories checked</dt>
          <dd>{SAFETY_CATEGORIES.length}</dd>
        </div>
        <div className="card stat">
          <dt>Automated rules</dt>
          <dd>{r.ruleCount}</dd>
        </div>
        <div className="card stat">
          <dt>Labelled synthetic fixtures</dt>
          <dd>{r.fixtures.length}</dd>
        </div>
        <div className="card stat">
          <dt>Fixtures where the rules agree with the label</dt>
          <dd>
            {r.fixturesMatching} of {r.fixtures.length}
          </dd>
        </div>
        <div className="card stat">
          <dt>Documented rule failures</dt>
          <dd>{r.documentedLimitations}</dd>
        </div>
      </dl>

      <h2>Safety-rule fixture cases</h2>
      <p className="prose">
        Each fixture is a synthetic set of suggestions written to contain, or to avoid, a particular failure. The rules are run on it
        now. Four fixtures are kept because the rules get them wrong, so that these gaps stay visible.
      </p>
      <div className="table-wrap">
        <table>
          <caption>Fixture results (evaluated on page load)</caption>
          <thead>
            <tr>
              <th scope="col">Fixture</th>
              <th scope="col">What it contains</th>
              <th scope="col">Developer label</th>
              <th scope="col">Flagged by the rules</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            {r.fixtures.map((f) => (
              <tr key={f.id}>
                <th scope="row">{f.id}</th>
                <td>
                  {f.description}
                  {f.note ? <span className="small muted"> ({f.note})</span> : null}
                </td>
                <td>{list(f.expected)}</td>
                <td>{list(f.flagged)}</td>
                {resultCell(f)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Failure-mode categories</h2>
      <div className="table-wrap">
        <table>
          <caption>Rules per category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Rules</th>
              <th scope="col">What the rules look for</th>
            </tr>
          </thead>
          <tbody>
            {SAFETY_CATEGORIES.map((c) => (
              <tr key={c}>
                <th scope="row">{SAFETY_CATEGORY_LABELS[c]}</th>
                <td>{r.ruleCountsByCategory[c]}</td>
                <td>
                  {allRules
                    .filter((rule) => rule.category === c)
                    .map((rule) => `${rule.id}: ${rule.description}`)
                    .join('; ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Deterministic demo audit</h2>
      <p className="prose">The demo generator is run twice on every scenario, then its output is validated and checked.</p>
      <div className="table-wrap">
        <table>
          <caption>Demo output per scenario</caption>
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col">Options offered, in order</th>
              <th scope="col">Uncertainty</th>
              <th scope="col">Schema valid</th>
              <th scope="col">Findings</th>
              <th scope="col">Same output twice</th>
            </tr>
          </thead>
          <tbody>
            {r.generatorAudit.map((row) => (
              <tr key={row.scenarioId}>
                <th scope="row">{row.title}</th>
                <td>{row.actions.map((a) => ACTION_LABELS[a]).join(', then ')}</td>
                <td>{row.overallUncertainty}</td>
                <td>{row.schemaValid ? 'Yes' : 'No'}</td>
                <td>{row.findingCount}</td>
                <td>{row.deterministic ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Structural rubric: static guidance and AI-assisted (demo)</h2>
      <p className="prose">
        These criteria are checked automatically against the output of each mode for all {r.scenarioCount} scenarios. They describe
        structure, not quality. They say nothing about whether either mode helps people, and the demo was written by the same person who
        wrote the criteria.
      </p>
      <div className="table-wrap">
        <table>
          <caption>Scenarios meeting each criterion</caption>
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              <th scope="col">How it is checked</th>
              <th scope="col">Static guidance</th>
              <th scope="col">AI-assisted (demo)</th>
            </tr>
          </thead>
          <tbody>
            {RUBRIC_CRITERIA.map((c) => (
              <tr key={c.id}>
                <th scope="row">
                  {c.id}: {c.label}
                </th>
                <td>{c.test}</td>
                <td>
                  {r.rubric.filter((row) => row.staticMet[c.id]).length} of {r.rubric.length}
                </td>
                <td>
                  {r.rubric.filter((row) => row.demoMet[c.id]).length} of {r.rubric.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">The static guidance text raised {r.staticGuidanceFindings} findings when run through the same rules.</p>

      <h2>What these checks cannot tell you</h2>
      <ul className="prose">
        <li>They are English keyword and pattern rules. They miss sarcasm, implied blame and other languages, and they over-flag quoted or negated phrases.</li>
        <li>Passing every check does not make a suggestion safe or helpful.</li>
        <li>The fixtures and labels were written by the developer, not by experts or people with lived experience.</li>
        <li>No live model output is evaluated here. Live mode is optional and was not exercised in the published tests.</li>
        <li>
          Unit and end-to-end test results come from <code>npm test</code> and <code>npm run test:e2e</code>, and are not copied onto
          this page, so it cannot show stale results.
        </li>
      </ul>
    </>
  );
}
