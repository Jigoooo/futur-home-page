# Technology Continuous Marquee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the breakpoint-limited scroll-driven technology motion with a readable continuous marquee that works at desktop, tablet, and mobile widths.

**Architecture:** Keep the existing duplicated technology text tracks and native disclosure. Move continuous motion, alternating direction, hover/focus pause, and reduced-motion fallback into the Technology CSS; remove the GSAP/ScrollTrigger hook because page scroll no longer owns marquee progress.

**Tech Stack:** React 19, CSS Modules, Playwright, TypeScript

## Global Constraints

- Keep four technology rows, 16 groups, and 70 technologies.
- Do not add dependencies, controls, cards, images, or horizontal touch gestures.
- Marquee motion must work at `1280px`, `900px`, and `390px` when reduced motion is not requested.
- `prefers-reduced-motion: reduce` must expose a static readable track.

---

### Task 1: Protect continuous marquee behavior

**Files:**

- Modify: `e2e/landing-capability-gallery.chrome.spec.ts`
- Modify: `src/pages/landing/ui/technology-section.tsx`
- Modify: `src/pages/landing/ui/styles/technology.module.css`
- Delete: `src/pages/landing/ui/use-technology-index-motion.ts`
- Modify: `DESIGN.md`

**Interfaces:**

- Consumes: `[data-technology-marquee]` and its original plus `aria-hidden` duplicate tracks.
- Produces: `data-technology-marquee-running='true'` on each animated marquee and a CSS animation that is independent from page scroll.

- [x] **Step 1: Write the failing test**

  Add a Playwright test that checks the marquee transform changes without scrolling at `1280px` and `900px`, that hover pauses the animation, and that reduced motion reports no animation and no transform.

- [x] **Step 2: Run the focused test to verify RED**

  Run `PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm exec playwright test e2e/landing-capability-gallery.chrome.spec.ts --project=chrome` and confirm the tablet animation assertion fails because the current hook is limited to `min-width: 1181px`.

- [x] **Step 3: Implement the minimal continuous marquee**

  Remove `useTechnologyIndexMotion`, apply alternating CSS keyframes to the duplicated track, pause on `:hover` and `:focus-within`, and disable animation/transform under reduced motion.

- [x] **Step 4: Verify GREEN and regressions**

  Run the focused Playwright spec, the accessibility project, `pnpm lint`, and `pnpm build`.

- [x] **Step 5: Verify visually and refresh the graph**

  Inspect desktop, tablet, and mobile Technology states in the Codex in-app browser, update `design-qa.md`, then run `graphify update .`.
