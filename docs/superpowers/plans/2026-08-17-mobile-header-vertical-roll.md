# Mobile Header Vertical Roll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `560px` 이하 Header의 현재 섹션명을 React Bits Rotating Text에서 착안한 짧은 세로 롤링으로 교체한다.

**Architecture:** `useAdaptiveHeader()`의 `activeHref`와 기존 section anchor를 상태 권위로 유지한다. 신규 `useMobileHeaderSectionRoll()`이 좁은 viewport에서 기존 anchor 내부 span의 enter/exit GSAP timeline과 inert 상태만 관리하며, CSS가 중앙 mask와 정적 fallback을 소유한다.

**Tech Stack:** React 19, TypeScript, CSS Modules, GSAP 3.15, `@gsap/react`, Playwright, axe-core

## Global Constraints

- 세로 롤링은 `560px` 이하의 서비스·기술·FAQ 현재 섹션명에만 적용한다.
- `561px` 이상에서는 기존 전체 메뉴와 shared active indicator를 그대로 유지한다.
- Hero와 Footer에서는 중앙 라벨을 비우고 `홈`·`문의` 같은 대체 라벨을 추가하지 않는다.
- `useAdaptiveHeader()`의 `activeHref`와 기존 `navigationItems`를 현재 섹션의 단일 권위로 유지한다.
- 신규 외부 의존성, Motion, React Bits 패키지와 SplitText plugin을 설치하지 않는다.
- 이전 라벨은 `y: 0 → -9px`, `opacity: 1 → 0`, `180ms`, `power2.in`을 사용한다.
- 새 라벨은 `70ms` 뒤 `y: 10px → 0`, `opacity: 0 → 1`, `240ms`, `back.out(1.25)`를 사용한다.
- scale, blur, 문자 분해, scramble, glow를 사용하지 않는다.
- 빠른 연속 전환은 진행 중 timeline을 중단하고 현재 시각 상태에서 최종 anchor로 수렴한다.
- reduced motion은 즉시 교체하고 no-JS는 서비스·기술·FAQ·문의 전체 navigation을 표시한다.
- Header surface probe, glass tone, hash navigation, 문의 CTA와 다른 landing section은 변경하지 않는다.

---

## File Structure

- Create: `src/pages/landing/ui/use-mobile-header-section-roll.ts`
  - `560px` media query, reduced-motion, anchor inert 상태와 GSAP timeline의 단일 소유자다.
- Modify: `src/pages/landing/ui/header-section.tsx`
  - 기존 refs와 `activeHref`를 신규 훅에 연결한다.
- Modify: `src/pages/landing/ui/styles/header.module.css`
  - 기존 `display: none` active-only 규칙을 강화 상태의 중앙 masked anchor 규칙으로 교체한다.
- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
  - 실제 세로 롤링, 반응형 경계, 빠른 전환과 fallback을 검증한다.
- Modify: `e2e/landing-runtime-errors.chrome.spec.ts`
  - 모션 강화 후 runtime/hydration warning 회귀를 유지한다.
- Modify: `docs/futur_react_docs_package/DESIGN.md`
  - 최종 breakpoint와 세로 롤링 모션 계약을 기록한다.
- Modify: `docs/superpowers/specs/2026-08-17-mobile-header-active-section-design.md`
  - 즉시 교체 계약이 세로 롤링 설계로 대체됐음을 명시한다.
- Modify: `docs/superpowers/specs/2026-08-17-mobile-header-persistent-navigation-design.md`
  - `560px` 이하 보완 관계를 유지한다.
- Update: `graphify-out/*` via `graphify update .`
  - 신규 훅과 Header 관계를 project graph에 반영한다.

---

### Task 1: 모바일 세로 롤링 훅과 중앙 mask 구현

**Files:**

- Create: `src/pages/landing/ui/use-mobile-header-section-roll.ts`
- Modify: `src/pages/landing/ui/header-section.tsx`
- Modify: `src/pages/landing/ui/styles/header.module.css`
- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Consumes: `activeHref: string | null`, `headerRef: RefObject<HTMLElement | null>`, `menuRef: RefObject<HTMLElement | null>`
- Produces: `useMobileHeaderSectionRoll(options: MobileHeaderSectionRollOptions): void`
- Produces DOM: `data-header-mobile-roll="enhanced"`, `data-header-mobile-roll-state="idle|running|reduced"`
- Produces transient test/debug DOM: `data-header-roll-role="outgoing|incoming"` on section anchors during a timeline only

