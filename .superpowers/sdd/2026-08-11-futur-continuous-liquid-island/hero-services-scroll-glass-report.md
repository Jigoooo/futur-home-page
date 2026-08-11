# Hero/Services Scroll Glass Optimization Report

## Result

- Header의 liquid-glass 외형은 정지 상태에서 기존 값 그대로 유지한다.
- 실제 scroll 이벤트가 이어지는 동안에만 Header root가
  `data-header-scrolling='true'`를 노출하고 glass backdrop 합성을 `none`으로 내린다.
- 마지막 scroll 이벤트 후 160ms가 지나면 marker를 제거하고 정확한
  `blur(20px) saturate(1.35) contrast(1.03)`을 복원한다.
- React state, dependency, Hero particle/WebGL production 변경은 없다.

## TDD evidence

### RED

Production 변경 전에 1920×1080, DPR 2 focused E2E를 추가하고 실행했다.

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test \
  e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --workers=1 \
  --grep "suspends only the Header blur"
```

결과: `1 failed`, exit `1`.

- at-rest 20px glass, dark tint/rim, WebGL2, 70,000 main particles, 4,000 emitter,
  DPR 2 canvas, 4-pass draw sequence는 먼저 통과했다.
- 실제 `window.scrollTo()` 뒤 `data-header-scrolling='true'`를 기대했지만 marker가 없어
  정확히 실패했다.

### GREEN

같은 focused gate 결과: `1 passed (2.7s)`, exit `0`.

추가로 burst scroll 세 번 동안 MutationObserver가 본 marker 변경은 정확히
`['true', null]`이며, 마지막 scroll 이후 140~200ms 경계 안에서 복원되는 것을 검증한다.
스크롤 중 standard computed `backdrop-filter`는 `none`, Chrome에서 지원하지 않는 WebKit
computed alias는 기존 플랫폼 계약대로 빈 문자열이다. CSS에는 standard와 prefixed 선언을
모두 `none`으로 둔다.

## Implementation

- `use-adaptive-header.ts`
  - passive scroll listener 하나와 idle timer 하나를 추가했다.
  - marker가 이미 있으면 dataset을 다시 쓰지 않고 timer만 refresh한다.
  - cleanup에서 timer, marker, listener를 모두 정리한다.
  - viewport/layout 조건을 두지 않아 desktop/mobile, hash navigation, smooth/programmatic
    scroll을 같은 실제 scroll event 경계로 처리한다.
- `header.module.css`
  - `.nav[data-header-scrolling='true'] .glassShell`에만 standard/prefixed backdrop `none`을
    적용했다.
  - 기존 at-rest 20px filter와 fallback/high-contrast 블록은 변경하지 않았다.
- `landing-adaptive-island.chrome.spec.ts`
  - 1920×1080/DPR2 quality contract와 scroll lifecycle 회귀를 추가했다.
  - 기존 fallback 테스트는 transient marker 해제 후 at-rest glass 값을 읽도록 동기화했다.

## Verification

- Focused scroll-glass: `1/1` passed.
- Full Adaptive Header: `39/39` passed.
- Hero + runtime errors: `16/16` passed.
- axe a11y: `11/11` passed.
- touched-file ESLint: exit `0`.
- `pnpm lint`: exit `0`, 기존 out-of-scope FAQ `jsx-a11y/prefer-tag-over-role` warning 1건.
- `pnpm exec tsc -b --pretty false`: exit `0`.
- `pnpm build`: exit `0`; client, SSR, Nitro 및 `/`, `/privacy`, `/terms` prerender 완료.
- `graphify update .`: exit `0`; 874 nodes, 1,146 edges, 91 communities.
- `git diff --check`: exit `0`.

## Visual check

port 3000, 1920×1080 in-app browser에서 확인했다.

- at rest: marker 없음, exact 20px filter, dark background/rim 유지.
- smooth-scroll frame: marker `true`, filter `none`, background/rim과 Header geometry 유지.
- 500ms 후: marker 없음, exact 20px filter 복원.
- 두 캡처 모두 Header typography, rim, rounded shell과 Hero particle appearance에 시각적 파손이
  없었다.

## Concerns

- Chrome은 `-webkit-backdrop-filter` computed alias를 지원하지 않아 빈 문자열로 보고한다.
  standard computed 값과 prefixed CSS declaration을 각각 검증했으며, WebKit 엔진 자체의
  computed alias 동작은 이 Chrome project가 직접 증명하지 않는다.
- 이 변경은 제공된 profiling에서 비용 차이가 확인된 scroll-time blur 합성만 제거한다.
  production WebGL 경로와 particle quality는 그대로이며, 새 E2E가 70k/4-pass/DPR2 경계를
  고정한다.

## Review Important round

Production 변경 없이 `landing-adaptive-island.chrome.spec.ts`의 quality boundary만 강화했다.

### Scroll-time Hero quality RED

- 실제 scroll 직전에 `__heroDrawCalls`를 비우도록 변경했다.
- test instrumentation에 scrolling marker가 있는 동안 draw call을 기록하지 않는 임시 mutation을
  넣었다.
- focused gate는 `1 failed`, exit `1`이었다. marker가 idle 전에 사라져 scroll-time frame 계약이
  실패했다.
- mutation을 제거하고, marker가 `true`인 rAF에서만 새
  `TRIANGLES(3) → POINTS(70k) → POINTS(70k) → POINTS(4k)` sequence를 인정하도록 샘플링을
  안정화했다.
- 같은 marker 생존 snapshot에서 particle/emitter count `70000/4000`, DPR `2`, CSS 크기의 정확한
  2배 backing canvas width/height를 다시 검증한다.

### Services light glass RED

- Services light scrolling selector만 `blur(20px) !important`로 되돌리는 test-local style
  mutation을 넣었다.
- focused gate는 expected `none`, received `blur(20px)`로 `1 failed`, exit `1`이었다.
- mutation을 제거하고 Services 내부에서 3-rAF actual scroll burst를 수행한다. marker `true` 동안
  filter `none`, background `rgba(248, 250, 255, 0.26)`, rim
  `rgba(255, 255, 255, 0.58)`을 함께 검증하고 idle 뒤 exact 20px filter 복원을 확인한다.

### Review GREEN

- Focused repeat: `5/5` passed.
- Full Adaptive Header: `39/39` passed.
- Hero + runtime errors: `16/16` passed.
- axe a11y: `11/11` passed.
- touched-file ESLint, `pnpm exec tsc -b --pretty false`, `git diff --check`: exit `0`.
- production diff: `0` files.
