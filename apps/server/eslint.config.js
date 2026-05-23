import serverConfig from '@messaging-app/eslint-config/server';

export default [
  {
    ...serverConfig,
    files: ['src/**/*.js'],
  },
];
