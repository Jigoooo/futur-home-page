# Services Capability Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the five independent service cards with one connected Build → Connect → Operate capability map while preserving all service content and the flat footer service list.

**Architecture:** Define three phases in landing config and derive the existing flat `services` export from them. Render phases as an ordered list and service entries as static articles. Reuse the existing reveal system and implement the connector and hover treatment in the section CSS without adding a dependency.

**Tech Stack:** React 19, TypeScript, CSS Modules, Playwright, existing GSAP/reveal utilities

## Global Constraints

- Implement direction A only; do not mix in Bento or interactive-index patterns.
- Keep all five services and preserve their footer order.
- Describe AI integration as use of existing models and APIs, not model training or model development.
- Do not add a dependency.
- Static service content must not become a fake button or keyboard stop.
- Respect coarse pointers and `prefers-reduced-motion: reduce`.

---

### Task 1: Capability-map behavior contract

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- Consumes: the rendered `#services` section
- Produces: regression coverage for phase order, service distribution, static semantics, and removal of card spotlight behavior

- [ ] **Step 1: Write the failing structure test**

Add assertions for three `[data-service-phase]` list items with phase names `BUILD`, `CONNECT`, `OPERATE`, article counts `2`, `2`, `1`, and zero `[data-landing-spotlight='card']` descendants.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "factual classic order"`

Expected: FAIL because the current section has no capability phases and still renders spotlight cards.

### Task 2: Phase data and semantic component structure

**Files:**

- Modify: `src/pages/landing/model/types.ts`
- Modify: `src/pages/landing/config/services.ts`
- Modify: `src/pages/landing/config/index.ts`
- Modify: `src/pages/landing/ui/services-section.tsx`

**Interfaces:**

- Produces: `ServicePhase`, `servicePhases`, and the existing flat `services` export
- Preserves: `services.map(...)` consumers such as `footer-section.tsx`

- [ ] **Step 1: Add the minimal phase model and configuration**

Define `ServicePhase` with `key`, `index`, `label`, `title`, and `services`. Export the three approved phases and derive `services` using `servicePhases.flatMap((phase) => phase.services)`.

- [ ] **Step 2: Render the ordered capability map**

Replace the two-column independent card list with an `<ol>` of three phase `<li>` elements. Render the five services as nested static `<article>` elements and keep existing icon mappings.

- [ ] **Step 3: Run the focused test and verify GREEN**

Run the focused command from Task 1 and confirm the new contract passes.

### Task 3: Connected visual system and interaction restraint

**Files:**

- Modify: `src/pages/landing/ui/styles/services.module.css`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- Consumes: phase data attributes and existing reveal visibility attributes
- Produces: one connected surface, a draw-on rail, subtle phase hover, responsive single-column service items

- [ ] **Step 1: Add a failing hover behavior test**

Record the computed phase background, hover the first phase, and assert that its background changes while the phase remains a static list item.

- [ ] **Step 2: Run the focused hover test and verify RED**

Expected: FAIL because the phase UI and hover state do not yet exist.

- [ ] **Step 3: Implement CSS Modules styling**

Use one bordered capability surface, three separated phase rows, a shared vertical rail, restrained blue hover emphasis, and mobile stacking. Disable decorative motion for coarse pointers and reduced motion.

- [ ] **Step 4: Run the focused test and verify GREEN**

Confirm the phase hover and structure tests pass.

### Task 4: Full verification and graph refresh

**Files:**

- Update generated graph files under `graphify-out/`

**Interfaces:**

- Verifies: functional, visual, responsive, accessibility, type, and repository graph consistency

- [ ] **Step 1: Run relevant Playwright coverage**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-editorial-motion.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts`

- [ ] **Step 2: Run static verification**

Run: `pnpm lint`, `pnpm build`, and `git diff --check`.

- [ ] **Step 3: Inspect the real page**

Inspect port `3000` at desktop and 390px mobile widths. Check default, hover, reduced-motion, and horizontal overflow states.

- [ ] **Step 4: Refresh the code graph**

Run: `graphify update .` and confirm it completes without a graph health blocker.
