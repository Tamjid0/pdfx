import { Worker } from 'bullmq';
import logger from '../utils/logger.js';
import { DocumentProcessor } from '../services/DocumentProcessor.js';
import { embedStructuredChunks } from '../controllers/fileUploadController.js'; // I might need to refactor this to a service

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
};

const documentProcessor = new DocumentProcessor();

export const initDocumentWorker = () => {
    const worker = new Worker('document-processing', async (job) => {
        const { filePath, mimeType, fileName, documentId } = job.data;

        logger.info(`Processing job ${job.id}: ${fileName}`);

        try {
            // 1. Process Document (Extraction & Chunking)
            await job.updateProgress(10);
            const result = await documentProcessor.process(filePath, mimeType, fileName, documentId);

            // 2. Embedding
            await job.updateProgress(50);
            if (result.chunks && result.chunks.length > 0) {
                const docsWithMetadata = result.chunks.map(chunk => ({
                    pageContent: chunk.content,
                    metadata: {
                        ...chunk.metadata,
                        source: documentId,
                        fileName: originalName
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
    }, { connection });

    worker.on('completed', (job) => {
        logger.info(`Worker: Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
        logger.error(`Worker: Job ${job?.id} has failed with ${err.message}`);
    });

    // Add error listener to prevent unhandled rejections if Redis is down
    worker.on('error', (err) => {
        logger.error(`Worker Error: ${err.message}`);
    });

    return worker;
};
