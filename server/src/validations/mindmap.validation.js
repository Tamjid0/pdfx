import { z } from 'zod';

export const mindmapSchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        settings: z.object({
            layout: z.enum(['organic', 'hierarchical', 'circular']).optional(),
        }).optional(),
    }).refine((data) => data.text || data.fileId, {
        message: "Either text or fileId must be provided",
        path: ["text"],
    }),
};
