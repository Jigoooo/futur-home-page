# Mobile Header Active Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 태블릿에서는 여유 있는 전체 Header 메뉴를 유지하고 `560px` 이하에서는 `FUTUR. | 현재 섹션 | 문의`만 표시한다.

**Architecture:** 현재 `useAdaptiveHeader()`가 부여하는 `aria-current="location"`과 기존 section link DOM을 그대로 사용한다. 새 React state나 모바일 메뉴 컴포넌트를 만들지 않고 CSS media query가 좁은 화면에서 비활성 링크와 shared indicator만 숨기며, no-JS에서는 강화 selector가 적용되지 않아 전체 메뉴가 남는다.

**Tech Stack:** React 19, TypeScript, CSS Modules, GSAP shared active indicator, Playwright, axe-core

## Global Constraints

- `901px 이상`의 `desktop-fluid` geometry와 scroll motion은 변경하지 않는다.
- `561px ~ 900px`에서는 로고, 서비스, 기술, FAQ, 문의를 모두 표시한다.
- `560px 이하`에서는 로고, 현재 서비스·기술·FAQ 링크 하나, 문의만 표시한다.
- Hero와 Footer에서는 모바일 중앙 섹션명을 비운다.
- 모바일 Header는 toggle, close button, `aria-expanded`, `mobile-expanded` 상태를 사용하지 않는다.
- `560px 이하`에서는 shared active indicator와 섹션 전환 animation을 표시하지 않는다.
- no-JS에서는 서비스·기술·FAQ·문의 전체 탐색 경로를 유지한다.
- Hero, Services, Technology, FAQ, Footer 콘텐츠와 Header section/surface probe 계산은 변경하지 않는다.
- 새 라이브러리와 새로운 Header state를 추가하지 않는다.

---

## File Structure

- Modify: `src/pages/landing/ui/styles/header.module.css`
  - 태블릿 spacing과 모바일 active-only 배치의 단일 소유자다.
- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
  - 반응형 visibility, geometry, hash/scroll 갱신, no-JS fallback 계약을 검증한다.
- Modify: `docs/futur_react_docs_package/DESIGN.md`
  - 현재 Header breakpoint와 노출 규칙을 제품 디자인 계약으로 기록한다.
- Modify: `docs/superpowers/specs/2026-08-17-mobile-header-persistent-navigation-design.md`
  - 기존 “모바일 전체 메뉴 상시 노출” 계약이 `560px` 이하에서 보완됐음을 명시한다.
- Update: `graphify-out/*` via `graphify update .`
  - 변경된 CSS·테스트·문서 관계를 프로젝트 그래프에 반영한다.

---

### Task 1: 모바일 Header를 현재 섹션 중심으로 단순화

**Files:**

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
- Modify: `src/pages/landing/ui/styles/header.module.css`

**Interfaces:**

- Consumes: `data-header-hydrated`, `data-header-layout="mobile-persistent"`, `data-header-section-link`, `aria-current="location"`, `data-header-active-indicator`
- Produces: `560px 이하`에서 로고·활성 section link·문의만 보이는 CSS 계약

- [ ] **Step 1: 모바일 active-only 회귀 테스트를 작성한다**

`e2e/landing-adaptive-island.chrome.spec.ts`에 visible section link를 읽는 helper를 추가한다.

```ts
async function visibleSectionLabels(page: Page) {
  return navigation(page).locator('[data-header-section-link]:visible').allTextContents();
}
```

`560px`, `390px`, `320px`에서 Hero와 각 섹션 상태를 검증한다.

```ts
test('shows only the current section between the mobile logo and inquiry action', async ({
  page,
}) => {
  for (const viewport of [
    { width: 560, height: 844 },
    { width: 390, height: 844 },
    { width: 320, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await waitForHeader(page, 'mobile-persistent');

    const nav = header(page);
    await expect(nav.getByRole('link', { name: 'FUTUR home' })).toBeVisible();
    await expect(navigation(page).getByRole('link', { name: '문의', exact: true })).toBeVisible();
    await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
    await expect(nav.locator('[data-header-active-indicator]')).toBeHidden();

    for (const [selector, label] of [
      ['#services', '서비스'],
      ['#technology', '기술'],
      ['#faq', 'FAQ'],
    ] as const) {
      await page.locator(selector).evaluate((element) => element.scrollIntoView());
      await expect.poll(() => visibleSectionLabels(page)).toEqual([label]);
    }

    await page.locator('#footer').evaluate((element) => element.scrollIntoView());
    await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
    await expectNoHorizontalOverflow(page);
  }
});
```

Header 전체 기준 중앙 정렬과 새 geometry를 별도 assertion으로 추가한다.

```ts
const frame = await page.evaluate(() => {
  const root = document.querySelector<HTMLElement>('[data-landing-nav]')!;
  const active = root.querySelector<HTMLElement>('[data-header-section-link][aria-current]')!;
  const rootRect = root.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  return {
    activeCenter: activeRect.left + activeRect.width / 2,
    headerCenter: rootRect.left + rootRect.width / 2,
    headerHeight: rootRect.height,
    headerWidth: rootRect.width,
  };
});

expect(frame.activeCenter).toBeCloseTo(frame.headerCenter, 0);
expect(frame.headerHeight).toBeCloseTo(60, 0);
expect(frame.headerWidth).toBeCloseTo(viewport.width - 24, 0);
```

