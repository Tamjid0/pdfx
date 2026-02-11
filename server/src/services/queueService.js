import { Queue } from 'bullmq';
import logger from '../utils/logger.js';
import net from 'net';

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
};

let _documentQueue = null;

/**
 * Checks if Redis is reachable using a raw TCP connection.
 * This is SILENT and doesn't trigger BullMQ/IORedis retries or error logs.
 */
export const isRedisConnected = () => {
    return new Promise((resolve) => {
        const socket = net.createConnection(connection.port, connection.host);
        socket.setTimeout(1000);

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });
    });
};

/**
 * Lazy initializer for the document queue.
 * Only creates the queue if Redis is actually available.
 */
export const getDocumentQueue = async () => {
    if (_documentQueue) return _documentQueue;

    const available = await isRedisConnected();
    if (!available) {
        return null;
    }

    try {
        _documentQueue = new Queue('document-processing', {
            connection: {
                ...connection,
                maxRetriesPerRequest: null,
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: {
                    count: 100,
                    age: 24 * 3600
                },
                removeOnFail: false,
            }
        });

        _documentQueue.on('error', (err) => {
            // Further silence ECONNREFUSED just in case it drops later
            if (!err.message.includes('ECONNREFUSED')) {
                logger.error(`Queue Error: ${err.message}`);
            }
        });

        return _documentQueue;
    } catch (error) {
        logger.error(`Failed to initialize Queue: ${error.message}`);
        return null;
    }
};

export const addDocumentJob = async (data) => {
    try {
        const queue = await getDocumentQueue();
        if (!queue) {
            throw new Error('Redis is not available to process background jobs.');
        }

        const job = await queue.add('process-document', data);
        logger.info(`Job added to queue: ${job.id} for file: ${data.originalName}`);
        return job;
    } catch (error) {
        logger.error(`Failed to add job to queue: ${error.message}`);
        throw error;
    }
};

/**
 * Adds a repeatable cleanup job for guest data
 */
export const addScheduledCleanupJob = async () => {
    try {
        const queue = await getDocumentQueue();
        if (!queue) return;

        // Run every 6 hours
        await queue.add('cleanup-guests', {}, {
            repeat: {
                every: 6 * 3600 * 1000, // 6 Hours
            },
            jobId: 'periodic-guest-cleanup'
        });

        logger.info('[QueueService] Scheduled periodic guest cleanup job.');
    } catch (error) {
        logger.error(`[QueueService] Failed to schedule cleanup: ${error.message}`);
    }
};

export const addAIJob = async (type, data) => {
    try {
        const queue = await getDocumentQueue();
        if (!queue) {
            throw new Error('Redis is not available to process background AI jobs.');
        }

        const job = await queue.add(`ai-${type}`, data, {
            // Higher priority for user-triggered generation? (Optional)
            attempts: 2,
            backoff: {
                type: 'exponential',
                delay: 2000,
            }
        });

        logger.info(`AI Job added to queue: ${job.id} type: ${type}`);
        return job;
    } catch (error) {
        logger.error(`Failed to add AI job to queue: ${error.message}`);
        throw error;
    }
};
