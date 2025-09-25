import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import dts from 'vite-plugin-dts';

// Read package.json for version and name
const packageJson = JSON.parse(readFileSync(resolve(__dirname, './package.json'), 'utf-8'));
const { version, name } = packageJson;
const banner = `/*! ${name} v${version} (c) 2023-${new Date().getFullYear()} Portkey Released under ISC License */`;

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PortkeyIframeProvider',
      fileName: 'index',
      formats: ['es'],
    },
    outDir: 'dist',
    sourcemap: true,
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_debugger: true,
    //     drop_console: true,
    //   },
    //   mangle: true,
    // },
    rollupOptions: {
      external: [],
      output: {
        banner,
        globals: {},
      },
    },
  },
  resolve: {
    alias: {
      // Node.js polyfills for browser environment
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
  },
  optimizeDeps: {
    include: ['stream-browserify', 'buffer'],
  },
  plugins: [
    // 生成 TypeScript 声明文件
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
    }),
    {
      name: 'node-polyfills',
      configResolved(_config) {
        // Ensure proper handling of Node.js polyfills
        // Note: define is already set in the main config
      },
    },
  ],
});
