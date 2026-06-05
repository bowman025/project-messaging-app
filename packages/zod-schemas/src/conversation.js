import { z } from 'zod';

export const createConversationSchema = z.object({
  participantIds: z
    .array(z.string().cuid2('Invalid user ID'))
    .min(1, 'At least one participant is required'),
  name: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 character')
    .max(64, 'Name must be at most 64 characters')
    .optional(),
});
