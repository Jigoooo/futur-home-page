# FUTUR Landing Classic Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 전체 화면 Hero와 semantic 커스텀 커서는 유지하면서, Hero 이후를 팀 소개가 존재했던 `12fa1c8`의 클래식 랜딩 레이아웃으로 선택 복원한다.

**Architecture:** 과거 커밋을 전체 revert하지 않고 컴포넌트·설정·CSS를 섹션 단위로 선택 복원한다. 현재 Hero particle 런타임, cursor tone 경계, 문의 클라이언트·서버 계약은 그대로 두고, 클래식 표현이 필요한 컴포넌트는 현재 접근성 마크업에 과거 시각 스타일을 이식한다. 검증되지 않은 증거 섹션은 테스트에서 부재 계약으로 고정한다.

**Tech Stack:** React 19, TypeScript 6, CSS Modules, GSAP 3, TanStack Start, Playwright 1.60, axe-core

## Global Constraints

- 복원 기준점은 Git commit `12fa1c8`이다.
- `git checkout 12fa1c8 -- .`, 전체 revert, 강제 reset을 사용하지 않는다.
- 현재 `HeroSection`, Hero particle engine/shader/GL, `CustomCursor`, `useCustomCursor` 동작을 보존한다.
- 현재 문의 필드명, 검증, 전송 상태, fallback mail, 서버 allowlist/rate-limit/idempotency/honeypot/form-age/test-address guard를 보존한다.
- 현재 pill 버튼의 spotlight, sheen, focus-visible, press 동작을 보존한다.
- 숫자 지표, 고객 후기, 익명 완료 사례, `24/7`, `4시간 응답`, 경력 연수, 자동 NDA를 복원하지 않는다.
- 신규 런타임 의존성을 추가하지 않는다.
- 포트 `3000`, 데스크톱 `1280×720`, 모바일 `390×844`를 시각 기준으로 사용한다.
- 각 작업은 RED → GREEN → review → commit 순서로 끝낸다.

---

## File Structure

### 현재 구현을 권위로 유지

- `src/pages/landing/ui/hero-section.tsx`
- `src/pages/landing/ui/styles/hero.module.css`
- `src/pages/landing/ui/hero-particle-*.ts*`
- `src/pages/landing/ui/custom-cursor.tsx`
- `src/pages/landing/ui/use-custom-cursor.ts`
- `src/pages/landing/ui/styles/custom-cursor.module.css`
- `src/pages/landing/server/**`

### 클래식 구조로 복원·수정

- `src/pages/landing/config/{navigation,services,stack,team,process,operations-policy}.ts`
- `src/pages/landing/model/types.ts`
- `src/pages/landing/ui/{services,stack,team,process,operations-policy}-section.tsx`
- `src/pages/landing/ui/{header,faq,contact,footer}-section.tsx`
- `src/pages/landing/ui/styles/{shared,header,services,stack,team,process,operations-policy,faq,contact,footer}.module.css`
- `src/pages/landing/ui/{landing-page,landing-enhancements}.tsx`
- `src/pages/landing/ui/{use-in-view-reveal,use-landing-gsap-interactions}.ts`

### 시네마틱 본문 전용 파일 삭제

- `src/pages/landing/config/review-method.ts`
- `src/pages/landing/ui/quality-standard-section.tsx`
- `src/pages/landing/ui/review-method-section.tsx`
- `src/pages/landing/ui/use-landing-scene-motion.ts`
- `src/pages/landing/ui/styles/quality-standard.module.css`
- `src/pages/landing/ui/styles/review-method.module.css`

---

### Task 1: 사실 기반 클래식 페이지 구조 복원

**Files:**

