import { socketAuthenticate } from '../middleware/socketAuthenticate.js';
import { createMessage, editMessage, deleteMessage } from '../services/messageService.js';
import { getConversationById } from '../services/conversationService.js';

export const initSocket = (io) => {
  io.use(socketAuthenticate);

  io.on('connection', (socket) => {
    const userId = socket.user.id;


    socket.on('join:conversations', async (conversationIds) => {
      if (!Array.isArray(conversationIds)) return;
      conversationIds.forEach((id) => socket.join(id));
    });

    socket.on('join:conversation', async (conversationId) => {
      try {
        await getConversationById(conversationId, userId);
        socket.join(conversationId);
      } catch (err) {
        console.error(`Error in join:conversation for user ${userId}:`, err);
        socket.emit('error', { message: 'Forbidden' });
      }
    });

    socket.on('message:send', async ({ conversationId, content, imageUrl, tempId }) => {
      try {
        await getConversationById(conversationId, userId);

        const message = await createMessage({
          conversationId,
          authorId: userId,
          content,
          imageUrl,
        });

        socket.to(conversationId).emit('message:new', message);
        socket.emit('message:new', { ...message, tempId });
      } catch (err) {
        console.error(`Error in message:send for user ${userId}:`, err);
        socket.emit('error', { message: err.message, tempId });
      }
    });

    socket.on('message:edit', async ({ messageId, conversationId, content }) => {
      try {
        const message = await editMessage(messageId, userId, content);
        io.to(conversationId).emit('message:edited', message);
      } catch (err) {
        console.error(`Error in message:edit for user ${userId}:`, err);
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('message:delete', async ({ messageId, conversationId }) => {
      try {
        await deleteMessage(messageId, userId);
        io.to(conversationId).emit('message:deleted', { messageId, conversationId });
      } catch (err) {
        console.error(`Error in message:delete for user ${userId}:`, err);
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('presence:online', async (conversationIds) => {
      if (!Array.isArray(conversationIds)) return;
      conversationIds.forEach((id) => {
        socket.to(id).emit('presence:online', { userId });
      });
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:start', {
        userId,
        username: socket.user.username,
        conversationId,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:stop', {
        userId,
        conversationId,
      });
    });

    socket.on('disconnect', () => {
      socket.rooms.forEach((room) => {
        socket.to(room).emit('presence:offline', { userId });
        socket.to(room).emit('typing:stop', { userId, conversationId: room });
      });
    });
  });
};
