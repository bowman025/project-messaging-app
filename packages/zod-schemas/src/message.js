import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid2('Invalid conversation ID'),
  content: z
    .string()
    .trim()
    .max(2000, 'Message must be at most 2000 characters')
    .optional(),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .regex(/\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i, 'Must be a valid image URL')
    .optional(),
}).refine((data) => data.content || data.imageUrl, {
  message: 'Message must have either content or an image',
});

export const editMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be at most 2000 characters'),
});
