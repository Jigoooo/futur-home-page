---
name: FUTUR Landing
description: Hero와 타이포그래피 중심 서비스 갤러리, 움직이는 기술 인덱스를 결합한 개발 파트너 랜딩
colors:
  hero: '#202523'
  service-surface: '#F4F4F0'
  technology: '#090B10'
  blue: '#315CFF'
typography:
  body: 'SUIT Variable, FUTUR Sans Critical, system sans-serif'
  display: 'Space Grotesk Variable, SUIT Variable, system sans-serif'
  hero: 'clamp(56px, 5.6vw, 80px)'
  editorial-heading: 'clamp(42px, 5.2vw, 72px)'
  body: '16px–19px'
---

# Design System: FUTUR Continuous Service Landing

## Authority

이 문서는 현재 랜딩의 디자인 권위다. 구현 순서는 `src/pages/landing/ui/landing-page.tsx`, 색상 토큰은 `src/styles/tokens.css`, 구체적인 반응형 규칙은 각 CSS Module을 따른다. 과거 Team·Stack·Process·서비스 비교 문서와 충돌하면 이 문서와 현재 소스를 우선한다.

Hero의 문구, particle surface와 WebGL fallback은 유지한다. 랜딩은 운영체제 기본 포인터를 사용하며 별도 ring/dot cursor를 만들지 않는다. 공개 랜딩에는 검증되지 않은 고객, 프로젝트, 성과, 팀 인원, SLA를 추가하지 않는다.

## Typography

폰트는 외부 CDN 없이 로컬 패키지로 제공한다. 한글과 한영 혼합 문장은 `SUIT Variable`, Hero 영문 H1·FUTUR 로고·서비스 번호는 `Space Grotesk Variable`을 사용한다. 기존 `FUTUR Sans Critical` Pretendard subset은 SUIT 로딩 전 한글 fallback으로 유지한다.

- Hero H1: `700`, `-0.035em`, `0.96`
- 대형 한글 제목: `800`, `-0.032em`, `1.10`
- FAQ·중간 제목: `700–760`
- 메뉴·라벨: `650–700`
- 본문: `450–520`

랜딩에서는 `930–950` 굵기와 `-0.055em` 이하의 과한 자간을 사용하지 않는다.

## Final Page Order

`data-landing-section` 순서는 다음으로 고정한다.

1. Hero (`#hero`)
2. Services H1 (`#services`)
3. Technology (`#technology`)
4. FAQ (`#faq`)
5. Footer (`#footer`)

Team, Stack, Process와 Operations는 렌더링하지 않는다. `?team=` 비교 분기와 `#team` 호환 앵커도 제공하지 않는다.

## Hero

Hero는 최소 `100svh`의 charcoal full-bleed surface다. particle layer와 WebGL2 canvas는 viewport 전체 폭을 유지하고 장식 요소로 보조기술에서 숨긴다. HTML 제목과 설명은 particle lifecycle과 독립적으로 SSR에서 읽을 수 있다.

- reduced motion, Save-Data, WebGL 초기화 실패와 context loss에서는 정적 surface를 사용한다.
- 공개 Hero CTA와 `#contact` 링크는 없다.
- H1 문구·크기와 기존 entrance motion을 변경하지 않는다.
- WebGL Hero가 활성화된 환경에서는 가시 비율 `0.62 → 0.16` 구간에 particle layer만 `opacity 1 → 0`으로 줄인다.
- renderer 정지·재개 임계값 `0.16 / 0.24`, particle 수·형태와 pointer 반응은 유지한다.

## Adaptive Island Header

Header는 데스크톱 `desktop-fluid`, 모바일 `mobile-compact | mobile-expanded` 상태를 사용한다.

- 주요 섹션 링크: `서비스 · 기술 · FAQ`
- 별도 문의 링크: `#footer`; 활성 인디케이터 대상에서는 제외
- Compact 라벨: Hero `FUTUR.`, Services `서비스`, Technology `기술`, FAQ `FAQ`, Footer `문의`
- glass tone은 섹션 ID가 아니라 Header 아래 `8px` 지점을 통과하는 `[data-header-surface]`의 실제 표면으로 결정한다.
- glass tone dark: Hero, Technology, Footer
- glass tone light: Services, FAQ
- Services 인트로와 카드 모두 활성 메뉴·Compact 라벨은 `서비스`를 유지한다.
- JavaScript 비활성 상태에서는 로고와 네 링크를 정적으로 노출한다.

Hash target offset은 desktop `92px`, mobile `82px`을 기준으로 하며 서비스 챕터는 native anchor와 `scroll-margin-top`을 사용한다.

## Services Gallery

