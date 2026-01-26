import { z } from 'zod';

export const flashcardsSchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        settings: z.object({
            count: z.number().min(1).max(50).optional(),
            focus: z.enum(['key-concepts', 'definitions', 'important-dates', 'mixed']).optional(),
        }).optional(),
        scope: z.object({
            type: z.enum(['all', 'pages', 'topics']),
            value: z.any()
        }).optional()
    }).refine((data) => data.text || data.fileId, {
        message: "Either text or fileId must be provided",
        path: ["text"],
    }),
};
