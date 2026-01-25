import { z } from 'zod';

export const exportSchema = {
    body: z.object({
        content: z.any().optional(),
        html: z.any().optional(),
        data: z.any().optional(),
        mode: z.string().optional(),
        format: z.enum(['pdf', 'docx', 'txt', 'json', 'csv']),
        filename: z.string().optional(),
    }),
};
