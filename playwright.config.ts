import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const useComet = process.env.PLAYWRIGHT_USE_COMET !== '0';
const cometExecutablePath =
  process.env.COMET_EXECUTABLE_PATH ?? '/Applications/Comet.app/Contents/MacOS/Comet';

if (useComet && !existsSync(cometExecutablePath)) {
  throw new Error(
    `Comet executable was not found at ${cometExecutablePath}. Set COMET_EXECUTABLE_PATH or PLAYWRIGHT_USE_COMET=0.`,
  );
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'comet',
      testMatch: /\.comet\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        ...(useComet
          ? {
              launchOptions: {
                executablePath: cometExecutablePath,
              },
            }
          : {}),
      },
    },
    {
      name: 'a11y',
      testMatch: /\.a11y\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        // a11y 전용 — Comet 미사용 (stock Chromium 으로 axe-core 분석)
      },
    },
  ],
  webServer:
    process.env.PLAYWRIGHT_SKIP_WEB_SERVER === '1'
      ? undefined
      : {
          command: 'env PLAYWRIGHT_E2E=1 pnpm dev -- --host 127.0.0.1 --port 3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          url: baseURL,
        },
});