- [ ] **Step 1: 세로 롤링 focused E2E를 작성한다**

`landing-adaptive-island.chrome.spec.ts`에 강화 상태 helper를 추가한다.

```ts
async function waitForMobileRoll(page: Page, state: 'idle' | 'running' | 'reduced' = 'idle') {
  await expect(header(page)).toHaveAttribute('data-header-mobile-roll', 'enhanced');
  await expect(header(page)).toHaveAttribute('data-header-mobile-roll-state', state);
}
```

서비스에서 기술로 이동할 때 이전/새 anchor가 실제로 다른 방향에서 교차하고 최종 상태를 정리하는 테스트를 추가한다.

```ts
test('rolls the narrow mobile section label upward through a clipped center lane', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');
  await waitForMobileRoll(page);

  await page.locator('#services').evaluate((element) => element.scrollIntoView());
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['서비스']);
  await waitForMobileRoll(page);

  await page.locator('#technology').evaluate((element) => element.scrollIntoView());
  await expect(header(page)).toHaveAttribute('data-header-mobile-roll-state', 'running');
  await expect(
    navigation(page).locator('[data-header-section-link][data-header-roll-role="outgoing"]'),
  ).toHaveAttribute('href', '#services');
  await expect(
    navigation(page).locator('[data-header-section-link][data-header-roll-role="incoming"]'),
  ).toHaveAttribute('href', '#technology');

  const motionFrame = await page.evaluate(() => {
    const outgoing = document.querySelector<HTMLElement>('[data-header-roll-role="outgoing"] span');
    const incoming = document.querySelector<HTMLElement>('[data-header-roll-role="incoming"] span');
    return {
      outgoingY: outgoing ? new DOMMatrixReadOnly(getComputedStyle(outgoing).transform).m42 : null,
      incomingY: incoming ? new DOMMatrixReadOnly(getComputedStyle(incoming).transform).m42 : null,
    };
  });
  expect(motionFrame.outgoingY).not.toBeNull();
  expect(motionFrame.incomingY).not.toBeNull();

  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['기술']);
  await expect(navigation(page).locator('[data-header-roll-role]')).toHaveCount(0);
  await expect(navigation(page).getByRole('link', { name: '기술', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
});
```

- [ ] **Step 2: 새 테스트가 기존 구현에서 실패하는지 확인한다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --grep "rolls the narrow mobile section label" --workers=1
```

Expected: FAIL. Header에 `data-header-mobile-roll`과 running 역할 anchor가 없다.

- [ ] **Step 3: 신규 훅의 media mode와 정리 helper를 구현한다**

`use-mobile-header-section-roll.ts`에 다음 공개 interface와 상태를 만든다.

```ts
import gsap from 'gsap';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

type MobileRollMode = 'off' | 'animated' | 'reduced';

type MobileHeaderSectionRollOptions = {
  activeHref: string | null;
  headerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
};

const SECTION_SELECTOR = '[data-header-section-link]';
const NARROW_QUERY = '(max-width: 560px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function getMode(narrow: MediaQueryList, reduced: MediaQueryList): MobileRollMode {
  if (!narrow.matches) return 'off';
  return reduced.matches ? 'reduced' : 'animated';
}