- Create: `e2e/landing-classic-restoration.chrome.spec.ts`
- Create: `src/pages/landing/config/stack.ts`
- Create: `src/pages/landing/config/team.ts`
- Create: `src/pages/landing/config/operations-policy.ts`
- Create: `src/pages/landing/ui/stack-section.tsx`
- Create: `src/pages/landing/ui/team-section.tsx`
- Create: `src/pages/landing/ui/operations-policy-section.tsx`
- Create: `src/pages/landing/ui/styles/{stack,team,operations-policy}.module.css`
- Modify: `src/pages/landing/config/{navigation,services,process,index}.ts`
- Modify: `src/pages/landing/model/types.ts`
- Modify: `src/pages/landing/ui/{services,process,landing-page,landing-enhancements}.tsx`
- Modify: `src/pages/landing/ui/styles/{services,process}.module.css`
- Modify: `src/pages/landing/ui/icons.tsx`
- Delete: 시네마틱 본문 전용 파일 6개

**Interfaces:**

- Produces: `stackGroups: StackGroup[]`, `teamRoles: TeamRole[]`, `operationsPolicies: OperationsPolicy[]`.
- Produces: `#services`, `#stack`, `#team`, `#process`, `#operations`, `#faq`, `#contact`.
- Preserves: `#hero`, `data-hero-particles`, 현재 H1과 cursor mount.

- [ ] **Step 1: 하이브리드 페이지 RED 테스트 작성**

```ts
import { expect, test } from '@playwright/test';

const orderedSections = [
  'hero',
  'services',
  'stack',
  'team',
  'process',
  'operations',
  'faq',
  'contact',
];

test('keeps the current hero and restores the factual classic order', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#hero canvas[data-hero-particles]')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('BUILT FOR WHAT’S NEXT.');
  expect(
    await page
      .locator('main > section[data-landing-section]')
      .evaluateAll((nodes) => nodes.map((node) => node.id)),
  ).toEqual(orderedSections);
  await expect(page.getByRole('link', { name: '팀' })).toHaveAttribute('href', '#team');
});

test('does not restore unverified proof or cinematic-only scenes', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#trust, #reviews, #cases, #quality, #review')).toHaveCount(0);
  await expect(
    page.locator('[data-quality-stage], [data-review-stage], [data-service-merge]'),
  ).toHaveCount(0);
  await expect(page.getByText(/24\/7|4시간|30\+|95%\+|자동 NDA|경력 \d+년/)).toHaveCount(0);
});
```

- [ ] **Step 2: RED 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts --workers=1
```

Expected: `#stack`, `#team`, `#operations`와 새 순서가 없어 FAIL. Hero assertion은 PASS.

- [ ] **Step 3: 복원 섹션의 최소 타입 정의**

```ts
export type IconName = 'check' | 'clock' | 'desktop' | 'link' | 'shield' | 'system';

export interface ServiceItem {
  title: string;
  description: string;
  icon: IconName;
}

export interface StackGroup {
  key: 'frontend' | 'interaction' | 'server' | 'quality';
  title: string;
  items: string[];
}

export interface TeamRole {
  badge: string;
  title: string;
  responsibility: string;
  tags: string[];
}

export interface OperationsPolicy {
  icon: IconName;
  title: string;
  description: string;
}
```

과거 `location`, `experience`, `projectExperience`, `cursorText` 필드는 복원하지 않는다.

- [ ] **Step 4: 사실 기반 설정 작성**

`stackGroups`는 다음 값만 사용한다.

```ts
export const stackGroups: StackGroup[] = [
  { key: 'frontend', title: 'Frontend', items: ['React', 'TypeScript', 'TanStack', 'Vite'] },
  { key: 'interaction', title: 'Interaction', items: ['GSAP', 'CSS Modules'] },
  { key: 'server', title: 'Server', items: ['Node.js', 'TanStack Start'] },
  { key: 'quality', title: 'Quality', items: ['Playwright', 'axe-core'] },
];
```

`teamRoles`는 연차·위치·완료 프로젝트 없이 다음 다섯 역할을 사용한다.

