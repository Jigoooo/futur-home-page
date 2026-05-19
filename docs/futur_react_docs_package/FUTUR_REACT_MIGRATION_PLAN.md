# FUTUR React 전환 계획서

> 대상: `futur_2026_layout_v10.html`을 React + TypeScript 기반 랜딩 페이지로 전환하기 위한 실행 계획서입니다.  
> 목적: Codex가 HTML/CSS/Vanilla JS 시안을 구조적으로 이해하고, 기능 손실 없이 컴포넌트화할 수 있도록 기준을 제공합니다.

---

## 0. 핵심 목표

FUTUR 랜딩 페이지는 “기술적으로 전문적이지만 부담스럽지 않은 SI·외주 개발 파트너”를 보여주는 페이지입니다. React 전환의 목표는 단순 마크업 복사가 아니라, 아래 품질을 만족하는 **유지보수 가능한 프론트엔드 구조**로 만드는 것입니다.

1. HTML 시안의 디자인 방향성 유지
   - 라이트 테마
   - 넉넉한 여백
   - 둥근 카드
   - 사람 사진 없는 시스템/UI/역할 중심 비주얼
   - “외주 문의가 쉬운” 직관적인 CTA
2. React 컴포넌트 단위로 구조화
   - 섹션 컴포넌트
   - 공통 UI 컴포넌트
   - 데이터 상수 분리
   - 훅 기반 인터랙션 분리
3. 실제 상호작용 유지 및 개선
   - Case Stories 탭 전환
   - Quick Brief 선택/요약
   - Contact Form 입력/체크/검증
   - Custom Select
   - Custom Checkbox / Radio-like Stage Selector
   - 카드/버튼/커서 마이크로 인터랙션
4. 접근성/반응형/성능 기준 반영
   - 키보드 조작 가능
   - `prefers-reduced-motion` 대응
   - 모바일 레이아웃 지원
   - 한글 줄바꿈 품질 유지
   - 외부 프로토콜 링크(`mailto:`, `tel:`) 사용 시 커스텀 커서 graceful fallback

---

## 1. Codex 작업 원칙

Codex는 구현 전에 반드시 아래 파일을 먼저 읽어야 합니다.

```text
AGENTS.md
DESIGN.md
FUTUR_REACT_MIGRATION_PLAN.md
futur_2026_layout_v10.html
```

작업 중에는 다음 원칙을 지켜야 합니다.

- 디자인 감도는 `DESIGN.md`를 우선 기준으로 한다.
- v10 HTML은 “최종 형태”가 아니라 “React 전환용 기준 시안”으로 본다.
- 클래스명을 그대로 복사하기보다 React 컴포넌트 책임에 맞게 정리한다.
- 단, 시각 결과가 크게 달라지지 않도록 토큰, spacing, radius, shadow, motion 기준은 보존한다.
- 사용자 요청으로 이미 확정된 사항은 되돌리지 않는다.
  - 사람 사진 사용 금지
  - 실명 노출 없는 역할 중심 팀 구성
  - 여유로운 섹션 간격
  - Quick Brief 실제 상호작용
  - Case Stories 실제 탭 전환
  - 기본 HTML select/checkbox가 아닌 커스텀 컴포넌트
  - 모바일 반응형
- 애니메이션은 “전부 fade-in”으로 처리하지 않는다. 요소 역할별로 다르게 적용한다.
- 새 라이브러리 도입은 최소화한다. 필요 시 이유와 대안을 문서화한다.

---

## 2. 권장 기술 스택

현재 시안을 React로 전환할 때의 기본 권장 스택은 아래와 같습니다.

```text
React + TypeScript
CSS Modules 또는 Vanilla CSS with component-level class naming
Vite 또는 TanStack Start
```

프로젝트가 이미 TanStack Start 기반이라면 TanStack Start를 우선 사용합니다. 아직 초기 구축 단계라면 Vite + React + TypeScript로 시작해도 충분합니다.

권장하지 않는 방향:

- 디자인 확정 전에 Tailwind 클래스로 모든 스타일을 급하게 치환
- 접근성 검토 없이 Headless UI 패턴을 자체 구현
- 모든 애니메이션을 Framer Motion으로 대체
- 커스텀 커서를 필수 기능처럼 만드는 것
- 모든 섹션에 동일한 fade-up 애니메이션 적용

