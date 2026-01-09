import multer from 'multer';
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

// ... (keep imports)
const documentProcessor = new DocumentProcessor();

export const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }

    const { filename, path: filePath } = req.file;
    // We can use the processor's ID or keep the fileId from filename for now to match Multer
    // Let's use the DocumentProcessor's ID for the DB, but we might need to relate them.
    // Ideally, we move to the new ID.
    const fileId = path.parse(filename).name;

    try {
        console.log(`[+] Uploading file: ${req.file.originalname}`);

        // UNIFIED PIPELINE EXECUTION
        const result = await documentProcessor.processFile(req.file);

        const { documentId, documentGraph, chunks, extractedText } = result;

        // Phase 2: Use structured chunks with metadata for embedding
        console.log(`[Phase 2] Embedding ${chunks.length} structured chunks with metadata`);

        const docsWithMetadata = chunks.map(chunk => ({
            pageContent: chunk.content,
            metadata: {
                ...chunk.metadata,
                source: documentId,
                fileName: req.file.originalname
            }
        }));

        const vectorStore = await FaissStore.fromDocuments(docsWithMetadata, hfEmbeddings);

        // Save index using the NEW documentId to align with the new storage
        const indexPath = path.join(indexesDir, documentId);
        await vectorStore.save(indexPath);

        console.log(`[+] FAISS index created successfully for documentId: ${documentId}`);
        console.log(`[+] Metadata preserved: pageIndex, documentType, imageCount, etc.`);

        // Clean text for response (legacy compatibility)
        const cleanedText = cleanText(extractedText);

        res.json({
            fileId: documentId, // Returning the NEW unified ID
            originalFileId: fileId, // Keep reference if needed
            fileName: req.file.originalname,
            extractedText: cleanedText,
            chunkCount: chunks.length,
            message: 'File processed via Unified Pipeline (Phase 2: Structured Chunks).'
        });

    } catch (error) {
        console.error('File processing failed:', error);
        res.status(500).send({ error: error.message || 'Failed to process file.' });
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