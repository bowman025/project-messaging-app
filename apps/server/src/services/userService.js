import db from '@project-messaging-app/db';
import { AppError } from '../utils/AppError.js';

export const findUserByEmail = async (email) => {
  return db.user.findUnique({ where: { email } });
};

export const findUserById = async (id) => {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const createUser = async ({ username, email, passwordHash }) => {
  return db.user.create({
    data: { username, email, passwordHash },
  });
};

export const updateUser = async (id, data) => {
  const user = await db.user.update({
    where: { id },
    data,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};
