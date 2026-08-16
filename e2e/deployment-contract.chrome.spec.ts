import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const workflowPath = `${projectRoot}.github/workflows/ci.yml`;
const playwrightConfigPath = `${projectRoot}playwright.config.ts`;
const ecosystemPath = `${projectRoot}deploy/pm2/ecosystem.config.cjs`;
const deployScriptPath = `${projectRoot}deploy/scripts/deploy-release.sh`;
const e2eContactRoutePath = `${projectRoot}src/routes/internal-e2e.contact-inquiry.ts`;

test.describe('운영 배포 계약', () => {
  test('PR과 master를 분리된 품질·계약·E2E 작업으로 검증하고 master만 배포한다', () => {
    const workflow = readFileSync(workflowPath, 'utf8');

    expect(workflow).toContain('name: CI & Deploy');
    expect(workflow).toMatch(/pull_request:\s*\n/);
    expect(workflow).toMatch(/push:\s*\n\s+branches:\s*\[master\]/);
    expect(workflow).toMatch(/workflow_dispatch:\s*\n/);
    expect(workflow).toContain('node-version: 22');
    expect(workflow).toContain('version: 10');
    expect(workflow).toContain('pnpm install --frozen-lockfile');
    expect(workflow).toContain('pnpm lint');
    expect(workflow).toContain('pnpm exec tsc -b --noEmit');
    expect(workflow).toContain('pnpm build');
    expect(workflow).toContain('deployment-contract:');
    expect(workflow).toContain('e2e:');
    expect(workflow).toContain('hero-e2e:');
    expect(workflow).toContain('shard: [1, 2, 3, 4]');
    expect(workflow).toContain('PLAYWRIGHT_CI_LIGHT_PARTICLES');
    expect(workflow).toContain('landing-hero-cinematic.chrome.spec.ts');
    expect(workflow).toContain('PLAYWRIGHT_E2E=1');
    expect(workflow).toContain("PLAYWRIGHT_PRODUCTION_SERVER: '1'");
    expect(workflow).toContain('--shard="${SHARD}/4" --workers=1');
    expect(workflow).toContain('--timeout=90000 --retries=1');
    expect(workflow).toContain('include-hidden-files: true');
    expect(workflow).toContain('needs: [quality, deployment-contract, e2e, hero-e2e]');
    expect(workflow).toContain("github.ref == 'refs/heads/master'");
    expect(workflow).toContain('cancel-in-progress: false');
  });

  test('일반 shard에만 명시적인 CI 경량 파티클 쿠키를 제공한다', () => {
    const workflow = readFileSync(workflowPath, 'utf8');
    const playwrightConfig = readFileSync(playwrightConfigPath, 'utf8');

    expect(workflow).toContain("PLAYWRIGHT_CI_LIGHT_PARTICLES: '1'");
    expect(playwrightConfig).toContain('PLAYWRIGHT_CI_LIGHT_PARTICLES');
    expect(playwrightConfig).toContain('futur-e2e-particles');
    expect(playwrightConfig).toContain('retries: process.env.CI ? 1 : 0');
    expect(playwrightConfig).toContain("video: process.env.CI ? 'off' : 'retain-on-failure'");
  });

  test('기존 SSH 인증정보와 문의 환경변수만 운영 배포에 전달한다', () => {
    const workflow = readFileSync(workflowPath, 'utf8');

    for (const secret of [
      'SSH_HOST',
      'SSH_USERNAME',
      'SSH_KEY',
      'SSH_PORT',
      'DEPLOY_PATH',
      'RESEND_API_KEY',
      'CONTACT_FROM_EMAIL',
      'CONTACT_TO_EMAIL',
      'CONTACT_RATE_LIMIT_SALT',
      'CONTACT_TRUST_PROXY',
    ]) {
      expect(workflow).toContain(`secrets.${secret}`);
    }

    expect(workflow).not.toMatch(/docker|prisma|DATABASE_URL|SESSION_SECRET/i);
  });

  test('Nitro 서버를 current release에서 단일 PM2 프로세스로 실행한다', () => {
    expect(existsSync(ecosystemPath)).toBe(true);
    const ecosystem = readFileSync(ecosystemPath, 'utf8');

    expect(ecosystem).toContain("name: 'futur'");
    expect(ecosystem).toContain('current/server/index.mjs');
    expect(ecosystem).toContain("exec_mode: 'fork'");
    expect(ecosystem).toContain('instances: 1');
    expect(ecosystem).toContain("NODE_ENV: 'production'");
    expect(ecosystem).toContain("PORT: '3000'");
  });

  test('release 전환, 내부 확인, 외부 실패 롤백과 최근 5개 보존 계약을 갖는다', () => {
    expect(existsSync(deployScriptPath)).toBe(true);
    const script = readFileSync(deployScriptPath, 'utf8');

    expect(script).toContain('releases_dir="${deploy_path}/releases"');
    expect(script).toContain('release_dir="${releases_dir}/${release_sha}"');
    expect(script).toContain('/current');
    expect(script).toContain('pm2 save');
    expect(script).toContain('pm2 resurrect');
    expect(script).toContain('BUILT FOR WHAT');
    expect(script).toContain('127.0.0.1:3000');
    expect(script).toContain('rollback');
    expect(script).toMatch(/tail\s+-n\s+\+6/);
  });

  test('문의 검증용 HTTP 경로는 Playwright 서버 밖에서 닫힌다', () => {
    const route = readFileSync(e2eContactRoutePath, 'utf8');

    expect(route).toContain("process.env.PLAYWRIGHT_E2E !== '1'");
    expect(route).toContain('status: 404');
  });
});
