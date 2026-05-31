import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { testDb } from './setup.js';
import { env } from '../config/env.js';

export const createTestUser = async ({
  username = 'testuser',
  email = 'test@example.com',
  password = 'password123',
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return testDb.user.create({
    data: { username, email, passwordHash },
  });
};

export const getAuthToken = (userId) => {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '1d' });
};

export const createTestConversation = async (participantIds) => {
  return testDb.conversation.create({
    data: {
      participants: {
        create: participantIds.map((userId) => ({ userId })),
      },
    },
    include: {
      participants: true,
    },
  });
};