- [ ] **Step 2: 새 테스트가 기존 구현에서 실패하는지 확인한다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --grep "shows only the current section" --workers=1
```

Expected: FAIL. Hero에서 서비스·기술·FAQ 세 링크가 모두 보이거나 Header height가 `58px`로 측정된다.

- [ ] **Step 3: `560px` 이하 active-only CSS를 최소 구현한다**

`header.module.css`의 기존 `@media (max-width: 340px)` 블록을 `@media (max-width: 560px)`로 교체하고 다음 규칙을 추가한다.

```css
@media (max-width: 560px) {
  .nav {
    width: calc(100% - 24px);
    height: 60px;
  }

  .glassShell {
    padding-inline: 14px;
  }

  .logo {
    font-size: 20px;
  }

  .navMenu {
    position: static;
    flex: 1 1 auto;
    font-size: 13px;
  }

  .menuLinks {
    position: static;
    width: 100%;
    justify-content: flex-end;
    gap: 0;
  }

  .nav[data-header-hydrated='true'] [data-header-section-link]:not([aria-current='location']),
  :global(html[data-header-initial-layout='mobile-persistent'])
    .nav[data-header-hydrated='false']
    [data-header-section-link]:not([aria-current='location']) {
    display: none;
  }

  .nav[data-header-hydrated='true'] [data-header-section-link][aria-current='location'] {
    position: absolute;
    left: 50%;
    min-height: 44px;
    padding-inline: 12px;
    transform: translateX(-50%);
  }

  .navMenu .contactLink {
    min-width: 52px;
    margin-left: auto;
    padding-inline: 11px;
  }

  .activeIndicator {
    display: none;
  }
}
```

Pre-hydration에서도 direct hash를 가리지 않도록 초기 layout selector에는 inactive hide만 적용한다. Active absolute positioning은 hydration 후 `aria-current`가 실제 section과 동기화된 상태에서만 적용한다.

- [ ] **Step 4: 모바일 focused 테스트를 통과시킨다**

Run: Step 2와 동일.

Expected: PASS at `560px`, `390px`, `320px`; Hero/Footer center blank, section center offset `<= 1px`, horizontal overflow `0`.

- [ ] **Step 5: Task 1 변경을 커밋한다**

```bash
git add e2e/landing-adaptive-island.chrome.spec.ts \
  src/pages/landing/ui/styles/header.module.css
