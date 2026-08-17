# FUTUR www TLS Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 무료 Let’s Encrypt 인증서를 apex+www SAN으로 확장하고 모든 www 요청을 인증서 오류 없이 apex로 영구 이동한다.

**Architecture:** Nginx 설정을 저장소에 명시적으로 관리하고, VS Code Remote SSH와 동일한 `futur-prod` SSH profile로 백업·Certbot·설치·검증을 수행한다. 앱 reverse proxy와 Certbot 자동 갱신은 유지하며 실패 시 Nginx 설정을 즉시 복구한다.

**Tech Stack:** Nginx 1.18, Certbot 4.40, Let’s Encrypt, OpenSSH, Bash

## Global Constraints

- 앱 배포 CI에 Certbot 명령을 넣지 않는다.
- 인증정보와 runtime env를 읽거나 출력하지 않는다.
- `/etc/nginx/sites-enabled/futur.co.kr`만 수정한다.
- `futur.co.kr` reverse proxy와 port 3000은 중단하지 않는다.
- `www` path와 query를 보존해 `https://futur.co.kr$request_uri`로 301 이동한다.
- `certbot.timer`의 무료 자동 갱신을 유지한다.

---

### Task 1: 저장소 Nginx 설정과 계약 테스트

**Files:**

- Create: `deploy/nginx/futur.co.kr.conf`
- Modify: `e2e/deployment-contract.chrome.spec.ts`

**Interfaces:**

- Produces: apex proxy + www redirect Nginx config
- Consumes: `/etc/letsencrypt/live/futur.co.kr/` 인증서와 localhost:3000

- [ ] **Step 1: 실패하는 설정 계약 작성**

테스트는 config에 다음이 정확히 한 번씩 존재하는지 검사한다.

```ts
expect(config).toContain('server_name www.futur.co.kr;');
expect(config).toContain('return 301 https://futur.co.kr$request_uri;');
expect(config).toContain('server_name futur.co.kr;');
expect(config).toContain('proxy_pass http://localhost:3000;');
```

- [ ] **Step 2: RED 확인**

Run: deployment contract spec 단독, `--workers=1 --retries=0`.

- [ ] **Step 3: Nginx config 작성**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name futur.co.kr www.futur.co.kr;
    return 301 https://futur.co.kr$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.futur.co.kr;
    ssl_certificate /etc/letsencrypt/live/futur.co.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/futur.co.kr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    return 301 https://futur.co.kr$request_uri;
}
```

세 번째 apex HTTPS server에는 기존 `client_max_body_size`, static regex location, 기본 location과 proxy headers를 그대로 복사한다.

- [ ] **Step 4: GREEN·Nginx 문법 정적 확인**

로컬 Nginx가 없으면 Playwright contract와 `git diff --check`를 실행한다. 서버 적용 전 `nginx -t`가 최종 권위다.

- [ ] **Step 5: 커밋·push·앱 배포 확인**

```bash
git add deploy/nginx/futur.co.kr.conf e2e/deployment-contract.chrome.spec.ts
git commit -m "chore(nginx): www TLS 대표 호스트 설정 추가"
git push origin master
```

---

### Task 2: 적용 직전 서버 검증과 복구점 생성

**Files:**

- Read: `/etc/nginx/sites-enabled/futur.co.kr`
- Create on server: `/etc/nginx/sites-enabled/futur.co.kr.backup-<UTC timestamp>`

**Interfaces:**

- Produces: 정확한 백업 경로
- Consumes: Task 1 config, SSH profile `futur-prod`

- [ ] **Step 1: 공개 기준선 기록**

```bash
curl -fsS https://futur.co.kr/futur-release
curl -sSI http://www.futur.co.kr/test?source=preflight
openssl s_client -connect www.futur.co.kr:443 -servername www.futur.co.kr </dev/null 2>/dev/null \
  | openssl x509 -noout -ext subjectAltName