Services는 짧은 전환 인트로와 네 개의 타이포그래피 중심 capability card로 구성한다. 긴 스크롤 챕터, sticky 진행 표시와 전환 curtain은 사용하지 않는다.

- 인트로 제목: `새로운 서비스부터, 운영 중인 시스템까지.`
- 인트로 설명: `웹·앱과 업무 시스템을 만들고, 기존 시스템과 AI 기능을 연결하며, 배포 이후 운영까지 이어갑니다.`
- 카드: 서비스·솔루션 개발, 업무 시스템·SI, AI 통합·AX, 운영·유지보수
- `업무 시스템·SI` 범위에는 `API·시스템 연동`을 포함한다.

surface는 warm off-white `#F4F4F0`이며 Hero와 명확한 cut으로 전환한다. 인트로는 desktop 두 열, tablet·mobile 한 열이고 viewport를 채우지 않는 자연 높이를 쓴다.

desktop은 두 열 bento다. 1번과 4번은 전폭, 2번과 3번은 반폭이며 카드 surface는 각각 ice, sand, mint, periwinkle의 낮은 채도 단색이다. border와 shadow는 사용하지 않고 `20px` radius만 쓴다. 이미지·SVG·아이콘 없이 번호·제목·설명·업무 범위의 정렬과 여백으로만 위계를 만든다. 카드는 최초 진입 시 최대 `28px` 아래에서 한 번 나타나며 hover 장식은 추가하지 않는다.

`1180px` 이하에서는 각 카드가 copy와 image의 세로 구조가 되고 `760px` 이하에서는 한 열로 전환한다. 네 서비스 ID는 Footer 이외의 직접 접근을 위해 유지하며 `scroll-margin-top`으로 고정 Header와 겹치지 않게 한다.

## Technology

Technology는 near-black `#090B10` surface 위에 네 개의 경계 없는 kinetic index row를 제공한다. 아이콘, 칩, 이미지, 카드, 성과 수치와 회피성 그라디언트를 사용하지 않는다.

- 제목: `기술은 목적과 환경에 맞게 선택합니다.`
- 기본 화면: 클라이언트, 백엔드·데이터, AI·AX, 클라우드·운영의 번호·역량명·설명과 대형 대표 기술 띠
- native `<details>/<summary>`: 기본 닫힘, `기술 범위 전체 보기`
- 전체 화면: 16개 분류와 70개 기술을 평문 행으로 표시

row는 얇은 hairline으로만 나눈다. 대표 기술 띠는 화면 너비와 무관하게 `20s`의 일정한 속도로 무한 marquee하며 행마다 방향을 교차한다. 기술명은 desktop `clamp(28px, 2.8vw, 44px)`, mobile `clamp(24px, 7.4vw, 32px)`이고 hover와 focus에서는 일시 정지한다. pin·snap·sticky·스크롤 진행 연동은 사용하지 않으며 reduced motion은 transform 없는 정적 기술 띠를 노출한다.

전체 기술 disclosure는 native `<details>/<summary>`를 유지하면서 모션만 progressive enhancement한다. 펼치면 summary 문구가 `기술 범위 접기`로 바뀌고 Header 아래 `96px`, mobile `82px`에 sticky로 남는다. panel은 `480ms` 높이 전환, 내부 목록은 `420ms` top-to-bottom curtain으로 열리고 각 분류는 기존 in-view observer를 통해 `16px`, `360ms`, `50ms` cadence로 한 번만 나타난다. 닫기 입력은 `300ms` 동안 panel과 현재 보이는 분류만 정리하며 disclosure 시작점으로 스크롤을 함께 보정한다. 진행 중 반대 입력은 잠그지 않고 현재 프레임에서 반전한다. no-JS와 reduced motion에서는 native disclosure가 즉시 동작한다.

기술 버전, 숙련도와 프로젝트 수치를 표시하지 않는다. AI는 모델 자체 개발이 아니라 검증된 모델과 조직 데이터·업무 흐름을 연결하는 통합 역량으로 설명한다. 긴 기술명은 `390px`에서 줄바꿈해야 한다.

## FAQ and Footer

FAQ 제목은 `자주 묻는 질문`이며 별도 소개 문장은 없다. Accordion과 버튼을 사용하지 않고 세 문항의 답변을 항상 노출한다. desktop은 번호 / 질문 / 답변의 에디토리얼 3열, tablet·mobile은 일반 세로 흐름이다. 둥근 카드·음영·Q 아이콘 대신 얇은 구분선만 사용한다.

Footer는 둥근 CTA 카드, 그라디언트와 이메일 pill이 없는 검은 에디토리얼 면이다.