export function useMobileHeaderSectionRoll({
  activeHref,
  headerRef,
  menuRef,
}: MobileHeaderSectionRollOptions): void {
  const [mode, setMode] = useState<MobileRollMode>('off');
  const previousHrefRef = useRef<string | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const narrow = window.matchMedia(NARROW_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const sync = () => setMode(getMode(narrow, reduced));
    narrow.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    sync();
    return () => {
      narrow.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  // Step 4에서 mode와 activeHref를 기존 anchor DOM에 반영한다.
}
```

같은 파일에 `setAnchorAvailability()`, `clearAnchorMotion()`, `settleAnchors()` private helper를 만든다. `off`에서는 모든 `inert`, `aria-hidden`, transient data와 GSAP inline style을 제거하고 Header data 속성도 삭제한다. `reduced`에서는 현재 anchor만 활성화하고 `data-header-mobile-roll-state="reduced"`를 기록한다.

- [ ] **Step 4: 기존 anchor span을 사용한 enter/exit timeline을 구현한다**

두 번째 `useLayoutEffect`에서 다음 순서를 구현한다.

```ts
useLayoutEffect(() => {
  const header = headerRef.current;
  const menu = menuRef.current;
  if (!header || !menu) return;

  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>(SECTION_SELECTOR));
  const previous = previousHrefRef.current
    ? (links.find((link) => link.getAttribute('href') === previousHrefRef.current) ?? null)
    : null;
  const incoming = activeHref
    ? (links.find((link) => link.getAttribute('href') === activeHref) ?? null)
    : null;

  timelineRef.current?.kill();

  if (mode === 'off') {
    restoreAllAnchors(header, links);
    previousHrefRef.current = activeHref;
    return;
  }

  header.dataset.headerMobileRoll = 'enhanced';
  setAnchorAvailability(links, incoming);

  if (mode === 'reduced' || previous === incoming) {
    settleAnchors(header, links, incoming, mode === 'reduced' ? 'reduced' : 'idle');
    previousHrefRef.current = activeHref;
    return;
  }

  header.dataset.headerMobileRollState = 'running';
  if (previous) previous.dataset.headerRollRole = 'outgoing';
  if (incoming) incoming.dataset.headerRollRole = 'incoming';

  const previousText = previous?.querySelector<HTMLElement>('span') ?? null;
  const incomingText = incoming?.querySelector<HTMLElement>('span') ?? null;
  if (previous) gsap.set(previous, { autoAlpha: 1 });
  if (incoming) gsap.set(incoming, { autoAlpha: 1 });
  if (incomingText && !incomingText.style.transform) {
    gsap.set(incomingText, { opacity: 0, y: 10 });
  }

  timelineRef.current = gsap.timeline({
    onComplete: () => settleAnchors(header, links, incoming, 'idle'),
  });
  if (previousText) {
    timelineRef.current.to(
      previousText,
      { duration: 0.18, ease: 'power2.in', opacity: 0, y: -9 },
      0,
    );
  }
  if (incomingText) {
    timelineRef.current.to(
      incomingText,
      { duration: 0.24, ease: 'back.out(1.25)', opacity: 1, y: 0 },
      0.07,
    );
  }

  previousHrefRef.current = activeHref;
  return () => timelineRef.current?.kill();
}, [activeHref, headerRef, menuRef, mode]);
```

실제 구현에서는 새 전환 전 `gsap.getProperty()`로 진행 중 span의 현재 `y`와 `opacity`를 읽는다. inline transform이 이미 있는 anchor를 다시 활성화할 때 `y: 10`으로 강제 초기화하지 않아 rapid re-entry가 현재 위치에서 이어지게 한다. 완료와 unmount에서 `clearProps: 'opacity,transform,visibility'`를 적용하고 transient data를 제거한다.

- [ ] **Step 5: HeaderSection에 훅을 연결한다**

```tsx
import { useMobileHeaderSectionRoll } from './use-mobile-header-section-roll';

const { activeHref, handleNavigation, hydrated, layout, glassTone } = useAdaptiveHeader({
  headerRef,
  menuRef,
});

useMobileHeaderSectionRoll({ activeHref, headerRef, menuRef });
```

기존 navigation map, anchor, `aria-current`, 문의 CTA와 shared indicator DOM은 바꾸지 않는다.

- [ ] **Step 6: 중앙 mask와 강화 상태 CSS를 구현한다**

기존 `max-width: 560px`의 inactive `display: none` 규칙을 다음 강화 상태 규칙으로 교체한다.

```css
.nav[data-header-mobile-roll='enhanced'] [data-header-section-link] {
  position: absolute;
  left: 50%;
  min-height: 44px;
  overflow: clip;
  padding-inline: 12px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%);
  visibility: hidden;
}

.nav[data-header-mobile-roll='enhanced'] [data-header-section-link][aria-current='location'] {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}

