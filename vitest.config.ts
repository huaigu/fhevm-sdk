import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test/**',
        '**/*.config.ts',
        '**/*.config.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@fhevm/core': path.resolve(__dirname, './packages/core/src'),
      '@fhevm/react': path.resolve(__dirname, './packages/react/src'),
      '@fhevm/vue': path.resolve(__dirname, './packages/vue/src'),
      'fhevm-sdk': path.resolve(__dirname, './packages/fhevm-sdk/src'),
    },
  },
});
