import type { ReportingRoute, Scenario } from '../types';
import type { ActionType } from './actions';
import type { Candidate, SuggestionSet } from './schema';

/**
 * Deterministic stand-in for the AI-assisted mode.
 *
 * This is NOT a language model. It assembles structured suggestions from fixed rules over the
 * scenario's signals, so the demonstrator works offline, costs nothing, and gives the same output
 * every time. It exists to exercise the same schema, safety checks and interface that a live
 * model would use, and to make the comparison with static guidance concrete.
 */

export const DEMO_GENERATOR_LABEL = 'Deterministic demo rules (not a language model)';

const ROUTE: Record<ReportingRoute, string> = {
  platform: "the platform's report tools",
  'community-moderators': "the community's moderators or the platform's report tools",
  workplace: "your organisation's reporting route, such as a manager you trust or HR",
  institution: "the module leader or the university's reporting route",
  'none-obvious': 'no obvious formal route',
};

/** Scenario-specific wording for a calm public (or in-group) intervention. */
const INTERVENTION_WORDING: Record<string, { title: string; text: string; rationale: string; risk: Candidate['relativeRisk'] }> = {
  's01-talk-comment': {
    title: 'Bring the comments back to the talk',
    text: "Let's keep the comments about the talk itself. The section on testing data pipelines was useful.",
    rationale:
      'A calm reply that moves attention back to the content can signal that the comment is not the norm here, without insulting anyone.',
    risk: 'moderate',
  },
  's02-match-chat': {
    title: 'Ask the team to focus on the game',
    text: "Let's just play. Comments like that aren't needed.",
    rationale: 'A short, neutral line may reset the chat without targeting anyone personally.',
    risk: 'higher',
  },
  's03-group-project': {
    title: 'Suggest including Mei in the technical meeting',
    text: "Mei wrote most of the data cleaning code, so it would make sense for her to be at Thursday's meeting. Shall we all go through it together?",
    rationale:
      'In a small group you know, a matter-of-fact suggestion about the work can include Mei without accusing anyone.',
    risk: 'lower',
  },
  's04-forum-moderator': {
    title: 'Back up the moderator with a calm reply',
    text: "Sana's reminder was about keeping threads easy to search. Repeated replies like this aren't okay here.",
    rationale: 'Other members speaking up may show that the community does not accept this pattern.',
    risk: 'moderate',
  },
  's05-pay-gap-post': {
    title: 'Reply to the point, not the person',
    text: "The data is worth discussing on its merits. Negotiation is one factor, but it doesn't explain a gap across a whole team.",
    rationale:
      'In a professional setting, a calm reply that engages with the evidence can counter the dismissal without personal attacks.',
    risk: 'lower',
  },
  's07-work-channel-joke': {
    title: 'Congratulate Hannah without repeating the joke',
    text: 'Congratulations, Hannah. Well deserved.',
    rationale:
      "Publicly affirming Hannah's promotion can shift the tone of the channel without confrontation. A private word with the colleague is another option if your role and relationship make that safe.",
    risk: 'moderate',
  },
  's08-stream-chat': {
    title: 'Add a supportive comment about the content',
    text: 'Thanks for the stream, Amina. Enjoying the TypeScript part.',
    rationale:
      'A positive comment about the content adds support to the chat without engaging the accounts posting hostile comments.',
    risk: 'moderate',
  },
  's09-friend-asks': {
    title: 'Reply calmly, but only if Chloe wants you to',
    text: 'You can disagree about the film without name-calling.',
    rationale: 'If Chloe would like someone to reply, a short line about behaviour keeps attention off her.',
    risk: 'moderate',
  },
  's10-banter-or-not': {
    title: "Celebrate Zara's win in the chat",
    text: 'Nice one, Zara! That last round was close.',
    rationale: "Replying to Zara's achievement shifts attention back to her win without accusing Ben of anything.",
    risk: 'lower',
  },
};

