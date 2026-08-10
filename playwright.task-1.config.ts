import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3000';
const trustProxy = process.env.CONTACT_TRUST_PROXY ?? '0';

export default defineConfig({
  metadata: {
    contactCapacityTests: true,
  },
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'task-1-chrome',
      testMatch: [
        /contact-server-boundaries\.chrome\.spec\.ts$/,
        /landing-runtime-errors\.chrome\.spec\.ts$/,
      ],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: `env PLAYWRIGHT_E2E=1 CONTACT_TRUST_PROXY=${trustProxy} CONTACT_RATE_LIMIT_CAPACITY=16 CONTACT_IDEMPOTENCY_CAPACITY=8 pnpm dev -- --host 127.0.0.1 --port 3000`,
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
});
