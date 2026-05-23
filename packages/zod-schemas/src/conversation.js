import { z } from 'zod';

export const createConversationSchema = z.object({
  participantIds: z
    .array(z.string().cuid('Invalid user ID'))
    .min(1, 'At least one participant is required'),
  name: z
    .string()
    .min(1)
    .max(64)
    .optional(),
});
