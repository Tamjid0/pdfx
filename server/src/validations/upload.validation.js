import { z } from 'zod';

export const uploadSchema = {
    body: z.object({
        userId: z.string().optional(),
    }),
};

export const embedTextSchema = {
    body: z.object({
        text: z.string().min(1, 'Text content is required for embedding'),
        fileName: z.string().optional(),
    }),
};
