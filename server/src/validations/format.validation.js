import { z } from 'zod';

export const formatSchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        settings: z.object({
            formatType: z.enum(['clean', 'reformat', 'summarize']).optional(),
        }).optional(),
    }).refine((data) => data.text || data.fileId, {
        message: "Either text or fileId must be provided",
        path: ["text"],
    }),
};
