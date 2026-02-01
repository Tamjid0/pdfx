import { z } from 'zod';

export const quizSchema = {
    body: z.object({
        text: z.string().optional(),
        fileId: z.string().optional(),
        settings: z.object({
            questionCount: z.number().min(1).max(50).optional(),
            difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
            questionTypes: z.array(z.string()).optional(),
            quizType: z.enum(['multiple-choice', 'true-false', 'short-answer']).optional(),
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

export const analysisSchema = {
    body: z.object({
        fileId: z.string().optional(),
        text: z.string().optional(),
        scope: z.object({
            type: z.enum(['all', 'pages', 'topics']),
            value: z.any()
        }).optional()
    })
};
