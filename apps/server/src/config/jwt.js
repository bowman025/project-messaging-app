import { env } from './env.js';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: '7d',
};
