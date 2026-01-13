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
     * Processes a file using its system path and metadata.
     * Useful for background jobs where the Multer object is lost.
     */
    async process(filePath, mime, originalName, forcedDocumentId = null, onProgress = null) {
        let documentGraph;

        console.log(`[DocumentProcessor] Processing ${originalName} (${mime})`);

        if (mime === 'application/pdf') {
            if (onProgress) await onProgress(20);
            documentGraph = await this.pdfExtractor.extract(filePath, originalName);
            documentGraph.documentId = forcedDocumentId || crypto.randomUUID();
        } else if (
            mime.includes('presentation') ||
            mime.includes('powerpoint')
        ) {
            const docId = forcedDocumentId || crypto.randomUUID();
            const outputDir = path.join(STORAGE_DIR, docId);

            // 1. Extract clean structured text (Old Design needs this)
            const buffer = fs.readFileSync(filePath);
            documentGraph = await this.pptxExtractor.extract(buffer, originalName);
            documentGraph.documentId = docId;
            documentGraph.type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

            // 2. Also convert to PDF for professional high-fidelity rendering (optional backup)
            try {
                if (onProgress) await onProgress(30);
                const pdfPath = await LibreOfficeService.convertToPdf(filePath, outputDir);
                documentGraph.convertedPdfPath = path.relative(STORAGE_DIR, pdfPath);
                if (onProgress) await onProgress(70);
            } catch (e) {
                console.warn("[DocumentProcessor] LibreOffice conversion failed, falling back to text extraction only", e);
            }
        } else {
            throw new Error(`Unsupported MIME type: ${mime}`);
        }

        const documentId = documentGraph.documentId;

        // Phase 2: Extract images to disk and update JSON
        const imageResult = await ImageExtractor.extractAndSave(
            documentId,
            documentGraph
        );
        if (imageResult.extractedCount > 0) {
            console.log(`[DocumentProcessor] Extracted ${imageResult.extractedCount} images to disk`);
        }

        // Phase 2: Generate structured chunks with metadata
        const chunks = StructuredChunker.chunkByStructure(documentGraph);
        console.log(`[DocumentProcessor] Created ${chunks.length} structured chunks`);

        // Legacy compatibility: Derive plain text for existing systems
        const flatText = StructuredChunker.deriveTextFromGraph(documentGraph);

        // Save JSON to disk (Single Source of Truth) - Updated to include chunks
        const jsonPath = path.join(STORAGE_DIR, `${documentId}.json`);
        const fullPersistentData = {
            ...documentGraph,
            chunks,
            extractedText: flatText
        };
        fs.writeFileSync(jsonPath, JSON.stringify(fullPersistentData, null, 2));
        console.log(`[DocumentProcessor] Saved graph to ${jsonPath}`);

        return {
            documentId,
            documentGraph,
            chunks,
            extractedText: flatText
        };
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
