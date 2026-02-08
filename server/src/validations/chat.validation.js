import { z } from 'zod';

export const chatSchema = {
    body: z.object({
        fileId: z.string().min(1, 'fileId is required'),
        message: z.string().min(1, 'message is required'),
    }),
};

export const chatStreamSchema = {
    body: z.object({
        fileId: z.string().min(1, 'fileId is required'),
        message: z.string().min(1, 'message is required'),
        selectionNodeIds: z.array(z.string()).optional(),
    }),
};
