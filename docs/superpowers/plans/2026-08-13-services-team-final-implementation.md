# Services and Team Final Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 승인된 Services A안을 유일한 서비스 UI로 고정하고, 확정 문구를 반영한 뒤 Team 역할 카드를 B안의 단일 화이트 에디토리얼 카드 문법으로 교체한다.

**Architecture:** Services는 `servicePhases` 설정과 `ServicesCapabilityMap`만 사용하는 정적 섹션으로 단순화하고 URL 기반 미리보기 분기를 제거한다. Team은 기존 `teamRoles` 데이터는 그대로 유지하면서 마크업과 CSS만 카드 단위의 진입 모션을 소유하도록 바꾼다. 기존 랜딩 페이지의 `data-landing-reveal` 관찰자와 CSS 변수만 재사용하며 새 런타임 의존성은 추가하지 않는다.

**Tech Stack:** React 19, TypeScript, CSS Modules, Playwright, pnpm, Vite

## Global Constraints

- 기준 디자인 문서는 `docs/superpowers/specs/2026-08-13-services-team-final-design.md`다.
- Services 제목은 `기술보다 먼저, 쓰임을 생각합니다.`로 고정하고 화면에서는 두 줄로 나눈다.
- Services 설명은 `사용자와 운영자가 실제로 마주하는 흐름을 살피고, 필요한 기능과 시스템을 그에 맞게 설계합니다.`로 고정한다.
- Services A의 `BUILD / CONNECT / OPERATE`, `01 / 02 / 03`, 연속 세로선, AI 통합·AX 내용을 보존한다.
- `?services=b`와 `?services=c`를 포함한 모든 URL에서 A만 렌더링한다.
- Team 데이터의 역할명, 책임 문구, 범위 항목은 변경하지 않는다.
- Team 카드는 동일한 흰색 표면으로 만들고 테두리, 상단 컬러선, 그라디언트, 그림자, 장식 도형, hover 이동을 사용하지 않는다.
- Team 역할 범위는 pill이 아니라 `/`로 구분한 일반 텍스트 목록으로 표현한다.
- 진입 모션만 사용하며 `prefers-reduced-motion: reduce`에서는 즉시 표시한다.
- 새 패키지를 설치하지 않는다.
- 현재 작업 트리의 Hero, Header, Navigation 및 다른 E2E 변경은 사용자의 작업이다. 이 계획의 경로만 선택적으로 스테이징하고 다른 변경을 되돌리거나 포함하지 않는다.
- 로컬 브라우저 검증은 반드시 `http://127.0.0.1:3000`을 사용한다.

---

## Task 1: Services A안을 유일한 서비스 UI로 고정

**Files:**

- Modify: `src/pages/landing/ui/services-section.tsx`
- Keep/Add: `src/pages/landing/ui/services-capability-map.tsx`
- Delete: `src/pages/landing/ui/services-bento-grid.tsx`
- Delete: `src/pages/landing/ui/styles/services-bento-grid.module.css`
- Delete: `src/pages/landing/ui/use-services-preview-variant.ts`
- Keep/Modify: `src/pages/landing/config/index.ts`
- Keep/Modify: `src/pages/landing/config/services.ts`
- Keep/Modify: `src/pages/landing/model/types.ts`
- Keep/Modify: `src/pages/landing/ui/icons.tsx`
- Keep/Modify: `src/pages/landing/ui/styles/services.module.css`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- `ServicesSection`은 URL 상태를 읽지 않는 순수 렌더 컴포넌트가 된다.
- `ServicesCapabilityMap`은 `servicePhases`를 사용하고 루트에 `data-capability-map`을 유지한다.
- `ServiceItem.key`는 `web | system | api | ai | operations`다.
- `ServiceItem.scopes`는 정확히 세 항목의 튜플이다.
- `ServicePhase.label`은 `BUILD | CONNECT | OPERATE`다.

- [ ] **Step 1: 제거될 미리보기 계약 대신 최종 A 계약을 검사하는 실패 테스트를 작성한다.**

`e2e/landing-cinematic-editorial.chrome.spec.ts`에서 아래 테스트들을 제거한다.

- `keeps A as the default and exposes B through development previews`
- `keeps A as the fallback when the removed C preview is requested`
- `renders B as an asymmetric five-card Bento without fake controls`
- `renders B without SVG decorations, accent rails, pill chips, or card lift`
- `reveals B cards in reading order when Services enters the viewport`

