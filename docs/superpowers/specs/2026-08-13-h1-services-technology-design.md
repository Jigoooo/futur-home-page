# FUTUR H1 Services and Technology Design

## Status

Approved and implemented. 이 문서는 기존 Services A/B 비교와 Team A1/A2/A3 비교 설계를 대체한다.

## Goal

프로젝트 사례나 성과를 만들지 않고도 FUTUR가 맡을 수 있는 서비스 범위와 실제 기술 역량을 설득력 있게 설명한다. Hero는 유지하고 본문을 `Services H1 → Technology → FAQ → Footer`로 단순화한다.

## Information Architecture

- Services는 `product | system | ai | operations` 네 챕터를 사용한다.
- Technology는 `client | backend | ai | cloud` 네 직군과 16개 기술 분류, 70개 기술을 사용한다.
- Header는 서비스·기술·FAQ 링크와 Footer 문의 링크만 제공한다.
- Team, Stack, Process, Operations와 비교 쿼리는 공개 UI와 소스에서 제거한다.

## Visual Contract

- Services desktop은 왼쪽 `100svh` 검은 sticky index와 오른쪽 `82svh` 챕터의 약 `40:60` 분할이다.
- `1180px` 이하는 한 열, `560px` 이하는 콘텐츠 높이로 전환한다.
- Technology는 짙은 남색 배경의 텍스트 행이며 카드와 칩을 사용하지 않는다.
- Footer는 검은 평면 위 큰 제목, 설명과 이메일을 배치하고 CTA 카드나 pill을 사용하지 않는다.
- 영문 kicker, 아이콘, 장식 SVG, 발광, blur entrance와 지속 애니메이션을 추가하지 않는다.

## Interaction Contract

- 서비스 인덱스는 native anchor이며 중앙선을 통과한 챕터 하나에 `aria-current='step'`을 제공한다.
- 챕터는 기존 reveal observer로 최초 진입 시 한 번만 나타난다.
- 전체 기술은 기본 닫힌 native `<details>`로 제공한다.
- FAQ 첫 문항만 기본으로 펼친다.
- reduced motion과 no-JS에서도 핵심 콘텐츠와 모든 기술에 접근할 수 있다.

## Content Boundaries

고객, 프로젝트, 성과, 팀 인원과 AI 모델 자체 개발 능력을 추가하지 않는다. 기술 목록에는 숙련도, 버전과 프로젝트 수치를 표시하지 않는다. 외부 서비스와 AI 통합, 운영·유지보수 가능성은 설명하되 확정 SLA는 약속하지 않는다.

## Verification

- `data-landing-section`: `hero, services, technology, faq, footer`
- 서비스 4개, 기술 요약 4개, 분류 16개, 기술 70개
- desktop sticky와 tablet/mobile 단일 열
- header active state, Footer 문의 라벨과 서비스 chapter links
- no-JS, reduced motion, keyboard, axe WCAG 2.2 AA
- 관련 Playwright, 전체 E2E, lint, build, 내부 브라우저와 graphify 갱신