```

- [ ] **Step 2: 서버 경계 재검증**

```bash
ssh -o BatchMode=yes futur-prod \
  'nginx -v; certbot --version; systemctl is-active nginx; systemctl is-active certbot.timer; nginx -t'
```

- [ ] **Step 3: 설정 백업**

```bash
backup="/etc/nginx/sites-enabled/futur.co.kr.backup-$(date -u +%Y%m%dT%H%M%SZ)"
ssh futur-prod "cp -a /etc/nginx/sites-enabled/futur.co.kr '$backup' && printf '%s\n' '$backup'"
```

백업 경로를 다음 단계 rollback 변수로 보존한다.

---

### Task 3: apex+www SAN 인증서 확장

**Files:**

- Modify on server: `/etc/letsencrypt/live/futur.co.kr/*` through Certbot

**Interfaces:**

- Produces: Domains `futur.co.kr www.futur.co.kr`
- Consumes: 기존 Certbot account와 Nginx challenge

- [ ] **Step 1: Certbot dry intent 출력**

`certbot certificates --cert-name futur.co.kr`로 현재 domain이 apex 하나인지 재확인한다.

- [ ] **Step 2: 인증서 확장 실행**

```bash
ssh futur-prod \
  'certbot certonly --nginx --cert-name futur.co.kr --expand --non-interactive --agree-tos -d futur.co.kr -d www.futur.co.kr'
```

- [ ] **Step 3: SAN 검증**

```bash
ssh futur-prod \
  "certbot certificates --cert-name futur.co.kr | grep -E 'Certificate Name|Domains:|Expiry Date:'"
```

Expected: `Domains: futur.co.kr www.futur.co.kr`.

---

### Task 4: Nginx 설치·reload·롤백

**Files:**

- Install: `deploy/nginx/futur.co.kr.conf` → `/etc/nginx/sites-enabled/futur.co.kr`

**Interfaces:**

- Consumes: Task 2 backup path, Task 3 SAN certificate
- Produces: HTTPS www→apex 301

- [ ] **Step 1: 임시 경로 업로드**

```bash
scp deploy/nginx/futur.co.kr.conf futur-prod:/tmp/futur.co.kr.conf
```

- [ ] **Step 2: install 후 Nginx test**

```bash
ssh futur-prod \
  'install -m 644 /tmp/futur.co.kr.conf /etc/nginx/sites-enabled/futur.co.kr && nginx -t'
```

- [ ] **Step 3: test 실패 시 즉시 복구**

```bash
ssh futur-prod "cp -a '$backup' /etc/nginx/sites-enabled/futur.co.kr && nginx -t"
```

- [ ] **Step 4: reload와 외부 검증**

```bash
ssh futur-prod 'systemctl reload nginx'
curl -fsSI 'https://www.futur.co.kr/privacy?source=tls' | rg \
  'HTTP/2 301|location: https://futur.co.kr/privacy\?source=tls'
curl -fsS https://futur.co.kr/futur-release
```

- [ ] **Step 5: 자동 갱신 검증**

```bash
ssh futur-prod 'systemctl is-enabled certbot.timer; systemctl is-active certbot.timer; certbot renew --dry-run --cert-name futur.co.kr'
```

- [ ] **Step 6: 임시 파일 제거와 결과 기록**

`/tmp/futur.co.kr.conf`를 제거한다. 백업은 다음 인증서 자동 갱신 1회가 성공할 때까지 보존한다.

---

### Task 5: 내부 브라우저와 검색 canonical 검증

**Files:** None

- [ ] **Step 1:** Codex 내부 브라우저에서 `https://www.futur.co.kr/`을 열어 보안 경고 없이 apex로 이동하는지 확인한다.
- [ ] **Step 2:** `/privacy`, `/terms`, query 포함 경로를 확인한다.
- [ ] **Step 3:** apex canonical, Organization URL과 sitemap이 계속 apex만 가리키는지 확인한다.
- [ ] **Step 4:** 서버 로그에 reload 오류가 없고 port 3000 프로세스가 유지되는지 확인한다.
