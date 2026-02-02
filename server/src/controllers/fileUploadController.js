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

import storageService from '../services/storageService.js';
import { DocumentProcessor } from '../services/DocumentProcessor.js';
import { addDocumentJob, isRedisConnected } from '../services/queueService.js';
import User from '../models/User.js';
import { deleteCachePattern } from '../services/cacheService.js';

const documentProcessor = new DocumentProcessor();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.body.userId || 'guest';
        const userDir = storageService.getUserDir(userId);
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const fileId = crypto.randomBytes(16).toString('hex');
        const fileExtension = path.extname(file.originalname);
        cb(null, `${fileId}${fileExtension}`);
    },
});

const upload = multer({ storage: storage });

/**
 * Shared embedding logic for background worker
 */
export const embedStructuredChunks = async (documentId, docsWithMetadata) => {
    const vectorStore = await FaissStore.fromDocuments(docsWithMetadata, hfEmbeddings);
    const indexPath = storageService.getIndexPath(documentId);
    await vectorStore.save(indexPath);
    return indexPath;
};

export const uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }

    const { filename, path: filePath, originalname } = req.file;
    let { mimetype } = req.file;
    const userId = req.body.userId || 'guest';
    const documentId = crypto.randomUUID();
    const stats = fs.statSync(filePath);
    const MB_THRESHOLD = 5 * 1024 * 1024; // 5MB

    // Fallback for generic binary types (often happens with PPTX uploads)
    // We check the extension to properly classify it before processing
    if (mimetype === 'application/octet-stream' || !mimetype) {
        if (originalname.match(/\.pptx$/i)) {
            mimetype = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        } else if (originalname.match(/\.ppt$/i)) {
            mimetype = 'application/vnd.ms-powerpoint';
        } else if (originalname.match(/\.pdf$/i)) {
            mimetype = 'application/pdf';
        }
        // CRITICAL: Update the req.file object so downstream consumers see the correct type
        req.file.mimetype = mimetype;
    }

    try {
        const redisAvailable = await isRedisConnected();
        let jobId = null;
        let extractionResult = null;

        // --- OPTIMIZATION (Audit 3.2): Background Processing for Large Files ---
        if (redisAvailable && stats.size > MB_THRESHOLD) {
            logger.info(`[FileUpload] File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds threshold. Backgrounding...`);
            const job = await addDocumentJob({
                documentId,
                filePath,
                fileName: originalname,
                originalName: originalname,
                mimeType: mimetype,
                userId: userId,
                triggerFullProcess: true // Flag to tell worker to do extraction + embedding + images
            });
            jobId = job.id;

            // Return early with jobId for the frontend to poll
            return res.json({
                documentId: documentId,
                jobId: jobId,
                message: 'Processing large document in background. Please wait...'
            });
        }

        // --- PHASE 1: Fast JSON Extraction (Synchronous for small files) ---
        extractionResult = await documentProcessor.extract(filePath, mimetype, originalname, documentId, userId);

        // --- MONGODB USER STATS UPDATE (Fire and Forget) ---
        if (userId !== 'guest') {
            User.findOneAndUpdate(
                { firebaseUid: userId },
                {
                    $inc: {
                        'usage.totalFiles': 1,
                        'usage.totalWords': extractionResult.extractedText ? extractionResult.extractedText.split(/\s+/).length : 0
                    }
                }
            ).catch(err => logger.error(`[StatsUpdate] Failed for user ${userId}: ${err.message}`));
        }

        // --- PHASE 2: Immediate Embedding (Synchronous) ---
        if (extractionResult.chunks && extractionResult.chunks.length > 0) {
            const docsWithMetadata = extractionResult.chunks.map(chunk => ({
                pageContent: chunk.content,
                metadata: { ...chunk.metadata, source: documentId, fileName: originalname }
            }));
            await embedStructuredChunks(documentId, docsWithMetadata);
        }

        // --- PHASE 3: Background PDF Conversion (Always backgrounded for PPTX) ---
        if (redisAvailable && (mimetype.includes('presentation') || mimetype.includes('powerpoint'))) {
            const job = await addDocumentJob({
                documentId,
                filePath,
                fileName: originalname,
                originalName: originalname,
                mimeType: mimetype,
                userId: userId,
            });
            jobId = job.id;
        }

        // Invalidate Cache for this user's document list
        deleteCachePattern(`docs_list:${userId}:*`).catch(err =>
            logger.error(`[Cache] Invalidation failed for user ${userId}: ${err.message}`)
        );

        // Return immediately with extraction data - UI transitions to workspace NOW
        return res.json({
            documentId: documentId,
            jobId: jobId,
            extractedText: extractionResult.extractedText,
            chunks: extractionResult.chunks,
            topics: extractionResult.topics,
            metadata: extractionResult.documentGraph?.metadata,
            message: jobId
                ? 'JSON extraction complete. High-fidelity rendering processing in background.'
                : 'Processed successfully.'
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
        const indexPath = storageService.getIndexPath(fileId);
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