그 자리에 다음 테스트를 추가한다.

```ts
test('fixes Services to the approved A ledger and copy for every preview query', async ({
  page,
}) => {
  for (const path of ['/', '/?services=b', '/?services=c']) {
    await page.goto(path);

    const services = page.locator('#services');
    await expect(
      services.getByRole('heading', {
        level: 2,
        name: '기술보다 먼저, 쓰임을 생각합니다.',
      }),
    ).toBeVisible();
    await expect(
      services.getByText(
        '사용자와 운영자가 실제로 마주하는 흐름을 살피고, 필요한 기능과 시스템을 그에 맞게 설계합니다.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(services.locator('[data-capability-map]')).toHaveCount(1);
    await expect(services.locator('[data-services-bento], [data-services-variant]')).toHaveCount(0);
  }
});
```

- [ ] **Step 2: 새 테스트가 현재 구현에서 실패하는지 확인한다.**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "fixes Services to the approved A ledger and copy" --workers=1
```

Expected: `/?services=b`에서 Bento가 렌더링되거나 확정 제목·설명이 없어서 실패한다.

- [ ] **Step 3: Services 섹션을 A 전용 마크업으로 교체한다.**

`src/pages/landing/ui/services-section.tsx` 전체를 다음 형태로 정리한다.

```tsx
import { cx } from './lib/cx';
import { ServicesCapabilityMap } from './services-capability-map';
import styles from './styles/services.module.css';
import sharedStyles from './styles/shared.module.css';

export function ServicesSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, sharedStyles.bgSoft, sharedStyles.section)}
      id='services'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container} data-classic-surface>
        <div className={cx(styles.serviceLayout, sharedStyles.gridLayout)}>
          <div
            className={cx(styles.serviceLead, sharedStyles.reveal, sharedStyles.revealLeft)}
            data-landing-reveal='left'
          >
            <h2 className={sharedStyles.sectionTitle}>
              기술보다 먼저,
              <br />
              쓰임을 생각합니다.
            </h2>
            <p className={sharedStyles.sectionDesc}>
              사용자와 운영자가 실제로 마주하는 흐름을 살피고, 필요한 기능과 시스템을 그에 맞게
              설계합니다.
            </p>
          </div>
          <div
            className={cx(styles.capabilityFlow, sharedStyles.reveal, sharedStyles.revealRight)}
            data-landing-reveal='right'
          >
            <ServicesCapabilityMap />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: A안 데이터와 타입이 최종 서비스 범위를 온전히 표현하는지 고정한다.**

`src/pages/landing/model/types.ts`에 다음 계약을 유지한다.

```ts
export type IconName = 'check' | 'clock' | 'desktop' | 'link' | 'shield' | 'sparkles' | 'system';

export type ServiceKey = 'web' | 'system' | 'api' | 'ai' | 'operations';

export interface ServiceItem {
  key: ServiceKey;
  title: string;
  description: string;
  icon: IconName;
  scopes: [string, string, string];
}

export interface ServicePhase {
  key: 'build' | 'connect' | 'operate';
  index: string;
  label: 'BUILD' | 'CONNECT' | 'OPERATE';
  title: string;
  services: ServiceItem[];
}
```

`src/pages/landing/config/services.ts`의 `servicePhases`는 아래 구조와 문구를 유지한다.

