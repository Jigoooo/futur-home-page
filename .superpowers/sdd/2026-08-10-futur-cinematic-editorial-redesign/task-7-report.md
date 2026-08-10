# Task 7 report

## RED

- Added the approved-copy, one-contact-surface, group-count, stage-radius, and nested cursor-tone contracts to `e2e/landing-cinematic-editorial.chrome.spec.ts`.
- RED evidence: the initial focused run reported 16 passing and 2 expected failures: the approved copy and `[data-contact-surface]` did not exist.

## GREEN

- Implemented the exact inquiry label, title, and body inside a single charcoal rounded surface (42px desktop, 30px mobile).
- Kept field names, client validation, consent disclosures, pending/success/failure behavior, direct-email fallback, and server modules unchanged.
- Replaced generic contact animation with `createContactTimeline`: an ellipse clip reveal and 50ms group rhythm; interactive consent blocks are excluded from clip animation.
- Kept FAQ semantic disclosure behavior and factual footer information intact.
- Removed legacy custom-cursor text props from Hero and contact actions; cursor remains ring-and-dot only and contact uses nested semantic contrast attributes.

## Verification

- `pnpm build` — PASS.
- `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line --workers=1` — PASS, 18/18.
- `pnpm exec playwright test e2e/contact-delivery.chrome.spec.ts --project=chrome --reporter=line --workers=1` — one intermittent failure: forced click on the visually-hidden `collectionConsent` input did not change its state; 2/3 passed. The UI, names, handlers, and server delivery code were not changed by this task.
- `git diff --check` — PASS before commit.

## Security invariants

- No changes to delivery function boundaries, test-address guard, mail sender, rate limiting, input schema, or environment configuration.
- Both collection and overseas-transfer consent controls and their notices remain native checkboxes/list disclosures.

## Self-review and concerns

- No customer, metric, SLA, automatic NDA, schedule, or experience claim was added.
- Remaining concern: rerun the full contact delivery/mail-safety/server-boundary/a11y/runtime suite in a clean worker because the existing forced hidden-checkbox interaction was flaky during the final focused run.

## Review round 1

- Commit `021666f` is the Task 7 implementation commit. The follow-up restores the approved timeline values (`1개월 이내`, `1~3개월`, `3개월 이상`) without changing the selected payload shape.
- Root-cause note: the earlier contact-delivery failure was non-reproducible; a clean single-worker rerun passed 3/3, so it is not treated as a product regression.
- Added behavioral cursor coverage: two post-enable pointer moves establish ready state, then it checks Hero, Quality, dark contact, nested CTA and form tones, both ring/dot color and visibility, blur/pageshow recovery, and coarse/reduced disablement. It passed 1/1.
- Added the 390px contact-surface radius and flat-control assertion.
- Follow-up gates: contact delivery 3/3; mail safety 1/1; server boundaries 6 pass and 3 configured capacity skips; lint passed with 5 existing role-choice warnings; build and diff-check passed. The combined run detached while interactive a11y was executing, so its result is not claimed here.

## Review round 2

- Controller evidence: interactive a11y passed 4/4 in 9.5 seconds.
- Root cause for the initial runtime spec failure was a stale visible-copy locator (`서비스`) after the approved navigation label became `제공 영역`; no runtime error was emitted.
- Updated only that navigation locator while preserving runtime-error collection and assertions. Single-worker runtime verification passed 1/1 in 7.9 seconds.