function supportCandidate(s: Scenario): Candidate {
  const name = s.targetName;
  if (s.signals.targetAskedForSupport) {
    return {
      action: 'support_target',
      title: `Listen to ${name} and ask what would help`,
      suggestedText:
        "I'm really sorry this is happening. You haven't done anything wrong. Would it help if we reported the replies together, or would you rather I just kept you company for a bit?",
      rationale: `${name} has asked you directly, so her wishes can guide what happens next. Offering choices, rather than acting for her, keeps the decision with her.`,
      whenToAvoid: `If ${name} says she only wants to vent, listening may help more than suggesting actions.`,
      relativeRisk: 'lower',
      requiresUserConfirmation: true,
    };
  }
  if (s.signals.bystanderKnowsTarget) {
    return {
      action: 'support_target',
      title: `Check in with ${name} privately`,
      suggestedText: `Hey ${name}, I saw what was said ${s.placePhrase}. Are you okay? Happy to help if you'd like, or to leave it if you'd rather.`,
      rationale: `A private message shows that someone noticed, without drawing more attention to the comment. Asking, rather than assuming, leaves the choice with ${name}.`,
      whenToAvoid: `If ${name} has said she wants to handle it herself, a message may feel like pressure.`,
      relativeRisk: 'lower',
      requiresUserConfirmation: true,
    };
  }
  return {
    action: 'support_target',
    title: `Send ${name} a short, supportive message`,
    suggestedText: `Hi ${name}, I saw some of the replies ${s.placePhrase}. That wasn't okay. No need to reply, but if anything would help, let me know.`,
    rationale: `Private support can show that someone noticed, without adding to the public thread. A message that asks for no reply asks nothing of ${name}.`,
    whenToAvoid: `A message from a stranger may feel intrusive. If ${name} has limited who can message her, respect that.`,
    relativeRisk: 'lower',
    requiresUserConfirmation: true,
  };
}

function reportCandidate(s: Scenario): Candidate {
  const name = s.targetName;
  const route = ROUTE[s.reportingRoute];
  let rationale: string;
  if (s.signals.threatOrSafetyRisk || s.signals.personalInformationAtRisk) {
    rationale = `One reply reads as a threat and another hints at where ${name} works. Platforms usually offer specific report options for threats and for exposing personal details, and reporting does not notify the account you report.`;
  } else if (s.reportingRoute === 'workplace') {
    rationale =
      "Comments like this may fall under your organisation's conduct policy. Raising it with someone you trust does not have to be a formal complaint.";
  } else if (s.signals.repeatedBehaviour) {
    rationale = `This has happened more than once. A report that describes the pattern, not just one message, may give the people reviewing it more to act on.`;
  } else {
    rationale = 'Reporting asks the people who run the space to review the comment against their rules. It does not notify the person you report.';
  }
  let whenToAvoid: string;
  if (s.signals.targetAskedForSupport) {
    whenToAvoid = `If ${name} would rather you did not report it, talk with her first.`;
  } else if (s.reportingRoute === 'workplace') {
    whenToAvoid = 'If raising it could put you at risk at work, you might first talk to someone you trust outside the team.';
  } else {
    whenToAvoid = 'Reports can be slow or unsuccessful. If nothing happens, that is not a judgement on you.';
  }
  return {
    action: 'report',
    title: `Report it through ${route}`,
    suggestedText: null,
    rationale,
    whenToAvoid,
    relativeRisk: 'lower',
    requiresUserConfirmation: true,
  };
}

function holdBackCandidate(s: Scenario): Candidate {
  const name = s.targetName;
  let rationale: string;
  if (s.signals.publicAudience && s.signals.multipleHarassers) {
    rationale = `Several accounts are already involved. Another public reply may push the thread to more people, including more hostile ones, and keep ${name} in the spotlight.`;
  } else if (s.signals.ambiguousIntent) {
    rationale = `Not every comment needs a public response. Raising it in front of the group could embarrass ${name} if she saw it as friendly teasing.`;
  } else {
    rationale =
      'A public argument can draw more attention to a comment than it would otherwise get. Choosing not to reply in public can be a deliberate, protective choice.';
  }
  return {
    action: 'hold_back_publicly',
    title: 'Consider not replying in public',
    suggestedText: null,
    rationale,
    whenToAvoid: 'Holding back in public does not have to mean doing nothing. You can still report or offer private support.',
    relativeRisk: 'lower',
    requiresUserConfirmation: true,
  };
}

function interventionCandidate(s: Scenario): Candidate | null {
  const wording = INTERVENTION_WORDING[s.id];
  if (!wording) return null;
  let whenToAvoid = `Avoid this if more people join in, if it would make you a target, or if ${s.targetName} has asked people not to engage.`;
  if (s.signals.powerImbalance) {
    whenToAvoid = 'If speaking up in front of a senior colleague could put you at risk, a private conversation or a report may be safer.';
  }
  if (s.signals.targetAskedForSupport) {
    whenToAvoid = `If ${s.targetName} would prefer that nobody replies, or if more people join in.`;
  }
  return {
    action: 'respectful_intervention',
    title: wording.title,
    suggestedText: wording.text,
    rationale: wording.rationale,
    whenToAvoid,
    relativeRisk: wording.risk,
    requiresUserConfirmation: true,
  };
}

