import { z } from 'zod';

export const sync = {
    body: z.object({
        firebaseUid: z.string().min(1, 'Firebase UID is required'),
        email: z.string().email('Invalid email format'),
        displayName: z.string().optional().or(z.literal('')),
        photoURL: z.string().url('Invalid photo URL').optional().or(z.literal('')),
    }),
};
