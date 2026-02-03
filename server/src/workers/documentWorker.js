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
            const { filePath, mimeType, fileName, documentId, userId = 'guest', triggerFullProcess = false } = job.data;
            logger.info(`Processing job ${job.id}: ${fileName}`);

            try {
                // Determine if we need to run extraction + embedding (Audit 3.2)
                if (triggerFullProcess) {
                    logger.info(`[Worker] Running FULL processing for ${documentId}`);
                    await job.updateProgress(10);

                    // 1. Extraction
                    const extractionResult = await documentProcessor.extract(filePath, mimeType, fileName, documentId, userId);
                    await job.updateProgress(40);

                    // 2. Embedding
                    if (extractionResult.chunks && extractionResult.chunks.length > 0) {
                        const docsWithMetadata = extractionResult.chunks.map(chunk => ({
                            pageContent: chunk.content,
                            metadata: { ...chunk.metadata, source: documentId, fileName: fileName }
                        }));
                        await embedStructuredChunks(documentId, docsWithMetadata);
                    }
                    await job.updateProgress(60);
                }

                // 3. Conversion/Rendering (Always run for PPTX or for full process)
                logger.info(`[Worker] Starting conversion/rendering for ${documentId} (${mimeType})`);

                await documentProcessor.convert(
                    documentId,
                    filePath,
                    userId,
                    async (progress) => {
                        // Progress here is 0-100 of the conversion step
                        const baseProgress = triggerFullProcess ? 60 : 10;
                        const factor = triggerFullProcess ? 0.4 : 0.9;
                        await job.updateProgress(Math.floor(baseProgress + (progress * factor)));
                    }
                );

                await job.updateProgress(100);
                logger.info(`Job ${job.id} completed successfully`);

                return {
                    documentId,
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