```ts
export const servicePhases: ServicePhase[] = [
  {
    key: 'build',
    index: '01',
    label: 'BUILD',
    title: '제품과 업무의 기반을 만듭니다.',
    services: [
      {
        key: 'web',
        title: '웹·앱 개발',
        description: '사용자가 실제로 쓰기 쉬운 화면과 현장 업무에 맞는 앱을 구현합니다.',
        icon: 'desktop',
        scopes: ['웹 서비스', '모바일 앱', '관리자 화면'],
      },
      {
        key: 'system',
        title: '업무 시스템 구축',
        description: '반복 업무와 수기 관리를 줄이고 데이터 기반으로 일할 수 있는 구조를 만듭니다.',
        icon: 'system',
        scopes: ['업무 흐름', '데이터 관리', '권한 설계'],
      },
    ],
  },
  {
    key: 'connect',
    index: '02',
    label: 'CONNECT',
    title: '필요한 기술을 하나의 흐름으로 연결합니다.',
    services: [
      {
        key: 'api',
        title: '연동·API',
        description:
          '인증, 결제, 알림, 파일 업로드 등 운영에 필요한 외부 서비스를 안정적으로 연결합니다.',
        icon: 'link',
        scopes: ['인증·결제', '알림', '파일·외부 API'],
      },
      {
        key: 'ai',
        title: 'AI 통합·AX',
        description:
          '기존 AI 모델과 API를 활용해 챗봇, 문서 검색, 업무 자동화를 서비스와 사내 시스템에 연결합니다.',
        icon: 'sparkles',
        scopes: ['AI 챗봇', '문서 검색', '업무 자동화'],
      },
    ],
  },
  {
    key: 'operate',
    index: '03',
    label: 'OPERATE',
    title: '출시 이후까지 안정적으로 운영합니다.',
    services: [
      {
        key: 'operations',
        title: '운영·유지보수',
        description: '배포 이후의 오류 대응, 기능 개선, 성능 점검까지 지속적으로 관리합니다.',
        icon: 'shield',
        scopes: ['오류 대응', '기능 개선', '성능 점검'],
      },
    ],
  },
];

export const services: ServiceItem[] = servicePhases.flatMap((phase) => phase.services);
```

`src/pages/landing/config/index.ts`에서 `servicePhases`를 export하고, `src/pages/landing/ui/icons.tsx`에서 `sparkles`를 Lucide `Sparkles`에 연결한다.

- [ ] **Step 5: A안의 시각·반응형 계약을 보존하고 B 전용 파일을 삭제한다.**

`src/pages/landing/ui/services-capability-map.tsx`와 `src/pages/landing/ui/styles/services.module.css`에서 다음을 확인한다.

- `data-capability-map`과 3개의 `data-capability-phase`가 존재한다.
- 01/02/03을 연결하는 세로선은 `capabilityMap::before/::after` 한 쌍이 소유한다.
- 단계 사이 `border-bottom`은 없다.
- `@container (max-width: 960px)`에서 단계 머리와 서비스 목록이 오른쪽 한 열로 재배치된다.
- 서비스 hover는 위치를 이동하지 않고 미세한 배경/색 변화만 사용한다.
- 진입은 `opacity: 0`과 `translate3d(0, 12px, 0)`에서 시작한다.
- reduced motion에서는 선과 단계가 즉시 최종 상태로 표시된다.

다음 B 전용 파일을 완전히 삭제한다.

```text
src/pages/landing/ui/services-bento-grid.tsx
src/pages/landing/ui/styles/services-bento-grid.module.css
src/pages/landing/ui/use-services-preview-variant.ts
```

- [ ] **Step 6: Services 관련 테스트를 통과시킨다.**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "fixes Services to the approved A ledger and copy|renders A as a flat capability ledger|keeps A service copy readable" --workers=1
```

Expected: 3 tests pass.

- [ ] **Step 7: B 전용 파일과 참조가 완전히 사라졌는지 확인한다.**

Run:

```bash
test ! -e src/pages/landing/ui/services-bento-grid.tsx
test ! -e src/pages/landing/ui/styles/services-bento-grid.module.css
test ! -e src/pages/landing/ui/use-services-preview-variant.ts
rg "ServicesBentoGrid|useServicesPreviewVariant|data-services-bento|data-services-variant" src e2e/landing-cinematic-editorial.chrome.spec.ts
```

Expected: 세 파일 검사는 성공하고 `rg`는 결과 없이 종료 코드 1을 반환한다.

- [ ] **Step 8: Services 범위만 선택적으로 커밋한다.**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts \
  src/pages/landing/config/index.ts \
  src/pages/landing/config/services.ts \
  src/pages/landing/model/types.ts \
  src/pages/landing/ui/icons.tsx \
  src/pages/landing/ui/services-capability-map.tsx \
  src/pages/landing/ui/services-section.tsx \
  src/pages/landing/ui/styles/services.module.css
git diff --cached --check
git diff --cached --name-only
git commit -m "feat(landing): 서비스 A안을 최종 적용"
```

Expected: 출력된 staged 파일이 위 Services 범위와 정확히 일치한다. 삭제 대상은 현재 untracked 파일이므로 삭제 후 별도 index 항목이 생기지 않는다.

---

## Task 2: Team 역할 카드를 단일 화이트 에디토리얼 카드로 교체

**Files:**

