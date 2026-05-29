import { createMessage, editMessage, deleteMessage } from '../services/messageService.js';
import { sendMessageSchema, editMessageSchema } from '@project-messaging-app/zod-schemas/message';
import { getConversationById } from '../services/conversationService.js';

export const postMessage = async (req, res, next) => {
  try {
    const parsed = sendMessageSchema.safeParse({
      conversationId: req.params.conversationId,
      content: req.body.content,
      imageUrl: req.body.imageUrl,
    });
    if (!parsed.success) return next(parsed.error);

    await getConversationById(parsed.data.conversationId, req.user.id);

    const message = await createMessage({
      conversationId: parsed.data.conversationId,
      authorId: req.user.id,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
    });

    res.status(201).json({ status: 'success', message });
  } catch (err) {
    next(err);
  }
};

export const patchMessage = async (req, res, next) => {
  try {
    const parsed = editMessageSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const message = await editMessage(req.params.id, req.user.id, parsed.data.content);
    res.json({ status: 'success', message });
  } catch (err) {
    next(err);
  }
};

export const removeMessage = async (req, res, next) => {
  try {
    await deleteMessage(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