git commit -m "fix(header): 모바일에 현재 섹션만 표시"
```

---

### Task 2: 태블릿 spacing과 no-JS 대체 경로를 보강

**Files:**

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
- Modify: `src/pages/landing/ui/styles/header.module.css`

**Interfaces:**

- Consumes: Task 1의 `@media (max-width: 560px)` active-only 계약
- Produces: `561px ~ 900px` 전체 메뉴 spacing과 no-JS 전체 탐색 fallback

- [ ] **Step 1: 태블릿 spacing과 no-JS 테스트를 작성한다**

```ts
test('keeps the full menu comfortably spaced at tablet widths', async ({ page }) => {
  for (const viewport of [
    { width: 900, height: 844 },
    { width: 768, height: 844 },
    { width: 561, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await waitForHeader(page, 'mobile-persistent');

    const links = navigation(page).getByRole('link');
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) await expect(link).toBeVisible();

    await expect(navigation(page)).toHaveCSS('font-size', '14px');
    await expect(header(page).locator('[data-header-section-link]').first()).toHaveCSS(
      'padding-left',
      '8px',
    );
    await expectNoHorizontalOverflow(page);
  }
});
```

기존 no-JS 테스트를 강화한다.

```ts
for (const name of ['서비스', '기술', 'FAQ', '문의']) {
  await expect(navigation(page).getByRole('link', { name, exact: true })).toBeVisible();
}
```

- [ ] **Step 2: 태블릿 spacing 테스트의 RED를 확인한다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --grep "comfortably spaced|without JavaScript" --workers=1
```

Expected: tablet test FAIL with current `font-size: 12px` or `padding-left: 5px`; no-JS assertion remains PASS.

- [ ] **Step 3: 태블릿 spacing을 구현한다**

기존 `@media (max-width: 900px)`의 전체 메뉴 기준을 다음으로 변경한다.

```css
@media (max-width: 900px) {
  .glassShell {
    padding-inline: 16px 12px;
  }

  .logo {
    font-size: 20px;
  }

  .navMenu {
    font-size: 14px;
  }

  .menuLinks {
    gap: 8px;
  }

  .navMenu a {
    padding-inline: 8px;
  }

  .navMenu .contactLink {
    min-width: 58px;
    margin-left: 2px;
    padding-inline: 12px;
  }
}
```

`@media (max-width: 560px)`는 cascade상 뒤에 두어 Task 1의 mobile geometry와 active-only 규칙이 우선하게 한다.

- [ ] **Step 4: 태블릿·모바일·no-JS 회귀를 함께 통과시킨다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --workers=1
```

Expected: all Header/runtime tests PASS; no horizontal overflow at every configured viewport.

- [ ] **Step 5: Task 2 변경을 커밋한다**

```bash
git add e2e/landing-adaptive-island.chrome.spec.ts \
  src/pages/landing/ui/styles/header.module.css
git commit -m "style(header): 태블릿 메뉴 간격을 확대"
```

---

### Task 3: 디자인 계약과 최종 검증을 갱신

**Files:**

- Modify: `docs/futur_react_docs_package/DESIGN.md`
- Modify: `docs/superpowers/specs/2026-08-17-mobile-header-persistent-navigation-design.md`
- Update: `graphify-out/*` via `graphify update .`

**Interfaces:**

- Consumes: Task 1과 Task 2의 확정 breakpoint·geometry·fallback
- Produces: 구현과 일치하는 Header 디자인 문서 및 최신 project graph

- [ ] **Step 1: 루트 Header 디자인 계약을 갱신한다**

`DESIGN.md`의 `9.1 Header`에서 “모바일 전체 메뉴 한 줄 상시 노출”을 다음 계약으로 교체한다.

```markdown
- `561px ~ 900px`에서는 로고·서비스·기술·FAQ·문의 전체 메뉴를 여유 있는 한 줄로 유지한다.
- `560px` 이하에서는 `FUTUR. | 현재 섹션 | 문의`만 표시한다.
- Hero와 Footer에서는 모바일 중앙 섹션명을 비우고, 현재 섹션은 글자색으로만 구분한다.
- no-JS에서는 전체 hash navigation을 그대로 노출한다.
```

- [ ] **Step 2: 이전 설계에 보완 관계를 명시한다**

`2026-08-17-mobile-header-persistent-navigation-design.md` 제목 아래에 다음을 추가한다.

```markdown
> Refined on 2026-08-17. `560px` 이하의 전체 메뉴 상시 노출 계약은 `2026-08-17-mobile-header-active-section-design.md`의 현재 섹션 중심 구조로 보완됐다. `561px` 이상과 접기·펼치기 제거 원칙은 계속 유효하다.
```

- [ ] **Step 3: 정적 검사와 접근성을 실행한다**

Run:

```bash
pnpm lint
pnpm exec tsc -b --noEmit
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts \
  e2e/a11y/landing.interactive.a11y.spec.ts --project=a11y --workers=1
```

Expected: lint/typecheck PASS, axe tests `7 passed`.

- [ ] **Step 4: 프로덕션 빌드와 전체 회귀를 실행한다**

Run:

```bash
pnpm build
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test --workers=4 --retries=0
```

Expected: build PASS. 문의 서버 전용 spec은 `PLAYWRIGHT_E2E=1` 서버에서 실행해야 하며, 일반 개발 서버에서 `/internal-e2e/contact-inquiry`가 닫혀 있는 것은 정상이다. 병렬 runner 종료 대기가 재현되면 출력된 실패를 분리해 해당 spec을 `--workers=1`로 다시 검증한다.

- [ ] **Step 5: Codex 내부 브라우저에서 실제 레이아웃을 확인한다**

`http://127.0.0.1:3001/#top`을 Codex 내부 브라우저에 열고 다음을 확인한다.

- `900px`, `768px`, `561px`: 전체 메뉴와 넓어진 간격
- `560px`, `390px`, `320px`: 로고·현재 섹션·문의, 중앙 오차 `<= 1px`
- Hero/Footer: 중앙 라벨 없음
- Services/Technology/FAQ: 현재 섹션 하나만 표시
- 모든 폭: horizontal overflow `0`, 콘솔 오류 `0`

- [ ] **Step 6: graphify와 diff를 갱신·확인한다**

Run:

```bash
graphify update .
git diff --check
git status --short
```

Expected: graph update 성공, whitespace 오류 없음, 의도한 CSS·테스트·문서 변경만 존재.

- [ ] **Step 7: 문서와 graph 변경을 커밋한다**

```bash
git add docs/futur_react_docs_package/DESIGN.md \
  docs/superpowers/specs/2026-08-17-mobile-header-persistent-navigation-design.md
git commit -m "docs(header): 모바일 활성 섹션 계약 반영"
```

---

## Completion Criteria

- `561px 이상`에서는 전체 Header 메뉴가 유지되고 기존 데스크톱 동작이 바뀌지 않는다.
- `560px 이하`에서는 현재 section link 하나와 문의만 보이고 Hero/Footer 중앙은 비어 있다.
- 모바일 현재 섹션은 Header 전체 기준 중앙이며 indicator/transition 위치 오류가 없다.
- no-JS 전체 navigation, reduced motion, high contrast와 glass fallback이 유지된다.
- 관련 Playwright, axe, lint, typecheck, build와 내부 Codex 브라우저 검증이 완료된다.
- `graphify update .` 실행 후 branch가 clean하다.