```ts
export const teamRoles: TeamRole[] = [
  {
    badge: 'PM',
    title: '프로젝트 매니지먼트',
    responsibility: '요구사항과 범위를 정리하고 일정과 의사결정을 연결합니다.',
    tags: ['기획', '문서화', '커뮤니케이션'],
  },
  {
    badge: 'PLAN',
    title: '서비스 기획',
    responsibility: '업무 흐름을 화면 구조와 실행 가능한 기능 단위로 바꿉니다.',
    tags: ['요구사항', 'IA', '화면 흐름'],
  },
  {
    badge: 'FE',
    title: '프론트엔드·모바일',
    responsibility: '실사용 환경에 맞는 웹과 앱의 화면 경험을 구현합니다.',
    tags: ['React', 'TypeScript', 'UI/UX'],
  },
  {
    badge: 'BE',
    title: '백엔드',
    responsibility: 'API, 데이터, 권한 구조를 운영 가능한 형태로 설계합니다.',
    tags: ['API', '데이터', '권한'],
  },
  {
    badge: 'OPS',
    title: '운영·인프라',
    responsibility: '배포와 모니터링, 변경 이력과 인수인계 범위를 관리합니다.',
    tags: ['배포', '모니터링', '인수인계'],
  },
];
```

`operationsPolicies`는 다음 네 항목을 사용한다.

```ts
export const operationsPolicies: OperationsPolicy[] = [
  {
    icon: 'shield',
    title: '정보 보호 범위 협의',
    description: '자료 취급과 비밀유지 조건은 프로젝트 시작 전에 필요한 범위로 확인합니다.',
  },
  {
    icon: 'clock',
    title: '운영 조건 명시',
    description: '모니터링과 대응 범위, 연락 방식은 운영 상황에 맞춰 문서로 정리합니다.',
  },
  {
    icon: 'system',
    title: '변경 이력 공유',
    description: '오류와 개선 작업은 원인, 변경 내용, 확인 결과가 남도록 관리합니다.',
  },
  {
    icon: 'check',
    title: '코드와 운영 자산 인계',
    description: '합의한 코드, 문서, 디자인, 운영 자료를 종료 범위에 맞춰 정리합니다.',
  },
];
```

- [ ] **Step 5: 내비게이션과 기존 설정 갱신**

```ts
export const navigationItems: NavItem[] = [
  { label: '서비스', href: '#services' },
  { label: '기술', href: '#stack' },
  { label: '팀', href: '#team' },
  { label: '프로세스', href: '#process' },
  { label: 'FAQ', href: '#faq' },
  { label: '문의', href: '#contact' },
];
```

서비스는 `웹·앱 개발`, `업무 시스템 구축`, `연동·API`, `운영·유지보수` 네 항목을 사용한다. 프로세스는 `상담 및 분석`, `기획 및 제안`, `디자인 및 개발`, `테스트 및 검증`, `배포 및 운영` 다섯 단계로 되돌린다.

- [ ] **Step 6: 클래식 semantic 섹션 구현**

서비스는 아이콘·제목·설명·문의 링크를 가진 네 `<article>`로 구현한다. 기술은 네 그룹 `<section>`과 실제 `<ul>`, 팀은 다섯 역할 `<article>`, 운영은 네 원칙 `<article>`, 프로세스는 다섯 단계 `<ol>`로 구현한다. 각 섹션에 `data-landing-section`과 `data-cursor-contrast='dark'`를 지정한다.

Task 1에서는 각 컴포넌트가 import하는 CSS Module에 실제 class selector를 함께 작성해 TypeScript build가 독립적으로 통과하게 한다. grid는 우선 1열 final-state로 두고, 반응형 열·surface·간격은 Task 2에서 확정한다.

`icons.tsx`는 필요한 여섯 아이콘만 매핑한다.

```ts
const ICONS: Record<IconName, LucideIcon> = {
  check: Check,
  clock: Clock,
  desktop: Monitor,
  link: LinkIcon,
  shield: ShieldCheck,
  system: Server,
};
```

팀 역할 목록의 핵심 마크업은 다음과 같다.

```tsx
{
  teamRoles.map((role) => (
    <article key={role.badge} className={styles.roleCard} data-reveal>
      <span className={styles.badge} aria-hidden='true'>
        {role.badge}
      </span>
      <h3>{role.title}</h3>
      <p>{role.responsibility}</p>
      <ul aria-label={`${role.title} 담당 영역`}>
        {role.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </article>
  ));
}
```