- Modify: `src/pages/landing/ui/team-section.tsx`
- Modify: `src/pages/landing/ui/styles/team.module.css`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- 역할 그리드 루트는 `data-team-role-grid`와 기존 `data-landing-reveal='right'`를 함께 가진다.
- 각 카드는 `data-team-role-card={role.badge}`를 가진다.
- 역할 코드는 `data-team-role-index`를 가진 일반 텍스트다.
- 역할 범위는 `<ul>`/`<li data-team-role-scope>`로 표현한다.
- 카드와 범위 텍스트는 링크나 버튼이 아니다.

- [ ] **Step 1: 최종 Team 카드 표면과 비상호작용 계약을 검사하는 실패 테스트를 작성한다.**

`e2e/landing-cinematic-editorial.chrome.spec.ts`에 다음 테스트를 추가한다.

```ts
test('renders Team as equal white editorial role cards without decorative chrome', async ({
  page,
}) => {
  await page.goto('/');

  const team = page.locator('#team');
  const cards = team.locator('[data-team-role-card]');
  await expect(cards).toHaveCount(5);
  await expect(cards.locator('[data-team-role-scope]')).toHaveCount(15);
  await expect(team.locator('a, button, [tabindex]')).toHaveCount(0);

  const surfaces = await cards.evaluateAll((items) =>
    items.map((item) => {
      const styles = getComputedStyle(item);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        borderWidth: styles.borderTopWidth,
        boxShadow: styles.boxShadow,
        borderRadius: Number.parseFloat(styles.borderRadius),
        accentContent: getComputedStyle(item, '::before').content,
      };
    }),
  );

  expect(surfaces).toEqual(
    Array.from({ length: 5 }, () => ({
      backgroundColor: 'rgb(255, 255, 255)',
      backgroundImage: 'none',
      borderWidth: '0px',
      boxShadow: 'none',
      borderRadius: 14,
      accentContent: 'none',
    })),
  );

  const firstCard = cards.first();
  await firstCard.scrollIntoViewIfNeeded();
  await expect(team.locator('[data-team-role-grid]')).toHaveAttribute(
    'data-landing-visible',
    'true',
  );
  await page.waitForTimeout(550);
  const beforeHover = await firstCard.evaluate((item) => getComputedStyle(item).transform);
  await firstCard.hover();
  expect(await firstCard.evaluate((item) => getComputedStyle(item).transform)).toBe(beforeHover);
});
```

- [ ] **Step 2: 카드 순차 진입과 reduced motion을 검사하는 실패 테스트를 작성한다.**

같은 파일에 다음 테스트를 추가한다.

```ts
test('reveals Team role cards in reading order and respects reduced motion', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');

  const grid = page.locator('#team [data-team-role-grid]');
  const cards = grid.locator('[data-team-role-card]');
  await expect(cards).toHaveCount(5);
  await expect(grid).not.toHaveAttribute('data-landing-visible', 'true');
  expect(await cards.first().evaluate((item) => getComputedStyle(item).opacity)).toBe('0');
  expect(await cards.last().evaluate((item) => getComputedStyle(item).transitionDelay)).toContain(
    '0.24s',
  );

  await grid.scrollIntoViewIfNeeded();
  await expect(grid).toHaveAttribute('data-landing-visible', 'true');
  await expect
    .poll(() => cards.last().evaluate((item) => getComputedStyle(item).opacity))
    .toBe('1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const reducedCards = page.locator('#team [data-team-role-card]');
  await expect(reducedCards).toHaveCount(5);
  expect(
    await reducedCards.evaluateAll((items) =>
      items.every((item) => {
        const styles = getComputedStyle(item);
        return (
          styles.opacity === '1' &&
          styles.transform === 'none' &&
          Number.parseFloat(styles.transitionDuration) === 0
        );
      }),
    ),
  ).toBe(true);
});
```

- [ ] **Step 3: 새 테스트들이 현재 Team 카드에서 실패하는지 확인한다.**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "renders Team as equal white editorial role cards|reveals Team role cards in reading order" --workers=1
```

Expected: `data-team-role-card`가 없고 기존 카드가 테두리·그라디언트·그림자·hover 이동을 사용하므로 실패한다.

- [ ] **Step 4: Team 마크업을 에디토리얼 카드 구조로 교체한다.**

`src/pages/landing/ui/team-section.tsx`의 역할 그리드 부분을 다음으로 바꾼다. 그리드 자체의 `sharedStyles.reveal`과 `sharedStyles.revealRight` 클래스는 제거하고 `data-landing-reveal` 속성만 남겨 카드별 모션과 충돌하지 않게 한다.

```tsx
<div
  className={cx(styles.roleGrid, sharedStyles.twoColumnList)}
  data-landing-reveal='right'
  data-team-role-grid
