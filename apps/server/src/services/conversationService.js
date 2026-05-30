import db from '@project-messaging-app/db';
import { AppError } from '../utils/AppError.js';

export const getConversationsByUserId = async (userId) => {
  return db.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, username: true, avatarUrl: true, bio: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getConversationById = async (id, userId, cursor = null, limit = 30) => {
  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: { user: { select: { id: true, username: true, avatarUrl: true, bio: true } } },
      },
    },
  });

  if (!conversation) throw new AppError('Conversation not found', 404);

  const isMember = conversation.participants.some((p) => p.userId === userId);
  if (!isMember) throw new AppError('Forbidden', 403);

  const messages = await db.message.findMany({
    where: {
      conversationId: id,
      ...(cursor ? { createdAt: { lt: (await db.message.findUnique({ where: { id: cursor } }))?.createdAt } } : {}),
    },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const chronologicalMessages = messages.reverse();

  return {
    ...conversation,
    messages: chronologicalMessages,
    nextCursor: messages.length === limit ? chronologicalMessages[0].id : null,
  };
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
        include: { user: { select: { id: true, username: true, avatarUrl: true, bio: true } } },
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
