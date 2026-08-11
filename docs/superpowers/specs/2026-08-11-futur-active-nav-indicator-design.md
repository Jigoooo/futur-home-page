# FUTUR Shared Active Navigation Indicator 설계

## 1. 목적

데스크톱 Header의 활성 메뉴가 스크롤에 따라 바뀔 때 현재 밑줄은 이전 항목에서 사라지고 새
항목에 즉시 다시 렌더링된다. 메뉴는 계속 보이지만 활성 위치 변화는 정적이고 단절돼 보인다.

이번 변경은 하나의 공유 밑줄이 이전 메뉴에서 다음 메뉴로 짧게 이동하도록 만든다. 움직임은
명확히 인지되지만 시선을 빼앗지 않아야 하며, bounce·과도한 glow·반복 loop를 사용하지 않는다.

## 2. 승인된 방향

사용자가 선택한 A안인 `Shared Glide`를 적용한다.

- 데스크톱의 다섯 nav link 아래에 공유 indicator 하나만 둔다.
- 활성 section이 바뀌면 indicator가 이전 link의 x와 width에서 새 link의 x와 width로 이동한다.
- 새 위치에서 다시 그리는 방식이 아니라 이전 위치와 다음 위치 사이의 연속성이 보여야 한다.
- 작은 빛점, capsule blob, elastic overshoot는 추가하지 않는다.

## 3. 범위

### 포함

- 데스크톱 `desktop-fluid` nav의 공유 active indicator
- section tracking, hash navigation, resize에 따른 target geometry 재계산
- 빠른 스크롤과 반대 방향 입력의 interruption-safe motion
- reduced-motion과 hydration 전후 대체 경로
- 실제 중간 frame과 `aria-current` 정합성을 검증하는 E2E

### 제외

- 모바일 Compact/Expanded geometry와 3+2 menu timeline 변경
- 모바일의 open indicator follow-through 변경
- Header glass, particle, cursor, body section, contact/server 경계 변경
- 새 dependency 추가

## 4. DOM과 상태 권위

`aria-current='location'`을 활성 위치의 유일한 semantic source of truth로 유지한다. 각 link 안에서
조건부 indicator를 렌더링하지 않고, `menuLinks` 안에 다음 공유 장식 요소 하나를 항상 렌더링한다.

```tsx
<span data-header-active-indicator aria-hidden='true' />
```

Hero와 Footer처럼 활성 nav가 없는 상태에서는 indicator를 숨긴다. link의 접근성 이름과 tab order는
바뀌지 않는다. 공유 indicator는 pointer event를 받지 않는다.

## 5. Motion 계약

### 활성 link 변경

- duration: `200ms`
- easing: `power3.out`
- x와 width를 같은 timeline에서 보간한다.
- opacity는 최초 등장 시 `0 → 1`로 `120ms`, 숨김 시 `1 → 0`으로 `100ms`만 사용한다.
- 도착 직전 약 `60ms` 동안 specular opacity가 `0.35 → 0.18`로 안정되며 위치 overshoot는 없다.
- underline 두께는 `2px`을 유지하고 y축 이동은 사용하지 않는다.

### 빠른 스크롤과 반전

- 새 target이 들어오면 이전 tween의 종료를 기다리지 않는다.
- 현재 computed x/width를 시작값으로 새 target timeline을 만든다.
- 마지막 frame에서 target으로 jump하거나 이전 target을 경유하지 않는다.
- scroll frame마다 React state를 추가하거나 link 전체를 반복 query하지 않는다.

### Resize

- desktop resize는 한 번의 `requestAnimationFrame`에서 현재 active link rect를 다시 측정한다.
- resize 보정은 `160ms power2.out`으로 제한한다.
- 900px 이하로 전환하면 desktop indicator tween과 inline motion 값을 정리한다.

## 6. 시각 계약

- 색은 현재 active link의 `currentColor` 계열을 유지한다.
- 기본 opacity는 `0.82`, 도착 후 `1`로 고정하지 않는다.
- 넓은 glow 대신 indicator 양 끝 6px 안쪽에만 보이는 약한 specular를 사용한다.
- glass 뒤 배경과 nav text 대비를 바꾸지 않는다.
- indicator가 link text보다 먼저 시선을 끌 정도로 밝거나 두꺼워지면 실패다.

## 7. 접근성과 대체 경로

- `aria-current='location'`은 motion 시작 전에 즉시 새 link로 이동한다.
- indicator는 `aria-hidden='true'`이며 접근성 tree와 tab order에 들어가지 않는다.
- `prefers-reduced-motion: reduce`에서는 x, width, opacity를 즉시 최종값으로 적용한다.
- JavaScript 비활성 상태에서는 기존 nav link와 keyboard navigation을 그대로 노출하고 공유
  indicator motion은 실행하지 않는다.
- focus-visible outline은 indicator와 독립적으로 유지한다.

## 8. 테스트 계약

### Semantic

- Services, Stack, Team으로 이동할 때 `aria-current='location'`은 항상 정확히 하나다.
- Hero와 Footer에서는 활성 link와 visible indicator가 없다.

### Frame

- Services → Stack 이동에서 최소 네 개의 서로 다른 x frame을 관측한다.
- 시작과 종료 x/width는 각각 이전/새 link rect와 `1px` 이내로 일치한다.
- 인접 frame의 x 또는 width가 마지막에 큰 폭으로 jump하지 않는다.
- 약 `80ms` 지점에 다시 Team target을 주면 현재 frame에서 바로 새 방향으로 이어진다.
- 종료 후 stale target을 가리키는 transform이나 width가 남지 않는다.

### 대체 경로

- reduced-motion은 한 frame 안에 최종 target을 적용한다.
- 390px mobile에서는 desktop shared glide가 실행되지 않고 기존 mobile indicator 계약이 유지된다.
- desktop nav tab order, runtime error, cursor, a11y 회귀를 함께 통과한다.

## 9. 권위 관계

이 문서는
`docs/superpowers/specs/2026-08-11-futur-continuous-liquid-island-design.md`와 루트
`DESIGN.md`의 active navigation indicator 부분만 보완한다. Header geometry, mobile timeline,
glass tone, contact UI 제거 및 server 보존 경계는 변경하지 않는다.

## 10. 완료 조건

- 스크롤 section 변경 시 하나의 밑줄이 이전 메뉴에서 새 메뉴로 연속 이동한다.
- motion은 200ms 안에 끝나며 bounce, overshoot, loop가 없다.
- 빠른 반전, resize, reduced-motion, mobile 전환에서 jump나 stale inline state가 없다.
- 활성 semantic state와 시각 indicator target이 일치한다.
- 대상 E2E, Header 회귀, runtime, a11y, lint, build, graphify update, diff-check가 통과한다.
