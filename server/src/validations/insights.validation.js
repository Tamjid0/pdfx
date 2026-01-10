import { z } from 'zod';

export const insightsSchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        settings: z.object({
            keyEntities: z.boolean().optional(),
            topics: z.boolean().optional(),
            customExtraction: z.string().optional(),
        }).optional(),
    }).refine((data) => data.text || data.fileId, {
        message: "Either text or fileId must be provided",
        path: ["text"],
    }),
};
