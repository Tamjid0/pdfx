import fs from 'fs';
import path from 'path';
import { PdfExtractor } from './extractors/PdfExtractor.js';
import { PptxExtractor } from './extractors/PptxExtractor.js';
import { StructuredChunker } from './StructuredChunker.js';
import { ImageExtractor } from './ImageExtractor.js';

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
     * Processes a file and returns structured chunks for embedding.
     * @param {Object} file - Multer file object
     * @returns {Promise<Object>} { documentId, chunks, extractedText }
     */
    async processFile(file) {
        let documentGraph;

        const mime = file.mimetype;
        const filePath = file.path;
        const originalName = file.originalname;

        console.log(`[DocumentProcessor] Processing ${originalName} (${mime})`);

        if (mime === 'application/pdf') {
            documentGraph = await this.pdfExtractor.extract(filePath, originalName);
        } else if (
            mime.includes('presentation') ||
            mime.includes('powerpoint')
        ) {
            const buffer = fs.readFileSync(filePath);
            documentGraph = await this.pptxExtractor.extract(buffer, originalName);
        } else {
            throw new Error(`Unsupported MIME type: ${mime}`);
        }

        // Save JSON to disk (Single Source of Truth)
        const jsonPath = path.join(STORAGE_DIR, `${documentGraph.documentId}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(documentGraph, null, 2));
        console.log(`[DocumentProcessor] Saved graph to ${jsonPath}`);

        // Phase 2: Extract images to disk and update JSON
        const imageResult = await ImageExtractor.extractAndSave(
            documentGraph.documentId,
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

        return {
            documentId: documentGraph.documentId,
            documentGraph,
            chunks,           // Phase 2: Structured chunks with metadata
            extractedText: flatText  // Legacy: Plain text for backward compatibility
        };
    }

    /**
     * Legacy method - kept for backward compatibility
     * Use StructuredChunker.deriveTextFromGraph() for new code
     */
    derivePlainText(docGraph) {
        return StructuredChunker.deriveTextFromGraph(docGraph);
    }
}
