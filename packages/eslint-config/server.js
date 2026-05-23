import base from './base.js';
import globals from 'globals';

export default {
  ...base,
  languageOptions: {
    ...base.languageOptions,
    globals: {
      ...base.languageOptions.globals,
      ...globals.node,
    },
  },
};
