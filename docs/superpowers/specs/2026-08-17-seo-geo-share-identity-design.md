# FUTUR 단일 랜딩 SEO·GEO·공유 아이덴티티 설계

## 1. 목적

현재의 단일 랜딩 구조를 유지하면서 검색엔진과 AI 검색이 FUTUR의 실제 서비스 범위를 정확히 이해하도록 정리한다. Footer에서 법적 문서로 이동할 때 이전 스크롤 위치에서 맨 위로 부드럽게 역주행하는 결함도 함께 해결한다.

이 작업은 별도 서비스 상세 페이지, 포트폴리오, 고객사, 프로젝트 수치와 후기 콘텐츠를 만들지 않는다. 검색 노출을 위해 확인되지 않은 성과나 팀 정보를 추가하지 않는다.

## 2. 확정 결정

- 공개 페이지 구조는 현재의 단일 랜딩과 `/privacy`, `/terms`를 유지한다.
- 기술 SEO·GEO는 균형형 종합안으로 적용한다.
- Googlebot, 네이버 Yeti, OAI-SearchBot, GPTBot을 포함한 모든 공개 크롤러를 허용한다.
- 검색 결과 파비콘과 Organization 로고는 `B2-B`를 사용한다.
  - 배경: `#202523` charcoal 원형
  - 심볼 내부 padding: `18%`
  - 원본 알파 경계 `512×412+0+0`을 기준으로 세로 `50px` 이동해 외곽 박스를 중앙에 맞춘다.
  - 로고 도형의 비율, 각도와 색은 변경하지 않는다.
- 공유 카드는 기존 `futur_main.png`의 검은 배경, 심볼과 FUTUR 워드마크를 유지한다.
  - 심볼 뒤에는 원형 배경을 넣지 않는다.
  - 하단 문구는 `BUILT FOR WHAT’S NEXT.`로 교체한다.
  - 최종 규격은 `1200×630 PNG`다.
- TLS 보강은 사용자가 열어 둔 VS Code Remote SSH `futur-prod` 세션에서 Computer Use로 수행한다. GitHub Actions 배포 workflow에는 인증서 명령을 추가하지 않는다.

## 3. 법적 문서 라우트 전환

### 현재 결함

운영 환경에서 Footer의 `/privacy` 링크를 누르면 다음 흐름이 재현된다.

1. 랜딩 Footer의 약 `scrollY=6297`에서 경로가 `/privacy`로 변경된다.
2. 짧아진 법적 문서 높이에 맞춰 스크롤이 약 `2249`로 먼저 보정된다.
3. TanStack Router의 `scrollTo(0, 0)`이 전역 `html { scroll-behavior: smooth; }`의 영향을 받아 약 1초 동안 `2249 → 0`으로 움직인다.

### 수정 계약

- 전역 `html`의 `scroll-behavior: smooth`를 제거하고 기본값을 `auto`로 둔다.
- 새 pathname으로 이동할 때는 첫 표시부터 맨 위에 있어야 하며 전환 모션을 사용하지 않는다.
- Header hash 링크와 상단 이동 버튼은 기존 `scrollToHashTarget()` 및 `scrollToPageTop()`의 명시적 `behavior`를 사용해 smooth 이동을 유지한다.
- reduced motion에서는 기존처럼 모든 스크롤 이동을 즉시 완료한다.
- 브라우저 뒤로 가기의 TanStack Router 스크롤 복원은 유지한다.

## 4. 검색 메타데이터

### 홈

- title: `FUTUR | 웹·앱·업무 시스템·AI 통합 개발`
- description: `퓨처(Futur)는 웹·앱, SaaS·솔루션, 업무 시스템·SI, AI 통합·AX 구축과 운영·유지보수를 함께하는 개발 파트너입니다.`
- canonical: `https://futur.co.kr/`
- `og:title`과 `twitter:title`은 홈 title과 동일하게 사용한다.
- `og:description`과 `twitter:description`은 홈 description과 동일하게 사용한다.
- `og:site_name`은 `FUTUR`로 통일한다.
- `og:image`와 `twitter:image`는 새 PNG 공유 이미지를 사용한다.
- `og:image:width=1200`, `og:image:height=630`, `og:image:type=image/png`을 실제 파일과 일치시킨다.
- 이미지 대체 텍스트는 `검은 배경 위 FUTUR 심볼과 BUILT FOR WHAT’S NEXT. 문구`로 작성한다.
- 검색 순위 신호로 유효하지 않은 `keywords`, `geo.position`, `ICBM` 메타는 제거한다. 지역 정보는 본문의 주소와 구조화 데이터로 제공한다.

### 법적 문서

- `/privacy`, `/terms`의 고유 title, description과 `noindex,follow`는 유지한다.
- canonical은 각각 자기 URL을 사용한다.
- 홈페이지용 Open Graph 정보가 법적 문서 URL인 것처럼 노출되지 않도록 `og:url`을 각 문서 URL로 맞춘다.
- 법적 문서는 사이트맵에 넣지 않는다.

