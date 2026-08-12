# 001 — Header live blur를 정적 글라스와 교차 전환한다

- **Status**: SUPERSEDED by [002](./002-persistent-header-blur.md)
- **Commit**: dd0c537, 0121956
- **Severity**: HIGH
- **Category**: Performance, Interruptibility, Cohesion
- **Estimated scope**: production 3 files, E2E 1 file

## Problem

> 이 계획은 구현 후 사용자 시각 검토에서 blur가 사라졌다 복원되는 변화 자체가 더 어색하다고
> 판정되어 폐기됐다. 현재 계약은 002를 따른다.

`src/pages/landing/ui/styles/header.module.css:46`의 live `backdrop-filter`를 스크롤 시작과 동시에 `none`으로 바꾸면서 합성 비용은 줄었지만, 정지 상태의 20px frosted glass와 스크롤 상태의 선명한 배경이 한 프레임에 교체된다.

```css
/* src/pages/landing/ui/styles/header.module.css:46 — current */
.glassShell {
  -webkit-backdrop-filter: blur(20px) saturate(135%) contrast(1.03);
  backdrop-filter: blur(20px) saturate(135%) contrast(1.03);
}

.nav[data-header-scrolling='true'] .glassShell {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
```

1920×1080, DPR2, WebGL 70k/4-pass 측정에서 `blur(0px)`는 DrawAndSwap 평균 0.238ms로 `none` 0.090ms보다 2.64배 비쌌다. 따라서 blur 값을 20→0으로 보간한 채 유지하면 성능 목표를 충족하지 못한다.

## Target

- live backdrop을 `glassShell`과 분리된 장식 레이어로 옮긴다.
- Apple Liquid Glass의 `Scroll Edge Effect` 원리를 따라, 스크롤 중에는 Header 아래쪽에 정적 soft-edge gradient를 함께 드러내 배경 콘텐츠가 유리 아래로 부드럽게 dissolve되는 인상을 준다. 이 레이어에는 `backdrop-filter`를 적용하지 않는다.
- 정지 상태는 기존 `blur(20px) saturate(135%) contrast(1.03)`와 tint/rim을 그대로 유지한다.
- 스크롤 시작 시 live backdrop 레이어의 `opacity`를 `160ms var(--ease-in-out)`로 `1 → 0` 전환한다.
- opacity 전환이 끝난 뒤 live backdrop 레이어의 standard/WebKit `backdrop-filter`를 실제 `none`으로 바꾼다.
- 마지막 scroll event 160ms 후에는 투명 상태에서 20px filter를 먼저 준비하고, 다음 animation frame부터 `160ms var(--ease-out)`로 `0 → 1` 복원한다.
- 빠르게 방향을 바꾸거나 복원 중 다시 스크롤해도 CSS opacity transition이 현재 프레임에서 retarget되어 컷이나 restart가 없어야 한다.
- reduced-motion에서는 opacity 전환 없이 즉시 suspend/restore한다.
- WebGL 70k/4-pass/DPR2, Header geometry, dark/light tint/rim, active indicator는 변경하지 않는다.

## Repo conventions to follow

- fade-out/Scroll Edge 진입은 `src/styles/tokens.css`의 기존 `--ease-in-out`, 복원은
  `--ease-out`을 재사용한다.
- scroll lifecycle은 `src/pages/landing/ui/use-adaptive-header.ts`의 passive listener와 DOM dataset 방식을 유지한다. React state를 추가하지 않는다.
- 장식 레이어는 `aria-hidden="true"`이며 실제 메뉴·포커스 순서에 참여하지 않는다.
- animation은 layout 속성이 아니라 `opacity`만 사용한다.

## Reference basis

- WebKit은 dynamic backdrop filter가 추가 렌더 패스를 요구하므로 필요한 곳에만 쓰라고 명시한다: https://webkit.org/blog/3632/introducing-backdrop-filters/
- Chrome은 blur radius 자체를 애니메이션하는 대신 pre-rasterized blur copies를 opacity로 교차 전환하는 방향을 제시한다. 이 페이지는 dynamic blurred layers를 둘 이상 계속 샘플링하면 오히려 GPU 비용이 커진다고도 경고한다: https://developer.chrome.com/blog/animated-blur
- Apple WWDC25 Liquid Glass는 material을 tint, shadow, highlight, scroll-edge의 다층 시스템으로 설명하고, 스크롤 중 아래 콘텐츠를 부드럽게 dissolve하는 Scroll Edge Effect를 사용한다: https://developer.apple.com/videos/play/wwdc2025/219/
- 이 프로젝트의 배경은 계속 변하는 WebGL이므로 pre-rasterized backdrop cache를 만들 수 없다. 따라서 하나의 live blur layer만 짧게 fade-out한 뒤 실제 `none`으로 끄고, 정적 material layer와 soft scroll-edge로 지각적 연속성을 유지한다.

