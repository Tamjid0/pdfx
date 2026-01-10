import { z } from 'zod';

export const exportSchema = {
    body: z.object({
        content: z.any(),
        format: z.enum(['pdf', 'docx', 'txt', 'json']),
        filename: z.string().optional(),
    }),
};
