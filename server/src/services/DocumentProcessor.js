import fs from 'fs';
import path from 'path';
import { PdfExtractor } from './extractors/PdfExtractor.js';
import { PptxExtractor } from './extractors/PptxExtractor.js';
import { StructuredChunker } from './StructuredChunker.js';
import { ImageExtractor } from './ImageExtractor.js';
import LibreOfficeService from './LibreOfficeService.js';
import crypto from 'crypto';

const STORAGE_DIR = path.resolve(process.cwd(), 'src/database/documents');

// Ensure storage exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

import PdfImageRenderer from './PdfImageRenderer.js';
import Document from '../models/Document.js';

export class DocumentProcessor {
    constructor() {
        this.pdfExtractor = new PdfExtractor();
        this.pptxExtractor = new PptxExtractor();
    }

    /**
     * Phase 1: FAST extraction. Returns the DocumentGraph (JSON Nodes) and saves it.
     */
    async extract(filePath, mime, originalName, forcedDocumentId = null) {
        let documentGraph;
        const documentId = forcedDocumentId || crypto.randomUUID();

        console.log(`[DocumentProcessor] Fast JSON Extraction: ${originalName} (${mime})`);

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
        documentGraph.originalFilePath = filePath; // Save absolute path for native PDF serving

        // Extract internal images (embedded in chunks)
        await ImageExtractor.extractAndSave(documentId, documentGraph);
        const chunks = StructuredChunker.chunkByStructure(documentGraph);
        const flatText = StructuredChunker.deriveTextFromGraph(documentGraph);

        // Save to MongoDB
        const documentData = {
            documentId,
            type: documentGraph.type || mime,
            originalFile: {
                name: originalName,
                mime: mime,
                path: filePath
            },
            metadata: documentGraph.metadata,
            structure: documentGraph,
            chunks,
            extractedText: flatText,
            originalFilePath: filePath
        };

        try {
            await Document.findOneAndUpdate(
                { documentId },
                documentData,
                { upsert: true, new: true }
            );
            console.log(`[DocumentProcessor] Document ${documentId} saved to MongoDB.`);
        } catch (mongoError) {
            console.error(`[DocumentProcessor] Failed to save to MongoDB: ${mongoError.message}`);
            // Fallback to local JSON if MongoDB fails during transition (optional, but safer)
        }

        // Save JSON to disk (Temporary backup during migration)
        const jsonPath = path.join(STORAGE_DIR, `${documentId}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify({ ...documentGraph, chunks, extractedText: flatText }, null, 2));

        return { documentId, documentGraph, chunks, extractedText: flatText };
    }

    /**
     * Phase 2: SLOW conversion. 
     * 1. PPTX -> PDF (if needed)
     * 2. PDF -> Scanned Images (WebP/PNG)
     */
    async convert(documentId, filePath, onProgress = null) {
        const jsonPath = path.join(STORAGE_DIR, `${documentId}.json`);
        if (!fs.existsSync(jsonPath)) throw new Error('Document JSON not found for conversion');

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const outputDir = path.join(STORAGE_DIR, documentId);
        let pdfPath = filePath;

        try {
            // A. PPTX to PDF Conversion
            if (data.type && data.type.includes('presentation')) {
                if (onProgress) await onProgress(10);
                pdfPath = await LibreOfficeService.convertToPdf(filePath, outputDir);
                data.convertedPdfPath = path.relative(STORAGE_DIR, pdfPath);
                fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
            }

            // B. PDF to Static Images (for Flicker-Free Source)
            if (onProgress) await onProgress(40);
            console.log(`[DocumentProcessor] Generating static images for: ${documentId}`);

            const totalPages = await PdfImageRenderer.renderToImages(
                pdfPath,
                outputDir,
                (p) => {
                    // Map 0-100 of rendering to 40-100 of total job
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
    async process(filePath, mime, originalName, forcedDocumentId = null, onProgress = null) {
        const result = await this.extract(filePath, mime, originalName, forcedDocumentId);
        // Always run convert for PDF and PPTX now to generate images
        await this.convert(result.documentId, filePath, onProgress);
        return result;
    }

    async processFile(file) {
        return this.process(file.path, file.mimetype, file.originalname);
    }

    derivePlainText(docGraph) {
        return StructuredChunker.deriveTextFromGraph(docGraph);
    }
}
