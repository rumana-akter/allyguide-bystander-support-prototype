'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import type { StaticGuidance } from '@/lib/guidance/staticGuidance';
import { AiAssistPanel, type LiveAvailability } from './AiAssistPanel';
import { StaticGuidancePanel } from './StaticGuidancePanel';

const TABS = [
  { id: 'static', label: 'Static guidance' },
  { id: 'ai', label: 'AI-assisted suggestions' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function GuidanceWorkspace(props: { scenarioId: string; targetName: string; staticGuidance: StaticGuidance; live: LiveAvailability }) {
  const [active, setActive] = useState<TabId>('static');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    const tab = TABS[next];
    if (tab) {
      setActive(tab.id);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <h2 id="workspace-title">Guidance for the bystander</h2>
      <p className="small muted">Both modes are optional. Nothing on this page posts, sends or stores anything.</p>
      <div role="tablist" aria-label="Guidance mode" className="tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="panel-static" aria-labelledby="tab-static" hidden={active !== 'static'} tabIndex={0}>
        <StaticGuidancePanel guidance={props.staticGuidance} />
      </div>
      <div role="tabpanel" id="panel-ai" aria-labelledby="tab-ai" hidden={active !== 'ai'} tabIndex={0}>
        <AiAssistPanel scenarioId={props.scenarioId} targetName={props.targetName} live={props.live} />
      </div>
    </section>
  );
}
