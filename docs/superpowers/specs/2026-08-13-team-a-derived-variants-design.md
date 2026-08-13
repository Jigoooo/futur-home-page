# Team Role and Capability Variants

> **Superseded — 2026-08-13:** Team A1·A2·A3 비교와 `?team=` 라우팅은 제거되었다. 현재 설계는 `2026-08-13-h1-services-technology-design.md`를 따른다. 아래 내용은 이전 비교 단계의 기록이며 현재 구현 계약이 아니다.

## Goal

팀원 이름이나 인원수를 공개하지 않고, 프로젝트를 실제로 수행하는 여섯 역할과 구현 가능한 기술 역량을 설명한다. 같은 콘텐츠를 A1·A2·A3의 서로 다른 정보 구조로 제공해 최종 레이아웃을 비교한다.

## Shared Content Contract

- 역할: 프로젝트 매니지먼트, 서비스 기획, 클라이언트 애플리케이션, 백엔드·데이터, AI 통합·AX, 클라우드·운영
- PM과 기획은 업무 범위만 표시한다.
- 나머지 네 기술 직군은 분류명과 평문 기술 목록을 모두 표시한다.
- 기술을 칩 구름, 숙련도, 버전, 프로젝트 수치로 표현하지 않는다.
- `Vercel AI SDK`, `Tool Calling`, `MCP`, `Structured Outputs`는 공개 목록에 표시하지 않는다.
- 영문 `OUR TEAM` 키커, 겹친 원형 장식, 카드 테두리와 장식 SVG를 추가하지 않는다.
- 고객, 팀 인원, 경력, 성과나 AI 모델 자체 개발 능력을 만들지 않는다.

세 안은 `teamRoles`, `teamCollaborationGroups`, `teamFlowStages`를 공통 데이터 원본으로 사용한다. 역할 6개, 역할 범위 18개, 기술 분류 16개, 기술 항목 70개가 어느 안에서도 빠지면 안 된다.

## Comparison Routing

- `?team=a1#team`: 역할 중심 Offset Editorial, 기본값
- `?team=a2#team`: 협업 중심 Collaboration Chapters
- `?team=a3#team`: 프로젝트 흐름 Project Flow
- 알 수 없는 값과 기존 `b`, `c`는 A1로 처리한다.
- 쿼리 비교는 로컬 개발 환경에서만 동작하고 프로덕션은 A1을 표시한다.

## A1 — Role-centered Editorial

여섯 역할을 좌우 두 열에 엇갈리게 배치한다. 각 역할은 배경, 테두리, 그림자 없는 독립된 텍스트 덩어리다. 제목과 책임, 역할 범위, 기술 분류를 한 흐름으로 읽으며 작은 화면에서는 한 열로 바뀐다.

## A2 — Collaboration Groups

역할을 `방향 설정 / 제품 구현 / 지능화 / 배포·운영` 네 그룹으로 묶는다. 그룹 설명은 왼쪽, 해당 역할은 오른쪽에 놓으며 좁은 화면에서는 위아래로 쌓는다. 그룹 제목은 현재 위치를 설명할 뿐 카드 헤더로 보이지 않아야 한다.

## A3 — Project Flow

`정의 → 클라이언트 구현 → 시스템·데이터 연결 → AI 통합 → 배포·운영` 다섯 단계를 하나의 연속된 세로 흐름으로 보여준다. 단계를 잇는 선은 끊기지 않으며 각 단계에 해당 역할의 전체 정보를 정적으로 표시한다. hover, focus, click으로 펼치는 인터랙션은 없다.

## Motion and Accessibility

- 기존 reveal 시스템으로 제목과 역할 또는 그룹만 한 번 순차 등장시킨다.
- 기술별 모션, 지속 애니메이션, 마우스 추적, 장식용 SVG는 사용하지 않는다.
- `prefers-reduced-motion: reduce`에서는 처음부터 최종 상태를 표시한다.
- DOM 순서와 시각적 읽기 순서를 같게 유지한다.
- 기술 텍스트는 줄바꿈할 수 있어야 하고 `390px`에서 가로 스크롤을 만들지 않는다.

## Verification

- A1·A2·A3 각각 역할 6개, 역할 범위 18개, 기술 분류 16개, 기술 70개를 표시한다.
- A2는 협업 그룹 4개, A3는 프로젝트 단계 5개다.
- A3에 역할 선택 버튼이나 확장 상태가 없다.
- 기본 주소, 알 수 없는 값, `b`, `c`가 A1을 표시한다.
- `1280px`과 `390px`에서 가로 overflow가 없다.
- no-JS와 reduced motion에서도 핵심 역할·기술 콘텐츠를 읽을 수 있다.
- 관련 Playwright, axe WCAG 2.2 AA, lint, build를 통과한다.

## Non-goals

- 실제 팀원 프로필이나 사진 공개
- 별도 Stack, Process, Portfolio 섹션 추가
- 새 애니메이션 라이브러리 도입
- 최종안 선택 전 비교 쿼리 제거
