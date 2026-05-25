import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getConversations,
  getConversation,
  postConversation,
  removeConversation,
} from '../controllers/conversationController.js';
import { postMessage, patchMessage, removeMessage } from '../controllers/messageController.js';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/:id', getConversation);
router.post('/', postConversation);
router.delete('/:id', removeConversation);

router.post('/:conversationId/messages', postMessage);
router.patch('/:conversationId/messages/:id', patchMessage);
router.delete('/:conversationId/messages/:id', removeMessage);

export default router;
