import multer from 'multer';
import logger from '../utils/logger.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { FaissStore } from '@langchain/community/vectorstores/faiss'; // Import FaissStore
import { hfEmbeddings } from '../services/embeddingService.js';
import { checkFileType, extractTextFromPdf, cleanText } from '../services/fileProcessingService.js';
import { extractSlides } from '../services/pptxService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for file storage
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Directory to store FAISS indexes
const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
if (!fs.existsSync(indexesDir)) {
    fs.mkdirSync(indexesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const fileId = crypto.randomBytes(16).toString('hex');
        const fileExtension = path.extname(file.originalname);
        cb(null, `${fileId}${fileExtension}`);
    },
});

const upload = multer({ storage: storage });

import { DocumentProcessor } from '../services/DocumentProcessor.js';
import { addDocumentJob, isRedisConnected } from '../services/queueService.js';

const documentProcessor = new DocumentProcessor();

/**
 * Shared embedding logic for background worker
 */
export const embedStructuredChunks = async (documentId, docsWithMetadata) => {
    const vectorStore = await FaissStore.fromDocuments(docsWithMetadata, hfEmbeddings);
    const indexPath = path.join(indexesDir, documentId);
    await vectorStore.save(indexPath);
    return indexPath;
};

export const uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }

    const { filename, path: filePath, originalname, mimetype } = req.file;
    const documentId = crypto.randomUUID();

    try {
        const redisAvailable = await isRedisConnected();

        if (redisAvailable) {
            // Standard Path: Offload to background queue
            const job = await addDocumentJob({
                documentId,
                filePath,
                fileName: originalname,
                originalName: originalname,
                mimeType: mimetype,
            });

            return res.json({
                jobId: job.id,
                documentId: documentId,
                message: 'File upload successful. Processing started in background.'
            });
        }

        // --- FALLBACK PATH: Redis is Down ---

        // 1. If it's a PPTX, we CANNOT process it synchronously easily (too slow/unstable)
        if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) {
            logger.warn(`[FileUpload] Redis is down. PPTX processing rejected.`);
            return res.status(503).json({
                error: 'Service temporarily unavailable (Redis).',
                message: 'PowerPoint processing requires the background worker. Please ensure Docker is running.',
                code: 'REDIS_DOWN'
            });
        }

        // 2. If it's a standard PDF, we can fallback to SYNCHRONOUS processing
        // This keeps the app working locally without Docker for basic PDF tasks.
        logger.info(`[FileUpload] Redis down. Falling back to synchronous processing for PDF: ${originalname}`);

        const result = await documentProcessor.process(filePath, mimetype, originalname, documentId);

        // Auto-embed for the synchronous result
        if (result.chunks && result.chunks.length > 0) {
            const docsWithMetadata = result.chunks.map(chunk => ({
                pageContent: chunk.content,
                metadata: { ...chunk.metadata, source: documentId, fileName: originalname }
            }));
            await embedStructuredChunks(documentId, docsWithMetadata);
        }

        return res.json({
            documentId: documentId,
            message: 'Processed synchronously (Redis was unavailable).',
            // Return enough data for the frontend to render immediately
            extractedText: result.extractedText,
            chunks: result.chunks
        });

    } catch (error) {
        logger.error(`[FileUpload] Upload/Processing failed: ${error.message}`);
        next(error);
    }
};

export const embedText = async (req, res) => {
    const { text, fileName } = req.body;

    if (!text) {
        return res.status(400).send({ error: 'No text provided for embedding.' });
    }

    const fileId = crypto.randomBytes(16).toString('hex');

    try {
        const cleanedText = cleanText(text);
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 100 });
        const docs = await splitter.createDocuments([cleanedText]);

        const vectorStore = await FaissStore.fromDocuments(docs, hfEmbeddings);
        const indexPath = path.join(indexesDir, fileId);
        await vectorStore.save(indexPath);

        console.log(`[+] FAISS index created successfully for pasted text, fileId: ${fileId}`);

        res.json({
            fileId: fileId,
            fileName: fileName || 'Pasted Content',
            extractedText: cleanedText,
            message: 'Text processed and index created successfully.'
        });

    } catch (error) {
        console.error('Text embedding failed:', error);
        res.status(500).send({ error: error.message || 'Failed to embed text.' });
    }
};

export const multerUpload = upload;