>
  {teamRoles.map((role) => (
    <article key={role.badge} className={styles.roleCard} data-team-role-card={role.badge}>
      <span className={styles.roleIndex} data-team-role-index>
        {role.badge}
      </span>
      <h3>{role.title}</h3>
      <p className={styles.roleJob}>{role.responsibility}</p>
      <ul className={styles.roleScopes} aria-label={`${role.title} 역할 범위`}>
        {role.tags.map((tag) => (
          <li key={tag} data-team-role-scope>
            {tag}
          </li>
        ))}
      </ul>
    </article>
  ))}
</div>
```

- [ ] **Step 5: Team CSS를 장식 없는 동일 표면과 카드별 진입 모션으로 교체한다.**

`src/pages/landing/ui/styles/team.module.css`를 다음으로 교체한다.

```css
.teamSection {
  --section-accent: #8a4a00;
}

.teamLayout {
  grid-template-columns: 330px minmax(0, 1fr);
  gap: clamp(90px, 8vw, 128px);
}

.roleGrid {
  gap: 16px;
}

.roleCard {
  display: flex;
  min-width: 0;
  min-height: 276px;
  flex-direction: column;
  padding: 28px 28px 25px;
  border: 0;
  border-radius: 14px;
  background: #fff;
  box-shadow: none;
  opacity: 1;
  transform: none;
  transition:
    opacity 0.48s var(--ease),
    transform 0.48s var(--ease);
}

:global(body[data-landing-ready='true']) .roleGrid:not([data-landing-visible='true']) .roleCard {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
}

.roleGrid[data-landing-visible='true'] .roleCard {
  opacity: 1;
  transform: none;
}

.roleGrid .roleCard:nth-child(2) {
  transition-delay: 0.06s;
}

.roleGrid .roleCard:nth-child(3) {
  transition-delay: 0.12s;
}

.roleGrid .roleCard:nth-child(4) {
  transition-delay: 0.18s;
}

.roleGrid .roleCard:nth-child(5) {
  transition-delay: 0.24s;
}

.roleIndex {
  color: #66738a;
  font-size: 11px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.12em;
}

.roleCard h3 {
  margin: 42px 0 14px;
  color: var(--navy);
  font-size: clamp(21px, 2vw, 27px);
  line-height: 1.2;
  font-weight: 920;
  letter-spacing: -0.035em;
}

.roleJob {
  margin: 0;
  color: #65718a;
  font-size: 14px;
  line-height: 1.72;
  text-wrap: pretty;
}

.roleScopes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 0;
  margin: auto 0 0;
  padding: 28px 0 0;
  color: #4f5e76;
  list-style: none;
}

.roleScopes li {
  font-size: 13px;
  font-weight: 720;
  line-height: 1.5;
}

.roleScopes li:not(:last-child)::after {
  content: '/';
  margin: 0 9px;
  color: #aab4c4;
  font-weight: 500;
}

@media (max-width: 1180px) {
  .teamLayout {
    grid-template-columns: 1fr;
    gap: 72px;
  }
}

