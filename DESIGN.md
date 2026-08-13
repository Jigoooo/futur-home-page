---
name: FUTUR Landing
description: 풀스크린 파티클 Hero와 서비스 중심 H1 내러티브를 결합한 개발 파트너 랜딩
colors:
  hero: '#202523'
  service-index: '#090B10'
  service-surface: '#FBFCFF'
  technology: '#10265F'
  blue: '#1E4DC4'
typography:
  body: 'SUIT Variable, FUTUR Sans Critical, system sans-serif'
  display: 'Space Grotesk Variable, SUIT Variable, system sans-serif'
  hero: 'clamp(56px, 5.6vw, 80px)'
  editorial-heading: 'clamp(42px, 5.2vw, 72px)'
  body: '16px–19px'
---

# Design System: FUTUR Service H1

## Authority

이 문서는 현재 랜딩의 디자인 권위다. 구현 순서는 `src/pages/landing/ui/landing-page.tsx`, 색상 토큰은 `src/styles/tokens.css`, 구체적인 반응형 규칙은 각 CSS Module을 따른다. 과거 Team·Stack·Process·서비스 비교 문서와 충돌하면 이 문서와 현재 소스를 우선한다.

Hero의 문구, particle surface, WebGL fallback과 ring/dot cursor는 유지한다. 공개 랜딩에는 검증되지 않은 고객, 프로젝트, 성과, 팀 인원, SLA를 추가하지 않는다.

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
- glass tone dark: Hero, Services 인트로, Technology, Footer
- glass tone light: 서비스 챕터 영역, FAQ
- Services 인트로와 챕터 모두 활성 메뉴·Compact 라벨은 `서비스`를 유지한다.
- JavaScript 비활성 상태에서는 로고와 네 링크를 정적으로 노출한다.

Hash target offset은 desktop `92px`, mobile `82px`을 기준으로 하며 서비스 챕터는 native anchor와 `scroll-margin-top`을 사용한다.

## Services H1

Services는 카드나 아이콘 없이 어두운 전환 인트로와 네 개의 긴 챕터로 구성한다.

- 인트로 제목: `만들고, 연결하고, 운영까지 이어갑니다.`
- 인트로 설명: `새로운 서비스부터 기존 업무 시스템의 개선까지. 필요한 범위를 함께 정리하고 목적에 맞는 기술로 구현합니다.`
- 챕터: 서비스·솔루션 개발, 업무 시스템·SI, AI 통합·AX, 운영·유지보수
- `업무 시스템·SI` 범위에는 `API·시스템 연동`을 포함한다.

인트로는 상단 `#202523`, 하단 `#090B10`의 미세한 세로 전환을 쓰는 전면 어두운 surface다. Hero와 같은 왼쪽 콘텐츠 기준선을 사용하며 desktop `64svh`, tablet `58svh`를 최소 높이로 한다. mobile은 `104px / 112px`의 자연 높이를 사용한다.

`1181px` 이상은 약 `40:60` 분할이다. 왼쪽 검은 진행 표시는 `100svh` sticky이며 오른쪽 챕터는 각각 약 `82svh`다. 서비스 영역이 끝나면 sticky도 해제된다. `1180px` 이하는 진행 표시를 완전히 숨기고 한 열로 전환한다. 챕터는 약 `68svh`, `560px` 이하는 콘텐츠 높이에 맞춘다.

진행 표시는 `<aside><ol>`의 비조작형 보조 시각 정보다. 링크·버튼·hover·focus·`aria-current`·위치 이동을 제공하지 않으며 보조기술에서는 숨긴다. 화면 중앙 기준선을 통과하는 챕터를 `data-current='true'`로 표시하고, 흰색 `100% / 48%`와 `240ms` 색상 전환만 사용한다. 서비스 챕터 ID는 Footer 직접 링크를 위해 유지한다.

첫 챕터는 어두운 curtain이 `820ms` 동안 왼쪽으로 빠지며 흰 surface를 연다. no-JS에서는 curtain이 처음부터 화면 밖에 있고, reduced motion에서는 표시하지 않는다. 첫 챕터 콘텐츠 지연은 번호·제목·설명·범위 순서로 `180 / 260 / 340 / 420ms`, 나머지는 `0 / 80 / 160 / 240ms`다. opacity와 최대 `24px`의 세로 이동만 한 번 사용하며 blur, scale, bounce, 글자 분해, 지속 모션은 사용하지 않는다.