- [ ] **Step 7: LandingPage 순서 교체와 시네마틱 본문 제거**

```tsx
<HeaderSection />
<HeroSection />
<ServicesSection />
<StackSection />
<TeamSection />
<ProcessSection />
<OperationsPolicySection />
<FaqSection />
<ContactSection />
<FooterSection />
```

현재 scroll-top threshold, SSR-visible content, lazy enhancement 경계는 유지한다. 시네마틱 본문 전용 파일과 모든 import/export를 삭제한다.

`landing-enhancements.tsx`에서는 `useLandingSceneMotion` import와 호출만 제거하고 `useCustomCursor()`, `useLandingGsapInteractions(pageRef)`, `<CustomCursor />`는 유지한다.

- [ ] **Step 8: GREEN과 dangling reference 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts --workers=1
rg -n "QualityStandard|ReviewMethod|useLandingSceneMotion|data-quality-stage|data-review-stage|data-service-merge" src
pnpm build
```

Expected: Playwright와 build PASS. `rg` exit 1 with no matches.

- [ ] **Step 9: 커밋**

```bash
git add e2e/landing-classic-restoration.chrome.spec.ts \
  src/pages/landing/config/index.ts src/pages/landing/config/navigation.ts \
  src/pages/landing/config/services.ts src/pages/landing/config/stack.ts \
  src/pages/landing/config/team.ts src/pages/landing/config/process.ts \
  src/pages/landing/config/operations-policy.ts src/pages/landing/config/review-method.ts \
  src/pages/landing/model/types.ts src/pages/landing/ui/icons.tsx \
  src/pages/landing/ui/services-section.tsx src/pages/landing/ui/stack-section.tsx \
  src/pages/landing/ui/team-section.tsx src/pages/landing/ui/process-section.tsx \
  src/pages/landing/ui/operations-policy-section.tsx src/pages/landing/ui/landing-page.tsx \
  src/pages/landing/ui/landing-enhancements.tsx \
  src/pages/landing/ui/quality-standard-section.tsx src/pages/landing/ui/review-method-section.tsx \
  src/pages/landing/ui/use-landing-scene-motion.ts \
  src/pages/landing/ui/styles/services.module.css src/pages/landing/ui/styles/stack.module.css \
  src/pages/landing/ui/styles/team.module.css src/pages/landing/ui/styles/process.module.css \
  src/pages/landing/ui/styles/operations-policy.module.css \
  src/pages/landing/ui/styles/quality-standard.module.css \
  src/pages/landing/ui/styles/review-method.module.css
git commit -m "feat(landing): 사실 기반 클래식 페이지 구조 복원"
```

---

### Task 2: 클래식 Header·본문 surface·반응형 스타일 복원

**Files:**

- Modify: `e2e/landing-classic-restoration.chrome.spec.ts`
- Modify: `src/pages/landing/ui/styles/{stack,team,operations-policy}.module.css`
- Modify: `src/pages/landing/ui/styles/{shared,header,services,process}.module.css`
- Modify: `src/pages/landing/ui/header-section.tsx`

**Interfaces:**

- Consumes: Task 1의 최종 section DOM.
- Produces: `[data-classic-surface]` 7개 중 서비스·기술·팀·프로세스·운영 5개.
- Preserves: header sentinel surface 전환, mobile CTA containment, Hero gutter.

- [ ] **Step 1: geometry RED 테스트 추가**

```ts
test('uses classic surfaces without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
  await expect(
    page.locator(
      '#services [data-classic-surface], #stack [data-classic-surface], #team [data-classic-surface], #process [data-classic-surface], #operations [data-classic-surface]',
    ),
  ).toHaveCount(5);
});
```

- [ ] **Step 2: RED 확인**

Run: `pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts --grep "classic surfaces" --workers=1`

Expected: `data-classic-surface`가 없어 FAIL.

- [ ] **Step 3: 과거 디자인 토큰 선택 복원**

`git show 12fa1c8:<path>`를 참고해 캡슐형 header, 교차 section background, 2열 정보 구조, 24px 카드 radius를 복원한다. 공통 폭은 데스크톱 `min(100% - 48px, 1180px)`, 모바일 `min(100% - 32px, 1180px)`로 제한한다.

```css
.classicSurface {
  width: min(100% - 48px, 1180px);
  margin-inline: auto;
  border-radius: 32px;
}

