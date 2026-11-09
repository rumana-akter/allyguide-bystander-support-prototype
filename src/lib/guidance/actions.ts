/** The four kinds of bystander action the demonstrator can suggest. */
export const ACTION_TYPES = ['support_target', 'report', 'hold_back_publicly', 'respectful_intervention'] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_LABELS: Record<ActionType, string> = {
  support_target: 'Support the targeted person',
  report: 'Report through existing mechanisms',
  hold_back_publicly: 'Avoid responding publicly',
  respectful_intervention: 'Respectful, non-escalatory intervention',
};
