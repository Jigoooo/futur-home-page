# Services Variants Comparison Design

## Goal

승인된 A안은 유지하면서 B안과 C안을 실제 컴포넌트로 제작해 동일한 랜딩 페이지 안에서 비교한다. 동시에 서비스 설명과 중복되는 `STACK`, `PROCESS` 섹션을 화면과 헤더 탐색에서 제거해 페이지를 더 짧고 명확하게 만든다.

## Shared page structure

비교 중인 세 안 모두 다음 섹션 순서를 사용한다.

1. Hero
2. Services
3. Team
4. Operations
5. FAQ
6. Footer

헤더 메뉴는 `서비스`, `팀`, `운영`, `FAQ`로 정리한다. `운영`은 `#operations`에 직접 연결한다. 기존 `STACK`, `PROCESS` 소스 파일은 이번 비교 단계에서 삭제하지 않고 렌더링과 탐색에서만 제외해 되돌리기 쉽게 유지한다.

## Variant preview contract

- 기본 `/`는 현재 A안 Capability Map을 렌더링한다.
- 개발 환경에서만 `/?services=b`는 B안, `/?services=c`는 C안을 렌더링한다.
- 서버 렌더링과 프로덕션 빌드의 기본값은 항상 A안이다.
- 변형 선택 UI를 실제 랜딩 페이지에 노출하지 않는다.
- 세 변형은 같은 제목, 같은 5개 서비스, 같은 페이지 폭 안에서 비교한다.

## B — Asymmetric Bento

- 12열 그리드에서 `웹·앱 개발 7`, `업무 시스템 구축 5`, `연동·API 5`, `AI 통합·AX 7`, `운영·유지보수 12` 비율을 사용한다.
- 각 서비스는 아이콘, 설명, 실제 제공 범위를 나타내는 3개 scope 문구, 서비스별 추상 UI 시각화로 구성한다.
- AI 카드는 자체 모델 개발처럼 보이는 과도한 보라색/반짝임 표현을 쓰지 않고, 챗봇·문서 검색·업무 자동화 연결을 시각화한다.
- hover에서는 카드가 조금 올라오고 내부 시각화만 움직인다. 클릭 기능이 없으므로 링크나 `tabIndex`를 추가하지 않는다.
- 모바일에서는 서비스 순서를 유지한 단일 열로 바꾼다.

## C — Interactive Capability Index

- 데스크톱에서는 왼쪽에 5개 서비스 버튼, 오른쪽에 선택된 서비스 상세 패널을 둔다.
- hover와 keyboard focus는 같은 미리보기 상태를 만든다.
- click, Enter, Space는 선택 상태를 확정하고 `aria-pressed`로 노출한다.
- 상세 패널은 설명, 3개 scope, 단계 분류 `BUILD / CONNECT / OPERATE`를 보여준다.
- 모바일에서는 선택한 상세 내용이 해당 버튼 바로 아래에 펼쳐지는 accordion 형태로 바뀐다.
- `prefers-reduced-motion`에서는 패널과 강조 이동을 제거한다.

## Service content

각 서비스에 다음 scope를 추가한다.

- 웹·앱 개발: 웹 서비스, 모바일 앱, 관리자 화면
- 업무 시스템 구축: 업무 흐름, 데이터 관리, 권한 설계
- 연동·API: 인증·결제, 알림, 파일·외부 API
- AI 통합·AX: AI 챗봇, 문서 검색, 업무 자동화
- 운영·유지보수: 오류 대응, 기능 개선, 성능 점검

이는 수행 가능한 서비스 범위를 설명하는 문구이며 고객·성과·실적을 주장하지 않는다.

## Verification

- 기본 URL에서 A안이 유지되는지 확인한다.
- B안에서 카드 5개와 span 패턴 `7, 5, 5, 7, 12`를 확인한다.
- C안에서 5개 버튼, focus/hover 미리보기, click 선택, 모바일 accordion을 확인한다.
- `STACK`, `PROCESS` 섹션과 기존 메뉴 링크가 없는지 확인한다.
- `서비스`, `팀`, `운영`, `FAQ`의 활성 헤더 상태를 확인한다.
- 세 안 모두 390px에서 가로 넘침이 없어야 한다.
- 관련 Playwright, axe-core, lint, build, `graphify update .`를 실행한다.
