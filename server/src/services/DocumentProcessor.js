import fs from 'fs';
import path from 'path';
import { PdfExtractor } from './extractors/PdfExtractor.js';
import { PptxExtractor } from './extractors/PptxExtractor.js';

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
     * Processes a file and allows valid extraction.
     * @param {Object} file - Multer file object
     * @returns {Promise<Object>} { documentId, textForEmbedding, structure }
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

        // Derive plain text for Legacy Embedding System (Wrap, don't rip)
        const flatText = this.derivePlainText(documentGraph);

        return {
            documentId: documentGraph.documentId,
            documentGraph,
            extractedText: flatText
        };
    }

    /**
     * Flattens the graph into a string for the current FAISS implementation.
     */
    derivePlainText(docGraph) {
        let texts = [];

        docGraph.structure.pages.forEach(page => {
            texts.push(`--- Page/Slide ${page.index} ---`);

            // Sort nodes by Y position roughly to maintain reading order
            const sortedNodes = page.nodes.sort((a, b) => {
                return (a.position?.y || 0) - (b.position?.y || 0);
            });

            sortedNodes.forEach(node => {
                if (node.type === 'text') {
                    texts.push(node.content.text);
                }
            });
            texts.push('\n');
        });

        return texts.join('\n');
    }
}