---

## 3. 권장 폴더 구조

```text
src/
  app/
    App.tsx
    main.tsx
  assets/
    icons/
  components/
    layout/
      Header.tsx
      Footer.tsx
      Container.tsx
      Section.tsx
    ui/
      Button.tsx
      Card.tsx
      CustomCursor.tsx
      CustomSelect.tsx
      CheckboxTile.tsx
      StageSelector.tsx
      TextField.tsx
      TextArea.tsx
      Tabs.tsx
      ScrollTopButton.tsx
    sections/
      HeroSection.tsx
      QuickBriefSection.tsx
      ServicesSection.tsx
      CaseStoriesSection.tsx
      TeamSection.tsx
      ProcessSection.tsx
      ReviewSection.tsx
      ContactSection.tsx
  data/
    navigation.ts
    hero.ts
    quickBrief.ts
    services.ts
    cases.ts
    team.ts
    process.ts
    reviews.ts
    contact.ts
  hooks/
    useInViewReveal.ts
    useCustomCursor.ts
    useClickOutside.ts
    useReducedMotion.ts
    useLockBodyScroll.ts
  styles/
    globals.css
    tokens.css
    animations.css
    utilities.css
  types/
    landing.ts
```

폴더 구조를 더 단순하게 시작해야 한다면 `components/sections`, `components/ui`, `data`, `hooks`, `styles`만 우선 만들어도 됩니다.

---

## 4. 단계별 전환 계획

### Phase 1. 기준 시안 분석 및 토큰 추출

작업:

- v10 HTML에서 CSS 변수 추출
- 색상, radius, shadow, spacing, easing, breakpoint를 `styles/tokens.css`로 이동
- 전역 스타일을 `styles/globals.css`로 이동
- 애니메이션 keyframes와 motion class를 `styles/animations.css`로 이동

완료 기준:

- React 렌더링 전에도 토큰만 보고 디자인 방향을 이해할 수 있어야 한다.
- `DESIGN.md`의 토큰 값과 코드 토큰 값이 크게 어긋나지 않아야 한다.

---

### Phase 2. 콘텐츠 데이터 분리

작업:

- 하드코딩된 텍스트를 `src/data/*.ts`로 분리
- Case Stories 데이터는 현재 JS의 `caseData`를 TypeScript 객체로 변환
- 팀원 정보는 role card 데이터로 분리
- Quick Brief 옵션, Contact Form 옵션도 데이터화

예시:

```ts
export type CaseStoryKey = 'system' | 'mobile' | 'api';

export interface CaseStory {
  key: CaseStoryKey;
  tabLabel: string;
  label: string;
  title: string;
  description: string;
  icon: string;
  noteTitle: string;
  noteDescription: string;
  metrics: Array<{ value: string; label: string }>;
  items: string[];
}
```

완료 기준:

- 문구 수정 시 컴포넌트 JSX를 직접 건드리지 않아도 된다.
- 반복 카드 UI는 `map()`으로 렌더링된다.

---

### Phase 3. 레이아웃 컴포넌트 전환

작업 순서:

1. `Header`
2. `HeroSection`
3. `QuickBriefSection`
4. `ServicesSection`
5. `CaseStoriesSection`
6. `TeamSection`
7. `ProcessSection`
8. `ReviewSection`
9. `ContactSection`
10. `Footer`

주의:

- `id="services"`, `id="cases"`, `id="team"`, `id="process"`, `id="contact"` 앵커는 유지한다.
- 데스크톱과 모바일 레이아웃이 모두 자연스럽게 보여야 한다.
- 네비게이션이 모바일에서 사라지는 경우, CTA는 유지하고 필요 시 모바일 메뉴 버튼을 추가한다.

---

### Phase 4. 공통 UI 컴포넌트 구현

#### 4.1 Button

책임:

- 기본 버튼/링크 스타일
- primary / blue / ghost variant
- hover spotlight
- arrow 이동
- hover hit-area 안정성

주의:

- 버튼 자체를 hover 상태에서 `translateY()`로 움직이지 않는다.
- hover 경계에서 마우스가 흔들리는 현상을 막기 위해 outer area는 고정한다.
- 내부 label, arrow, highlight layer만 움직인다.

예시 API:

```tsx
<Button href="#contact" variant="primary" cursorText="START">
  프로젝트 문의하기
</Button>
```

