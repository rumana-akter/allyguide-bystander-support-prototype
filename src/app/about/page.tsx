import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="prose">
      <h1>About this demonstrator</h1>

      <h2>Why it exists</h2>
      <p>
        Much advice about online harassment asks the people targeted to protect themselves. Research on bystanders suggests that
        other people who see harassment could share that responsibility, but often do not act, or are unsure what would help. AllyGuide
        is a small technical demonstrator built alongside a PhD research proposal on AI-assisted bystander support for gendered online
        harassment. It shows how guidance could be structured, compared with a static baseline, and checked for failures.
      </p>

      <h2>What it does</h2>
      <ul>
        <li>Shows ten fictional scenarios with a content note for each.</li>
        <li>Offers static guidance that is the same for every scenario, as a non-AI baseline.</li>
        <li>
          Offers AI-assisted suggestions, which in this demo come from deterministic rules. An optional server-side language-model mode
          exists but is turned off unless the person running the server enables it.
        </li>
        <li>Runs every suggestion through schema validation and rule-based safety checks, and withholds options that fail a blocking check.</li>
        <li>
          Shows the checks, their known failures and a structural comparison on the <Link href="/dashboard">evaluation page</Link>.
        </li>
      </ul>

      <h2>Limitations</h2>
      <ul>
        <li>No human-subject study has been carried out. Nothing here shows that the guidance helps, or that it reduces harm.</li>
        <li>The scenarios, guidance text, rules and fixture labels were written by one developer and have not been reviewed by specialists or by people with lived experience.</li>
        <li>The safety checks are English keyword heuristics. They miss things and over-flag things, and they can be evaded.</li>
        <li>The deterministic demo is not a language model. It shows the shape of AI-assisted output, not its quality.</li>
        <li>The guidance is general information, not professional safeguarding advice.</li>
      </ul>

      <h2>Privacy and responsible AI</h2>
      <ul>
        <li>There is no free-text input. The browser sends only a scenario identifier, so no harassment content from users can be submitted or stored.</li>
        <li>The site sets no cookies, keeps no logs of choices and has no analytics.</li>
        <li>In live mode, only the fixed fictional scenario is sent to the model provider. The API key stays on the server.</li>
        <li>Nothing is ever posted or sent on the user&apos;s behalf. Every option requires the user&apos;s own decision.</li>
      </ul>

      <h2>Testing</h2>
      <p>
        The code is checked with automated unit and end-to-end tests. The repository README describes what was tested and what remains
        unverified.
      </p>

      <p>
        If someone is in immediate danger, contact local emergency services.
      </p>
    </div>
  );
}
