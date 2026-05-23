import { defineConfig } from 'eslint/config';
import serverConfig from '@project-messaging-app/eslint-config/server';

export default defineConfig(serverConfig, {
  files: ['src/**/*.js'],
});
