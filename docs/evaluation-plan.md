# Evaluation plan

This document has two parts. Part A describes what this demonstrator evaluates now, with software only. Part B sketches how AI-assisted bystander guidance could be evaluated with people in the proposed PhD. **No part of Part B has been carried out.** No ethics approval, participant access or partner agreement exists.

## Part A: what the demonstrator evaluates now

| Question | Method | Where | What it cannot show |
|---|---|---|---|
| Do the safety rules catch the failures they target? | 16 labelled synthetic fixtures; the rules are run and compared with the developer's label | `src/lib/evaluation/fixtures.ts`, dashboard, `harness.test.ts` | Labels are the developer's, not experts'. Fixtures are few and in English |
| Where do the rules fail? | Four fixtures are kept because the rules get them wrong: two misses (sarcasm, implied blame) and two over-flags (quoted insult, negated phrase) | Same | The real error rate is unknown |
| Is the demo output well formed, deterministic and free of flagged content? | Generate twice per scenario; schema validation; safety checks | Dashboard audit table, `demoGenerator.test.ts` | Passing the checks does not make the content appropriate |
| How do the two modes differ in structure? | Five automated structural criteria (R1 to R5) applied to static and demo output | Dashboard rubric table | Structure is not quality. The developer wrote both the demo and the criteria, so this comparison is not independent |
| Does the software behave correctly? | 106 unit tests and 35 end-to-end tests, including accessibility (axe) and a phone viewport | `tests/` | Automated accessibility checks find only part of the barriers |

## Part B: a possible evaluation with people (proposed PhD, Phase D)

### Question

Compared with carefully designed static guidance, does AI-assisted guidance change (1) the appropriateness of the action people choose, (2) their sense of agency and confidence, and (3) the rate of safety-related failures in the guidance itself?

### Design (provisional)

- Between-subjects online experiment with two conditions: static guidance and AI-assisted guidance. Both present the same four kinds of action, so the comparison isolates tailoring rather than content coverage.
- Fictional scenarios co-written in earlier co-design workshops and reviewed by specialists, replacing the developer-written scenarios here.
- Participants choose an action, or none, for each scenario. Nothing is posted anywhere.

### Outcomes

| Outcome | Measure (to be finalised) |
|---|---|
| Appropriateness of the chosen action | Rated against a co-designed rubric by specialists who do not know the condition; inter-rater agreement reported |
| Sense of agency and confidence | A validated scale chosen during the literature review, plus single-item confidence ratings |
| Perceived usefulness | Short questionnaire and open comments |
| Safety-related failures | Adversarial audit of AI outputs against the rubric and the automated rules; failure rates by category and by scenario type, including scenarios involving intersecting identities |
| Explanations | Follow-up interviews with a subset of participants, analysed thematically |

### Sample size

A provisional 150 to 200 participants, to be fixed by a power analysis using effect sizes from a pilot and from related studies. The analysis plan would be pre-registered.

### Analysis

Mixed-effects models with scenario as a random effect for the rating outcomes; descriptive failure rates with confidence intervals for safety failures; reflexive thematic analysis for interviews. Null results would be reported as findings.

### What this evaluation could and could not show

It could show whether AI tailoring changes what people choose in simulated situations, and what goes wrong. It could not show that harm is reduced on real platforms, because intentions and choices in a simulation are not behaviour, and because the people targeted would not be part of the interaction.

### Ethics (summary)

Favourable opinion from the Open University Human Research Ethics Committee before any recruitment; informed consent with content notes; the right to skip scenarios and to withdraw until a stated anonymisation date; signposting to support services and a distress protocol; no collection of real harassment content; pseudonymised data stored under UK GDPR; no participant data sent to external model providers; planning for researcher wellbeing.
