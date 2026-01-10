import { z } from 'zod';

export const templateSchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        templateName: z.string().min(1),
    }).refine((data) => data.text || data.fileId, {
        message: "Either text or fileId must be provided",
        path: ["text"],
    }),
};
