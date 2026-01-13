import express from 'express';
import { getDocumentQueue } from '../../services/queueService.js';
import validate from '../../middleware/validate.js';
import { z } from 'zod';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

const jobStatusSchema = {
    params: z.object({
        id: z.string(),
    }),
};

router.get('/:id', validate(jobStatusSchema), async (req, res, next) => {
    try {
        const queue = await getDocumentQueue();
        if (!queue) {
            throw new ApiError(503, 'Background processing service is currently unavailable.');
        }

        const job = await queue.getJob(req.params.id);

        if (!job) {
            throw new ApiError(404, 'Job not found');
        }

        const state = await job.getState();
        const progress = job.progress;
        const result = job.returnvalue;
        const failedReason = job.failedReason;

        res.json({
            id: job.id,
            state,
            progress,
            result,
            failedReason,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
