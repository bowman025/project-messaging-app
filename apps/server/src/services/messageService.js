import db from '@project-messaging-app/db';
import { AppError } from '../utils/AppError.js';
import cloudinary from '../config/cloudinary.js';
import { extractPublicId } from '../utils/cloudinaryUtils.js';

export const getMessagesByConversationId = async (conversationId, cursor = null, limit = 30) => {
  let cursorDate = null;

  if (cursor) {
    const cursorMessage = await db.message.findUnique({ where: { id: cursor } });
    cursorDate = cursorMessage?.createdAt ?? null;
  }

  const messages = await db.message.findMany({
    where: {
      conversationId,
      ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
    },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const chronologicalMessages = messages.reverse();

  return {
    messages: chronologicalMessages,
    nextCursor: messages.length === limit ? chronologicalMessages[0].id : null,
  };
};

export const createMessage = async ({ conversationId, authorId, content, imageUrl }) => {
  const [message] = await db.$transaction([
    db.message.create({
      data: { conversationId, authorId, content, imageUrl },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
};

export const editMessage = async (id, userId, content) => {
  const message = await db.message.findUnique({ where: { id } });
  if (!message) throw new AppError('Message not found', 404);
  if (message.authorId !== userId) throw new AppError('Forbidden', 403);

  return db.message.update({
    where: { id },
    data: { content, edited: true },
  });
};

export const deleteMessage = async (id, userId) => {
  const message = await db.message.findUnique({ where: { id } });
  if (!message) throw new AppError('Message not found', 404);
  if (message.authorId !== userId) throw new AppError('Forbidden', 403);

  if (message.imageUrl) {
    const publicId = extractPublicId(message.imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (_err) {
        console.error('Failed to delete image from Cloudinary:', publicId);
      }
    }
  }

  return db.message.delete({ where: { id } });
};
