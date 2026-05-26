import babel from '@rolldown/plugin-babel';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isPlaywrightE2E = process.env.PLAYWRIGHT_E2E === '1';

  return {
    server: {
      host: '0.0.0.0',
      port: Number.parseInt(env.VITE_PORT || '', 10) || 3000,
      open: !isPlaywrightE2E,
      watch: isPlaywrightE2E
        ? {
            ignored: [
              '**/.git/**',
              '**/.output/**',
              '**/.tanstack/**',
              '**/dist/**',
              '**/dist-ssr/**',
              '**/graphify-out/**',
              '**/node_modules/**',
              '**/playwright-report/**',
              '**/test-results/**',
            ],
            interval: 500,
            usePolling: true,
          }
        : undefined,
    },
    plugins: [
      tanstackStart(),
      nitro(),
      react(),
      babel({
        include: /\.[jt]sx?$/,
        presets: [reactCompilerPreset()],
      }),
      tsconfigPaths(),
    ],
    assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.otf'],
    build: {
      sourcemap: true,
    },
  };
});

export default config;
