---
name: FUTUR Landing
description: 풀스크린 파티클 Hero와 클래식 B2B 본문을 결합한 개발 파트너 랜딩
colors:
  charcoal: '#202523'
  paper: '#F3F1EC'
  paper-cool: '#E9ECEC'
  blue: '#1E4DC4'
  muted: '#545C58'
typography:
  family: 'Wanted Sans Variable, Wanted Sans, FUTUR Sans Critical, Apple SD Gothic Neo, Noto Sans KR, system-ui, sans-serif'
  hero: 'clamp(56px, 5.6vw, 80px)'
  section: '50px desktop, clamp(33px, 8vw, 42px) mobile'
  body: '16px–19px'
radius:
  card: '18px–40px'
  contact: '34px–48px'
  button: '999px'
---

# Design System: FUTUR Hybrid Classic

## Authority

이 문서는 현재 랜딩의 최종 디자인 권위다. 구현 순서는 `src/pages/landing/ui/landing-page.tsx`, 토큰은 `src/styles/tokens.css`, 개별 형태와 반응형 규칙은 각 CSS Module을 따른다.

현재 화면은 두 출처를 결합한다. Hero와 ring/dot 커스텀 커서는 2026-08-10 시네마틱 구현을 그대로 유지한다. Hero 이후 Header·본문·FAQ·문의·Footer는 Git commit `12fa1c8`의 클래식 소스를 선택 복원하되, 현재 사실 경계와 접근성·서버 보안 계약을 연결한 상태가 권위다. `docs/futur_react_docs_package/DESIGN.md`는 역사적 참고자료이며 충돌 시 이 문서와 현재 소스를 따른다.

## Final Page Order

문서 순서는 다음과 같다.

1. Hero (`#hero`)
2. 서비스 (`#services`)
3. 기술 (`#stack`)
4. 팀 (`#team`)
5. 프로세스 (`#process`)
6. 운영 원칙 (`#operations`)
7. FAQ (`#faq`)
8. 문의 (`#contact`)
9. Footer (`#footer`)

주요 내비게이션은 서비스, 기술, 팀, 프로세스, FAQ, 문의의 여섯 앵커를 사용한다. Hero부터 문의까지의 여덟 항목은 `main`의 랜딩 섹션이며 Footer는 문서 끝의 별도 랜딩 섹션이다.

## Hybrid Transition and Classic Surfaces

Hero는 charcoal full-bleed surface이고, 다음 서비스 섹션부터 paper 계열의 클래식 문서 표면으로 전환한다. 전환 뒤에는 `12fa1c8`의 넓은 여백, 캡슐형 Header, 둥근 카드, 명확한 grid와 목록 구조를 유지한다. 삭제된 시네마틱 본문 장면, merge stage, mask stage, path animation을 다시 만들지 않는다.

`data-classic-surface`는 서비스, 기술, 팀, 프로세스, 운영 원칙, FAQ, 문의에 각각 하나씩 총 7개다. 대표 수치는 다음과 같다.

- 본문 최대 폭: `1180px`
- 공통 섹션 제목: 데스크톱 `50px`, 모바일 최대 `42px`
- 일반 카드 radius: `18px–40px`
- 문의 외곽과 폼 surface radius: 데스크톱 `38px–48px`, 모바일 `34px`
- 데스크톱 grid: 서비스 2×2, 기술 2열, 팀 역할 2열, 운영 원칙 2×2
- 모바일 grid: 모두 1열이며 문서 가로 overflow를 만들지 않는다.

그림자는 실제 surface 계층을 구분할 때만 사용한다. 모든 내용을 같은 카드로 반복하지 않고, 기술은 그룹 목록, 프로세스는 번호 목록, FAQ는 disclosure, 문의는 실제 form control 구조로 표현한다.

## Typography and Color