.nav[data-header-mobile-roll='enhanced'] [data-header-section-link] > span {
  display: inline-block;
  will-change: transform, opacity;
}

.nav[data-header-mobile-roll-state='idle'] [data-header-section-link] > span,
.nav[data-header-mobile-roll-state='reduced'] [data-header-section-link] > span {
  will-change: auto;
}
```

강화 전과 no-JS에서는 기존 links가 정상 flow에 남도록 `[data-header-mobile-roll='enhanced']` 밖에 active-only hide 규칙을 만들지 않는다.

- [ ] **Step 7: focused 테스트와 정적 검사를 통과시킨다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --grep "rolls the narrow mobile section label" --workers=1
pnpm lint
pnpm exec tsc -b --noEmit
git diff --check
```

Expected: focused `1 passed`, lint/typecheck/diff-check exit `0`.

- [ ] **Step 8: Task 1을 커밋한다**

```bash
git add e2e/landing-adaptive-island.chrome.spec.ts \
  src/pages/landing/ui/header-section.tsx \
  src/pages/landing/ui/styles/header.module.css \
  src/pages/landing/ui/use-mobile-header-section-roll.ts
git commit -m "feat(header): 모바일 섹션명을 세로로 전환"
```

---

### Task 2: 빠른 전환·접근성·반응형 fallback 보강

**Files:**

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
- Modify: `e2e/landing-runtime-errors.chrome.spec.ts`
- Modify: `src/pages/landing/ui/use-mobile-header-section-roll.ts`
- Modify: `src/pages/landing/ui/styles/header.module.css`

**Interfaces:**

- Consumes: Task 1의 `data-header-mobile-roll`, `data-header-mobile-roll-state`, transient roll roles
- Produces: rapid re-entry 후 최종 active/inert 정합성, `561px` 경계 정리, reduced/no-JS fallback

- [ ] **Step 1: rapid re-entry와 Hero/Footer 퇴장 테스트를 작성한다**

```ts
test('settles rapid mobile section changes on the final accessible anchor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#services');
  await waitForHeader(page, 'mobile-persistent');
  await waitForMobileRoll(page);

  for (const selector of ['#technology', '#faq', '#services']) {
    await page.locator(selector).evaluate((element) => element.scrollIntoView());
    await page.waitForTimeout(60);
  }

  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['서비스']);
  await expect(navigation(page).locator('[data-header-roll-role]')).toHaveCount(0);

  const anchorState = await navigation(page)
    .locator('[data-header-section-link]')
    .evaluateAll((links) =>
      links.map((link) => ({
        current: link.getAttribute('aria-current'),
        hidden: link.getAttribute('aria-hidden'),
        href: link.getAttribute('href'),
        inert: (link as HTMLElement).inert,
        style: link.getAttribute('style'),
        textStyle: link.querySelector('span')?.getAttribute('style') ?? null,
      })),
    );
  expect(anchorState.filter((item) => item.current === 'location')).toHaveLength(1);
  expect(anchorState.find((item) => item.href === '#services')).toMatchObject({
    hidden: null,
    inert: false,
  });

  await page.locator('#footer').evaluate((element) => element.scrollIntoView());
  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
});
```

- [ ] **Step 2: breakpoint와 reduced/no-JS 테스트를 강화한다**

기존 breakpoint round-trip 테스트에 다음 계약을 추가한다.

```ts
await page.setViewportSize({ width: 561, height: 844 });
await expect(header(page)).not.toHaveAttribute('data-header-mobile-roll', 'enhanced');
for (const link of await navigation(page).locator('[data-header-section-link]').all()) {
  await expect(link).not.toHaveAttribute('inert', '');
  await expect(link).not.toHaveAttribute('aria-hidden', 'true');
  await expect(link).toBeVisible();
}
```

기존 reduced-motion 테스트에서는 `data-header-mobile-roll-state="reduced"`, visible label 하나, 모든 span의 `transform: none`과 transition/animation duration `0s`를 확인한다. no-JS 테스트에서는 `data-header-mobile-roll`이 없고 네 링크가 모두 visible인지 유지한다.