---

#### 4.2 CustomSelect

책임:

- 기본 `<select>`가 아닌 커스텀 드롭다운 UI
- hidden input 또는 controlled value 제공
- listbox option 렌더링
- 키보드 조작
- 외부 클릭 닫기

권장 API:

```tsx
<CustomSelect
  label="예상 일정"
  name="timeline"
  value={timeline}
  options={timelineOptions}
  onChange={setTimeline}
/>
```

필수 동작:

- trigger click: open/close
- Escape: close
- ArrowUp / ArrowDown: option focus 이동
- Enter / Space: 선택
- 외부 클릭: close
- focus visible 표시
- chevron 중앙 정렬
- option 간격 충분히 확보

접근성:

- `role="combobox"`
- `aria-expanded`
- `aria-controls`
- popup은 `role="listbox"`
- option은 `role="option"`, `aria-selected`

---

#### 4.3 CheckboxTile

책임:

- native checkbox는 유지하되 시각 UI는 커스텀
- 왼쪽 정렬 기준 유지
- label 전체 클릭 가능
- checked/focus/hover 상태 제공

권장 API:

```tsx
<CheckboxTile
  name="services"
  value="웹·앱 개발"
  checked={checked}
  onChange={handleChange}
  title="웹·앱 개발"
  description="랜딩·관리자·모바일 화면"
/>
```

주의:

- “필요한 서비스”와 “필요한 영역”은 가운데 정렬보다 왼쪽 정렬이 더 적합하다.
- 텍스트 줄바꿈이 발생하지 않도록 카드 최소 너비와 grid gap을 충분히 둔다.
- 모바일에서는 자연스럽게 1열로 쌓인다.

---

#### 4.4 StageSelector

책임:

- Quick Brief의 현재 단계 선택
- radio input 기반 상태 유지
- 3단계 카드형 UI
- 선택된 단계의 인덱스, border, background 강조

권장 API:

```tsx
<StageSelector
  value={stage}
  options={stageOptions}
  onChange={setStage}
/>
```

주의:

- 토글 버튼처럼 보이게 하지 않는다.
- `01 아이디어`, `02 기획 중`, `03 운영 개선`처럼 단계적 맥락을 보여준다.
- 카드 내부는 왼쪽 정렬이 기본이다.

---

#### 4.5 Tabs

책임:

- Case Stories 탭 전환
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- 방향키 이동
- active tab state 관리

권장 API:

```tsx
<Tabs
  tabs={caseStories.map(story => ({ id: story.key, label: story.tabLabel }))}
  value={activeCase}
  onChange={setActiveCase}
/>
```

필수 동작:

- click: active 변경
- ArrowRight / ArrowLeft: active 이동
- Home / End: 첫/마지막 탭 이동
- tabpanel 내용 실제 변경

---

#### 4.6 CustomCursor

책임:

- 데스크톱 fine pointer 환경에서만 표시
- 모바일/터치 환경에서는 비활성화
- `prefers-reduced-motion: reduce` 환경에서는 비활성화
- `data-cursor-text` 요소 hover 시 label 표시
- label 표시 시 가운데 dot 숨김
- `mailto:`, `tel:`, browser alert, 외부 앱 포커스 이탈 후 graceful recovery

중요한 제약:

- 외부 프로토콜 레이어가 열린 동안 웹페이지 JS가 포인터 위치를 실시간 추적할 수는 없다.
- 따라서 “외부 레이어가 열린 상태에서도 계속 따라다니게”가 아니라, “레이어 복귀 후 다음 pointer event에서 정상 복구”를 목표로 한다.
- 문제가 계속 반복되면 primary CTA는 `mailto:` 직접 실행 대신 `#contact` 스크롤 또는 이메일 복사 버튼으로 바꾼다.

권장 구현:

```ts
useEffect(() => {
  const onPointerMove = (event: PointerEvent) => {
    // target position update
    // show cursor
    // resume raf loop if needed
  };

  const recover = () => {
    // reset hot/soft/muted classes
    // resume raf loop
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('focus', recover);
  window.addEventListener('pageshow', recover);
  document.addEventListener('visibilitychange', recoverWhenVisible);

  return () => {
    // remove listeners
    // cancelAnimationFrame
  };
}, []);
```

---