@media (max-width: 640px) {
  .classicSurface {
    width: min(100% - 32px, 1180px);
    border-radius: 24px;
  }
}
```

- [ ] **Step 4: 섹션별 반응형 스타일 적용**

- 서비스: 데스크톱 2×2, 모바일 1열.
- 기술: 데스크톱 4그룹, 태블릿 2열, 모바일 1열.
- 팀: 데스크톱 3열 후 2열 흐름, 모바일 1열.
- 프로세스: 번호가 보이는 5단계 목록, 모바일 1열.
- 운영: 데스크톱 2×2, 모바일 1열.
- 모든 H2는 데스크톱 `55px`, 모바일 `42px` 이하.
- 현재 Layered Merge, orbit, path SVG, clip-path stage 스타일을 복원하지 않는다.

- [ ] **Step 5: Header 비례 복원**

과거 캡슐형 header 비례를 적용하되 현재 `data-header-surface`, cursor tone, 모바일 CTA containment를 유지한다. 6개 링크가 태블릿 breakpoint에서 기존 메뉴로 전환되도록 한다.

- [ ] **Step 6: GREEN 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --workers=1
pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts --workers=1
```

Expected: geometry, Hero, runtime, static axe PASS.

- [ ] **Step 7: 커밋**

```bash
git add e2e/landing-classic-restoration.chrome.spec.ts \
  src/pages/landing/ui/header-section.tsx \
  src/pages/landing/ui/styles/shared.module.css \
  src/pages/landing/ui/styles/header.module.css \
  src/pages/landing/ui/styles/services.module.css \
  src/pages/landing/ui/styles/stack.module.css \
  src/pages/landing/ui/styles/team.module.css \
  src/pages/landing/ui/styles/process.module.css \
  src/pages/landing/ui/styles/operations-policy.module.css
git commit -m "feat(landing): 클래식 본문과 헤더 스타일 복원"
```

---

### Task 3: FAQ·문의·Footer 클래식 스타일과 기능 보존

**Files:**

- Modify: `e2e/landing-classic-restoration.chrome.spec.ts`
- Modify: `src/pages/landing/ui/{faq,contact,footer}-section.tsx`
- Modify: `src/pages/landing/ui/styles/{faq,contact,form-controls,footer}.module.css`
- Test unchanged: `e2e/contact-delivery.chrome.spec.ts`
- Test unchanged: `e2e/contact-mail-safety.chrome.spec.ts`
- Test unchanged: `e2e/contact-server-boundaries.chrome.spec.ts`
- Test unchanged: `e2e/a11y/landing.interactive.a11y.spec.ts`

**Interfaces:**

- Preserves: FAQ `aria-expanded`/`aria-controls`, Contact input names, native consent controls, submit state, legal modal triggers.
- Produces: FAQ와 Contact의 `data-classic-surface`; factual Footer columns.

- [ ] **Step 1: 하단 기능·geometry RED 테스트 추가**

```ts
test('keeps classic lower surfaces and native contact controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#contact');

  await expect(
    page.locator('#faq [data-classic-surface], #contact [data-classic-surface]'),
  ).toHaveCount(2);
  for (const name of ['privacyConsent', 'collectionConsent']) {
    const input = page.locator(`input[name="${name}"]`);
    await input.locator('..').click();
    await expect(input).toBeChecked();
  }
});
```

- [ ] **Step 2: RED 확인**

Run: `pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts --grep "lower surfaces" --workers=1`

Expected: classic surface가 없어 FAIL.

- [ ] **Step 3: FAQ 시각 레이어만 복원**

현재 disclosure button과 answer region을 유지한다. 현재 장식 grid를 제거하고 `12fa1c8`의 단일 열, 구분선, 넉넉한 질문 행을 적용한다.