## Steps

1. `e2e/landing-adaptive-island.chrome.spec.ts`에 RED 계약을 먼저 추가한다.
   - scroll 시작 직후 backdrop layer opacity가 0과 1 사이의 중간값을 실제로 거친다.
   - 40–60ms 구간에서 backdrop opacity `>= 0.55`, Scroll Edge opacity `<= 0.45`를 확인한다.
   - 160ms 전환 뒤 opacity 0과 computed filter `none`을 확인한다.
   - idle 복원 중 opacity가 0과 1 사이를 거쳐 160ms 이내 1, filter exact 20px을 확인한다.
   - 전환 중 반대 입력을 줘도 opacity jump가 없고 최종 marker/filter가 정리된다.
   - WebGL 70k/4-pass/DPR2와 dark/light tint/rim은 active scroll 상태에서도 유지한다.
2. `src/pages/landing/ui/header-section.tsx`에 `data-header-backdrop-layer`와 `data-header-scroll-edge` 장식 레이어를 추가한다.
3. `src/pages/landing/ui/styles/header.module.css`에서 live backdrop filter를 새 레이어로 이동하고 opacity-only crossfade를 구현한다.
   - `glassShell`의 tint/rim/shadow는 유지한다.
   - unsupported/high-contrast에서는 backdrop layer filter를 `none`으로 고정하고 기존 94% fallback surface를 유지한다.
   - scroll-edge는 Header 하단 바깥에 18–28px 높이의 투명 gradient로 두고 `opacity`만 전환한다. 콘텐츠를 가리는 불투명 판이나 두 번째 glass로 만들지 않는다.
4. `src/pages/landing/ui/use-adaptive-header.ts`의 scroll lifecycle을 두 단계로 바꾼다.
   - enter: scrolling marker → 160ms 후 suspended marker.
   - idle: suspended 제거 → 다음 rAF scrolling 제거.
   - 단일 idle timer, 단일 suspend timer, 단일 restore rAF만 사용하고 cleanup에서 모두 취소한다.
   - repeated scroll event는 marker를 반복 기록하지 않는다.
5. 기존 Header/particle/fallback/reduced-motion 테스트 helper가 새 backdrop layer를 읽도록 갱신한다.

## Boundaries

- Hero particle engine, shader, DPR tier, count를 변경하지 않는다.
- Header geometry/active section/shared glide/mobile morph를 변경하지 않는다.
- tint, rim, inset highlight, typography를 변경하지 않는다.
- 새 dependency를 추가하지 않는다.
- 성능을 감추기 위해 particle 품질이나 canvas 해상도를 낮추지 않는다.

## Verification

- **Mechanical**:
  - `pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts --project=chrome --workers=1`
  - Hero/runtime 및 a11y 대상 회귀
  - `pnpm lint`
  - `pnpm exec tsc -b --pretty false`
  - `pnpm build`
  - `graphify update .`
  - `git diff --check`
- **Feel check**:
  - 포트 3000에서 Hero↔Our Services를 트랙패드로 천천히·빠르게 왕복한다.
  - blur가 한 프레임에 사라지거나 나타나지 않고 양방향 160ms 동안 짧게 교차 전환되는지
    확인한다.
  - 스크롤 중 Header 하단의 soft edge가 과한 흰 띠 없이 콘텐츠 경계를 살짝 dissolve하고, 정지 시 자연스럽게 사라지는지 확인한다.
  - 계속 스크롤하는 동안 정적 글라스의 tint/rim은 유지되고 WebGL 입자 밀도는 줄지 않는지 확인한다.
  - 복원 중 다시 스크롤해도 번쩍임이나 opacity restart가 없는지 확인한다.
  - reduced-motion에서는 컷 없는 즉시 최종 상태와 동일한 접근성을 확인한다.
- **Done when**: 활성 스크롤 steady-state는 live filter `none`, 정지 상태는 exact 20px이며, 두 방향 모두 실제 중간 opacity frame이 관측되고 전체 회귀가 통과한다.