### Phase 5. 인터랙션 훅 구현

#### useReducedMotion

```ts
export function useReducedMotion(): boolean
```

- `window.matchMedia('(prefers-reduced-motion: reduce)')` 사용
- SSR 환경에서는 기본값 `false` 또는 안전한 초기값 사용

#### useInViewReveal

```ts
export function useInViewReveal<T extends HTMLElement>(): RefObject<T>
```

- IntersectionObserver 기반
- 한 번 보이면 `is-visible` class 추가
- 너무 많은 요소에 적용하지 않는다.
- 섹션 제목, 큰 레이아웃 단위에만 적용한다.

#### useClickOutside

```ts
export function useClickOutside(ref, handler)
```

- CustomSelect 닫기에 사용
- document pointerdown/click listener 정리 필수

---

### Phase 6. Quick Brief 구현

상태:

```ts
interface QuickBriefState {
  stage: '아이디어' | '기획 중' | '운영 개선';
  needs: string[];
  timeline: string;
  budget: string;
  memo: string;
}
```

동작:

- stage radio 선택
- needs checkbox 복수 선택
- timeline/budget custom select 선택
- memo input 입력
- summary tokens 자동 갱신

완료 기준:

- 사용자가 선택한 값이 즉시 summary에 반영된다.
- 키보드만으로 선택 가능하다.
- 모바일에서 한 화면에 과도하게 압축되지 않는다.

---

### Phase 7. Contact Form 구현

상태:

```ts
interface ContactFormState {
  company: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  projectType: string;
  replyType: string;
  message: string;
  agree: boolean;
}
```

동작:

- 입력 가능
- checkbox 선택 가능
- custom select 선택 가능
- 필수값 검증
- 제출 시 현재는 demo result 표시
- 실제 서비스 연결 시 API endpoint로 전송

운영 추천:

- `mailto:` 직접 실행 대신 폼 제출 또는 이메일 복사 버튼을 우선 고려한다.
- 개인정보 수집 동의 문구는 실제 운영 시 개인정보처리방침 링크와 수집 항목/목적/보관 기간을 명시해야 한다.

---

### Phase 8. 반응형 구현

기준 breakpoint:

```text
>= 1180px: desktop full layout
900px ~ 1179px: tablet / narrow desktop
<= 900px: single-column mobile layout
<= 560px: compact mobile layout
```

필수 점검:

- `.page`에 `min-width`가 남지 않도록 한다.
- Header nav는 모바일에서 숨기거나 mobile menu로 변경한다.
- Hero visual은 잘리지 않아야 한다.
- Quick Brief stage/checkbox/select는 1열로 쌓인다.
- Service card title이 단어 중간에서 끊기지 않는다.
- Contact form은 1열로 쌓인다.
- Footer는 컬럼이 자연스럽게 세로 배치된다.

한글 줄바꿈:

