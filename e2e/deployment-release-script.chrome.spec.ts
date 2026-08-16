import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const deployScript = `${projectRoot}deploy/scripts/deploy-release.sh`;
const ecosystemConfig = `${projectRoot}deploy/pm2/ecosystem.config.cjs`;
const firstSha = '1111111111111111111111111111111111111111';
const secondSha = '2222222222222222222222222222222222222222';

interface Harness {
  root: string;
  deployPath: string;
  env: NodeJS.ProcessEnv;
  prepareRelease: (sha: string, validArtifact?: boolean) => string;
  seedLegacyProcess: () => void;
  run: (action: 'deploy' | 'rollback' | 'finalize', sha: string) => void;
}

function createHarness(): Harness {
  const root = mkdtempSync(join(tmpdir(), 'futur-deploy-contract-'));
  const deployPath = join(root, 'production');
  const fakeBin = join(root, 'bin');
  const fakeHome = join(root, 'home');
  const pm2Log = join(root, 'pm2.log');
  const pm2State = join(root, 'pm2-state');
  const curlCount = join(root, 'curl-count');

  mkdirSync(fakeBin, { recursive: true });
  mkdirSync(fakeHome, { recursive: true });
  writeFileSync(
    join(fakeBin, 'pm2'),
    `#!/usr/bin/env bash
set -Eeuo pipefail
printf '%s\n' "$*" >> "$FAKE_PM2_LOG"
mkdir -p "$HOME/.pm2"
case "\${1:-}" in
  save) printf 'legacy-process-dump' > "$HOME/.pm2/dump.pm2" ;;
  startOrReload)
    [[ "\${FAKE_PM2_FAIL_START:-0}" != '1' ]]
    if [[ "\${FAKE_PM2_PRESERVE_LEGACY_ON_RELOAD:-0}" != '1' || "$(cat "$FAKE_PM2_STATE" 2>/dev/null || true)" != 'legacy' ]]; then
      printf 'new' > "$FAKE_PM2_STATE"
    fi
    ;;
  start)
    [[ "\${FAKE_PM2_FAIL_START:-0}" != '1' ]]
    printf 'new' > "$FAKE_PM2_STATE"
    ;;
  delete) rm -f "$FAKE_PM2_STATE" ;;
  resurrect) printf 'legacy' > "$FAKE_PM2_STATE" ;;
esac
`,
  );
  writeFileSync(
    join(fakeBin, 'curl'),
    `#!/usr/bin/env bash
set -Eeuo pipefail
count=0
if [[ -f "$FAKE_CURL_COUNT" ]]; then count="$(<"$FAKE_CURL_COUNT")"; fi
count=$((count + 1))
printf '%s' "$count" > "$FAKE_CURL_COUNT"
if [[ "\${FAKE_CURL_MODE:-marker}" == 'fail-new' && "$count" -le 12 ]]; then exit 22; fi
if [[ "\${FAKE_CURL_MODE:-marker}" == 'pm2-state' && "$(cat "$FAKE_PM2_STATE" 2>/dev/null || true)" == 'new' ]]; then
  printf '<h1>BUILT FOR WHAT</h1>'
elif [[ "\${FAKE_CURL_MODE:-marker}" == 'marker' ]]; then
  printf '<h1>BUILT FOR WHAT</h1>'
else
  printf '<h1>legacy homepage</h1>'
fi
`,
  );
  writeFileSync(join(fakeBin, 'sleep'), '#!/usr/bin/env bash\nexit 0\n');
  for (const command of ['pm2', 'curl', 'sleep']) chmodSync(join(fakeBin, command), 0o755);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HOME: fakeHome,
    NVM_DIR: join(fakeHome, '.nvm'),
    PATH: `${fakeBin}:${process.env.PATH ?? '/usr/bin:/bin'}`,
    FAKE_PM2_LOG: pm2Log,
    FAKE_PM2_STATE: pm2State,
    FAKE_CURL_COUNT: curlCount,
    FAKE_CURL_MODE: 'marker',
  };

  const prepareRelease = (sha: string, validArtifact = true) => {
    const incoming = join(deployPath, '.incoming', sha);
    const output = join(root, `output-${sha}`);
    mkdirSync(join(output, 'server'), { recursive: true });
    if (validArtifact) writeFileSync(join(output, 'server', 'index.mjs'), 'export {};\n');
    mkdirSync(incoming, { recursive: true });
    execFileSync('tar', ['-C', output, '-czf', join(incoming, 'futur-output.tar.gz'), '.']);
    writeFileSync(
      join(incoming, 'futur-runtime.env'),
      'RESEND_API_KEY=test\nCONTACT_FROM_EMAIL=test@example.com\n',
    );
    cpSync(ecosystemConfig, join(incoming, 'ecosystem.config.cjs'));
    return incoming;
  };

  const run = (action: 'deploy' | 'rollback' | 'finalize', sha: string) => {
    const incoming = join(deployPath, '.incoming', sha);
    execFileSync('bash', [deployScript, action, deployPath, sha, incoming], {
      env,
      stdio: 'pipe',
    });
  };

  const seedLegacyProcess = () => {
    writeFileSync(pm2State, 'legacy');
    env.FAKE_PM2_PRESERVE_LEGACY_ON_RELOAD = '1';
    env.FAKE_CURL_MODE = 'pm2-state';
  };

  return { root, deployPath, env, prepareRelease, seedLegacyProcess, run };
}