- [ ] **Step 4: 문의 로직을 고정하고 밝은 클래식 폼 적용**

다음 input name을 변경하지 않는다.

```ts
const protectedContactNames = [
  'name',
  'email',
  'phone',
  'company',
  'projectType',
  'stage',
  'schedule',
  'budget',
  'message',
  'privacyConsent',
  'collectionConsent',
];
```

과거의 밝은 폼 surface와 2열 데스크톱 배치를 적용한다. 모바일은 1열, surface radius `24px`, control min-height `48px`로 한다. visible label surface와 native checkbox 연결을 유지한다.

- [ ] **Step 5: Footer 정보 구조 복원**

브랜드, 현재 연락처, 서비스 탐색, 정책 링크를 클래식 다열 구조로 분리한다. 확인되지 않은 영문 슬로건, 고객·성과·운영 보장은 넣지 않는다.

- [ ] **Step 6: 문의·접근성 GREEN 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts e2e/contact-delivery.chrome.spec.ts e2e/contact-mail-safety.chrome.spec.ts e2e/contact-server-boundaries.chrome.spec.ts e2e/a11y/landing.interactive.a11y.spec.ts --workers=1
```

Expected: 0 failed. 환경 용량 guard에 의한 기존 skip만 허용.

- [ ] **Step 7: 커밋**

```bash
git add e2e/landing-classic-restoration.chrome.spec.ts src/pages/landing/ui/faq-section.tsx src/pages/landing/ui/contact-section.tsx src/pages/landing/ui/footer-section.tsx src/pages/landing/ui/styles/faq.module.css src/pages/landing/ui/styles/contact.module.css src/pages/landing/ui/styles/form-controls.module.css src/pages/landing/ui/styles/footer.module.css
git commit -m "feat(landing): 클래식 문의와 하단 레이아웃 복원"
```

---

### Task 4: 클래식 reveal과 현재 Hero·커서 회귀 통합

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `e2e/landing-editorial-motion.chrome.spec.ts`
- Modify: `src/pages/landing/ui/landing-enhancements.tsx`
- Modify: `src/pages/landing/ui/use-in-view-reveal.ts`
- Modify: `src/pages/landing/ui/use-landing-gsap-interactions.ts`

**Interfaces:**

- Preserves: `useCustomCursor()`, `CustomCursor`, current button interaction.
- Removes: quality/merge/review/process scene timelines.
- Produces: `[data-reveal].is-visible` one-shot reveal.

- [ ] **Step 1: 모션 RED 테스트 작성**

```ts
test('reveals classic sections once without hiding SSR content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-reveal]').first()).toBeVisible();
  await page.locator('#team').scrollIntoViewIfNeeded();
  await expect(page.locator('#team [data-reveal]').first()).toHaveClass(/is-visible/);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows restored sections in their final state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-reveal]:not(.is-visible)')).toHaveCount(0);
  });
});
```

- [ ] **Step 2: RED 확인**

Run: `pnpm exec playwright test e2e/landing-editorial-motion.chrome.spec.ts --workers=1`

Expected: 현재 scene motion 계약과 새 classic reveal 계약이 달라 FAIL.

- [ ] **Step 3: LandingEnhancements를 커서·버튼 경계로 축소**

```tsx
export function LandingEnhancements({ pageRef }: Props) {
  useCustomCursor();
  useLandingGsapInteractions(pageRef);
  return <CustomCursor />;
}
```

scene motion import와 mount를 제거한다.

- [ ] **Step 4: one-shot reveal 구현**

`useInViewReveal`은 `[data-reveal]`을 관찰해 `is-visible`을 한 번 부여한다. 이동은 `translateY(14px)` 이하, duration `480ms` 이하, easing `var(--ease-out)`만 사용한다. reduced-motion이나 JavaScript-disabled 경로에서는 콘텐츠가 처음부터 보인다.

- [ ] **Step 5: 시네마틱 테스트 정리**

`landing-cinematic-editorial.chrome.spec.ts`에서 quality stage, merge, review mask, process path, dark cinematic contact 기대만 제거한다. Hero full viewport/gutter, mobile header, scroll-top, cursor tone/ring-dot/lifecycle/coarse/reduced 테스트는 유지한다.

- [ ] **Step 6: GREEN 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-editorial-motion.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts e2e/landing-cinematic-editorial.chrome.spec.ts --workers=1
```

