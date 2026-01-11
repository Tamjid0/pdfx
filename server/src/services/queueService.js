import { Queue } from 'bullmq';
import logger from '../utils/logger.js';

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
};

export const documentQueue = new Queue('document-processing', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true, // Keep it lean for now
        removeOnFail: false,   // Keep failed jobs for debugging
    }
});

// Add error listener to prevent unhandled rejections if Redis is down
documentQueue.on('error', (err) => {
    logger.error(`Queue Error: ${err.message}`);
});

export const addDocumentJob = async (data) => {
    try {
        const job = await documentQueue.add('process-document', data);
        logger.info(`Job added to queue: ${job.id} for file: ${data.originalName}`);
        return job;
    } catch (error) {
        logger.error(`Failed to add job to queue: ${error.message}`);
        throw error;
    }
};
