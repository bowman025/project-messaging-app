import db from '@project-messaging-app/db';
import { AppError } from '../utils/AppError.js';

export const getConversationsByUserId = async (userId) => {
  return db.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getConversationById = async (id, userId) => {
  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, username: true, avatarUrl: true } } },
      },
    },
  });

  if (!conversation) throw new AppError('Conversation not found', 404);

  const isMember = conversation.participants.some((p) => p.userId === userId);
  if (!isMember) throw new AppError('Forbidden', 403);

  return conversation;
};

export const createConversation = async ({ participantIds, name, isGroup }) => {
  return db.conversation.create({
    data: {
      name,
      isGroup: isGroup ?? participantIds.length > 1,
      participants: {
        create: participantIds.map((userId) => ({ userId })),
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      },
    },
  });
};

export const deleteConversation = async (id, userId) => {
  const conversation = await db.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });

  if (!conversation) throw new AppError('Conversation not found', 404);

  const isMember = conversation.participants.some((p) => p.userId === userId);
  if (!isMember) throw new AppError('Forbidden', 403);

  return db.conversation.delete({ where: { id } });
};
