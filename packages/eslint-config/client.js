import base from './base.js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default {
  ...base,
  languageOptions: {
    ...base.languageOptions,
    globals: {
      ...base.languageOptions.globals,
      ...globals.browser,
    },
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    'jsx-a11y': jsxA11yPlugin,
  },
  settings: {
    react: { version: '19.2' },
  },
  rules: {
    ...base.rules,
    ...reactPlugin.configs.recommended.rules,
    ...reactHooksPlugin.configs.recommended.rules,
    ...jsxA11yPlugin.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
