import { ACTION_LABELS } from '@/lib/guidance/actions';
import type { StaticGuidance } from '@/lib/guidance/staticGuidance';

export function StaticGuidancePanel({ guidance }: { guidance: StaticGuidance }) {
  return (
    <div>
      <p className="small muted">
        <span className="tag">Static guidance</span> The same text for every scenario. No AI is involved.
      </p>
      <p>{guidance.intro}</p>
      <h3>Before you act</h3>
      <ul>
        {guidance.checklist.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <h3>Options</h3>
      <ol className="options">
        {guidance.items.map((item) => (
          <li key={item.action} className="card option">
            <p className="eyebrow">{ACTION_LABELS[item.action]}</p>
            <h4>{item.title}</h4>
            <p>{item.guidance}</p>
            <p className="small">
              <strong>Consider first:</strong> {item.considerFirst}
            </p>
          </li>
        ))}
      </ol>
      <p className="small muted">{guidance.caveat}</p>
    </div>
  );
}
