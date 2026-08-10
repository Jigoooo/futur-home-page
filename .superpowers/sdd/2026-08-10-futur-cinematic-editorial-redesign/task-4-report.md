# Task 4 report — rounded quality material stage

## RED

- Added stage, orb, semantic-copy, no-article, minimum-radius, and reduced-motion final-state checks.
- `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line` failed as expected: the ledger rendered zero `[data-quality-stage]` elements and no `[data-quality-copy]` target.

## GREEN

- Replaced the two-row ledger with one semantic copy block and one decorative `aria-hidden` Harbor Slate stage containing charcoal and Harbor Blue orbs.
- Added a quality-only GSAP circular clip reveal and bounded orb parallax (`-24px` and `32px`); all other scene helpers remain unchanged.
- Removed the no-longer-used quality ledger config barrel export.

## Verification

- `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts --reporter=line --workers=1` — 14 passed.
- `pnpm eslint src/pages/landing/ui/quality-standard-section.tsx src/pages/landing/ui/use-landing-scene-motion.ts` — passed.
- `pnpm build` — passed.
- `git diff --check` — passed.

## Self-review and concerns

- H2 is capped at 55px with `-0.04em` Korean tracking; the stage uses 46px desktop and 30px mobile radii.
- No stage content starts hidden in CSS, so SSR and reduced-motion retain the final readable/decorative state.
- No known task-specific concerns.
