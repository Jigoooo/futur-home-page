# Mobile Header Persistent Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 Header에서 접기·펼치기 구조를 제거하고 로고와 전체 메뉴를 한 줄에 항상 노출한다.

**Architecture:** Header는 `desktop-fluid | mobile-persistent` 두 반응형 상태만 가진다. 모바일은 CSS로 고정된 한 줄 구조를 만들고, React 훅은 메뉴 열림 상태와 GSAP 모바일 타임라인을 더 이상 관리하지 않는다. 활성 섹션, 해시 이동, 표면 기반 색상과 공유 활성 표시 로직은 두 상태가 함께 사용한다.

**Tech Stack:** React 19, TypeScript, CSS Modules, GSAP(데스크톱 Header 보간만 유지), Playwright, axe

## Global Constraints

- `900px 이하`는 `mobile-persistent`, `901px 이상`은 `desktop-fluid`다.
- 모바일 Header는 좌우 `10px`, 높이 `58px`이며 스크롤 중 크기가 변하지 않는다.
- 모바일에서 FUTUR 로고와 서비스·기술·FAQ·문의 링크를 한 줄에 항상 표시한다.
- 모바일 Menu/X 버튼, 확장 패널, 레이아웃 GSAP 모션을 제거한다.
- 데스크톱 유동 축소, 활성 메뉴, 해시 이동과 표면별 색상은 유지한다.
- 새 의존성, 메뉴 문구와 링크 목적지 변경은 금지한다.

---

### Task 1: 모바일 상시 노출 회귀 계약

**Files:**

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
- Modify: `e2e/landing-runtime-errors.chrome.spec.ts`

**Interfaces:**

- Consumes: `[data-landing-nav]`, `data-header-layout`, `nav[aria-label="주요 메뉴"]`, `data-header-active-indicator`
- Produces: `mobile-persistent` 상태, 모바일 고정 geometry와 상시 노출 메뉴에 대한 Playwright 회귀 계약

- [ ] **Step 1: compact 전용 helper와 테스트를 상시 노출 계약으로 교체한다**

  `compactButton`, `enterCompactLayout`, `openCompactMenu`, 모바일 geometry timeline helper와 다음 compact 전용 테스트를 제거한다.
  - expansion/collapse midpoint와 motion lifecycle
  - interrupted opening/closing과 expanded fallback
  - toggle focus return, Escape/outside click/scroll dismissal
  - expanded close controller와 mobile active indicator follow-through

  다음 helper를 추가한다.

  ```ts
  async function enterPersistentMobileLayout(page: Page, viewport = mobileViewport) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
    await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-persistent');
  }
  ```

- [ ] **Step 2: 모바일 메뉴가 항상 표시되고 geometry가 고정되는 실패 테스트를 작성한다**

  ```ts
  test('keeps the complete navigation visible in a fixed mobile header', async ({ page }) => {
    for (const viewport of [mobileViewport, { width: 320, height: 720 }]) {
      await enterPersistentMobileLayout(page, viewport);
      const nav = header(page).getByRole('navigation', { name: '주요 메뉴' });
      await expect(header(page).getByRole('link', { name: 'FUTUR home' })).toBeVisible();
      await expect(nav.getByRole('link')).toHaveText(['서비스', '기술', 'FAQ', '문의']);
      await expect(header(page).locator('[data-header-toggle], [data-header-close]')).toHaveCount(
        0,
      );

      const initial = await header(page).boundingBox();
      await page.locator('#technology').evaluate((element) => element.scrollIntoView());
      const scrolled = await header(page).boundingBox();
      expect(scrolled?.width).toBeCloseTo(initial?.width ?? 0, 0);
      expect(scrolled?.height).toBeCloseTo(initial?.height ?? 0, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width,
      );
    }
  });
  ```

- [ ] **Step 3: 활성 메뉴와 해시 이동을 상시 노출 상태에서 검증한다**

  ```ts
  test('keeps mobile navigation active and directly operable', async ({ page }) => {
    await enterPersistentMobileLayout(page);
    const nav = header(page).getByRole('navigation', { name: '주요 메뉴' });
    await nav.getByRole('link', { name: '기술', exact: true }).click();
    await expect(page).toHaveURL(/#technology$/);
    await expect(nav.locator('a[href="#technology"]')).toHaveAttribute('aria-current', 'location');
    await expect(header(page).locator('[data-header-active-indicator]')).toBeVisible();
  });
  ```

- [ ] **Step 4: no-JS와 런타임 오류 테스트에서 toggle 조작을 제거한다**

  no-JS 테스트는 Header 높이를 `58px` 전후로 확인하고 로고와 네 링크가 보이는지 검증한다. 런타임 오류 테스트는 모바일 전환 후 `기술` 링크를 직접 클릭한다.