- [ ] **Step 3: 강화 테스트의 RED를 확인한다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --grep "rapid mobile|breakpoint round trips|reduced motion|without JavaScript" --workers=1
```

Expected: 새 계약의 실제 결과를 기록한다. Task 1의 최소 구현에서 실패가 나오면 Step 4에서 해당 상태 정리를 보강한다. 전부 PASS라면 이를 characterization GREEN으로 기록하고 Step 4에서는 중복 코드를 추가하지 않고 cleanup·sequence guard가 이미 동등하게 보장되는지만 확인한다.

- [ ] **Step 4: timeline 중단과 viewport cleanup을 보강한다**

신규 훅에 다음 cleanup 원칙을 반영한다.

```ts
function stopTimelineAtCurrentFrame(timelineRef: RefObject<gsap.core.Timeline | null>) {
  timelineRef.current?.pause();
  timelineRef.current?.kill();
  timelineRef.current = null;
}

function restoreAllAnchors(header: HTMLElement, links: HTMLAnchorElement[]) {
  delete header.dataset.headerMobileRoll;
  delete header.dataset.headerMobileRollState;
  links.forEach((link) => {
    link.inert = false;
    link.removeAttribute('aria-hidden');
    link.removeAttribute('data-header-roll-role');
    gsap.set([link, link.querySelector('span')], {
      clearProps: 'opacity,transform,visibility',
    });
  });
}
```

`mode`가 `off`로 바뀌면 위 helper를 즉시 실행한다. `animated` 전환 중에는 기존 tween이 남긴 현재 값을 읽은 뒤 최종 incoming span을 `y: 0`, `opacity: 1`로 수렴시킨다. 완료 callback이 이미 폐기된 target에 동작하지 않도록 transition sequence id를 ref로 증가시키고 최신 id만 settle하도록 한다.

- [ ] **Step 5: runtime/hydration 회귀를 갱신한다**

`landing-runtime-errors.chrome.spec.ts`의 모바일 구간에서 서비스→기술→FAQ를 빠르게 이동한 뒤 `data-header-mobile-roll-state="idle"`을 기다리고, 기존 `errors` 배열이 비어 있는지 확인한다. hydration warning 두 테스트는 DOM mutation이 hydration 후에만 발생한다는 기존 계약을 그대로 검증한다.

- [ ] **Step 6: focused 회귀와 a11y를 통과시킨다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --workers=1
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts \
  e2e/a11y/landing.interactive.a11y.spec.ts --project=a11y --workers=1
pnpm lint
pnpm exec tsc -b --noEmit
git diff --check
```

Expected: Header/runtime spec 전부 PASS, axe `0 violations`, lint/typecheck/diff-check exit `0`. 병합 실행이 결과 출력 후 종료되지 않으면 각 spec을 별도 `--workers=1` 프로세스로 재실행하고 완료 수치를 보고서에 기록한다.

- [ ] **Step 7: Task 2를 커밋한다**

```bash
git add e2e/landing-adaptive-island.chrome.spec.ts \
  e2e/landing-runtime-errors.chrome.spec.ts \
  src/pages/landing/ui/styles/header.module.css \
  src/pages/landing/ui/use-mobile-header-section-roll.ts
git commit -m "fix(header): 모바일 롤링 전환 상태를 안정화"
```

---

### Task 3: 디자인 계약·전체 검증·내부 브라우저 확인

**Files:**

- Modify: `docs/futur_react_docs_package/DESIGN.md`
- Modify: `docs/superpowers/specs/2026-08-17-mobile-header-active-section-design.md`
- Modify: `docs/superpowers/specs/2026-08-17-mobile-header-persistent-navigation-design.md`
- Update: `graphify-out/*` via `graphify update .`

**Interfaces:**

- Consumes: Task 1·2의 최종 breakpoint, roll timing, accessibility fallback
- Produces: 구현과 일치하는 디자인 문서, 전체 검증 증거와 최신 project graph

- [ ] **Step 1: 루트 Header 디자인 계약을 최종 구현과 일치시킨다**

`DESIGN.md`의 `9.1 Header`를 다음 내용으로 정리한다.