```css
body {
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

특정 짧은 문구는 `span.nowrap`로 보호합니다.

---

### Phase 9. 접근성 QA

필수 체크리스트:

- 모든 interactive element는 keyboard focus 가능
- 버튼/링크/탭/셀렉트/체크박스 focus visible 명확
- Case tabs는 방향키로 이동 가능
- CustomSelect는 Escape로 닫힘
- CheckboxTile은 Space로 체크 가능
- Contact form label과 input이 연결됨
- `aria-live`는 summary/result처럼 실제로 갱신되는 영역에만 사용
- 커스텀 커서는 정보 전달의 유일한 수단이 아님
- 모션 감소 설정에서 애니메이션/커서 효과가 비활성화됨

---

### Phase 10. 성능 및 SEO

SEO:

- `<title>`: `FUTUR | 웹·앱·업무 시스템 개발 파트너`
- `<meta name="description">`: 외주 개발, SI, 웹/앱, 업무 시스템, API 연동, 유지보수 키워드 포함
- Open Graph 태그 추가
- 구조화된 heading hierarchy 유지

성능:

- 불필요한 JS 애니메이션 최소화
- custom cursor는 desktop fine pointer에서만 로드/실행
- IntersectionObserver 대상 최소화
- SVG는 inline 또는 icon component로 관리
- 이미지가 없는 현재 방향성은 성능상 유리하므로 과도한 이미지 추가 금지

---

## 5. 컴포넌트 인벤토리

| 구분 | 컴포넌트 | 책임 | 상태 | 주의사항 |
|---|---|---|---|---|
| Layout | Header | 로고, nav, CTA | 없음 또는 mobile menu | sticky 위치/모바일 처리 |
| Layout | Footer | CTA, 링크, 문의, 소셜 | 없음 | footer top border gap 유지 |
| UI | Button | CTA, hover, arrow | hover spotlight | 버튼 outer hit-area 이동 금지 |
| UI | CustomCursor | cursor aura/dot/text | pointer position | 모바일/감소 모션 비활성화 |
| UI | CustomSelect | single selection | open/value/focused option | ARIA + keyboard |
| UI | CheckboxTile | multiple selection | checked | 왼쪽 정렬, 줄바꿈 보호 |
| UI | StageSelector | stage radio | selected stage | 토글이 아닌 단계 카드 |
| UI | Tabs | case switching | active key | 방향키/Home/End |
| Section | HeroSection | 첫인상, CTA, visual | 없음 | 우측 visual overflow 확인 |
| Section | QuickBriefSection | 문의 진입 완화 | brief state | summary tokens |
| Section | ServicesSection | 서비스 범위 | 없음 | 2x2 card, title nowrap |
| Section | CaseStoriesSection | 사례 전환 | active case | tabpanel 실제 변경 |
| Section | TeamSection | 역할 기반 팀 소개 | 없음 | 오밀조밀 방지 |
| Section | ProcessSection | 진행 방식 | 없음 | timeline 여백 |
| Section | ReviewSection | 후기 | 없음 | quote hierarchy |
| Section | ContactSection | 상담 폼 | form state | validation + consent |

---

## 6. 기존 v10에서 반드시 보존할 사용자 확정사항

- `FUTUR.` 워드마크는 과하게 꾸미지 않는다.
- 사람 사진은 사용하지 않는다.
- 팀은 사진/실명 대신 역할, 직군, 경력, 위치, 강점, 태그 중심으로 보여준다.
- “사진 대신” 같은 방어적인 문구는 쓰지 않는다.
- “실명 노출 없이도...” 같은 설명 문구도 쓰지 않는다.
- Quick Brief는 단순 input이 아니라 선택형 브리프 컴포넌트로 유지한다.
- Case Stories 탭은 실제 전환되어야 한다.
- Footer 아이콘은 중앙 정렬되어야 한다.
- 기본 HTML checkbox/select의 시각 UI는 쓰지 않는다.
- 필요한 서비스 checkbox는 왼쪽 정렬이 기본이다.
- 섹션 간 여백은 넉넉해야 한다.
- 모든 요소가 fade-in되지 않도록 motion 사용량을 제한한다.
- 모바일 반응형을 지원한다.

---

## 7. 알려진 이슈와 React 전환 시 결정사항

### 7.1 Custom cursor + mailto/tel/native dialog

문제:

- `mailto:`나 `tel:`은 브라우저/OS 외부 레이어로 제어가 넘어간다.
- 브라우저 alert도 페이지 스레드를 막는다.
- 이 상황에서는 커스텀 커서가 실시간으로 포인터를 따라가는 것을 보장하기 어렵다.

권장 해결:

1. primary CTA는 `mailto:` 직접 실행 대신 `#contact`로 스크롤한다.
2. 이메일은 “복사하기” 버튼을 제공한다.
3. footer나 보조 링크에서만 `mailto:`/`tel:`을 사용한다.
4. 해당 링크 클릭 직전에는 커스텀 커서를 숨기고, 다음 `pointermove`에서 복구한다.

### 7.2 Custom Select 접근성

직접 만든 select는 native select보다 접근성 책임이 커집니다. 구현 난이도가 부담되면 아래 중 하나를 선택합니다.

- 직접 구현을 유지하되 WAI-ARIA select-only combobox 패턴을 따른다.
- 디자인이 허용되면 native select를 시각적으로 개선한다.
- 라이브러리를 쓸 경우 Radix UI Select 같은 검증된 headless component를 도입하되 디자인 시스템에 맞게 스타일링한다.

현재 사용자 요구는 “기본 HTML 태그처럼 보이지 않게 직접 컴포넌트 디자인”이므로, 우선 직접 구현하되 접근성 테스트를 필수로 둡니다.

### 7.3 애니메이션 과잉