test.describe('release 배포 스크립트', () => {
  let harness: Harness;

  test.beforeEach(() => {
    harness = createHarness();
  });

  test.afterEach(() => {
    rmSync(harness.root, { recursive: true, force: true });
  });

  test('검증된 Nitro artifact를 current로 전환하고 성공 상태를 저장한다', () => {
    harness.prepareRelease(firstSha);
    harness.run('deploy', firstSha);

    expect(readlinkSync(join(harness.deployPath, 'current'))).toBe(
      join(harness.deployPath, 'releases', firstSha),
    );
    harness.run('finalize', firstSha);
    expect(
      readFileSync(join(harness.deployPath, 'shared', 'last-successful-release'), 'utf8'),
    ).toBe(firstSha);
  });

  test('같은 이름의 기존 PM2 앱을 새 Nitro 프로세스로 교체한다', () => {
    harness.prepareRelease(firstSha);
    harness.seedLegacyProcess();

    harness.run('deploy', firstSha);

    expect(readlinkSync(join(harness.deployPath, 'current'))).toBe(
      join(harness.deployPath, 'releases', firstSha),
    );
    expect(readFileSync(join(harness.root, 'pm2-state'), 'utf8')).toBe('new');
  });

  test('다음 release의 외부 검증이 실패하면 직전 release로 되돌릴 수 있다', () => {
    harness.prepareRelease(firstSha);
    harness.run('deploy', firstSha);
    harness.run('finalize', firstSha);
    harness.prepareRelease(secondSha);
    harness.run('deploy', secondSha);
    harness.run('rollback', secondSha);

    expect(readlinkSync(join(harness.deployPath, 'current'))).toBe(
      join(harness.deployPath, 'releases', firstSha),
    );
  });

  test('첫 전환에서 PM2 시작이 실패하면 저장한 기존 PM2 상태를 복구한다', () => {
    harness.prepareRelease(firstSha);
    harness.env.FAKE_PM2_FAIL_START = '1';

    expect(() => harness.run('deploy', firstSha)).toThrow();
    expect(existsSync(join(harness.deployPath, 'current'))).toBe(false);
    expect(readFileSync(join(harness.root, 'pm2.log'), 'utf8')).toContain('resurrect');
  });

  test('Nitro 진입점이 없는 artifact는 활성화하지 않는다', () => {
    harness.prepareRelease(firstSha, false);

    expect(() => harness.run('deploy', firstSha)).toThrow();
    expect(existsSync(join(harness.deployPath, 'current'))).toBe(false);
    expect(readFileSync(join(harness.root, 'pm2.log'), 'utf8')).not.toContain('startOrReload');
  });

  test('내부 health check가 실패하면 기존 PM2 상태로 복구한다', () => {
    harness.prepareRelease(firstSha);
    harness.env.FAKE_CURL_MODE = 'fail-new';

    expect(() => harness.run('deploy', firstSha)).toThrow();
    expect(existsSync(join(harness.deployPath, 'current'))).toBe(false);
    expect(readFileSync(join(harness.root, 'pm2.log'), 'utf8')).toContain('resurrect');
  });
});
