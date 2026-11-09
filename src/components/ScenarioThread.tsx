import type { ParticipantRole, Scenario } from '@/lib/types';

const ROLE_LABEL: Record<ParticipantRole, string> = {
  'targeted-person': 'targeted person',
  'harassing-account': 'harassing account',
  'other-participant': 'other participant',
};

export function ScenarioThread({ scenario }: { scenario: Scenario }) {
  return (
    <section className="card" aria-labelledby="thread-title">
      <div className="thread-head">
        <h2 id="thread-title">The fictional messages</h2>
        <span className="tag tag-fiction">Fictional</span>
      </div>
      <p className="small muted">
        {scenario.platformLabel}. Visibility: {scenario.visibility}.
      </p>
      <ol className="messages">
        {scenario.thread.map((m, i) => (
          <li key={i} className={`message role-${m.role}`}>
            <p className="speaker">
              {m.speaker}
              <span className="role">({ROLE_LABEL[m.role]})</span>
            </p>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
