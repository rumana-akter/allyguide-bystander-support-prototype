import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentNote } from '@/components/ContentNote';
import { GuidanceWorkspace } from '@/components/GuidanceWorkspace';
import { ScenarioThread } from '@/components/ScenarioThread';
import { readLiveConfig } from '@/lib/config';
import { STATIC_GUIDANCE } from '@/lib/guidance/staticGuidance';
import { SCENARIOS, getScenario } from '@/lib/scenarios/scenarios';

// Rendered per request so that the live-mode setting reflects the server's current environment.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: getScenario(id)?.title ?? 'Scenario not found' };
}

export default async function ScenarioPage({ params }: Props) {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();

  const index = SCENARIOS.findIndex((s) => s.id === scenario.id);
  const prev = SCENARIOS[index - 1];
  const next = SCENARIOS[index + 1];
  const live = readLiveConfig();

  return (
    <>
      <p>
        <Link href="/">Back to all scenarios</Link>
      </p>
      <p className="eyebrow">
        Scenario {index + 1} of {SCENARIOS.length}: {scenario.categoryLabel}
      </p>
      <h1>{scenario.title}</h1>
      <ContentNote text={scenario.contentNote} />
      <p className="lead">{scenario.summary}</p>

      <ScenarioThread scenario={scenario} />

      <GuidanceWorkspace
        scenarioId={scenario.id}
        targetName={scenario.targetName}
        staticGuidance={STATIC_GUIDANCE}
        live={{ enabled: live.enabled, model: live.enabled ? live.model : null, reason: live.reason }}
      />

      <nav className="pager" aria-label="Other scenarios">
        {prev ? <Link href={`/scenarios/${prev.id}`}>Previous: {prev.title}</Link> : <span />}
        {next ? <Link href={`/scenarios/${next.id}`}>Next: {next.title}</Link> : <span />}
      </nav>
    </>
  );
}
