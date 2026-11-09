import Link from 'next/link';
import { ContentNote } from '@/components/ContentNote';
import { GLOBAL_CONTENT_NOTE, SCENARIOS } from '@/lib/scenarios/scenarios';

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="page-title">
        <h1 id="page-title">AllyGuide</h1>
        <p className="lead">
          A small research demonstrator that explores how optional, context-sensitive guidance might help bystanders respond to
          gendered online harassment, and how such guidance can be checked for safety failures.
        </p>
        <div className="notice" role="note">
          <p>
            <strong>What this is not.</strong> AllyGuide is a preliminary technical demonstrator. It is not a validated intervention,
            a commercial safety product or a replacement for professional safeguarding advice. No human-subject study has been
            carried out with it, and nothing here shows that it reduces harm.
          </p>
        </div>
      </section>

      <ContentNote text={GLOBAL_CONTENT_NOTE} />

      <section aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol className="steps">
          <li>Open one of the fictional scenarios below.</li>
          <li>
            Compare the <strong>static guidance</strong>, which is the same for every situation, with the{' '}
            <strong>AI-assisted suggestions</strong>. In this public demo, the AI-assisted mode uses deterministic rules, not a
            language model.
          </li>
          <li>
            See what the automated safety checks catch, and what they miss, on the <Link href="/dashboard">evaluation page</Link>.
          </li>
        </ol>
      </section>

      <section aria-labelledby="scenarios-title">
        <h2 id="scenarios-title">Scenarios</h2>
        <ul className="scenario-grid">
          {SCENARIOS.map((s, i) => (
            <li key={s.id} className="card scenario-card">
              <p className="eyebrow">Scenario {i + 1}</p>
              <h3>
                <Link href={`/scenarios/${s.id}`}>{s.title}</Link>
              </h3>
              <p className="tags">
                <span className="tag">{s.categoryLabel}</span>
                <span className="tag">{s.platformLabel}</span>
              </p>
              <p className="small muted">{s.contentNote}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