## Technology

Technology는 `--navy-2` 배경 위 텍스트 행으로 구성한다. 카드, 칩 구름, 모달을 사용하지 않는다.

- 제목: `기술은 목적과 환경에 맞게 선택합니다.`
- 기본 화면: 클라이언트, 백엔드·데이터, AI·AX, 클라우드·운영의 대표 기술
- native `<details>/<summary>`: 기본 닫힘, `기술 범위 전체 보기`
- 전체 화면: 16개 분류와 70개 기술을 평문 행으로 표시

기술 버전, 숙련도와 프로젝트 수치를 표시하지 않는다. AI는 모델 자체 개발이 아니라 검증된 모델과 조직 데이터·업무 흐름을 연결하는 통합 역량으로 설명한다. 긴 기술명은 `390px`에서 줄바꿈해야 한다.

## FAQ and Footer

FAQ 제목은 `자주 묻는 질문`이며 별도 소개 문장은 없다. 정확히 세 문항을 표시하고 첫 항목만 기본으로 펼친다. 각 버튼은 `aria-expanded`, `aria-controls`와 연결 패널을 유지한다.

Footer는 둥근 CTA 카드, 그라디언트와 이메일 pill이 없는 검은 에디토리얼 면이다.

- 제목: `필요한 변화가 있다면, 그 시작부터 함께합니다.`
- 설명: `새로운 아이디어도, 이미 운영 중인 시스템의 문제도 괜찮습니다. 현재 상황과 필요한 기능을 알려주세요.`
- 이메일, 주소, 회사·법적 정보와 문의 서버 경계를 유지한다.
- 서비스 탐색 링크는 네 서비스 챕터로 직접 이동한다.

## Motion, Accessibility and Product Truth

본문은 기존 `data-landing-reveal` 관찰자를 재사용하고 한 번 보인 항목은 다시 숨기지 않는다. SSR/no-JS에서는 모든 핵심 콘텐츠가 보인다. `prefers-reduced-motion`에서는 이동, 지연과 부드러운 스크롤을 제거하고 처음부터 최종 상태를 표시한다.

고객 로고·후기·사례·숫자 지표, 팀 인원과 경력, 상시 지원·응답 시간·자동 계약·확정 일정 같은 근거 없는 증거를 만들지 않는다. 공개 문의 폼과 `#contact`는 제거된 상태를 유지하되 contact server/model/mail safety, company JSON-LD, 개인정보처리방침과 이용약관의 실제 경계는 유지한다.

## Regression Checklist

- [ ] 페이지 순서가 `hero, services, technology, faq, footer`다.
- [ ] 헤더는 서비스, 기술, FAQ와 별도 문의 링크를 제공한다.
- [ ] Team·Stack·Process·Operations DOM과 `?team=` 분기가 없다.
- [ ] desktop 서비스 진행 표시 4개는 비조작형이며, tablet·mobile에서는 렌더링되지 않는다.
- [ ] 어두운 인트로에서 첫 챕터로 넘어갈 때 curtain과 Header·cursor tone이 한 번 전환된다.
- [ ] Hero particle opacity가 `0.62 → 0.16` 구간에서 감소하고 기존 renderer hysteresis가 유지된다.
- [ ] SUIT·Space Grotesk가 로컬 파일로 제공되고 Wanted Sans 요청이 없다.
- [ ] Technology는 대표 행 4개, 전체 분류 16개와 기술 70개를 제공한다.
- [ ] FAQ는 3개이며 첫 항목만 기본 확장된다.
- [ ] `1280px`, `1180px`, `900px`, `390px`에서 레이아웃과 가로 overflow가 안전하다.
- [ ] no-JS, reduced motion, 키보드 탐색과 axe WCAG 2.2 AA가 유지된다.
- [ ] contact server/mail safety를 포함한 전체 Playwright, lint, build가 통과한다.