- [ ] **Step 5: 새 계약이 기존 구현에서 실패하는지 확인한다**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --workers=1 -g "persistent|상시|runtime errors"
  ```

  Expected: `mobile-persistent`가 없고 toggle DOM이 남아 있어 FAIL.

### Task 2: Header 상태와 DOM 단순화

**Files:**

- Modify: `src/pages/landing/ui/header-motion.ts`
- Modify: `src/pages/landing/ui/use-adaptive-header.ts`
- Modify: `src/pages/landing/ui/header-section.tsx`

**Interfaces:**

- Consumes: `navigationItems`, `startDesktopActiveIndicatorMotion`, `writeDesktopHeaderFrame`, `scrollToHashTarget`
- Produces: `HeaderLayout = 'desktop-fluid' | 'mobile-persistent'`와 상시 접근 가능한 Header DOM

- [ ] **Step 1: 모바일 motion API를 삭제한다**

  `header-motion.ts`에서 `MobileHeaderLayout`, `HeaderMotionPhase`, `MobileHeaderMotionOptions`, `getMobileHeaderGeometry`, `startMobileHeaderMotion`을 제거한다. 다음 데스크톱 API는 유지한다.

  ```ts
  export const DESKTOP_HEADER_SCROLL_RANGE = 160;
  export function getDesktopHeaderProgress(scrollY: number): number;
  export function writeDesktopHeaderFrame(
    header: HTMLElement,
    viewportWidth: number,
    progress: number,
  ): void;
  export function clearDesktopHeaderFrame(header: HTMLElement): void;
  ```

- [ ] **Step 2: adaptive 훅을 두 상태로 단순화한다**

  ```ts
  export type HeaderLayout = 'desktop-fluid' | 'mobile-persistent';

  const syncBaseLayout = () => {
    updateLayout(compactViewport.matches ? 'mobile-persistent' : 'desktop-fluid');
  };
  ```

  toggle ref, motion phase, opened section, mobile timeline, focus 반환, expanded 메뉴 이벤트, `toggleMenu`, `handleMenuClose` 반환값을 제거한다. 활성 섹션 측정은 어떤 layout에서도 계속 수행한다. 공유 활성 표시도 두 layout 모두에서 실행한다.

- [ ] **Step 3: Header DOM에서 모바일 controller를 제거한다**

  `Menu`, `X`, `toggleRef`, `HEADER_MENU_ID`, compact button과 close button을 삭제한다. 로고와 메뉴는 항상 접근 가능하게 렌더링한다.

  ```tsx
  const { activeHref, handleNavigation, hydrated, layout, glassTone } =
    useAdaptiveHeader({ headerRef, menuRef });

  <a href='#top' aria-label='FUTUR home' onClick={handleNavigation}>FUTUR<span>.</span></a>
  <nav ref={menuRef} className={styles.navMenu} aria-label='주요 메뉴'>…</nav>
  ```

- [ ] **Step 4: 타입 검사로 사용되지 않는 모바일 계약이 모두 제거됐는지 확인한다**

  Run: `pnpm exec tsc -b --noEmit`

  Expected: PASS, `mobile-compact`, `mobile-expanded`, toggle handler 참조 없음.

### Task 3: 모바일 한 줄 CSS와 문서 계약

**Files:**

- Modify: `src/pages/landing/ui/styles/header.module.css`
- Modify: `docs/futur_react_docs_package/DESIGN.md`

**Interfaces:**

- Consumes: `data-header-layout='mobile-persistent'`, 기존 Header 색상 토큰
- Produces: `320px` 이상에서 넘치지 않는 `58px` 한 줄 Header

- [ ] **Step 1: compact/expanded CSS를 고정 한 줄 규칙으로 교체한다**

  ```css
  @media (max-width: 900px) {
    .nav {
      --landing-compact-header-offset: 82px;
      top: 10px;
      width: calc(100% - 20px);
      height: 58px;
    }

    .glassShell {
      padding-inline: 12px 8px;
    }

    .logo {
      font-size: 19px;
    }

    .navMenu,
    .menuLinks {
      min-width: 0;
      gap: 2px;
    }

    .navMenu {
      font-size: 12px;
    }

    .navMenu a {
      min-height: 40px;
      padding-inline: 5px;
    }

    .navMenu .contactLink {
      min-width: 44px;
      margin-left: 1px;
      padding-inline: 8px;
    }
  }
  ```

  compact toggle, close button, mobile grid와 hidden clipping 규칙은 삭제한다. `320px`에서 공간이 부족하면 `.logo`를 `18px`, 링크 padding을 `4px`까지 줄이되 메뉴 문구를 숨기지 않는다.

- [ ] **Step 2: DESIGN 문서에서 mobile compact 계약을 교체한다**

  `mobile-compact/mobile-expanded`, toggle, 220×56/370×158 설명을 제거하고 `mobile-persistent`, 58px, 상시 노출과 고정 geometry를 기록한다.

- [ ] **Step 3: focused 테스트를 통과시킨다**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --workers=1
  ```

  Expected: 모바일 상시 노출, 데스크톱 geometry, Header tone과 hash tests PASS.

### Task 4: 통합 검증과 프로젝트 그래프

**Files:**

- Modify generated ignored graph files via `graphify update .`

**Interfaces:**

- Consumes: Tasks 1–3 결과
- Produces: 배포 가능한 회귀 검증 결과

- [ ] **Step 1: 정적 품질 검사를 실행한다**

  ```bash
  pnpm lint
  pnpm exec tsc -b --noEmit
  pnpm build
  ```

- [ ] **Step 2: Header 및 접근성 회귀를 실행한다**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts e2e/landing-static.a11y.spec.ts --workers=1
  ```

- [ ] **Step 3: Codex 내부 브라우저에서 확인한다**

  `390×844`, `320×720`, `901×844`, `1280×900`에서 Header 노출, 직접 메뉴 이동, 색상 전환과 가로 overflow를 확인한다.

- [ ] **Step 4: graphify를 갱신한다**

  Run: `graphify update .`

- [ ] **Step 5: 구현 변경을 커밋한다**

  ```bash
  git add \
    src/pages/landing/ui/header-motion.ts \
    src/pages/landing/ui/use-adaptive-header.ts \
    src/pages/landing/ui/header-section.tsx \
    src/pages/landing/ui/styles/header.module.css \
    e2e/landing-adaptive-island.chrome.spec.ts \
    e2e/landing-runtime-errors.chrome.spec.ts \
    docs/futur_react_docs_package/DESIGN.md \
    docs/superpowers/plans/2026-08-17-mobile-header-persistent-navigation.md
  git commit -m "fix(header): 모바일 메뉴를 항상 노출"
  ```
