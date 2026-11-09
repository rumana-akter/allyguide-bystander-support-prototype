import type { ActionType } from './actions';

/**
 * Non-AI baseline: the same guidance for every scenario, written like a platform help page.
 * It is deliberately not tailored, so that it can serve as the comparison condition.
 */

export interface StaticGuidanceItem {
  action: ActionType;
  title: string;
  guidance: string;
  considerFirst: string;
}

export interface StaticGuidance {
  intro: string;
  checklist: string[];
  items: StaticGuidanceItem[];
  caveat: string;
}

export const STATIC_GUIDANCE: StaticGuidance = {
  intro:
    'This guidance is the same for every situation. Read it as a set of options, not instructions. You may decide that none of them fits.',
  checklist: [
    "Is anyone at risk of immediate harm? If so, use the platform's safety reporting, or contact local emergency services.",
    'Has the targeted person said what they want? Their wishes come first.',
    'Would replying in public draw more attention to the abuse, or to the person targeted?',
    'Are you safe to act? Your own safety and wellbeing matter too.',
  ],
  items: [
    {
      action: 'support_target',
      title: 'Check in with the targeted person privately',
      guidance:
        'A short private message can show that someone noticed and cares. Keep it about them, ask what (if anything) would help, and accept it if they do not reply or do not want help.',
      considerFirst:
        'Do not send them screenshots of the abuse unless they ask. If you do not know them, a private message from a stranger may feel intrusive.',
    },
    {
      action: 'report',
      title: 'Use the reporting tools that already exist',
      guidance:
        'Most platforms let you report harassment, threats and the sharing of personal information. Reporting does not alert the account you report. Community moderators, or a named contact at work or university, may also be able to act.',
      considerFirst: 'Reports can be slow or unsuccessful. If nothing happens, that is not a judgement on you.',
    },
    {
      action: 'hold_back_publicly',
      title: 'Consider not replying in public',
      guidance:
        'Public replies, quote-posts and arguments can push the abuse to more people, including the person targeted. Not replying in public can be a deliberate, protective choice, especially during a pile-on or when threats or personal details are involved.',
      considerFirst: 'Holding back in public does not mean doing nothing. You can still report or offer private support.',
    },
    {
      action: 'respectful_intervention',
      title: 'If it feels safe, say something calm in public',
      guidance:
        'A brief, calm reply that focuses on the behaviour rather than the person, and does not insult or threaten anyone, can signal that the comment is not acceptable. Do not speak for the targeted person or reveal anything about them.',
      considerFirst:
        'Avoid this if there is a pile-on or a threat, or if the targeted person has asked people not to engage.',
    },
  ],
  caveat:
    'This is general information written for a research demonstrator. It is not professional safeguarding advice, and it may not fit every situation.',
};
