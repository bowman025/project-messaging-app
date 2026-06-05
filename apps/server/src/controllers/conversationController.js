import {
  getConversationsByUserId,
  getConversationById,
  createConversation,
  deleteConversation,
  leaveConversation,
} from '../services/conversationService.js';
import { getIO } from '../config/socket.js';
import { getMessagesByConversationId } from '../services/messageService.js';
import { AppError } from '../utils/AppError.js';
import { createConversationSchema } from '@project-messaging-app/zod-schemas/conversation';

export const getMessages = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    await getConversationById(req.params.id, req.user.id);

    const messages = await getMessagesByConversationId(
      req.params.id,
      cursor ?? null,
      limit ? parseInt(limit) : 30
    );

    res.json({ status: 'success', ...messages });
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await getConversationsByUserId(req.user.id);
    res.json({ status: 'success', conversations });
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const conversation = await getConversationById(
      req.params.id,
      req.user.id,
      cursor ?? null,
      limit ? parseInt(limit) : 30
    );
    res.json({ status: 'success', conversation });
  } catch (err) {
    next(err);
  }
};

export const postConversation = async (req, res, next) => {
  try {
    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const { participantIds, name } = parsed.data;

    if (!name && participantIds.length === 1) {
      const existing = await getConversationsByUserId(req.user.id);
      const duplicate = existing.find(
        (c) =>
          !c.isGroup &&
          c.participants.length === 2 &&
          c.participants.some((p) => p.userId === participantIds[0])
      );
      if (duplicate) throw new AppError('A direct conversation with this user already exists', 409);
    }

    const allParticipantIds = [...new Set([req.user.id, ...participantIds])];

    const conversation = await createConversation({
      participantIds: allParticipantIds,
      name,
      isGroup: allParticipantIds.length > 2,
      creatorId: req.user.id,
    });

    try {
      const io = getIO();
      if (io && io.sockets && io.sockets.sockets) {
        for (const socket of io.sockets.sockets.values()) {
          const sidUserId = socket.user?.id;
          if (sidUserId && sidUserId !== req.user.id && allParticipantIds.includes(sidUserId)) {
            socket.emit('conversation:new', conversation);
          }
        }
      }
    } catch (err) {
      console.error('Failed to emit conversation:new to participants', err);
    }

    res.status(201).json({ status: 'success', conversation });
  } catch (err) {
    next(err);
  }
};

export const removeConversation = async (req, res, next) => {
  try {
    const conversation = await getConversationById(req.params.id, req.user.id);
    await deleteConversation(req.params.id, req.user.id);

    try {
      const io = getIO();
      if (io) {
        io.to(req.params.id).emit('conversation:deleted', {
          conversationId: req.params.id,
          deletedBy: req.user.id,
        });
        if (conversation?.participants?.length) {
          const participantIds = conversation.participants
            .map((p) => p.user?.id ?? p.userId ?? p.id)
            .filter(Boolean);
          for (const socket of io.sockets.sockets.values()) {
            const sidUserId = socket.user?.id;
            if (sidUserId && participantIds.includes(sidUserId)) {
              socket.emit('conversation:deleted', {
                conversationId: req.params.id,
                deletedBy: req.user.id,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to emit conversation:deleted', err);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const leave = async (req, res, next) => {
  try {
    const result = await leaveConversation(req.params.id, req.user.id);
    res.json({ status: 'success', deleted: result.deleted });
  } catch (err) {
    next(err);
  }
};
