# Services A/B Anti-Slop Design

## Summary

Our Services는 A와 B 두 시안만 유지한다. 두 시안의 정보 구조는 보존하되, 과한 라운드 카드·그림자·그라디언트·장식 도형·반복 칩을 제거해 FUTUR의 기존 Hero와 어울리는 절제된 테크 에디토리얼 화면으로 정리한다. C 시안과 관련된 컴포넌트, 스타일, 개발용 미리보기 분기는 제거한다.

## Goals

- A의 연결된 역량 흐름과 B의 비대칭 서비스 구성을 유지한다.
- 한눈에 SI 구축 범위와 AI 통합·AX 역량을 읽을 수 있게 한다.
- 전형적인 AI 랜딩페이지에서 자주 보이는 장식적 패턴을 줄인다.
- 모션은 정보의 순서와 구조를 설명하는 용도로만 사용한다.
- 데스크톱, 모바일, 키보드 탐색, reduced motion에서 안정적으로 동작한다.

## Non-goals

- Hero 또는 이후 Team, Operations, FAQ 섹션을 다시 디자인하지 않는다.
- 새로운 애니메이션 라이브러리나 UI 의존성을 추가하지 않는다.
- 카드 전체를 링크나 버튼처럼 보이게 만들지 않는다.
- 고객사, 성과, 포트폴리오처럼 확인되지 않은 정보를 추가하지 않는다.

## Shared Visual Direction

### Color and depth

- FUTUR navy, blue, off-white palette는 유지한다.
- 서비스 영역의 그라디언트와 광택 표현은 제거한다.
- 큰 확산 그림자는 제거하고, 필요한 경우 표면 분리를 위한 매우 얕은 그림자 하나만 허용한다.
- 네이비 면은 시각적 기준점 한 곳에만 사용한다.

### Geometry

- 30px 이상의 카드 라운드는 10~16px 범위로 축소한다.
- 원형 단계 표식은 A의 흐름을 설명하는 기능이 있으므로 유지하되 그림자는 제거한다.
- A의 아이콘은 반복되는 색상 박스보다 선 아이콘 자체가 먼저 보이게 한다.
- B 카드에는 SVG 아이콘과 장식 전용 도형을 넣지 않는다.
- 카드마다 다른 장식적 라운드 조합은 사용하지 않는다.

### Typography and scope labels

- 제목, 설명, 제공 범위의 위계를 타이포그래피와 간격으로 만든다.
- 제공 범위는 pill chip 대신 점, 슬래시 또는 가는 구분선이 있는 평문 목록으로 표현한다.
- `BUILD`, `CONNECT`, `OPERATE`는 작은 메타 정보로만 남기고 장식적 레터링으로 키우지 않는다.
- 한국어 본문은 14px 이상을 유지한다.

## Variant A: Capability Ledger

A는 세 단계가 연결된 역량표로 정리한다.

- 기존 세로 연결선과 `01/02/03` 단계 구조를 유지한다.
- 큰 유리 카드처럼 보이는 외곽 배경, 그라디언트, 확산 그림자를 제거한다.
- 각 단계는 넓은 행과 가는 구분선으로 나눈다.
- 서비스 아이콘은 배경 박스를 최소화하고 제목 옆의 보조 표식으로 사용한다.
- 두 서비스가 있는 단계는 동일한 너비의 열을 유지하되 중첩 카드처럼 보이지 않게 한다.
- hover는 단계 배경의 미세한 색 변화와 연결선 강조만 사용한다.

## Variant B: Asymmetric Editorial Grid

B는 기존 `7/5`, `5/7`, `12` 비대칭 배치를 유지한다.

- 첫 번째 웹·앱 개발 카드만 네이비 기준면으로 사용한다.
- 나머지 카드는 흰색 또는 단색 soft surface로 구성한다.
- 카드 내부의 SVG 아이콘과 창, 노드, 막대 등 장식 전용 도형을 모두 제거한다.
- 카드 하단 chip 목록은 한 줄 또는 줄바꿈 가능한 평문 제공 범위로 바꾼다.
- 비기능성 화살표와 카드 전체 상승 효과를 제거한다.
- 마지막 운영·유지보수 카드는 넓은 가로 모듈로 남겨 전체 흐름을 마감한다.

## Motion Design

### Section entrance

- 기존 one-shot reveal 체계를 재사용한다.
- 제목 영역과 콘텐츠 영역은 짧은 거리에서 한 번만 나타난다.
- 이동 거리는 최대 12px, 전체 지속시간은 약 420~560ms로 제한한다.

### Variant A motion

- 세로 연결선은 위에서 아래로 한 번 그려진다.
- 세 단계 행은 60~80ms 간격으로 순차 등장한다.
- hover 시 현재 단계에 해당하는 연결선과 단계 번호만 blue로 전환한다.
- 행이나 아이콘을 들어 올리는 transform은 사용하지 않는다.

### Variant B motion

- 다섯 모듈은 읽기 순서대로 50~70ms 간격으로 나타난다.
- 각 모듈의 상단 hairline이 짧게 확장되며 콘텐츠가 함께 나타난다.
- 모션은 다섯 모듈이 화면에 처음 나타나는 entrance에만 사용한다.
- 그림자 확대, 회전, 카드 상승 및 hover 이동 효과는 사용하지 않는다.

### Reduced motion and touch

- `prefers-reduced-motion: reduce`에서는 transform과 line-draw를 제거하고 최종 상태를 즉시 표시한다.
- 터치 환경에서는 hover 전용 변화를 제거한다.
- 콘텐츠가 숨겨진 채 남는 JavaScript 의존 상태를 만들지 않는다.

## C Removal

- `ServicesCapabilityIndex`와 전용 CSS를 삭제한다.
- 개발 미리보기 타입과 쿼리는 `a | b`만 허용한다.
- `?services=c`는 별도 시안을 노출하지 않고 기본 A로 처리한다.
- C의 버튼, focus preview, 모바일 아코디언 전용 테스트를 제거한다.

## Verification

- 기본 URL에서 A가 렌더링된다.
- `?services=b`에서 B가 렌더링된다.
- `?services=c`에서 C가 렌더링되지 않고 A가 유지된다.
- A와 B 모두 다섯 서비스와 15개 제공 범위를 노출한다.
- B에 장식 전용 `data-service-visual` 요소와 비기능성 control이 없다.
- STACK과 PROCESS는 계속 렌더링되지 않는다.
- 데스크톱과 390px 모바일에서 수평 overflow가 없다.
- reduced motion에서 모든 콘텐츠가 즉시 보인다.
- lint, build, 관련 Playwright, 정적 접근성 검사를 통과한다.

## Expected File Scope

- `src/pages/landing/ui/services-section.tsx`
- `src/pages/landing/ui/services-capability-map.tsx`
- `src/pages/landing/ui/services-bento-grid.tsx`
- `src/pages/landing/ui/styles/services.module.css`
- `src/pages/landing/ui/styles/services-bento-grid.module.css`
- `src/pages/landing/ui/use-services-preview-variant.ts`
- `src/pages/landing/ui/services-capability-index.tsx` 삭제
- `src/pages/landing/ui/styles/services-capability-index.module.css` 삭제
- 관련 landing E2E 테스트
