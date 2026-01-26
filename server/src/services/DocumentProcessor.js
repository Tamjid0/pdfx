import fs from 'fs';
import path from 'path';
import { PdfExtractor } from './extractors/PdfExtractor.js';
import { PptxExtractor } from './extractors/PptxExtractor.js';
import { StructuredChunker } from './StructuredChunker.js';
import { ImageExtractor } from './ImageExtractor.js';
import LibreOfficeService from './LibreOfficeService.js';
import crypto from 'crypto';

const BASE_STORAGE_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure base storage exists
if (!fs.existsSync(BASE_STORAGE_DIR)) {
    fs.mkdirSync(BASE_STORAGE_DIR, { recursive: true });
}

import PdfImageRenderer from './PdfImageRenderer.js';
import Document from '../models/Document.js';

export class DocumentProcessor {
    constructor() {
        this.pdfExtractor = new PdfExtractor();
        this.pptxExtractor = new PptxExtractor();
    }

    /**
     * Gets the user-specific storage directory
     */
    getUserDir(userId) {
        const userDir = path.join(BASE_STORAGE_DIR, userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        return userDir;
    }

    /**
     * Phase 1: FAST extraction. Returns the DocumentGraph (JSON Nodes) and saves it.
     */
    async extract(filePath, mime, originalName, forcedDocumentId = null, userId = 'guest') {
        let documentGraph;
        const documentId = forcedDocumentId || crypto.randomUUID();
        const userDir = this.getUserDir(userId);
        const docDir = path.join(userDir, documentId);

        if (!fs.existsSync(docDir)) {
            fs.mkdirSync(docDir, { recursive: true });
        }

        console.log(`[DocumentProcessor] Fast JSON Extraction: ${originalName} (User: ${userId})`);

        if (mime === 'application/pdf') {
            documentGraph = await this.pdfExtractor.extract(filePath, originalName);
        } else if (
            mime.includes('presentation') ||
            mime.includes('powerpoint')
        ) {
            const buffer = fs.readFileSync(filePath);
            documentGraph = await this.pptxExtractor.extract(buffer, originalName);
            documentGraph.type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        } else {
            throw new Error(`Unsupported MIME type: ${mime}`);
        }

        documentGraph.documentId = documentId;
        documentGraph.userId = userId;

        // Extract internal images (embedded in chunks)
        // Note: ImageExtractor will need to be updated to handle the new directory structure
        await ImageExtractor.extractAndSave(documentId, documentGraph, docDir);

        const chunks = StructuredChunker.chunkByStructure(documentGraph);
        const topics = StructuredChunker.detectTopics(documentGraph);
        const flatText = StructuredChunker.deriveTextFromGraph(documentGraph);

        // Calculate file size
        const stats = fs.statSync(filePath);

        // Save to MongoDB (Production Grade Schema)
        const documentData = {
            documentId,
            userId,
            type: documentGraph.type || mime,
            storage: {
                type: 'local',
                key: path.relative(process.cwd(), docDir),
                url: `/api/v1/documents/${documentId}/view` // Dynamic retrieval endpoint
            },
            originalFile: {
                name: originalName,
                mime: mime,
                size: stats.size,
                path: filePath
            },
            metadata: documentGraph.metadata,
            structure: documentGraph,
            chunks,
            topics,
            extractedText: flatText
        };

        try {
            await Document.findOneAndUpdate(
                { documentId },
                documentData,
                { upsert: true, new: true }
            );
            console.log(`[DocumentProcessor] Document ${documentId} synced to MongoDB for User ${userId}.`);
        } catch (mongoError) {
            console.error(`[DocumentProcessor] Failed to save to MongoDB: ${mongoError.message}`);
        }

        // Save JSON to disk (Temporary metadata backup)
        const jsonPath = path.join(docDir, `metadata.json`);
        fs.writeFileSync(jsonPath, JSON.stringify({ ...documentGraph, chunks, topics, extractedText: flatText }, null, 2));

        return { documentId, documentGraph, chunks, topics, extractedText: flatText };
    }

    /**
     * Phase 2: SLOW conversion. 
     * 1. PPTX -> PDF (if needed)
     * 2. PDF -> Scanned Images (WebP/PNG)
     */
    async convert(documentId, filePath, userId = 'guest', onProgress = null) {
        // Handle case where userId is omitted and onProgress is passed as 3rd argument
        if (typeof userId === 'function') {
            onProgress = userId;
            userId = 'guest';
        }

        const docDir = path.join(this.getUserDir(userId), documentId);
        const jsonPath = path.join(docDir, 'metadata.json');

        if (!fs.existsSync(jsonPath)) throw new Error('Document metadata not found for conversion');

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        let pdfPath = filePath;

        try {
            // A. PPTX to PDF Conversion
            if (data.type && data.type.includes('presentation')) {
                if (onProgress) await onProgress(10);
                pdfPath = await LibreOfficeService.convertToPdf(filePath, docDir);
                data.convertedPdfPath = path.relative(process.cwd(), pdfPath);

                // Update local metadata
                fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

                // Update MongoDB
                await Document.findOneAndUpdate({ documentId }, { convertedPdfPath: data.convertedPdfPath });
            }

            // B. PDF to Static Images (for Flicker-Free Source)
            if (onProgress) await onProgress(40);
            console.log(`[DocumentProcessor] Generating static images for: ${documentId} (User: ${userId})`);

            const totalPages = await PdfImageRenderer.renderToImages(
                pdfPath,
                docDir,
                (p) => {
                    if (onProgress) onProgress(40 + (p * 0.6));
                }
            );

            console.log(`[DocumentProcessor] Static rendering complete. Generated ${totalPages} images.`);
            if (onProgress) await onProgress(100);

            return data.convertedPdfPath || filePath;
        } catch (e) {
            console.warn("[DocumentProcessor] Conversion/Rendering failed", e);
            throw e;
        }
    }

    /**
     * Legacy/Unified method
     */
    async process(filePath, mime, originalName, forcedDocumentId = null, userId = 'guest', onProgress = null) {
        const result = await this.extract(filePath, mime, originalName, forcedDocumentId, userId);
        // Always run convert for PDF and PPTX now to generate images
        await this.convert(result.documentId, filePath, userId, onProgress);
        return result;
    }

    async processFile(file, userId = 'guest') {
        return this.process(file.path, file.mimetype, file.originalname, null, userId);
    }

    derivePlainText(docGraph) {
        return StructuredChunker.deriveTextFromGraph(docGraph);
    }
}
