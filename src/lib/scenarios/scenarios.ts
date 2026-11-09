import type { Scenario, ScenarioSignals } from '../types';

/**
 * Ten fictional scenarios. Names, handles, platforms and events are invented.
 * Abusive wording is deliberately mild, and anything more serious is paraphrased in square brackets.
 */

const NONE: ScenarioSignals = {
  publicAudience: false,
  repeatedBehaviour: false,
  multipleHarassers: false,
  threatOrSafetyRisk: false,
  personalInformationAtRisk: false,
  targetAskedForSupport: false,
  bystanderKnowsTarget: false,
  powerImbalance: false,
  ambiguousIntent: false,
};

export const GLOBAL_CONTENT_NOTE =
  'These scenarios contain fictional examples of sexist and gendered harassment, including dismissive comments, exclusion, a sexist joke at work, comments targeting religion, and a veiled threat (scenario 6). There is no graphic or sexual content. Abusive wording is mild or paraphrased.';

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 's01-talk-comment',
    title: 'A comment under a technical talk',
    categoryLabel: 'Gendered dismissal',
    platformLabel: 'Video-sharing site, public comments',
    visibility: 'public',
    summary:
      'Priya, a data engineer, has uploaded a recorded conference talk about testing machine learning pipelines. One of the first comments dismisses her because she is a woman.',
    contentNote: 'A dismissive, sexist comment. No slurs or threats.',
    targetName: 'Priya',
    placePhrase: 'under your talk',
    thread: [
      { speaker: 'Priya', role: 'targeted-person', text: 'My talk on testing machine learning pipelines is now online. Feedback welcome!' },
      {
        speaker: 'gearhead_77',
        role: 'harassing-account',
        text: "Couldn't take any of this seriously. Women shouldn't be giving technical talks. Stick to something easier.",
      },
    ],
    signals: { ...NONE, publicAudience: true },
    reportingRoute: 'platform',
    intersectionalFactors: [],
  },
  {
    id: 's02-match-chat',
    title: 'Team chat in an online match',
    categoryLabel: 'Gendered stereotyping in a game',
    platformLabel: 'Online game, match text chat',
    visibility: 'semi-private',
    summary:
      'You are in a five-player match with strangers. Jess says she will play a support role. Another player mocks her for being a woman, and a third player joins in.',
    contentNote: 'Sexist mockery in a game chat, with another player joining in. No slurs or threats.',
    targetName: 'Jess',
    placePhrase: 'in the match chat',
    thread: [
      { speaker: 'Jess', role: 'targeted-person', text: "I'll take the support role this round." },
      { speaker: 'RazorFang', role: 'harassing-account', text: 'Of course the girl picks support. Just stay out of the way.' },
      { speaker: 'K1ller_Koala', role: 'harassing-account', text: 'lol' },
      { speaker: 'RazorFang', role: 'harassing-account', text: 'And mute your mic, nobody wants to hear you.' },
    ],
    signals: { ...NONE, publicAudience: true, multipleHarassers: true },
    reportingRoute: 'platform',
    intersectionalFactors: [],
  },
  {
    id: 's03-group-project',
    title: 'Left out of a group project',
    categoryLabel: 'Exclusion',
    platformLabel: 'University group-project chat',
    visibility: 'private',
    summary:
      'You are one of five students in a project group. For the third week running, two members have arranged the technical meetings without Mei and given her only the presentation slides, although she wrote much of the code.',
    contentNote: 'Gendered exclusion in a small group. No abusive language.',
    targetName: 'Mei',
    placePhrase: 'in the project chat',
    thread: [
      { speaker: 'Tom', role: 'harassing-account', text: "Let's meet Thursday to sort out the code. Just me, Dan and Ali, it'll be quicker." },
      { speaker: 'Dan', role: 'harassing-account', text: 'Yeah, Mei can do the slides. That is more her thing.' },
      { speaker: 'Mei', role: 'targeted-person', text: 'I wrote most of the data cleaning code last week, so I could help with that.' },
      { speaker: 'Tom', role: 'harassing-account', text: "Sure, but we'll handle the technical bits." },
    ],
    signals: { ...NONE, repeatedBehaviour: true, multipleHarassers: true, bystanderKnowsTarget: true },
    reportingRoute: 'institution',
    intersectionalFactors: [],
  },
  {
    id: 's04-forum-moderator',
    title: 'Replies that follow a moderator around',
    categoryLabel: 'Repeated targeting',
    platformLabel: 'Hobby community forum',
    visibility: 'public',
    summary:
      'Sana is a volunteer moderator on a cycling forum. Over the past week the same account has replied to almost every post she makes with short put-downs. This is the ninth such reply.',
    contentNote: 'Repeated, dismissive replies aimed at one woman. No slurs or threats.',
    targetName: 'Sana',
    placePhrase: 'on the forum',
    thread: [
      { speaker: 'Sana', role: 'targeted-person', text: 'Reminder: please keep route threads on topic so they stay easy to search.' },
      { speaker: 'northern_ledger', role: 'harassing-account', text: 'Nobody asked you. Typical.' },
      { speaker: 'northern_ledger', role: 'harassing-account', text: 'Who made her the boss anyway?' },
    ],
    signals: { ...NONE, publicAudience: true, repeatedBehaviour: true },
    reportingRoute: 'community-moderators',
    intersectionalFactors: [],
  },
  {
    id: 's05-pay-gap-post',
    title: 'A reply to a pay-gap post',
    categoryLabel: 'Discriminatory dismissal',
    platformLabel: 'Professional networking site',
    visibility: 'public',
    summary:
      'Grace, an engineering manager, shared anonymised pay data from her team showing a gender pay gap. A stranger replies that women should negotiate instead of complaining.',
    contentNote: 'A dismissive reply about the gender pay gap. No abusive language.',
    targetName: 'Grace',
    placePhrase: 'on your post',
    thread: [
      {
        speaker: 'Grace',
        role: 'targeted-person',
        text: "Sharing our team's anonymised pay data. The gender gap is still 14%, and here is what we are changing.",
      },
      { speaker: 'M. Hollis', role: 'harassing-account', text: 'Maybe women should learn to negotiate instead of complaining online.' },
      { speaker: 'J. Okafor', role: 'other-participant', text: 'Useful data, thanks for sharing.' },
    ],
    signals: { ...NONE, publicAudience: true },
    reportingRoute: 'platform',
    intersectionalFactors: [],
  },
  {
    id: 's06-pile-on-threat',
    title: 'A pile-on with a veiled threat',
    categoryLabel: 'Pile-on with a veiled threat',
    platformLabel: 'Public social media',
    visibility: 'public',
    summary:
      'Laila, a local journalist, posted about safer streets for women who cycle. The post has drawn dozens of hostile replies. One reply hints at where she works and another reads as a threat.',
    contentNote:
      'A coordinated pile-on, a hint about where the targeted person works, and a veiled threat. No graphic content.',
    targetName: 'Laila',
    placePhrase: 'under your column',
    thread: [
      { speaker: 'Laila', role: 'targeted-person', text: 'My column this week: what would make our streets safer for women who cycle?' },
      { speaker: 'Many accounts', role: 'harassing-account', text: '[About sixty mocking and hostile replies, not reproduced here]' },
      { speaker: 'vantage_point', role: 'harassing-account', text: '[A reply naming the building where she works, details removed]' },
      { speaker: 'quietstorm', role: 'harassing-account', text: 'Someone should teach her a lesson.' },
    ],
    signals: {
      ...NONE,
      publicAudience: true,
      repeatedBehaviour: true,
      multipleHarassers: true,
      threatOrSafetyRisk: true,
      personalInformationAtRisk: true,
    },
    reportingRoute: 'platform',
    intersectionalFactors: [],
  },
  {
    id: 's07-work-channel-joke',
    title: "A 'joke' in a work channel",
    categoryLabel: 'Sexist joke at work',
    platformLabel: 'Workplace team messaging',
    visibility: 'semi-private',
    summary:
      'In your team channel, a senior colleague congratulates Hannah on her promotion and adds a joke implying she did not earn it. Two people react with laughing emoji. Hannah has not replied.',
    contentNote: 'A sexist insinuation about a promotion, made by a senior colleague. No explicit language.',
    targetName: 'Hannah',
    placePhrase: 'in the team channel',
    thread: [
      { speaker: 'Rob (team lead)', role: 'harassing-account', text: 'Congrats to Hannah on the promotion! We all know how that happened, ha.' },
      { speaker: 'Two colleagues', role: 'other-participant', text: '[Reacted with laughing emoji]' },
    ],
    signals: { ...NONE, bystanderKnowsTarget: true, powerImbalance: true },
    reportingRoute: 'workplace',
    intersectionalFactors: [],
  },
  {
    id: 's08-stream-chat',
    title: 'Chat on a coding live stream',
    categoryLabel: 'Harassment targeting gender and religion',
    platformLabel: 'Live-streaming site, public chat',
    visibility: 'public',
    summary:
      'Amina streams live coding sessions while wearing a headscarf. Several viewers post comments that mock her headscarf and tell her to go back to cooking content. The stream has volunteer chat moderators.',
    contentNote:
      'Comments targeting a woman for her gender and her religion. The comment about her headscarf is paraphrased, not quoted.',
    targetName: 'Amina',
    placePhrase: 'in your stream chat',
    thread: [
      { speaker: 'Amina', role: 'targeted-person', text: "Today we're building a small recipe app in TypeScript." },
      { speaker: 'byte_baron', role: 'harassing-account', text: 'Why is she even coding? Stick to the cooking bit.' },
      { speaker: 'n0name42', role: 'harassing-account', text: '[A comment mocking her headscarf, paraphrased rather than quoted]' },
      { speaker: 'byte_baron', role: 'harassing-account', text: 'Mods asleep lol' },
    ],
    signals: { ...NONE, publicAudience: true, multipleHarassers: true },
    reportingRoute: 'community-moderators',
    intersectionalFactors: ['gender', 'religion'],
  },
  {
    id: 's09-friend-asks',
    title: 'A friend asks for help',
    categoryLabel: 'Targeted person asks for support',
    platformLabel: 'Private message about a public post',
    visibility: 'private',
    summary:
      'Your friend Chloe messages you privately. Strangers keep replying to her public post about a film, calling her hysterical and attention-seeking.',
    contentNote: 'A friend describing gendered insults she has received. No graphic content.',
    targetName: 'Chloe',
    placePhrase: 'on your film post',
    thread: [
      {
        speaker: 'Chloe',
        role: 'targeted-person',
        text: "People keep replying to my film post calling me hysterical and attention-seeking. I don't want to make it worse, but I feel awful.",
      },
    ],
    signals: {
      ...NONE,
      publicAudience: true,
      repeatedBehaviour: true,
      multipleHarassers: true,
      targetAskedForSupport: true,
      bystanderKnowsTarget: true,
    },
    reportingRoute: 'platform',
    intersectionalFactors: [],
  },
  {
    id: 's10-banter-or-not',
    title: 'Banter, or something else?',
    categoryLabel: 'Ambiguous banter',
    platformLabel: "Friends' group chat",
    visibility: 'private',
    summary:
      "In a group chat of friends, Zara shares a clip of a game she won. Ben replies with a comment about her being a girl, and Zara replies 'haha'. You are not sure whether this is friendly teasing or a pattern that bothers her.",
    contentNote: 'A mild gendered comment between friends. Its meaning is unclear.',
    targetName: 'Zara',
    placePhrase: 'in the group chat',
    thread: [
      { speaker: 'Zara', role: 'targeted-person', text: 'Finally won a ranked match!' },
      { speaker: 'Ben', role: 'other-participant', text: 'Not bad for a girl.' },
      { speaker: 'Zara', role: 'targeted-person', text: 'haha' },
    ],
    signals: { ...NONE, bystanderKnowsTarget: true, ambiguousIntent: true },
    reportingRoute: 'none-obvious',
    intersectionalFactors: [],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
