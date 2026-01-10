import { z } from 'zod';

export const notesSchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        settings: z.object({
            keyConcepts: z.boolean().optional(),
            actionItems: z.boolean().optional(),
            aiSummary: z.boolean().optional(),
        }).optional(),
    }).refine((data) => data.text || data.fileId, {
        message: "Either text or fileId must be provided",
        path: ["text"],
    }),
};
