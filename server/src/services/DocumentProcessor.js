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

export class DocumentProcessor {
    constructor() {
        this.pdfExtractor = new PdfExtractor();
        this.pptxExtractor = new PptxExtractor();
    }

    /**
     * Phase 1: FAST extraction. Returns the DocumentGraph (JSON Nodes) and saves it.
     * This is the "JSON Extraction" the user is referring to.
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

        // Extract images and chunks from the JSON graph
        await ImageExtractor.extractAndSave(documentId, documentGraph);
        const chunks = StructuredChunker.chunkByStructure(documentGraph);
        const flatText = StructuredChunker.deriveTextFromGraph(documentGraph);

        // Save JSON to disk immediately - this is the source of truth for Chat
        const jsonPath = path.join(STORAGE_DIR, `${documentId}.json`);
        const data = { ...documentGraph, chunks, extractedText: flatText };
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

        return { documentId, documentGraph, chunks, extractedText: flatText };
    }

    /**
     * Phase 2: SLOW conversion. Updates the existing JSON with PDF path.
     * This is for high-fidelity rendering only, Chat doesn't depend on this.
     */
    async convert(documentId, filePath, onProgress = null) {
        const jsonPath = path.join(STORAGE_DIR, `${documentId}.json`);
        if (!fs.existsSync(jsonPath)) throw new Error('Document JSON not found for conversion');

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const outputDir = path.join(STORAGE_DIR, documentId);

        try {
            if (onProgress) await onProgress(30);
            const pdfPath = await LibreOfficeService.convertToPdf(filePath, outputDir);
            data.convertedPdfPath = path.relative(STORAGE_DIR, pdfPath);
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
            if (onProgress) await onProgress(100);
            return data.convertedPdfPath;
        } catch (e) {
            console.warn("[DocumentProcessor] LibreOffice conversion failed", e);
            throw e;
        }
    }

    /**
     * Legacy/Unified method
     */
    async process(filePath, mime, originalName, forcedDocumentId = null, onProgress = null) {
        const result = await this.extract(filePath, mime, originalName, forcedDocumentId);
        if (mime.includes('presentation') || mime.includes('powerpoint')) {
            await this.convert(result.documentId, filePath, onProgress);
        } else if (onProgress) {
            await onProgress(100);
        }
        return result;
    }

    /**
     * Processes a file from a Multer object.
     */
    async processFile(file) {
        return this.process(file.path, file.mimetype, file.originalname);
    }

    /**
     * Legacy method - kept for backward compatibility
     * Use StructuredChunker.deriveTextFromGraph() for new code
     */
    derivePlainText(docGraph) {
        return StructuredChunker.deriveTextFromGraph(docGraph);
    }
}