- 모든 카드가 fade/blur로 등장하면 페이지가 뿌옇고 답답해 보인다.
- 스크롤 reveal은 섹션 단위만 적용한다.
- 카드는 hover/focus micro-interaction 중심으로 반응시킨다.
- footer는 reveal 애니메이션 대상에서 제외한다.

---

## 8. 구현 순서 체크리스트

### 1차 PR: 구조와 정적 렌더링

- [ ] React 프로젝트 생성
- [ ] global CSS/tokens 분리
- [ ] data 파일 작성
- [ ] Header/Hero/Services/Footer 정적 구현
- [ ] Desktop layout 확인

### 2차 PR: 전체 섹션 구현

- [ ] QuickBrief 정적 UI
- [ ] Case Stories 정적 UI
- [ ] Team/Process/Review/Contact 구현
- [ ] Footer gap/CTA 정리
- [ ] Mobile layout 1차 확인

### 3차 PR: 상호작용 구현

- [ ] Button hover spotlight
- [ ] CustomSelect
- [ ] CheckboxTile
- [ ] StageSelector
- [ ] QuickBrief summary
- [ ] Case tabs
- [ ] Contact form demo submit

### 4차 PR: 애니메이션 및 커서

- [ ] useReducedMotion
- [ ] useInViewReveal
- [ ] CustomCursor
- [ ] 카드 hover animation
- [ ] native dialog recovery graceful fallback

### 5차 PR: QA/접근성/성능

- [ ] keyboard navigation 확인
- [ ] focus visible 확인
- [ ] mobile 390/430/768/900/1180 확인
- [ ] Lighthouse 또는 기본 성능 점검
- [ ] 한글 줄바꿈 점검
- [ ] reduced motion 점검
- [ ] Form validation 점검

---

## 9. Codex에게 줄 수 있는 작업 프롬프트 예시

### 전체 전환 시작 프롬프트

```md
AGENTS.md, DESIGN.md, FUTUR_REACT_MIGRATION_PLAN.md, futur_2026_layout_v10.html을 읽고 React + TypeScript 구조로 전환 계획을 먼저 제안해줘. 계획이 끝나면 Phase 1~2부터 구현해줘. 디자인 방향은 DESIGN.md를 우선하고, v10 HTML의 시각 결과를 크게 벗어나지 않게 해줘.
```

### CustomSelect 구현 프롬프트

```md
DESIGN.md의 CustomSelect 가이드와 FUTUR_REACT_MIGRATION_PLAN.md의 4.2 항목을 기준으로 CustomSelect 컴포넌트를 구현해줘. role="combobox", listbox, option, aria-expanded, aria-selected, ArrowUp/ArrowDown/Enter/Escape 키보드 동작, 외부 클릭 닫기를 포함해줘. 기본 select처럼 보이면 안 되고 v10 디자인 톤에 맞춰줘.
```

### 커서 이슈 수정 프롬프트

```md
CustomCursor에서 mailto/tel/native dialog 복귀 후 커서가 멈추는 문제를 graceful fallback으로 처리해줘. 외부 레이어가 열린 동안 완전 추적은 불가능하므로, 클릭 직전 커서 overlay를 숨기고 pointermove/focus/pageshow/visibilitychange에서 복구하도록 구현해줘. mobile과 prefers-reduced-motion에서는 비활성화해줘.
```

---

## 10. 참고 자료

- OpenAI Codex Best Practices: https://developers.openai.com/codex/learn/best-practices
- OpenAI Codex AGENTS.md Guide: https://developers.openai.com/codex/guides/agents-md
- React Hooks Reference: https://react.dev/reference/react/hooks
- React Components and Props: https://legacy.reactjs.org/docs/components-and-props.html
- WAI-ARIA Select-Only Combobox Example: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
- MDN ARIA Combobox Role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role
- MDN Intersection Observer API: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- MDN prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- UX Patterns Checkbox: https://uxpatterns.dev/patterns/forms/checkbox
- UX Patterns Text Field: https://uxpatterns.dev/patterns/forms/text-field
- UX Patterns Selection Input: https://uxpatterns.dev/patterns/forms/selection-input
- UX Patterns Button: https://uxpatterns.dev/patterns/forms/button
- GDWEB 심사위원/평가기준: https://www.gdweb.co.kr/sub/judge.asp
