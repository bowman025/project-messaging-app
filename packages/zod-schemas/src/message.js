import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid2('Invalid conversation ID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be at most 2000 characters'),
});

export const editMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be at most 2000 characters'),
});
