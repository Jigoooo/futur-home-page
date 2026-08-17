# FUTUR Legacy Runtime Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** release 기반 현행 홈페이지를 유지하면서 서버의 미사용 legacy 프로세스와 약 1GB의 Prisma·Nitro·정적 빌드·실패 배포 파일을 제거한다.

**Architecture:** 먼저 current SHA와 port 3000의 단일 소유권을 검증한다. 삭제는 고정된 절대 경로 allowlist만 대상으로 하며 legacy process 종료, PM2 저장, 파일 삭제, 공개 health check 순서로 수행한다.

**Tech Stack:** Bash, OpenSSH, PM2 6, Linux `/proc`, `ss`, Nitro release layout

## Global Constraints

- 삭제는 복구 불가능하며 정확한 allowlist 외 경로를 삭제하지 않는다.
- `/home/futur/front/futur-home-page`보다 넓은 경로를 재귀 삭제하지 않는다.
- `current`, `releases`, `shared`, `.incoming` 상위와 `/root/.pm2/logs`를 보존한다.
- 현재 port 3000 프로세스를 종료하지 않는다.
- `spec-lens` 애플리케이션과 `/home/futur/front/spec-lens`를 건드리지 않는다.
- legacy 저장소는 GitHub의 archived `team-futur/futur-home-page-legacy`에 보존되어 있다는 전제로 서버 사본을 삭제한다.

---

### Task 1: 삭제 직전 권위 검증

**Files:** None

**Interfaces:**

- Produces: `expected_sha`, `current_pid`, `legacy_pids[]`
- Consumes: 공개 `/futur-release`, server `/proc`, `ss`

- [ ] **Step 1: 공개 SHA와 current 일치 확인**

```bash
expected_sha="$(curl -fsS https://futur.co.kr/futur-release | tr -d '\n')"
ssh futur-prod "test \"\$(basename \"\$(readlink -f /home/futur/front/futur-home-page/current)\")\" = '$expected_sha'"
```

- [ ] **Step 2: port 3000 소유권 확인**

```bash
ssh futur-prod \
  "ss -lntp 'sport = :3000'; pgrep -af '^node /home/futur/front/futur-home-page/current/server/index.mjs$'"
```

정확히 한 PID가 listen 해야 한다.

- [ ] **Step 3: legacy PID 재조회**

```bash
ssh futur-prod \
  "pgrep -af '^node /home/futur/front/futur-home-page/server/index.mjs$'"
```

각 PID가 `ss -lntp` 결과에 없고 cwd가 배포 root인지 확인한다. 조사 시점 PID는 `358794`, `358796`이지만 실행 시 재조회값만 사용한다.

- [ ] **Step 4: PM2 dump 이름 확인**

`/root/.pm2/dump.pm2`에서 app name과 exec path만 출력한다. `spec-lens`와 current 경로의 `futur` 외 항목이 있으면 중단한다.

---

### Task 2: legacy process 종료

**Files:** None

**Interfaces:**

- Consumes: Task 1 `legacy_pids[]`
- Produces: legacy cmdline process 0개

- [ ] **Step 1: SIGTERM 전 마지막 cmdline guard**

각 PID의 `/proc/$pid/cmdline`이 exact legacy path와 같은지 검사한다.

- [ ] **Step 2: SIGTERM 전송**

```bash
kill -TERM "${legacy_pids[@]}"
```

- [ ] **Step 3: 최대 10초 condition wait**

1초 간격으로 exact legacy `pgrep`가 0개인지 확인한다.

- [ ] **Step 4: 필요할 때만 SIGKILL**

남은 PID의 cmdline을 다시 확인한 후 해당 PID만 `kill -KILL`한다.

- [ ] **Step 5: 현행 서비스 재검증**

port 3000 current PID, `/futur-release`, apex 200을 확인한다.

---

### Task 3: PM2 현재 상태 저장

**Files:** None

