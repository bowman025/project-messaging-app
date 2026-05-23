import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import { jwtConfig } from '../config/jwt.js';
import { createUser, findUserByEmail } from '../services/userService.js';
import { AppError } from '../utils/AppError.js';
import { registerSchema, loginSchema } from '@project-messaging-app/zod-schemas/user';

const signToken = (userId) =>
  jwt.sign({ sub: userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

const sanitizeUser = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const { username, email, password } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) throw new AppError('Email already in use', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({ username, email, passwordHash });

    const token = signToken(user.id);

    res.status(201).json({
      status: 'success',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const login = (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return next(parsed.error);

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return next(new AppError(info?.message ?? 'Invalid credentials', 401));

    const token = signToken(user.id);

    res.json({
      status: 'success',
      token,
      user: sanitizeUser(user),
    });
  })(req, res, next);
};

export const getMe = (req, res) => {
  res.json({
    status: 'success',
    user: sanitizeUser(req.user),
  });
};
