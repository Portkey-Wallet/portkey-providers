/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';
import { lstatSync, readdirSync } from 'fs';

// get listing of packages in the mono repo
const basePath = path.resolve(__dirname, 'packages');
const packages = readdirSync(basePath).filter((name: string) => lstatSync(path.join(basePath, name)).isDirectory());

const alias: Record<string, string> = {};
packages.forEach((key: string) => {
  alias[`@portkey/${key}/test/(.+)$`] = path.resolve(__dirname, `packages/${key}/test/$1`);
  alias[`@portkey/${key}`] = path.resolve(__dirname, `packages/${key}/src`);
});

export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env': '{ RUNTIME_ENV: "browser" }',
  },
  test: {
    globals: true,
    env: {
      RUNTIME_ENV: 'browser',
    },
    environment: 'happy-dom',
    setupFiles: ['./vitest-setup/setup.browser.ts'],
    // pool: 'forks',
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text'],
      include: ['**/packages/**/**'],
      exclude: [
        'node_modules/',
        '__generated__/',
        'dist/',
        'entity/',
        'chain/',
        'providerInjection',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/vitest-setup/**',
        '**/packages/example/**',
        '**/packages/example-next/**',
        '**/packages/chrome-extension/**',
        '**/packages/extension-provider/**',
        '**/packages/iframe-provider/**',
        '**/packages/mobile-provider/**',
        '**/packages/types/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
      reportOnFailure: true,
    },
  },
  resolve: {
    alias: {
      ...alias,
      buffer: 'buffer',
      stream: 'stream-browserify',
      process: 'process/browser',
      events: 'events',
    },
  },
});