영문 Hero와 한국어 제목·본문·내비게이션·폼은 self-hosted Wanted Sans 계열을 사용한다. Hero 문구는 정확히 `BUILT FOR WHAT’S NEXT.`이며 두 행으로 렌더링한다. 제목은 짧고 단단하게, 본문은 `word-break: keep-all`과 충분한 행간으로 조판한다.

Charcoal은 Hero와 주요 잉크, Paper와 Paper Cool은 클래식 본문 표면, blue는 링크·선택·focus와 제한된 강조에 사용한다. 색만으로 상태를 전달하지 않으며 텍스트, 형태, native control 상태를 함께 제공한다.

## Hero: Preserved Full-screen Particle Surface

Hero는 `100vw × 100svh`의 full-bleed charcoal 표면이다. WebGL2 particle canvas가 전체 면을 채우고 문장과 CTA는 실제 HTML로 남는다. canvas는 장식이며 보조기술에서 숨긴다.

- 헤드라인, 설명, CTA는 SSR과 WebGL 초기화 전에도 읽을 수 있어야 한다.
- Hero가 viewport 밖에 있거나 문서가 숨겨지면 렌더링을 멈추고 다시 보일 때 재개한다.
- 모션 감소, Save-Data, WebGL 초기화 실패, context loss에서는 정적 또는 fallback 표면을 사용한다.
- fallback에서도 Hero 높이, 대비, 문장과 문의 CTA를 보존한다.
- Hero particle engine, shader, canvas lifecycle과 Hero CSS는 클래식 복원 범위가 아니다.

## Classic Sections

- 서비스: 아이콘, 제목, 설명, 문의 링크를 가진 네 카드.
- 기술: Frontend, Interaction, Server, Quality의 네 semantic 목록.
- 팀: 프로젝트 매니지먼트, 서비스 기획, 프론트엔드·모바일, 백엔드, 운영·인프라의 다섯 역할 카드. 연차, 위치, 완료 건수는 표시하지 않는다.
- 프로세스: 상담 및 분석부터 배포 및 운영까지 번호가 보이는 다섯 단계 목록.
- 운영 원칙: 정보 보호 범위, 운영 조건, 변경 이력, 인계 범위를 설명하는 네 카드.
- FAQ: `aria-expanded`와 `aria-controls`를 유지하는 accordion 행.
- 문의: 프로젝트 단계, 서비스, 일정, 예산, 담당자, 문의 내용, 동의를 포함한 클래식 좌우 레이아웃.
- Footer: 브랜드, 현재 연락처, 서비스 탐색, 정책 링크만 제공한다.

## Reveal and Motion Contract

본문은 `data-landing-reveal`에서 `data-landing-visible`로 전환하는 one-shot reveal만 사용한다. 초기 SSR 콘텐츠는 보이며, JavaScript가 준비된 뒤에만 아직 등장하지 않은 target을 숨길 수 있다. JavaScript가 비활성인 경우 모든 핵심 콘텐츠는 최종 상태로 보인다.

모션 감소 환경에서는 observer와 transition 없이 즉시 최종 상태를 제공한다. 현재 pill 버튼의 spotlight, sheen, focus-visible, press 상호작용은 유지한다. 섹션 pinning, scroll snap, slide replacement는 사용하지 않는다.

## Cursor Tones

커스텀 커서는 2026-08-10의 ring/dot 구현을 유지하며 `data-cursor-contrast`가 선언한 semantic surface로 dark/light tone을 바꾼다. 픽셀 색상을 샘플링하지 않는다.

- fine pointer, viewport 폭 `900px` 초과, 모션 감소가 아닌 조건에서만 활성화한다.
- Hero와 운영 원칙의 dark surface는 `data-cursor-contrast='light'`로 밝은 cursor tone을 사용한다.
- 문의는 흰 surface이며 section의 `data-cursor-contrast='dark'`로 어두운 cursor tone을 사용한다. paper 계열 본문도 같은 dark tone 계약을 따른다.
- 링크·버튼은 hot, 입력 surface는 soft 상태를 사용하지만 의미나 상태를 커서만으로 전달하지 않는다.
- protocol link, window blur, visibility change 뒤에는 mute 상태를 정리하고 복구한다.
- 비활성 조건에서는 native cursor와 `focus-visible`을 그대로 제공한다.

