# FUTUR 모바일 활성 섹션 Header 설계

> Refined on 2026-08-17. 섹션명을 즉시 교체하던 모션 계약은 `2026-08-17-mobile-header-vertical-roll-design.md`의 세로 롤링으로 대체됐다. breakpoint, 중앙 정렬과 no-JS fallback은 계속 유효하다.

## 1. 목적

`mobile-persistent` Header는 모든 메뉴를 언제든 사용할 수 있지만 `390px` 이하에서 로고, 서비스, 기술, FAQ, 문의가 한 줄에 모여 시각적으로 지나치게 촘촘하다. 태블릿에서는 전체 메뉴를 유지하고, 모바일에서는 현재 읽고 있는 섹션 하나와 문의만 보여 정보 밀도를 낮춘다.

이 설계는 `2026-08-17-mobile-header-persistent-navigation-design.md`의 모바일 상시 노출 계약을 좁은 화면에 맞게 보완한다. 접기·펼치기 메뉴는 다시 도입하지 않는다.

## 2. 확정 반응형 구조

### 데스크톱: `901px 이상`

- 기존 `desktop-fluid` geometry, 전체 메뉴와 공유 active indicator를 그대로 유지한다.
- 스크롤 기반 폭·높이 변화와 surface 기반 glass tone을 변경하지 않는다.

### 태블릿: `561px ~ 900px`

- `mobile-persistent` 단일 행에서 로고, 서비스, 기술, FAQ, 문의를 모두 표시한다.
- 메뉴 font size는 `14px`, 메뉴 gap은 `8px`, 일반 링크 좌우 padding은 `8px`을 기준으로 한다.
- Header 높이 `58px`, 화면 좌우 여백 `10px`, hash target offset `82px`은 유지한다.
- 데스크톱과 같은 공유 active indicator를 사용한다.

### 모바일: `560px 이하`

- 시각 구조를 `FUTUR. | 현재 섹션 | 문의` 세 영역으로 단순화한다.
- 서비스, 기술, FAQ 중 `aria-current="location"`을 가진 링크 하나만 Header 중앙에 표시한다.
- 문의 CTA는 항상 우측 끝에 표시한다.
- Hero와 Footer에서는 활성 섹션 링크가 없으므로 중앙 영역을 비운다. `홈`, `문의` 같은 중복 상태 문구를 추가하지 않는다.
- Header 너비는 `calc(100% - 24px)`, 높이는 `60px`, top은 `10px`을 사용한다.
- shell 좌우 padding은 `14px`, 로고와 문의 CTA 사이의 중앙 영역은 독립적으로 가운데 정렬한다.
- `320px`까지 로고, 현재 섹션, 문의가 겹치거나 가로 overflow를 만들지 않아야 한다.

## 3. DOM과 상태 권위

- `navigationItems`와 `useAdaptiveHeader()`의 `activeHref`를 현재 섹션의 단일 권위로 유지한다.
- 새로운 모바일 메뉴 상태, 별도 current-label state와 URL 동기화를 만들지 않는다.
- 서비스·기술·FAQ 링크는 기존 DOM과 실제 hash link를 유지한다.
- 모바일 강화 상태에서는 비활성 섹션 링크를 화면과 접근성 트리에서 제외한다. 활성 링크는 같은 위치에서 실제 anchor로 남는다.
- 문의 CTA는 활성 indicator 대상에 포함하지 않는다.
- Header DOM에는 toggle, close button, `aria-expanded`, `mobile-expanded` 상태를 추가하지 않는다.

## 4. 정렬과 시각 표현

- 모바일 현재 섹션 링크는 Header 전체 좌표를 기준으로 중앙에 놓는다. 로고나 문의 CTA의 실제 글자 폭에 따라 중앙 위치가 흔들리지 않아야 한다.
- 현재 섹션은 글자색과 `aria-current="location"`으로만 표현한다.
- `560px 이하`에서는 공유 active indicator를 숨긴다. 섹션 전환 시 밑줄이 이동하거나 잘못된 위치를 통과하지 않는다.
- 섹션명 전환의 mask, 세로 이동 범위와 timing은 `2026-08-17-mobile-header-vertical-roll-design.md`를 따른다.
- glass tone과 logo·CTA 색상 전환은 현재 surface 기반 규칙을 그대로 사용한다.

## 5. 접근성과 대체 동작

- 활성 섹션 링크와 문의 CTA는 native anchor로 유지하고 키보드 focus ring을 제공한다.
- 비활성 섹션 링크는 좁은 화면에서 보이지 않으며 tab 순서에도 들어오지 않는다.
- JavaScript가 없으면 현재 섹션을 계산할 수 없으므로 기존 전체 메뉴를 표시한다. no-JS 사용자는 서비스·기술·FAQ·문의에 모두 접근할 수 있어야 한다.
- reduced motion에서도 같은 구조를 즉시 표시하며 전환 animation을 사용하지 않는다.
- `prefers-contrast: more`와 backdrop-filter 미지원 fallback의 대비 규칙을 유지한다.

## 6. 구현 경계

- 수정 대상은 `HeaderSection`, `useAdaptiveHeader`, Header CSS와 관련 회귀 테스트로 제한한다.
- 활성 링크를 재사용할 수 있으면 별도 current label element를 추가하지 않는다.
- Hero, Services, Technology, FAQ, Footer 콘텐츠와 Header의 섹션 판정·surface probe 계산은 변경하지 않는다.
- 모바일 menu drawer, dropdown, 가로 스크롤 메뉴와 두 줄 레이아웃은 추가하지 않는다.

## 7. 검증 계약

- `1280px`, `901px`: 기존 데스크톱 전체 메뉴와 연속 geometry가 유지된다.
- `900px`, `768px`, `561px`: 전체 메뉴 다섯 항목이 충분한 간격으로 한 줄에 표시된다.
- `560px`, `390px`, `320px`: 로고, 현재 섹션 하나, 문의만 표시되고 가로 overflow가 없다.
- Hero와 Footer에서는 중앙 섹션명이 비어 있고 서비스·기술·FAQ에서는 대응 링크 하나만 표시된다.
- 직접 스크롤과 hash 이동 모두 현재 섹션 표시를 정확히 갱신한다.
- 모바일에는 toggle·close control·공유 active indicator가 없다.
- no-JS에서는 전체 메뉴가 보이며 reduced motion에서는 모든 상태 변화가 즉시 완료된다.
- 전체 Header·런타임 회귀와 axe WCAG 2.2 AA를 통과한다.