- [ ] **Step 1:** PM2 daemon 자식 중 exact legacy path가 없음을 확인한다.
- [ ] **Step 2:** `pm2 save`를 실행한다.
- [ ] **Step 3:** dump에서 `spec-lens`, `futur`과 두 current exec path만 남는지 확인한다. 환경변수 값은 출력하지 않는다.

---

### Task 4: 고정 allowlist 삭제

**Files:** Remove on server only:

- `/home/futur/front/futur-home-page/prisma`
- `/home/futur/front/futur-home-page/public`
- `/home/futur/front/futur-home-page/server`
- `/home/futur/front/futur-home-page/logs`
- `/home/futur/front/futur-home-page/ecosystem.config.cjs`
- `/home/futur/front/futur-home-page/nitro.json`
- `/home/futur/front/futur-home-page/pm2.sh`
- `/home/futur/front/futur-home-page/.incoming/f79ea7bf0d5fce52c89d31dbacc79abcc90a54fc`
- `/home/futur/front/futur-home-page/.incoming/5de9b5ce87194fc23124ba5cb1b002174bd9fae6`

- [ ] **Step 1: allowlist를 literal array로 선언**

환경변수, glob과 command substitution으로 삭제 대상을 만들지 않는다.

- [ ] **Step 2: 각 대상 경계 검증**

각 target의 parent `realpath`가 `/home/futur/front/futur-home-page` 또는 그 하위인지 검사하고 `current`, `releases`, `shared`가 아닌지 검사한다.

- [ ] **Step 3: 삭제 전 최종 목록·용량 출력**

`du -sh -- "$target"`을 출력하고 대상 수가 정확히 9개인지 확인한다.

- [ ] **Step 4: exact target 삭제**

```bash
rm -rf -- \
  /home/futur/front/futur-home-page/prisma \
  /home/futur/front/futur-home-page/public \
  /home/futur/front/futur-home-page/server \
  /home/futur/front/futur-home-page/logs \
  /home/futur/front/futur-home-page/ecosystem.config.cjs \
  /home/futur/front/futur-home-page/nitro.json \
  /home/futur/front/futur-home-page/pm2.sh \
  /home/futur/front/futur-home-page/.incoming/f79ea7bf0d5fce52c89d31dbacc79abcc90a54fc \
  /home/futur/front/futur-home-page/.incoming/5de9b5ce87194fc23124ba5cb1b002174bd9fae6
```

- [ ] **Step 5: `.incoming` 상위 유지**

```bash
mkdir -p /home/futur/front/futur-home-page/.incoming
```

---

### Task 5: 삭제 후 운영 검증

**Files:** None

- [ ] **Step 1: 배포 루트 목록 확인**

상위에는 `.incoming`, `current`, `releases`, `shared`만 남아야 한다.

- [ ] **Step 2: 용량 회수 확인**

삭제 전후 `du -sh /home/futur/front/futur-home-page`을 기록한다. 약 1GB 감소가 예상된다.

- [ ] **Step 3: 프로세스·포트 확인**

legacy exact path PID는 0개, current process는 1개, port 3000 listener는 current PID 하나여야 한다.

- [ ] **Step 4: 내부·외부 health 확인**

```bash
curl -fsS http://127.0.0.1:3000/futur-release
curl -fsS https://futur.co.kr/futur-release
curl -fsS -o /dev/null https://futur.co.kr/
curl -fsS -o /dev/null https://futur.co.kr/privacy
curl -fsS -o /dev/null https://futur.co.kr/terms
```

- [ ] **Step 5: PM2 restart 내구성 확인**

`pm2 restart futur --update-env` 후 current SHA와 port 3000을 다시 검증한다. `pm2 save`로 확정한다.

- [ ] **Step 6: 결과 보고**

삭제된 경로, 회수 용량, 복구 불가능함, 보존된 release·shared 경계를 사용자에게 알린다.
