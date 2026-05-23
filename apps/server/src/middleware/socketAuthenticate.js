import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { findUserById } from '../services/userService.js';

export const socketAuthenticate = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    const payload = jwt.verify(token, jwtConfig.secret);
    const user = await findUserById(payload.sub);
    socket.user = user;

    next();
  } catch (err) {
    next(err);
  }
};
