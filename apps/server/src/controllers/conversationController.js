import {
  getConversationsByUserId,
  getConversationById,
  createConversation,
  deleteConversation,
} from '../services/conversationService.js';
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
    });

    res.status(201).json({ status: 'success', conversation });
  } catch (err) {
    next(err);
  }
};

export const removeConversation = async (req, res, next) => {
  try {
    await deleteConversation(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