### 기타 응답

- `/futur-release`는 기존 `Cache-Control: no-store`에 `X-Robots-Tag: noindex, nofollow, nosnippet`을 추가한다.
- 실제 404 응답은 HTTP 404를 유지하고 `noindex`를 제공한다.

## 5. 구조화 데이터

홈에 하나의 JSON-LD `@graph`를 제공한다.

### WebSite

- `@id`: `https://futur.co.kr/#website`
- `url`: `https://futur.co.kr/`
- `name`: `FUTUR`
- `alternateName`: `퓨터`, `Futur`
- `publisher`: Organization `@id`

### Organization

- `@id`: `https://futur.co.kr/#organization`
- `name`: `FUTUR`
- `legalName`: `퓨터`
- `alternateName`: `Futur`
- `url`, 새 `ImageObject` logo, 사실 기반 description, 공개 주소와 이메일을 제공한다.
- 새 logo는 `512×512`와 실제 URL을 명시한다.
- 현재 화면에 공개되지 않은 전화번호는 구조화 데이터에서 제외한다.
- 실제 계정이 확인되지 않은 `sameAs`, Twitter 계정과 소셜 링크를 만들지 않는다.
- 고객, 후기, 평가, 프로젝트 수와 직원 수 구조화 데이터를 추가하지 않는다.

## 6. 이미지 자산

### 파비콘·검색 아이콘

- 기존 `/logo.svg`, `/logo_*.png`, `/futur_main.png`는 외부 캐시와 호환성을 위해 유지한다.
- 새 파생 자산은 원본 PNG를 결정적으로 합성해 만든다.
  - `/favicon.ico`: 16, 32, 48px 포함
  - `/favicon-32.png`
  - `/favicon-48.png`
  - `/favicon-96.png`
  - `/apple-touch-icon.png`: 180px
  - `/organization-logo-512.png`
- 브라우저와 검색엔진이 같은 안정된 아이콘을 선택하도록 `rel=icon`은 새 자산을 가리킨다.
- 기존 심볼을 다시 그리거나 ImageGen으로 변형하지 않는다.

### 공유 카드

- 소스는 저장소의 기존 `/futur_main.png`를 사용한다.
- `3024×1588+0+900` 영역을 기준으로 1.91:1 구성을 만들고 `1200×630`으로 내보낸다.
- 기존 하단 영문 문구 영역만 검은색으로 정리한 뒤 `BUILT FOR WHAT’S NEXT.`를 중앙 배치한다.
- 심볼, FUTUR 워드마크와 검은 배경은 원본을 유지한다.
- 출력 경로는 `/media/share/futur-main-og.png`로 고정한다.
- 핵심 세로 lockup은 중앙 정사각형 crop에서도 모두 남아야 한다.
- ImageGen은 사용하지 않는다.

## 7. 크롤링과 GEO

- `robots.txt`는 모든 일반 검색봇을 허용한다.
- OAI-SearchBot과 GPTBot도 명시적으로 허용한다.
- 사이트맵 URL은 `https://futur.co.kr/sitemap.xml`로 유지한다.
- 단일 색인 페이지인 홈만 사이트맵에 포함하고 실제 콘텐츠 수정일을 `lastmod`로 기록한다.
- `/llms.txt`를 사실 기반 보조 문서로 제공한다.
  - 회사명, 공개 주소와 이메일
  - 서비스·솔루션 개발, 업무 시스템·SI, AI 통합·AX, 운영·유지보수
  - `/`, `/privacy`, `/terms` 링크
  - 존재하지 않는 포트폴리오, 아티클, 팀 경력, 프로젝트 수치, 업무시간은 포함하지 않는다.
- `llms.txt`는 검색 순위나 AI 노출을 보장하는 수단으로 설명하지 않는다.
- 별도의 `llms-full.txt`, AI 전용 schema와 FAQ schema를 추가하지 않는다.
- 기존 네이버 소유확인 파일을 유지한다.

## 8. `www` TLS와 대표 호스트

### 현재 상태

- `www.futur.co.kr`은 `futur.co.kr`과 같은 서버를 가리킨다.
- 현재 인증서 SAN에는 `futur.co.kr`만 있고 `www.futur.co.kr`이 없어 HTTPS 검증이 실패한다.
- HTTP `www`는 현재 `https://www.futur.co.kr/`로 이동해 사용자를 인증서 오류로 보낸다.
- 2026-08-17 VS Code Remote SSH 읽기 전용 점검 결과:
  - 원격 사용자 `root`, host `futur0219.cafe24.com`
  - Nginx `1.18.0`, active
  - Certbot `4.40.0`
  - `certbot.timer` enabled, active
  - 관련 Nginx 설정 `/etc/nginx/sites-enabled/default`
  - HTTP와 HTTPS server block 모두 `server_name futur.co.kr www.futur.co.kr`
  - HTTP는 `return 301 https://$host$request_uri`
  - HTTPS는 `/etc/letsencrypt/live/futur.co.kr/` 인증서를 사용하고 `localhost:3000`으로 proxy
  - Certbot 인증서 이름과 domain은 `futur.co.kr` 하나뿐

