import clientConfig from '@messaging-app/eslint-config/client';

export default [
  {
    ...clientConfig,
    files: ['src/**/*.{js,jsx}'],
  },
];
