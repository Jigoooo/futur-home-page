# FUTUR Cinematic Editorial 재설계

## 1. 상태와 목적

이 문서는 기존 `Calibration Rail` 구현을 대체하는 FUTUR 랜딩 페이지의 승인 설계다. 기존 구현은 선, 번호, 균일한 분할을 목업 그대로 옮겨 완성된 웹사이트보다 와이어프레임이나 발표 자료처럼 보였다. 새 설계는 동일한 제품 사실과 문의 기능을 보존하되 시각 세계와 장면 전환을 전면 교체한다.

방문자는 FUTUR가 웹·앱·업무 시스템을 만드는 개발 파트너이며, 보이는 경험과 코드·데이터·운영 구조를 함께 다룬다는 점을 첫 화면과 이어지는 장면에서 이해해야 한다. 검증되지 않은 고객, 성과, 숫자, SLA, 일정, 후기, 익명 사례는 설득 근거로 사용하지 않는다.

## 2. 승인 방향

방향명은 `Cinematic Editorial`이다. Hero는 전체 화면 파티클 장면이고, 이후 페이지는 밝은 editorial 면과 깊은 charcoal 면, Harbor haze의 단단한 색면이 번갈아 이어진다.

시각 재료는 [Glaze](https://www.glaze.app/)의 다음 원리에서 출발하되 화면 구성이나 컴포넌트를 복제하지 않는다.

- 어두운 무광 바탕
- 큰 반경을 가진 소수의 시각 스테이지
- 밀도 높은 검정과 파랑의 재질감
- 깊은 그림자와 제한된 광택
- 작은 둥근 카드의 반복보다 하나의 큰 장면을 우선하는 구성

FUTUR에서는 이를 Harbor Slate, Blue, Taupe, Olive와 기존 WebGL 파티클에 맞춰 번역한다. 둥근 형태는 부드러움보다 무게와 결속을 표현해야 한다.

## 3. 페이지 구조

최종 순서는 다음과 같다.

1. Header
2. Hero
3. 품질 기준
4. 제공 영역
5. 검토 방식
6. 진행 방식
7. FAQ
8. 문의
9. Footer

`책임 주체` 섹션과 내비게이션 앵커는 제거한다. 회사·대표·개인정보 책임자처럼 필요한 사실은 Footer와 법적 문서에만 남긴다.

## 4. Hero

- 파티클은 오른쪽 칸이나 별도 패널이 아니라 `100vw × 100svh` Hero 전체 배경이다.
- 기존 WebGL 파티클 엔진, 포인터 반응, 성능 tier, visibility 중지, WebGL 실패 폴백, reduced-motion과 Save-Data 정적 경로를 보존한다.
- 파티클 위에는 좌측 하단에 영문 headline, 한국어 설명, 기존 pill CTA를 배치한다.
- headline은 문법에 맞는 `BUILT FOR WHAT’S NEXT.`를 사용한다.
- `BUILT FOR`와 `WHAT’S NEXT.`를 명시적인 두 줄로 고정하고 아포스트로피 주변 자간을 별도로 확인한다.
- League Gothic은 제거한다. 영문 headline은 Wanted Sans의 넓고 무거운 weight를 사용해 과도하게 길쭉한 인상을 없앤다.
- 데스크톱 headline은 최대 약 `80px`, 모바일은 약 `47px`를 기준으로 한다. Hero의 힘은 글자 확대가 아니라 전체 파티클과 여백, 대비가 만든다.
- Header는 Hero 위에서 반투명 charcoal capsule surface를 사용한다. 기존 문의 pill 버튼의 모양과 동작은 유지한다.

한국어 설명은 다음 의미를 유지하되 최종 문구는 `humanize-korean` 검증을 거친다.

> 보이는 경험부터 코드와 데이터, 배포 이후의 운영까지. 다음 변화를 견딜 수 있는 디지털 제품을 함께 만듭니다.

## 5. 형태, 색감과 질감

- 페이지의 기본 표면은 matte charcoal과 warm paper다.
- Harbor Blue는 제품 결합, 포커스, 움직임의 중심에만 사용한다.
- Harbor Slate와 Taupe는 큰 곡면 스테이지의 몸체로 사용한다.
- Olive는 보조 깊이와 저채도 결합 면에 제한한다.
- 질감은 낮은 농도의 grain, radial light, inset highlight, 넓고 깊은 shadow로 만든다.
- 유리 효과, 과도한 glow, 여러 개의 작은 gradient blob은 사용하지 않는다.
- 큰 시각 스테이지와 문의 폼은 데스크톱 약 `42–48px`, 모바일 약 `28–32px` 반경을 가질 수 있다.
- CTA는 기존 `999px` pill 계약을 유지한다.
- FAQ 행, 일반 텍스트, 단순 목록을 모두 rounded card로 만들지 않는다.

## 6. 타이포그래피

- 본문과 한국어 제목은 Wanted Sans를 사용한다.
- 영문 headline도 Wanted Sans의 heavy weight로 통일한다.
- League Gothic 의존성과 import를 제거한다.
- 데스크톱 기준 Hero는 최대 약 `80px`, 주요 섹션 제목은 최대 약 `55px`, 문의 제목은 약 `44–48px`로 제한한다.
- 한국어 제목은 `word-break: keep-all`과 `letter-spacing >= -0.04em`을 지킨다.
- 줄바꿈은 의미 단위로 고정하고 한 글자가 다음 줄로 떨어지는 상태를 허용하지 않는다.
- 작은 영문 kicker는 설명 가능한 분류에만 사용한다. 장식용 `START A PROJECT`는 제거한다.

## 7. 섹션별 장면과 애니메이션

모든 섹션에 같은 fade-up을 복사하지 않는다. 각 장면의 의미에 맞는 움직임 하나를 배정하고, 일반 문서 흐름을 유지한다. 화면 전체 pin, section snap, 슬라이드 교체처럼 발표 자료로 느껴지는 전환은 사용하지 않는다.

### 7.1 품질 기준

- warm paper 안에 큰 Harbor Slate rounded stage를 하나 둔다.
- 검정과 파랑의 단단한 구가 서로 교차해 사용자 경험과 엔지니어링의 결합을 표현한다.
- 스크롤 진입 시 stage가 원형 clip으로 열리고, 구는 서로 다른 속도로 짧게 parallax한 뒤 안정된다.
- 연속 움직임은 매우 느린 `translate`, `rotate`, `scale` 범위로 제한한다.

### 7.2 제공 영역

- 지구나 행성을 떠올리게 하는 회전 궤도는 사용하지 않는다.
- 승인 모션은 `Layered Merge`다.
- 웹 제품, 업무 시스템, 외부 연동, 운영을 나타내는 네 개의 단단한 곡면이 서로 다른 방향에서 들어와 겹치고 하나의 charcoal 제품 코어를 만든다.
- 최초 진입에서 한 번 결합하고, 스크롤을 되돌렸을 때 과도하게 재생하지 않는다.
- 텍스트 목록은 코어 옆에서 차례로 나타나지만 카드 grid로 만들지 않는다.

### 7.3 검토 방식

- Taupe 전체 면과 밝은 큰 원형 cutout을 사용한다.
- 검토 기준은 작은 카드가 아니라 한 장면 안의 명확한 텍스트 그룹으로 배치한다.
- 진입 시 원형 mask가 비대칭으로 열리고, 기준 텍스트는 의미 그룹 단위로 짧게 reveal한다.
- 원형 장식은 천천히 이동하되 페이지를 지배하지 않는다.

### 7.4 진행 방식

- 직선 timeline과 균일한 step card를 제거한다.
- 요청 확인부터 배포와 운영까지 완만한 SVG 곡선 경로로 연결한다.
- 스크롤 진행에 맞춰 경로 stroke가 그려지고, 현재 단계의 작은 marker만 경로를 따라 이동한다.
- 각 단계 문구는 일반 문서 흐름에 남아 있어 JavaScript와 무관하게 읽을 수 있어야 한다.

### 7.5 FAQ

- 앞선 장면 뒤의 휴식 구간이다.
- rounded card를 사용하지 않고 평평한 disclosure 행을 유지한다.
- 열림/닫힘은 높이와 opacity를 짧게 전환하며 bounce나 과도한 stagger를 사용하지 않는다.

### 7.6 문의

- 작은 장식용 영문 `START A PROJECT`를 제거한다.
- 문구는 다음과 같이 구체적으로 작성한다.

> 프로젝트 문의
>
> 만들거나 개선하려는 제품을 알려주세요.
>
> 현재 상황과 필요한 범위를 적어주시면 확인 후 연락드리겠습니다.

- Form은 하나의 큰 rounded charcoal surface 안에 배치하되, 각 선택 항목을 흰색 card로 만들지 않는다.
- 진입 시 surface가 곡선 mask로 열리고 form group은 짧은 간격으로 나타난다.
- 입력 검증, 필수 동의, pending, success, failure, 직접 이메일 fallback, 서버 보안 경계를 보존한다.

## 8. 모션 기술 경계

- 기존 `gsap`과 `@gsap/react`만 사용한다.
- Anime.js와 Motion은 GSAP과 역할이 겹치므로 추가하지 않는다.
- ScrollTrigger는 장면 진입, 짧은 scrub, 곡선 path 진행에 사용한다. 긴 section pin은 사용하지 않는다.
- 단순 위치·크기 변화로 표현할 수 있는 곡면은 MorphSVG를 사용하지 않는다.
- 실제 path morph가 꼭 필요한 한 장면에서만 lazy import를 검토한다.
- Skiper UI는 전체 component system을 설치하지 않는다. 필요한 단일 효과가 있으면 소스와 라이선스를 확인한 뒤 CSS Modules와 기존 GSAP으로 포팅한다.
- 현재 프로젝트의 `.env.local` 비밀 값은 코드, 로그, 문서, 커밋에 노출하지 않는다.

## 9. 커서와 버튼

- 커스텀 커서는 단순한 ring과 dot을 유지한다.
- matte charcoal, Blue, Slate, Taupe, paper 표면에 `data-cursor-contrast`를 명시한다.
- 픽셀 색상 추론 대신 semantic surface를 사용한다.
- 기존 pill 버튼의 spotlight, sheen, label, arrow, press 동작을 보존한다.
- `back.out` 예외는 버튼 arrow와 press release에만 허용한다.
- 곡면 stage, FAQ, form control에는 spring/bounce를 전파하지 않는다.

## 10. 반응형과 접근성

- 모바일에서도 Hero 파티클은 전체 너비를 유지하고 headline, 설명, CTA가 첫 viewport 안에서 읽혀야 한다.
- 큰 시각 스테이지는 세로로 쌓고 곡면 일부가 잘려도 의미가 유지되게 한다.
- 작은 viewport에서 곡선 자산은 정보보다 앞에 오지 않는다.
- `prefers-reduced-motion: reduce`에서는 parallax, path-follow, path draw, 반복 회전, Layered Merge 이동을 제거하고 최종 상태를 즉시 표시한다.
- reduced-motion에서 필요한 상태 피드백은 `120–180ms` opacity 전환으로 제한한다.
- Hero, 섹션 문구, CTA, FAQ, 문의 폼은 JavaScript 지연이나 enhancement 실패 전에도 보인다.
- WCAG 2.2 AA 대비, focus-visible, 키보드 조작, form 오류 연결을 유지한다.

## 11. 구현과 검증 경계

구현은 한 번에 전체 페이지를 무작정 바꾸지 않는다.

1. Hero를 승인 목업과 같은 크기·밀도로 구현하고 데스크톱·모바일을 비교한다.
2. 공통 색감, 타이포, rounded solid material 토큰을 적용한다.
3. 품질 기준, 제공 영역, 검토 방식, 진행 방식의 정적 장면을 완성한다.
4. GSAP enhancement layer에 섹션별 애니메이션을 추가한다.
5. FAQ와 문의를 새 세계에 맞추되 기존 동작과 서버 경계를 보존한다.
6. 책임 주체 섹션과 관련 설정·타입·테스트·내비게이션을 제거한다.
7. 카피를 사실 관계부터 검토하고 `humanize-korean`을 실행한다.
8. finish review 이후 루트 `DESIGN.md`를 실제 구현 기준으로 다시 작성한다.

필수 회귀 검증은 다음과 같다.

- 파티클 ready, pointer, tier, morph, visibility, reduced-motion, Save-Data, WebGL fallback
- 단일 Hero CTA와 기존 pill 버튼 동작
- 섹션 DOM 순서와 내비게이션 앵커
- `ResponsibilitySection`과 관련 카피의 DOM 부재
- JavaScript 비활성 상태의 핵심 콘텐츠와 CTA
- 각 섹션 애니메이션의 reduced-motion 최종 상태
- 문의 validation, success, failure, direct email fallback, 서버 보안 경계
- 1280×720과 390×844 시각 QA
- 접근성, 런타임 오류, lint, build, 전체 Playwright, Impeccable detector

## 12. 완료 기준

- Hero가 전체 화면 파티클로 보이고 글자가 과도하게 크거나 길쭉하지 않다.
- Hero 이후가 직선 rail, 균일한 card grid, 발표 자료의 슬라이드 교체처럼 보이지 않는다.
- 큰 곡면과 둥근 solid material이 제한된 장면에서 일관되게 사용된다.
- 제공 영역의 `Layered Merge`가 지구·행성이 아니라 여러 영역의 제품 결합으로 읽힌다.
- 모든 섹션에 의미가 다른 애니메이션이 있지만 콘텐츠보다 먼저 보이지 않는다.
- 근거 없는 고객, 후기, 사례, 수치, SLA, 일정 약속이 없다.
- 문의 문구가 구체적이고 입력 목적이 분명하다.
- 데스크톱과 모바일에서 P0/P1 디자인·접근성 결함이 없다.
- 최종 구현과 루트 `DESIGN.md`가 일치하고 전체 회귀 검사가 통과한다.