### 실행 구조

- 이미 인증된 VS Code Remote SSH 세션을 사용하며 비밀번호, SSH key와 GitHub Secret을 읽거나 출력하지 않는다.
- 앱 배포 workflow와 분리된 일회성 서버 운영 작업으로 수행한다.
- 위 읽기 전용 점검이 충족됐으므로 apply는 다음 순서로 진행한다.
  1. 관련 Nginx 설정 백업
  2. 전체 설정을 읽고 apex reverse proxy, 보안 header와 기존 Certbot include를 보존하는 변경안을 확정
  3. Certbot Nginx plugin으로 기존 `futur.co.kr` 인증서를 `futur.co.kr`, `www.futur.co.kr` SAN 인증서로 확장
  4. HTTP의 apex와 www를 `https://futur.co.kr$request_uri`로 301 이동
  5. HTTPS `www` 전용 redirect server block을 추가하고 apex reverse proxy server block과 분리
  6. `nginx -t` 후 reload
  7. 인증서 SAN, path/query 보존 301, apex 200과 갱신 타이머 확인
- 전체 Nginx 설정을 확인했을 때 예상하지 못한 다른 서비스와 공유되거나 설정 경계를 안전하게 특정할 수 없으면 apply를 실행하지 않는다.
- 실패하면 백업한 Nginx 설정을 복구하고 `nginx -t` 후 reload한다. 확장 발급된 인증서는 그대로 두어도 기존 apex 서비스에 영향을 주지 않는다.

## 9. 검증

### 자동 검증

- Footer에서 `/privacy`, `/terms`로 이동하는 첫 화면의 `scrollY`가 0이며 중간 역주행 프레임이 없어야 한다.
- hash 기반 서비스·기술·FAQ 이동은 smooth를 유지하고 reduced motion에서는 즉시 이동해야 한다.
- 홈 SSR HTML의 title, description, canonical, Open Graph, X 카드와 JSON-LD를 검증한다.
- 새 파비콘과 Organization logo가 200 응답, 정사각형 규격과 올바른 MIME type을 가져야 한다.
- 공유 카드가 1200×630 PNG이며 중앙 square crop에 심볼·FUTUR·하단 문구가 남아야 한다.
- `/privacy`, `/terms`의 고유 메타, self canonical과 noindex를 검증한다.
- `/futur-release`의 no-store와 X-Robots-Tag를 검증한다.
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`의 상태와 문구 경계를 검증한다.
- 구조화 데이터에 근거 없는 수치·후기·전화번호·소셜 계정이 없어야 한다.
- 관련 Playwright, a11y, lint, typecheck와 build를 통과한다.

### 운영 검증

- VS Code Remote SSH에서 백업 경로, Certbot 결과, `nginx -t`, reload와 외부 검증 결과를 기록한다.
- `https://futur.co.kr/`은 200을 유지한다.
- `https://www.futur.co.kr/path?query=1`은 인증서 오류 없이 `https://futur.co.kr/path?query=1`로 301 이동해야 한다.
- 인증서에는 apex와 www가 모두 포함되고 자동 갱신이 활성화되어야 한다.
- Codex 내부 브라우저에서 홈, Privacy, Terms, Footer 링크와 공유 메타를 확인한다.

## 10. 배포 이후 수동 작업

- Google Search Console에서 홈 URL 검사를 실행하고 색인 생성을 요청한다.
- 네이버 서치어드바이저에서 홈 수집 요청과 사이트맵 상태를 확인한다.
- 카카오 개발자 도구에서 홈 URL과 새 OG 이미지 URL의 Open Graph 캐시를 초기화한다.
- 검색 결과의 title, description과 favicon 변경은 재수집 이후 반영되며 즉시 갱신을 보장하지 않는다.

## 11. 참고 기준

- Google Search favicon: <https://developers.google.com/search/docs/appearance/favicon-in-search>
- Google site name: <https://developers.google.com/search/docs/appearance/site-names>
- Google Organization structured data: <https://developers.google.com/search/docs/appearance/structured-data/organization>
- Google AI search guidance: <https://developers.google.com/search/docs/appearance/ai-features>
- 네이버 콘텐츠·Open Graph 가이드: <https://searchadvisor.naver.com/guide/markup-content>
- Open Graph protocol: <https://ogp.me/>
- Kakao Open Graph cache: <https://developers.kakao.com/docs/ko/message-template/faq>
- OpenAI publisher crawler guidance: <https://help.openai.com/en/articles/12627856-publishers-and-developers-faq>