```markdown
- `561px ~ 900px`에서는 높이 `58px`의 Header에 로고·서비스·기술·FAQ·문의를 모두 표시한다.
- `560px` 이하에서는 너비 `calc(100% - 24px)`, 높이 `60px`의 `FUTUR. | 현재 섹션 | 문의` 구조를 사용한다.
- 현재 섹션은 중앙 masked lane에서 이전 `-9px`, 새 라벨 `+10px` 범위의 세로 롤링으로 교체한다.
- Hero와 Footer에서는 중앙 섹션명을 비우고, reduced motion에서는 즉시 교체한다.
- no-JS에서는 서비스·기술·FAQ·문의 전체 hash navigation을 노출한다.
```

기존의 `560px 이하 즉시 교체`, 모바일 전체 메뉴, 높이 `58px`, shared indicator 사용 문장을 제거해 breakpoint 계약이 한 번씩만 등장하게 한다.

- [ ] **Step 2: 이전 설계 문서에 대체 관계를 명시한다**

`mobile-header-active-section-design.md` 제목 아래에 다음 note를 추가한다.

```markdown
> Refined on 2026-08-17. 섹션명을 즉시 교체하던 모션 계약은 `2026-08-17-mobile-header-vertical-roll-design.md`의 세로 롤링으로 대체됐다. breakpoint, 중앙 정렬과 no-JS fallback은 계속 유효하다.
```

`mobile-header-persistent-navigation-design.md`의 이미 작성된 `560px` 보완 note를 유지한다.

- [ ] **Step 3: 정적 검사와 프로덕션 빌드를 실행한다**

Run:

```bash
pnpm lint
pnpm exec tsc -b --noEmit
pnpm build
git diff --check
```

Expected: 모두 exit `0`, Nitro `.output/server/index.mjs` 생성.

- [ ] **Step 4: 전체 Playwright 회귀를 실행한다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test --workers=4 --retries=0
```

Expected: failure `0`; 환경 조건으로 선언된 skip만 허용한다. runner 종료 대기가 재현되면 출력된 실패 spec을 분리하고, Header/runtime/a11y와 실패 파일을 각각 `--workers=1`로 다시 실행해 코드 결함과 runner hang을 구분한다.

- [ ] **Step 5: Codex 내부 브라우저에서 실제 전환을 확인한다**

`http://127.0.0.1:3001/#top`을 내부 브라우저에 열고 다음을 확인한다.

- `900px`, `768px`, `561px`: 전체 메뉴, `14px`, overflow `0`, mobile roll 속성 없음
- `560px`, `390px`, `320px`: Header 높이 `60px`, 너비 `viewport - 24px`, 중앙 오차 `<= 1px`
- 서비스→기술→FAQ: 이전 라벨이 위로 빠지고 새 라벨이 아래에서 등장
- Hero/Footer: 중앙 공백
- 모든 폭: 콘솔 error/warning `0`, horizontal overflow `0`

최종 전달 탭은 `390px`의 `#technology`에 두고 사용자에게 보이도록 유지한다.

- [ ] **Step 6: graphify를 갱신한다**

Run:

```bash
graphify update .
git diff --check
git status --short
```

Expected: graph update 성공. 변경 목록은 이번 Header 코드·테스트·문서와 graphify 산출물로 제한된다.

- [ ] **Step 7: 문서와 graph 변경을 커밋한다**

```bash
git add docs/futur_react_docs_package/DESIGN.md \
  docs/superpowers/specs/2026-08-17-mobile-header-active-section-design.md \
  docs/superpowers/specs/2026-08-17-mobile-header-persistent-navigation-design.md
git commit -m "docs(header): 모바일 세로 롤링 계약 반영"
```

---

## Completion Criteria

- `560px` 이하 서비스·기술·FAQ 라벨이 약 `310ms`의 단일 세로 롤링으로 교체된다.
- 빠른 스크롤 후 최종 active anchor 하나만 보이고 inert·aria·inline style이 정리된다.
- Hero/Footer 중앙은 비고, `561px` 이상 전체 메뉴와 데스크톱 모션은 변하지 않는다.
- reduced motion은 즉시 교체하고 no-JS는 전체 navigation을 유지한다.
- focused Header/runtime, axe, lint, typecheck, build, 전체 E2E와 내부 브라우저 검증을 통과한다.
- `graphify update .` 이후 구현과 문서·project graph가 일치한다.
