import base from './base.js';
import globals from 'globals';
import vitestPlugin from 'eslint-plugin-vitest';

export default {
  ...base,
  languageOptions: {
    ...base.languageOptions,
    globals: {
      ...base.languageOptions.globals,
      ...globals.node,
      ...vitestPlugin.environments.env.globals,
    },
  },
  plugins: {
    vitest: vitestPlugin,
  },
  rules: {
    ...base.rules,
    ...vitestPlugin.configs.recommended.rules,
  },
};
