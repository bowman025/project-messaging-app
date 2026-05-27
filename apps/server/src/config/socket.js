import { socketAuthenticate } from '../middleware/socketAuthenticate.js';
import { createMessage, editMessage, deleteMessage } from '../services/messageService.js';
import { getConversationById } from '../services/conversationService.js';

export const initSocket = (io) => {
  io.use(socketAuthenticate);

  io.on('connection', (socket) => {
    const userId = socket.user.id;

    console.warn(`User connected: ${userId}`);

    socket.on('join:conversations', async (conversationIds) => {
      console.warn('join:conversations received', conversationIds);
      if (!Array.isArray(conversationIds)) return;
      conversationIds.forEach((id) => socket.join(id));
      console.warn('rooms after join:conversations', [...socket.rooms]);
    });

    socket.on('join:conversation', async (conversationId) => {
      console.warn('join:conversation received', conversationId, 'for user', userId);
      try {
        await getConversationById(conversationId, userId);
        socket.join(conversationId);
        console.warn('joined room', conversationId, 'rooms now', [...socket.rooms]);
      } catch {
        socket.emit('error', { message: 'Forbidden' });
      }
    });

    socket.on('message:send', async ({ conversationId, content, tempId }) => {
      try {
        await getConversationById(conversationId, userId);
        const message = await createMessage({ conversationId, authorId: userId, content });

        const room = io.sockets.adapter.rooms.get(conversationId);
        console.warn('room members:', room ? [...room] : 'empty');
        console.warn('total sockets in room:', room?.size ?? 0);

        socket.to(conversationId).emit('message:new', message);
        socket.emit('message:new', { ...message, tempId });
      } catch (err) {
        socket.emit('error', { message: err.message, tempId });
      }
    });

    socket.on('message:edit', async ({ messageId, conversationId, content }) => {
      try {
        const message = await editMessage(messageId, userId, content);
        io.to(conversationId).emit('message:edited', message);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('message:delete', async ({ messageId, conversationId }) => {
      try {
        await deleteMessage(messageId, userId);
        io.to(conversationId).emit('message:deleted', { messageId, conversationId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('presence:online', async (conversationIds) => {
      if (!Array.isArray(conversationIds)) return;
      conversationIds.forEach((id) => {
        socket.to(id).emit('presence:online', { userId });
      });
    });

    socket.on('disconnect', () => {
      console.warn(`User disconnected: ${userId}`);
      socket.rooms.forEach((room) => {
        socket.to(room).emit('presence:offline', { userId });
      });
    });
  });
};