@media (max-width: 560px) {
  .teamLayout {
    gap: 52px;
  }

  .roleCard {
    min-height: 238px;
    padding: 24px 22px 22px;
  }

  .roleCard h3 {
    margin-top: 34px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .roleCard {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

CSS에 `.roleCard:hover`, `.roleBadge`, `.tag`, `::before`, `linear-gradient`, `box-shadow` 규칙을 다시 추가하지 않는다.

- [ ] **Step 6: Team 관련 테스트를 통과시킨다.**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "renders Team as equal white editorial role cards|reveals Team role cards in reading order|preserves classic reveal targets" --workers=1
```

Expected: 3 tests pass.

- [ ] **Step 7: Team 범위만 선택적으로 커밋한다.**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts \
  src/pages/landing/ui/team-section.tsx \
  src/pages/landing/ui/styles/team.module.css
git diff --cached --check
git diff --cached --name-only
git commit -m "feat(landing): 팀 역할 카드를 에디토리얼 표면으로 정리"
```

Expected: 출력된 staged 파일이 위 세 경로와 정확히 일치한다.

---

## Task 3: 통합 검증과 실제 브라우저 확인

**Files:**

- Verify: `src/pages/landing/**`
- Verify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Verify: `e2e/landing-classic-restoration.chrome.spec.ts`
- Verify: `e2e/landing-anti-slop.chrome.spec.ts`
- Verify: `e2e/a11y/landing.static.a11y.spec.ts`
- Update generated graph: `graphify-out/**`

- [ ] **Step 1: 변경 파일의 포맷과 정적 검사를 실행한다.**

```bash
pnpm exec prettier --check \
  src/pages/landing/config/index.ts \
  src/pages/landing/config/services.ts \
  src/pages/landing/model/types.ts \
  src/pages/landing/ui/icons.tsx \
  src/pages/landing/ui/services-capability-map.tsx \
  src/pages/landing/ui/services-section.tsx \
  src/pages/landing/ui/styles/services.module.css \
  src/pages/landing/ui/team-section.tsx \
  src/pages/landing/ui/styles/team.module.css \
  e2e/landing-cinematic-editorial.chrome.spec.ts
pnpm lint
pnpm build
```

Expected: Prettier와 build는 성공한다. lint는 오류 0개여야 하며, 기존 FAQ 경고가 남는 경우 최종 보고에 기존 경고로 명시한다.

- [ ] **Step 2: 랜딩 관련 회귀 테스트를 실행한다.**

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test \
  e2e/landing-cinematic-editorial.chrome.spec.ts \
  e2e/landing-classic-restoration.chrome.spec.ts \
  e2e/landing-anti-slop.chrome.spec.ts \
  e2e/a11y/landing.static.a11y.spec.ts \
  --workers=2
```

Expected: 모든 테스트가 통과한다. 실패하면 Services/Team 변경으로 인한 회귀인지 먼저 좁혀 수정하고 같은 명령을 다시 실행한다.

- [ ] **Step 3: 지식 그래프를 갱신한다.**

```bash
graphify update .
```

Expected: 갱신이 성공한다. `graphify-out/**`의 자동 생성 변경은 기존 작업 트리와 분리해서 유지하고 제품 코드 커밋에 섞지 않는다.

- [ ] **Step 4: Codex 내부 브라우저에서 데스크톱 화면을 확인한다.**

`http://127.0.0.1:3000/#services`를 내부 브라우저에서 열어 다음을 확인한다.

- 작은 `Our Services` kicker가 없다.
- 제목과 설명이 확정 문구로 표시된다.
- BUILD/CONNECT/OPERATE와 AI 통합·AX가 보인다.
- 01/02/03의 세로선은 하나로 이어지고 단계 사이 가로 구분선은 없다.
- 카드 hover 시 위치가 움직이지 않는다.

`http://127.0.0.1:3000/#team`에서 다음을 확인한다.

- 다섯 카드가 같은 흰색 표면이다.
- 카드에 테두리, 컬러 상단선, 그라디언트, 그림자, 장식 도형이 없다.
- 역할 범위가 pill이 아니라 `/` 구분 텍스트다.
- 스크롤 진입 시 카드가 위로 12px 이내에서 순서대로 나타난다.
- hover 시 카드가 움직이지 않는다.

- [ ] **Step 5: 내부 브라우저에서 좁은 화면과 reduced motion을 확인한다.**

- 1181px 부근에서 Services 오른쪽 콘텐츠가 눌리거나 가로 스크롤이 생기지 않는다.
- 390px에서 Services와 Team이 한 열로 읽히고 텍스트가 잘리지 않는다.
- reduced motion 환경에서 두 섹션의 콘텐츠가 기다림 없이 모두 보인다.
- 브라우저 콘솔에 새 오류가 없다.

- [ ] **Step 6: 최종 범위와 작업 트리 상태를 확인한다.**

```bash
git diff --check
git status --short
git log -2 --oneline
```

Expected: 두 구현 커밋이 존재하고, 남은 변경은 사용자 소유의 기존 변경 또는 `graphify-out/**` 자동 생성 변경뿐이다. 검증 중 제품 코드 수정이 추가됐다면 해당 Task의 파일만 다시 선택적으로 스테이징해 적절한 구현 커밋에 보완 커밋으로 남긴다.
