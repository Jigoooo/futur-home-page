import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'task-2-chrome',
      testMatch: /landing-evidence\.chrome\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: 'env PLAYWRIGHT_E2E=1 pnpm dev -- --host 127.0.0.1 --port 3000',
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
});