- 제목: `필요한 변화가 있다면, 그 시작부터 함께합니다.`
- 설명: `새로운 아이디어도, 이미 운영 중인 시스템의 문제도 괜찮습니다. 현재 상황과 필요한 기능을 알려주세요.`
- 주 CTA는 `mailto:`를 사용하는 `문의하기` 버튼이다. 포인터 환경에서 최대 `6px` magnetic 반응과 포인터 위치를 기준으로 차오르는 liquid fill을 제공한다.
- magnetic 외곽과 press 내부 surface를 분리해 transform 충돌을 막고, reduced motion은 색상과 focus outline만 유지한다.
- 이메일은 연락처 영역에 작은 텍스트로 유지하며 주소, 회사·법적 정보와 문의 서버 경계를 바꾸지 않는다.
- Footer의 서비스 탐색 nav는 렌더링하지 않는다.

## Legal Pages and Scrollbar

`/privacy`, `/terms`는 dialog·modal·backdrop 없는 독립 페이지를 유지한다. 한국어 회사명은 `퓨터`, 영문 브랜드는 `Futur`를 쓰고 법적 본문은 `퓨터(영문명 Futur, 이하 “회사”)`로 표기한다.

공용 `PageScrollbar`는 landing·privacy·terms에서 현재 문서를 제어한다. `pointer: fine`, `min-width: 901px`, `prefers-reduced-motion: no-preference`를 모두 만족할 때만 `html[data-page-scrollbar-enabled='true']`를 추가하고 native scrollbar를 숨긴다. 그 외 환경과 no-JS에서는 native scrolling을 유지한다. track 클릭, thumb drag, idle fade와 페이지 전환 정리를 제공한다.

## Motion, Accessibility and Product Truth

본문은 기존 `data-landing-reveal` 관찰자를 재사용하고 한 번 보인 항목은 다시 숨기지 않는다. 서비스 카드와 기술 설명은 단위별로 나타나고 대표 기술 띠는 스크롤 위치와 독립적으로 움직인다. SSR/no-JS에서는 모든 핵심 콘텐츠가 보인다. `prefers-reduced-motion`에서는 이동, 지연과 부드러운 스크롤을 제거하고 처음부터 최종 상태를 표시한다.

고객 로고·후기·사례·숫자 지표, 팀 인원과 경력, 상시 지원·응답 시간·자동 계약·확정 일정 같은 근거 없는 증거를 만들지 않는다. 공개 문의 폼과 `#contact`는 제거된 상태를 유지하되 contact server/model/mail safety, company JSON-LD, 개인정보처리방침과 이용약관의 실제 경계는 유지한다.

## Regression Checklist

- [ ] 페이지 순서가 `hero, services, technology, faq, footer`다.
- [ ] 헤더는 서비스, 기술, FAQ와 별도 문의 링크를 제공한다.
- [ ] Team·Stack·Process·Operations DOM과 `?team=` 분기가 없다.
- [ ] Services는 이미지 없는 타이포그래피 카드 4개이며 sticky index와 surface gate가 없다.
- [ ] 1번·4번 전폭, 2번·3번 반폭의 desktop bento가 tablet·mobile에서 안전하게 한 열로 전환된다.
- [ ] Hero particle opacity가 `0.62 → 0.16` 구간에서 감소하고 기존 renderer hysteresis가 유지된다.
- [ ] SUIT·Space Grotesk가 로컬 파일로 제공되고 Wanted Sans 요청이 없다.
- [ ] Technology는 card 없는 kinetic row 4개, `20s` marquee와 전체 분류 16개·기술 70개를 제공한다.
- [ ] 전체 기술 disclosure는 sticky summary, curtain reveal, 닫힘 scroll anchoring과 입력 반전을 제공하고 no-JS·reduced motion에서는 native 동작을 유지한다.
- [ ] FAQ 3개의 질문과 답변이 처음부터 보이고 accordion control이 없다.
- [ ] Footer에 blue magnetic·liquid `문의하기` CTA와 작은 이메일이 있고 서비스 탐색 nav는 없다.
- [ ] 기본 포인터가 유지되고 custom ring/dot cursor DOM과 dataset이 없다.
- [ ] `/privacy`, `/terms`는 독립 페이지이며 `퓨터 / Futur` 표기와 공용 PageScrollbar 계약을 유지한다.
- [ ] `1280px`, `1180px`, `900px`, `390px`에서 레이아웃과 가로 overflow가 안전하다.
- [ ] no-JS, reduced motion, 키보드 탐색과 axe WCAG 2.2 AA가 유지된다.
- [ ] contact server/mail safety를 포함한 전체 Playwright, lint, build가 통과한다.
