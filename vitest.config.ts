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
  test: {
    environment: 'node',
    setupFiles: ['./vitest-setup/setup.ts'],
    pool: 'forks',
    testTimeout: 5000,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      // Exclude browser-specific tests
      '**/detect-provider/test/**',
      '**/providers/test/web3Provider.test.ts',
      '**/providers/test/portkeyPostStream.test.ts',
      '**/providers/test/system.test.ts',
    ],
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
    globals: true,
  },
  resolve: {
    alias: {
      ...alias,
      'aelf-sdk': path.resolve(__dirname, 'node_modules/aelf-sdk/dist/aelf.cjs'),
    },
  },
});
