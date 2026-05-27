import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.es2021,
    },
  },
  rules: {
    ...js.configs.recommended.rules,
    ...eslintConfigPrettier.rules,
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
