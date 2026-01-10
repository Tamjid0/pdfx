import { z } from 'zod';

export const getDocumentSchema = {
    params: z.object({
        documentId: z.string().uuid('Invalid documentId format'),
    }),
};

export const getDocumentPageSchema = {
    params: z.object({
        documentId: z.string().uuid('Invalid documentId format'),
        pageIndex: z.string().regex(/^\d+$/, 'pageIndex must be a number').transform(Number),
    }),
};

export const getDocumentImageSchema = {
    params: z.object({
        documentId: z.string().uuid('Invalid documentId format'),
        filename: z.string().min(1, 'filename is required'),
    }),
};
