import { defineConfig } from 'eslint/config';
import clientConfig from '@project-messaging-app/eslint-config/client';

export default defineConfig(clientConfig, {
  files: ['src/**/*.{js,jsx}'],
});
