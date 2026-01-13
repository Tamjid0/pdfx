import { Worker } from 'bullmq';
import logger from '../utils/logger.js';
import { DocumentProcessor } from '../services/DocumentProcessor.js';
import { embedStructuredChunks } from '../controllers/fileUploadController.js';
import { isRedisConnected } from '../services/queueService.js';

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
};

const documentProcessor = new DocumentProcessor();
let _worker = null;

export const initDocumentWorker = async () => {
    if (_worker) return _worker;

    const available = await isRedisConnected();
    if (!available) {
        logger.warn('[Worker] Redis not reachable. Worker initialization skipped.');
        return null;
    }

    try {
        _worker = new Worker('document-processing', async (job) => {
            const { filePath, mimeType, fileName, documentId } = job.data;
            logger.info(`Processing job ${job.id}: ${fileName}`);

            try {
                const result = await documentProcessor.process(
                    filePath,
                    mimeType,
                    fileName,
                    documentId,
                    async (progress) => {
                        await job.updateProgress(progress);
                    }
                );

                await job.updateProgress(80); // Processing done, starting embedding
                if (result.chunks && result.chunks.length > 0) {
                    const docsWithMetadata = result.chunks.map(chunk => ({
                        pageContent: chunk.content,
                        metadata: {
                            ...chunk.metadata,
                            source: documentId,
                            fileName: fileName
                        }
                    }));
                    await embedStructuredChunks(documentId, docsWithMetadata);
                }

                await job.updateProgress(100);
                logger.info(`Job ${job.id} completed successfully`);

                return {
                    documentId,
                    chunkCount: result.chunks?.length || 0,
                    success: true
                };
            } catch (error) {
                logger.error(`Error processing job ${job.id}: ${error.message}`);
                throw error;
            }
        }, {
            connection: {
                ...connection,
                maxRetriesPerRequest: null
            }
        });

        _worker.on('completed', (job) => {
            logger.info(`Worker: Job ${job.id} has completed!`);
        });

        _worker.on('failed', (job, err) => {
            logger.error(`Worker: Job ${job?.id} has failed with ${err.message}`);
        });

        _worker.on('error', (err) => {
            if (!err.message.includes('ECONNREFUSED')) {
                logger.error(`Worker Error: ${err.message}`);
            }
        });

        logger.info('[Worker] Document processing worker initialized successfully.');
        return _worker;
    } catch (error) {
        logger.error(`[Worker] Failed to initialize: ${error.message}`);
        return null;
    }
};
