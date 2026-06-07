import rateLimit from 'express-rate-limit';

const createLimitMessage = (windowMs) => ({
  status: 'error',
  message: `Too many requests, please try again in ${Math.ceil(windowMs / 60 / 1000)} minutes`
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: createLimitMessage(15 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: createLimitMessage(15 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: createLimitMessage(15 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
});
