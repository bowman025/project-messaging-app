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
      ...(cursor
        ? { createdAt: { lt: (await db.message.findUnique({ where: { id: cursor } }))?.createdAt } }
        : {}),
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

export const createConversation = async ({ participantIds, name, isGroup, creatorId }) => {
  return db.conversation.create({
    data: {
      name,
      isGroup: isGroup ?? participantIds.length > 2,
      creatorId,
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
  if (conversation.creatorId !== userId)
    throw new AppError('Only the creator can delete this conversation', 403);

  return db.conversation.delete({ where: { id } });
};

export const leaveConversation = async (id, userId) => {
  const conversation = await db.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });

  if (!conversation) throw new AppError('Conversation not found', 404);

  const isMember = conversation.participants.some((p) => p.userId === userId);
  if (!isMember) throw new AppError('You are not a member of this conversation', 403);

  if (conversation.creatorId === userId) {
    throw new AppError('Creators cannot leave — delete the conversation instead', 403);
  }

  await db.participant.deleteMany({
    where: { conversationId: id, userId },
  });

  const remaining = conversation.participants.filter((p) => p.userId !== userId);
  if (remaining.length === 0) {
    await db.conversation.delete({ where: { id } });
    return { deleted: true };
  }

  return { deleted: false };
};
