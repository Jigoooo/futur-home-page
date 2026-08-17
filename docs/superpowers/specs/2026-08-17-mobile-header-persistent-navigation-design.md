# FUTUR 모바일 Header 상시 노출 설계

> Refined on 2026-08-17. `560px` 이하의 전체 메뉴 상시 노출 계약은 `2026-08-17-mobile-header-active-section-design.md`의 현재 섹션 중심 구조로 보완됐다. `561px` 이상과 접기·펼치기 제거 원칙은 계속 유효하다.

## 목적

모바일에서 상단 Header가 작은 토글로 접혔다가 큰 메뉴로 펼쳐지는 이중 구조를 제거한다. 이후 좁은 화면의 현재 섹션 표현과 전환 모션은 후속 설계에서 구체화했다.

## 확정 동작

- 모바일 전용 Menu/X 버튼과 확장 패널을 제거한다.
- 데스크톱의 기존 스크롤 기반 유동 축소는 변경하지 않는다.
- 정확한 breakpoint, Header geometry와 현재 섹션 표현은 `2026-08-17-mobile-header-vertical-roll-design.md`를 단일 기준으로 사용한다.

## 반응형 레이아웃

- `561px` 이상 전체 메뉴와 `560px` 이하 현재 섹션 구조의 상세 계약은 후속 세로 롤링 설계를 따른다.
- 접기·펼치기 메뉴, 모바일 전용 하단 내비게이션, 가로 스크롤 메뉴와 두 줄 Header는 도입하지 않는다.

## 상태와 접근성

- 해시 이동, 키보드 포커스, Header 표면에 따른 글자색 전환은 유지한다.
- 모바일 메뉴 토글에 필요했던 `aria-expanded`, focus 복귀, Escape, 외부 클릭과 스크롤 닫기 로직은 삭제한다.
- JavaScript가 없으면 전체 hash navigation을 노출하는 fallback을 유지한다.

## 모션

- Header shell의 레이아웃 모션을 새로 도입하지 않는다.
- 활성 섹션 라벨의 세로 롤링과 reduced-motion 대체 동작은 후속 세로 롤링 설계를 따른다.

## 구현 경계

- `HeaderSection`, `useAdaptiveHeader`, Header CSS와 관련 E2E의 변경 범위를 유지한다.
- Hero, Services, Technology, FAQ, Footer와 공개 문구는 변경하지 않는다.
- 데스크톱 Header 크기, 스크롤 보간과 현재 표면 판정 기준은 변경하지 않는다.

## 검증

- 모든 breakpoint에서 토글·닫기 버튼·`mobile-expanded` 상태가 없어야 한다.
- hash navigation, 키보드, no-JS, reduced motion과 axe WCAG 2.2 AA 검사를 통과해야 한다.
- breakpoint별 Header geometry, visibility와 모션 검증은 후속 세로 롤링 설계를 따른다.

## 제외 사항

- Header의 시각 스타일을 새로 디자인하지 않는다.
- 메뉴 항목, 순서, 문구와 링크 목적지를 변경하지 않는다.
