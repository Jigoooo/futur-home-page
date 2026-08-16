import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const lightParticleStorageState =
  process.env.PLAYWRIGHT_CI_LIGHT_PARTICLES === '1'
    ? {
        cookies: [
          {
            name: 'futur-e2e-particles',
            value: 'lite',
            domain: new URL(baseURL).hostname,
            path: '/',
            expires: -1,
            httpOnly: false,
            secure: baseURL.startsWith('https://'),
            sameSite: 'Lax' as const,
          },
        ],
        origins: [],
      }
    : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    storageState: lightParticleStorageState,
    trace: 'on-first-retry',
    video: process.env.CI ? 'off' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      testMatch: /\.chrome\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'a11y',
      testMatch: /\.a11y\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer:
    process.env.PLAYWRIGHT_SKIP_WEB_SERVER === '1'
      ? undefined
      : {
          command: 'env PLAYWRIGHT_E2E=1 pnpm dev -- --host 127.0.0.1 --port 3000',
          reuseExistingServer: false,
          timeout: 120_000,
          url: baseURL,
        },
});
