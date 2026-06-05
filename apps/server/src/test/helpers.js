import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { testDb } from './setup.js';
import { env } from '../config/env.js';

export const createTestUser = async ({
  username,
  email = `test-${randomUUID()}@example.com`,
  password = 'Password123',
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return testDb.user.create({
    data: {
      username: username ?? `testuser-${randomUUID()}`,
      email,
      passwordHash,
    },
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
