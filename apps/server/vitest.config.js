import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
    alias: [
      {
        find: /^@project-messaging-app\/db$/,
        replacement: resolve('../../packages/db/src/testClient.js'),
      },
    ],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/test/**', 'src/index.js'],
    },
  },
});
