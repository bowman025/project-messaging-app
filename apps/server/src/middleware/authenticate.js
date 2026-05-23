import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { findUserById } from '../services/userService.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, jwtConfig.secret);

    const user = await findUserById(payload.sub);
    req.user = user;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Unauthorized', 401));
    }
    next(err);
  }
};
