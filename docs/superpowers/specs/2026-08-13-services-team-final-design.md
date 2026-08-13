# Services and Team Final Design

> **Superseded — 2026-08-13:** Services Ledger와 Team 카드 설계는 H1 Services와 독립 Technology 섹션으로 대체되었다. 현재 설계는 `2026-08-13-h1-services-technology-design.md`를 따른다.

## Summary

서비스 섹션은 A안 Capability Ledger로 확정한다. 비교용 B 미리보기는 제거하되, B의 두 번째 흰색 카드에서 확인한 절제된 표면 언어는 Team 역할 카드에 재사용한다. 서비스 소개 문구는 제공 범위를 나열하는 설명문보다 FUTUR의 제품 관점을 전달하는 짧은 문장으로 교체한다.

## Approved Service Copy

### Section title

`기술보다 먼저, 쓰임을 생각합니다.`

화면에서는 다음 두 줄로 표시한다.

1. `기술보다 먼저,`
2. `쓰임을 생각합니다.`

### Section description

`사용자와 운영자가 실제로 마주하는 흐름을 살피고, 필요한 기능과 시스템을 그에 맞게 설계합니다.`

이 문구는 `PRODUCT.md`의 사용자·운영자 흐름 검토 범위에 근거한다. 성과, 일정, 안정성, 응답 수준 또는 계약상 보장을 암시하는 표현은 추가하지 않는다.

## Services: Final A Capability Ledger

- 기본 URL과 모든 환경에서 A안만 렌더링한다.
- 세 단계 `BUILD / CONNECT / OPERATE`와 `01 / 02 / 03` 세로 연결 구조를 유지한다.
- 단계 사이 가로 구분선은 사용하지 않고 세로 진행선만 연속해서 표시한다.
- 실제 컴포넌트 폭을 기준으로 내부 열을 재배치해 중간 너비에서 설명이 눌리지 않게 한다.
- 등장 모션은 세로선과 단계가 읽기 순서대로 한 번 나타나는 현재 방식으로 유지한다.
- 단계 hover는 배경과 번호의 작은 색상 변화만 허용하고 위치 이동은 사용하지 않는다.
- B 서비스 그리드, B 전용 CSS, 쿼리 기반 미리보기 훅과 관련 분기 테스트는 삭제한다.
- `?services=b` 또는 제거된 다른 미리보기 쿼리가 있어도 A가 그대로 렌더링된다.

## Team: White Editorial Role Card

Team은 B의 두 번째 카드에서 사용한 흰색 무보더 표면 한 종류만 사용한다. 네이비 강조 카드나 회색 보조 카드를 섞지 않는다. 모든 역할은 같은 시각적 비중을 가진다.

### Card surface

- 단색 흰색 배경을 사용한다.
- 외곽선, 상단 색상선, 그라디언트, 광택, 확산 그림자와 장식 도형을 사용하지 않는다.
- radius는 약 `14px`로 제한한다.
- 카드 간 구분은 배경 대비와 grid gap으로 만든다.
- hover 시 카드 상승, 회전, 그림자 확대 또는 색상 테두리를 사용하지 않는다.

### Content hierarchy

- 기존 `PM / PLAN / FE / BE / OPS` 표시는 작은 텍스트 인덱스로 사용한다.
- 역할명, 책임 설명, 제공 범위 순서로 읽힌다.
- 기존 pill tag는 제거하고 `/`로 구분한 평문 목록으로 바꾼다.
- 특정 역할만 강조하거나 실제 팀원 경력, 인원, 연차 또는 성과를 추가하지 않는다.
- 현재 `teamRoles` 데이터의 역할명, 책임 설명과 태그 내용은 유지한다.

### Layout and motion

- 데스크톱은 현재 2열 역할 grid를 유지한다.
- 모바일은 역할 순서를 보존한 1열로 배치한다.
- 카드별 등장 애니메이션은 opacity와 최대 `12px`의 짧은 translate만 사용한다.
- 카드 stagger는 약 `60ms`로 제한한다.
- `prefers-reduced-motion: reduce`에서는 모든 역할을 즉시 최종 상태로 표시한다.

## Accessibility and Product-Truth Boundaries

- 서비스와 역할 카드는 클릭 기능이 없는 `article`로 유지하며 링크·버튼·`tabIndex`를 추가하지 않는다.
- 제목 계층과 읽기 순서를 유지한다.
- 한국어 본문은 `14px` 이상, 충분한 명도 대비를 유지한다.
- 고객, 프로젝트 사례, 성과 수치, SLA, 모델 자체 개발 또는 검증되지 않은 전문성을 추가하지 않는다.
- AI 범위는 기존 모델과 API를 서비스·사내 시스템에 연결하는 현재 사실 경계를 유지한다.

## Verification

- 서비스 섹션 제목과 설명이 승인 문구로 노출된다.
- 기본 URL에서 A Capability Ledger만 렌더링된다.
- B 서비스 컴포넌트, 스타일과 미리보기 훅이 남지 않는다.
- 서비스 단계 3개와 서비스 항목 5개가 유지된다.
- Team 역할 카드 5개가 동일한 흰색 무보더 표면으로 렌더링된다.
- Team 카드에 장식 pseudo-element, gradient, shadow, pill tag와 hover transform이 없다.
- 서비스와 Team 모두 데스크톱 및 `390px` 모바일에서 가로 overflow가 없다.
- 등장 애니메이션과 reduced-motion 동작을 각각 확인한다.
- 관련 Playwright, 정적 접근성 검사, lint, build와 `graphify update .`를 실행한다.

## Expected File Scope

- `src/pages/landing/ui/services-section.tsx`
- `src/pages/landing/ui/services-capability-map.tsx`
- `src/pages/landing/ui/styles/services.module.css`
- `src/pages/landing/ui/services-bento-grid.tsx` 삭제
- `src/pages/landing/ui/styles/services-bento-grid.module.css` 삭제
- `src/pages/landing/ui/use-services-preview-variant.ts` 삭제
- `src/pages/landing/ui/team-section.tsx`
- `src/pages/landing/ui/styles/team.module.css`
- 관련 landing E2E 및 접근성 테스트

## Non-goals

- Hero, Operations, FAQ 또는 Footer를 다시 디자인하지 않는다.
- Team 역할 데이터의 의미나 서비스 항목의 사실 범위를 변경하지 않는다.
- 새로운 UI 또는 애니메이션 의존성을 추가하지 않는다.
- 팀원을 실제 인물 카드나 프로필 형태로 바꾸지 않는다.
