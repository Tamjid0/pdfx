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

import { DocumentProcessor } from '../services/DocumentProcessor.js';
import { addDocumentJob, isRedisConnected } from '../services/queueService.js';
import User from '../models/User.js';

const documentProcessor = new DocumentProcessor();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.body.userId || 'guest';
        const userDir = path.join(uploadsDir, userId);

        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
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
    const indexPath = path.join(indexesDir, documentId);
    await vectorStore.save(indexPath);
    return indexPath;
};

export const uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }

    const { filename, path: filePath, originalname, mimetype } = req.file;
    const userId = req.body.userId || 'guest';
    const documentId = crypto.randomUUID();

    try {
        // --- PHASE 1: Fast JSON Extraction (Synchronous) ---
        // This extracts the DocumentGraph (Nodes) immediately so Chat and UI work instantly.
        const extractionResult = await documentProcessor.extract(filePath, mimetype, originalname, documentId, userId);

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
        // We use the chunks generated from the JSON graph for the vector store.
        if (extractionResult.chunks && extractionResult.chunks.length > 0) {
            const docsWithMetadata = extractionResult.chunks.map(chunk => ({
                pageContent: chunk.content,
                metadata: { ...chunk.metadata, source: documentId, fileName: originalname }
            }));
            await embedStructuredChunks(documentId, docsWithMetadata);
        }

        const redisAvailable = await isRedisConnected();
        let jobId = null;

        // --- PHASE 3: Background PDF Conversion (Only for Slides) ---
        // --- PHASE 3: Background PDF Conversion (Only for Slides) ---
        if (redisAvailable && (mimetype.includes('presentation') || mimetype.includes('powerpoint'))) {
            // Standard Path: Offload slow PDF conversion to background queue
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

        // --- FALLBACK PATH: Redis is Down (Old logic preserved for reference) ---
        // Note: With Phase 1 & 2 now synchronous, the "fallback" is mostly redundant 
        // for extraction, but we keep it safe.

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