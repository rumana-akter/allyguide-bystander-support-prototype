/**
 * Domain types for AllyGuide's fictional scenarios.
 * Every scenario is invented for this demonstrator. None is based on a real person or real post.
 */

export type Visibility = 'public' | 'semi-private' | 'private';

export type ParticipantRole = 'targeted-person' | 'harassing-account' | 'other-participant';

export interface ThreadMessage {
  /** Fictional display name or handle. */
  speaker: string;
  role: ParticipantRole;
  /** Message text. Abusive content is mild or paraphrased in square brackets. */
  text: string;
}

/** Facts about the situation that the guidance logic is allowed to use. */
export interface ScenarioSignals {
  /** People beyond a small known group can see the messages. */
  publicAudience: boolean;
  /** The behaviour has happened more than once. */
  repeatedBehaviour: boolean;
  /** More than one account is taking part. */
  multipleHarassers: boolean;
  /** A message reads as a threat to someone's safety. */
  threatOrSafetyRisk: boolean;
  /** Personal details about the targeted person have been posted or hinted at. */
  personalInformationAtRisk: boolean;
  /** The targeted person has asked the bystander for help. */
  targetAskedForSupport: boolean;
  /** The bystander knows the targeted person. */
  bystanderKnowsTarget: boolean;
  /** The person making the comment holds power over others present (for example, seniority at work). */
  powerImbalance: boolean;
  /** It is genuinely unclear whether the comment is harmful. */
  ambiguousIntent: boolean;
}

export type ReportingRoute = 'platform' | 'community-moderators' | 'workplace' | 'institution' | 'none-obvious';

export interface Scenario {
  id: string;
  title: string;
  categoryLabel: string;
  platformLabel: string;
  visibility: Visibility;
  summary: string;
  contentNote: string;
  /** Fictional first name of the targeted person. */
  targetName: string;
  /** Short phrase naming where the messages appeared, written from the targeted person's view, e.g. "under your talk". */
  placePhrase: string;
  thread: ThreadMessage[];
  signals: ScenarioSignals;
  reportingRoute: ReportingRoute;
  /** Identity characteristics, beyond gender, that the harassment also targets. */
  intersectionalFactors: string[];
}