/** Decide which actions to offer, and in what order, from the scenario's signals. */
export function chooseActionOrder(s: Scenario): ActionType[] {
  const sig = s.signals;
  const severe = sig.threatOrSafetyRisk || sig.personalInformationAtRisk;
  const pileOnRisk = sig.publicAudience && sig.multipleHarassers;
  let order: ActionType[];
  if (sig.targetAskedForSupport) {
    order = ['support_target', 'report', 'hold_back_publicly', 'respectful_intervention'];
  } else if (severe) {
    // A public reply is deliberately not offered when there is a threat or exposed personal information.
    order = ['report', 'hold_back_publicly', 'support_target'];
  } else if (pileOnRisk) {
    order = ['report', 'support_target', 'hold_back_publicly', 'respectful_intervention'];
  } else if (sig.ambiguousIntent) {
    order = ['support_target', 'respectful_intervention', 'hold_back_publicly'];
  } else if (sig.powerImbalance) {
    order = ['support_target', 'report', 'respectful_intervention', 'hold_back_publicly'];
  } else if (sig.repeatedBehaviour && sig.publicAudience) {
    order = ['report', 'support_target', 'respectful_intervention', 'hold_back_publicly'];
  } else if (!sig.publicAudience) {
    order = ['respectful_intervention', 'support_target', 'report'];
  } else {
    order = ['respectful_intervention', 'support_target', 'report', 'hold_back_publicly'];
  }
  if (s.reportingRoute === 'none-obvious') order = order.filter((a) => a !== 'report');
  return order;
}

function uncertaintyNotes(s: Scenario): string {
  const name = s.targetName;
  const sig = s.signals;
  const parts = [
    `These options are based only on the fictional messages shown. They cannot account for ${name}'s wishes, your relationship with the people involved, or anything that happened before.`,
  ];
  if (sig.ambiguousIntent) {
    parts.push(`It is unclear whether ${name} sees the comment as friendly teasing, so asking her privately may tell you more than the message itself.`);
  }
  if (sig.threatOrSafetyRisk || sig.personalInformationAtRisk) {
    parts.push(
      `Threats are hard to judge from text alone. If you think someone is in immediate danger, contact local emergency services. A public reply is not suggested here because it may draw more attention to ${name}.`,
    );
  }
  if (sig.powerImbalance) {
    parts.push(`The comment came from someone more senior, which may affect what feels safe for you and for ${name}.`);
  }
  if (s.intersectionalFactors.length > 1) {
    parts.push(
      `The comments target ${name}'s ${s.intersectionalFactors.join(' and ')} together. Report categories may not capture this combination, so choosing the closest options and adding a short description may help.`,
    );
  }
  return parts.join(' ');
}

function safetyConcerns(s: Scenario): string[] {
  const name = s.targetName;
  const sig = s.signals;
  const concerns: string[] = [];
  if (sig.threatOrSafetyRisk) concerns.push('A reply reads as a threat. Treat it seriously and report it.');
  if (sig.personalInformationAtRisk) concerns.push(`Details about where ${name} works have been hinted at. Do not repeat, confirm or pass them on.`);
  if (sig.publicAudience && sig.multipleHarassers) concerns.push(`Several accounts are involved. Public replies may draw more attention to ${name}.`);
  if (sig.powerImbalance) concerns.push('The comment comes from a senior colleague. Consider your own position before acting publicly.');
  if (sig.repeatedBehaviour && !sig.threatOrSafetyRisk) concerns.push('This has happened repeatedly, which can make each instance harder to bear.');
  return concerns;
}

export const DEMO_LIMITATIONS =
  'Demo mode: these options were assembled by fixed rules written for this demonstrator, not by a language model. The same scenario always gives the same output. The options may still be wrong for a real situation, and the automated checks cannot confirm that any option is safe.';

export function generateDemoSuggestions(s: Scenario): SuggestionSet {
  const builders: Record<ActionType, (sc: Scenario) => Candidate | null> = {
    support_target: supportCandidate,
    report: reportCandidate,
    hold_back_publicly: holdBackCandidate,
    respectful_intervention: interventionCandidate,
  };
  const candidates = chooseActionOrder(s)
    .map((action) => builders[action](s))
    .filter((c): c is Candidate => c !== null);
  return {
    candidates,
    overallUncertainty: s.signals.ambiguousIntent ? 'high' : 'medium',
    uncertaintyNotes: uncertaintyNotes(s),
    safetyConcerns: safetyConcerns(s),
    limitations: DEMO_LIMITATIONS,
  };
}