## Contact Accessibility and Server Security Boundary

문의 UI는 `12fa1c8`의 단계·서비스·일정·예산·담당자·내용·동의 구성과 좌우 레이아웃을 복원했다. 필드명과 실제 form semantics는 현재 서버 입력 계약을 따른다. visible label, native radio·checkbox, combobox 키보드 조작, 오류 연결, pending·success·failure 상태와 결과 live region을 유지한다.

클라이언트 검증은 빠른 피드백을 위한 것이며 보안 경계가 아니다. 서버는 입력 길이와 허용값, 동의, honeypot, 폼 체류 시간, 요청 제한, 중복 전송, 테스트 주소 제한, 메일 전달 결과를 다시 확인한다. 비밀값은 서버 환경에만 두고 fallback mail도 현재 허용 경계 안에서만 동작한다. 클래식 UI 복원은 `src/pages/landing/server/**`를 변경할 이유가 되지 않는다.

## Evidence and SLA Boundary

공개 문구는 확인 가능한 회사 정보, 실제 구현, 사용자가 제공한 조건만 설명한다. 다음 항목은 설득 장치로 만들거나 암시하지 않는다.

- 공개 근거 없는 고객 로고, 후기, 익명 사례, 완료 사례
- 프로젝트 수, 재의뢰율, 경력 연수 등 검증되지 않은 숫자 지표
- 상시 지원, 특정 응답 시간, 자동 계약 처리, 확정 일정 같은 서비스 수준 또는 계약 보장
- 팀 구성원의 위치, 경력, 완료 건수를 사실처럼 보이는 프로필 정보

법인과 연락처 사실은 `src/entities/company/config/company-infos.ts`, 문의 동작과 서버 경계는 실제 구현과 회귀 테스트를 근거로 삼는다. 파티클, 모션, 시각적 완성도와 검토용 이미지는 사실의 근거가 아니다.

## Accessibility and Resilience

- WCAG 2.2 AA를 기준으로 대비, 키보드 조작, 명확한 `focus-visible`, label과 오류 연결을 유지한다.
- 모든 주요 콘텐츠와 문의 경로는 JavaScript가 늦거나 비활성인 상태에서도 문서에 존재해야 한다.
- 장식 canvas와 visual marker는 보조기술에서 숨기고 의미는 텍스트와 실제 컨트롤로 제공한다.
- 모바일과 coarse pointer에서는 hover 또는 커스텀 커서를 전제로 하지 않는다.
- `1280×720`과 `390×844`에서 Hero, Header, 카드, form, Footer가 가로 overflow 없이 동작해야 한다.

## Regression Checklist

- [ ] Hero가 viewport를 채우고 particle silhouette, 헤드라인, 설명, CTA가 보인다.
- [ ] 문서와 주요 내비게이션 순서가 Final Page Order와 일치한다.
- [ ] Hero 다음부터 7개의 classic surface가 자연스럽게 이어진다.
- [ ] 서비스·기술·팀·프로세스·운영 원칙·FAQ·문의가 지정된 semantic 구조를 유지한다.
- [ ] 팀 카드와 공개 문구가 Evidence and SLA Boundary를 넘지 않는다.
- [ ] one-shot reveal, JavaScript 비활성 최종 상태, reduced-motion 최종 상태가 유지된다.
- [ ] ring/dot cursor tone, native fallback, protocol link 복구가 동작한다.
- [ ] 문의 폼의 키보드 조작, 오류, 전송 결과, fallback과 서버 방어 경계가 유지된다.
- [ ] 데스크톱과 모바일에서 가로 overflow가 없다.
