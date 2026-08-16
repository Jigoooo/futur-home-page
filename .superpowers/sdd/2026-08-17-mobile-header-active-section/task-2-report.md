# Task 2 보고서: 태블릿 메뉴 간격과 no-JS 탐색 fallback

## RED

추가한 `keeps the full menu comfortably spaced at tablet widths` 테스트를 CSS 변경 전에 실행했다.

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --grep "comfortably spaced|without JavaScript" --workers=1
```

- 태블릿 spacing 테스트: 실패
- 결정적 실패: `font-size` 기대값 `14px`, 실제값 `12px`
- no-JS 테스트: 통과

## GREEN

`@media (max-width: 900px)`의 tablet/full-menu 기준만 조정했다.

- shell padding: `16px 12px`
- logo: `20px`
- navigation: `14px`
- menu gap: `8px`
- link horizontal padding: `8px`
- contact link: `58px`, margin `2px`, padding `12px`

`@media (max-width: 560px)` active-only 규칙과 `@media (min-width: 901px)` desktop 규칙은 변경하지 않았다.

동일한 focused 명령 재실행 결과:

- 태블릿 spacing: 통과
- no-JS 강화 테스트: 통과
- 총 2 passed

## no-JS 계약

no-JS 테스트에 `서비스`, `기술`, `FAQ`, `문의` 링크가 각각 visible인지 확인하는 assertion을 추가했다.

## runtime 오류 계약 갱신

모바일에서 active-only CSS로 숨겨진 `기술` 링크를 실제 클릭하던 기존 계약을 `/#technology` 직접 hash 이동 후 section scroll 검증으로 최소 갱신했다.

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-runtime-errors.chrome.spec.ts \
  --project=chrome --workers=1
```

- 총 3 passed
- runtime error 및 hydration warning 테스트 포함

## 회귀 실행

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --workers=1
```

16개 테스트 중 출력된 앞 9개는 모두 통과했다. 이후 Playwright 프로세스가 결과를 더 출력하지 않고 종료되지 않아 중단했다. 따라서 이 실행은 `9 passed + hang(중단)`으로 기록한다. runtime spec 단독 실행은 위와 같이 3/3 통과했고, tablet/no-JS focused 실행은 2/2 통과했다.

## Self-review / concerns

- 변경 범위는 소유 파일 4개로 제한했다.
- 900/768/561px에서 네 링크 visible, 14px, section link padding-left 8px, horizontal overflow 없음이 검증된다.
- 560px 이하 active-only 및 901px 이상 desktop 계약은 직접 수정하지 않았다.
- 전체 회귀 명령의 hang 원인은 현재 서버/브라우저 실행 환경에서 추가 확인이 필요하다. 이미 출력된 통과 결과와 중단 사실을 숨기지 않고 기록했다.
- graphify는 Task 3에서 실행하라는 지시에 따라 실행하지 않았다.
