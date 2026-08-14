# FUTUR FAQ Accordion Design

## Status

Approved and implemented. This document replaces the static three-row FAQ contract in the earlier landing continuity and capability gallery specifications.

## Content Contract

- The FAQ contains six factual questions covering inquiry preparation, cost and schedule, maintenance, system integration, AI adoption, and project delivery.
- The first answer is open on initial render.
- At most one answer is open. Opening another answer closes the current answer in the same interaction.
- The FAQ does not claim customers, outcomes, team size, or proprietary AI model development.

## Visual Contract

- Keep the editorial numbered list, full-width rows, and thin horizontal separators.
- Do not add rounded cards, shadows, gradients, or decorative illustrations.
- The whole question row is the trigger. A 28px circular plus sits at the right edge and rotates 45 degrees when open.
- Panel height uses a `0fr → 1fr` grid transition over `400ms` with `cubic-bezier(.4, 0, .2, 1)`.
- Answer opacity transitions over `300ms`; the plus rotates over `350ms` and changes surface color over `250ms`.
- Reduced-motion users receive the final state without perceptible transition time.

## Accessibility Contract

- Each trigger is a native button inside its question heading.
- `aria-expanded`, `aria-controls`, answer `<section>`, and `aria-labelledby` remain synchronized with the single open state.
- Enter and Space activate the focused question, and focus-visible receives an explicit outline.
- Closed answers are removed from the visible and accessibility reading flow while the corresponding question remains reachable.