Expected: 0 failed.

- [ ] **Step 7: 커밋**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-editorial-motion.chrome.spec.ts src/pages/landing/ui/landing-enhancements.tsx src/pages/landing/ui/use-in-view-reveal.ts src/pages/landing/ui/use-landing-gsap-interactions.ts
git commit -m "refactor(landing): 클래식 reveal과 현재 커서 경계 통합"
```

---

### Task 5: 접근성·문서·최종 시각 QA

**Files:**

- Modify: `e2e/landing-anti-slop.chrome.spec.ts`
- Modify: `e2e/a11y/landing.static.a11y.spec.ts`
- Modify: `e2e/landing.chrome.spec.ts`
- Modify: `DESIGN.md`
- Modify: `PRODUCT.md` only if section inventory appears there

**Interfaces:**

- Produces: 최종 하이브리드 페이지의 회귀·문서 권위.

- [ ] **Step 1: 섹션 목록과 제거 계약 갱신**

정적 a11y 대상은 `#services`, `#stack`, `#team`, `#process`, `#operations`, `#faq`, `#contact`로 설정한다. anti-slop 테스트는 숫자 지표·후기·완료 사례·SLA 문구의 부재를 계속 assert한다.

- [ ] **Step 2: 디자인 권위 문서 갱신**

`DESIGN.md`에 다음을 기록한다.

- Hero와 cursor는 2026-08-10 시네마틱 구현 유지.
- Hero 이후는 `12fa1c8` 클래식 디자인의 선택 복원.
- 최종 섹션 순서와 classic surface 수치.
- 금지된 증거·SLA.
- Contact 보안·접근성 보존 경계.

- [ ] **Step 3: 금지 문구와 dead reference scan**

Run:

```bash
rg -n "24/7|4시간|30\\+|95%\\+|자동 NDA|experience|projectExperience|TrustSection|ReviewsSection|CaseStoriesSection|QualityStandardSection|ReviewMethodSection|useLandingSceneMotion" src DESIGN.md PRODUCT.md
```

Expected: no matches.

- [ ] **Step 4: 포트 3000 시각 QA**

다음 네 캡처를 만든다.

- `1280×720` first viewport
- `1280×720` full page
- `390×844` first viewport
- `390×844` full page

확인 항목:

- Hero full-bleed와 particle silhouette가 기존과 동일하다.
- Hero 다음부터 클래식 배경·카드·간격으로 자연스럽게 전환된다.
- 팀 카드에 연차·위치·완료 사례가 없다.
- cursor가 Hero, 밝은 surface, 버튼, 문의 surface에서 보인다.
- mobile header, card, form, footer에 overflow가 없다.

- [ ] **Step 5: 전체 검증**

Run sequentially:

```bash
pnpm exec playwright test --workers=1
pnpm lint
pnpm build
graphify update .
git diff --check
```

Expected:

- Playwright: 0 failed; 환경 guard의 기존 skip만 허용.
- ESLint: 0 errors. 기존 `prefer-tag-over-role` warnings는 보고.
- Build: client, SSR, Nitro, `/`, `/privacy`, `/terms` prerender PASS.
- Graphify: exit 0.
- Diff check: no whitespace errors.

- [ ] **Step 6: 최종 커밋과 상태 확인**

```bash
git add e2e/landing-anti-slop.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts e2e/landing.chrome.spec.ts DESIGN.md PRODUCT.md
git commit -m "docs(landing): 클래식 선택 복원 계약 확정"
git status --short --branch
```

Expected: clean worktree on `codex/landing-classic-restoration`. 사용자의 별도 지시 없이 `master` merge 또는 push를 수행하지 않는다.
