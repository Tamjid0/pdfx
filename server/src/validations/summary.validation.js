import { z } from 'zod';

export const summarySchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        settings: z.object({
            summaryLength: z.number().min(0).max(100).optional(),
            summaryFormat: z.enum(['paragraph', 'bullets']).optional(),
            keywords: z.string().optional(),
            tone: z.string().optional(),
            language: z.string().optional(),
            summaryType: z.enum(['abstractive', 'extractive']).optional(),
            targetWordCount: z.number().min(0).optional(),
        }).optional(),
    }).refine((data) => data.text || data.fileId, {
        message: "Either text or fileId must be provided",
        path: ["text"],
    }),
};
