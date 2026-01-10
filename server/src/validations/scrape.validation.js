import { z } from 'zod';

export const scrapeSchema = {
    query: z.object({
        url: z.string().url("Must be a valid URL"),
    }),
};
