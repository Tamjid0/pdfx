import fs from 'fs';
import path from 'path';
import { PdfExtractor } from './extractors/PdfExtractor.js';
import { PptxExtractor } from './extractors/PptxExtractor.js';
import { StructuredChunker } from './StructuredChunker.js';
import { ImageExtractor } from './ImageExtractor.js';
import { analyzeImage } from './aiGenerationService.js';
import LibreOfficeService from './LibreOfficeService.js';
import crypto from 'crypto';

import storageService from './storageService.js';
import PdfImageRenderer from './PdfImageRenderer.js';
import Document from '../models/Document.js';
import logger from '../utils/logger.js';

export class DocumentProcessor {
    constructor() {
        this.pdfExtractor = new PdfExtractor();
        this.pptxExtractor = new PptxExtractor();
    }

    /**
     * Gets the user-specific storage directory
     */
    getUserDir(userId) {
        return storageService.getUserDir(userId);
    }

    /**
     * Phase 1: FAST extraction. Returns the DocumentGraph (JSON Nodes) and saves it.
     */
    async extract(filePath, mime, originalName, forcedDocumentId = null, userId = 'guest') {
        let documentGraph;
        const documentId = forcedDocumentId || crypto.randomUUID();
        const docDir = storageService.getDocDir(userId, documentId);


        if (mime === 'application/pdf') {
            documentGraph = await this.pdfExtractor.extract(filePath, originalName);
        } else if (
            mime.includes('presentation') ||
            mime.includes('powerpoint') ||
            (mime === 'application/octet-stream' && (originalName.match(/\.pptx$/i) || originalName.match(/\.ppt$/i)))
        ) {
            const buffer = fs.readFileSync(filePath);
            documentGraph = await this.pptxExtractor.extract(buffer, originalName);
            documentGraph.type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        } else if (
            mime.includes('text/') ||
            mime === 'application/json' ||
            (mime === 'application/octet-stream' && (originalName.match(/\.txt$/i) || originalName.match(/\.md$/i)))
        ) {
            const content = fs.readFileSync(filePath, 'utf-8');
            documentGraph = this.generateGraphFromText(content, originalName);
        } else {
            throw new Error(`Unsupported MIME type: ${mime}`);
        }

        documentGraph.documentId = documentId;
        documentGraph.userId = userId;

        // Extract internal images
        await ImageExtractor.extractAndSave(documentId, documentGraph, docDir);

        // Enrich images with AI descriptions BEFORE chunking
        try {
            await this.enrichImages(documentId, documentGraph, docDir);
        } catch (enrichError) {
            logger.warn(`[DocumentProcessor] Image enrichment failed but proceeding with extraction: ${enrichError.message}`);
        }

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
                url: `/api/v1/documents/${documentId}/view`
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
        } catch (mongoError) {
            logger.error(`[DocumentProcessor] Failed to save to MongoDB: ${mongoError.message}`);
        }

        // Save JSON to disk (Temporary metadata backup)
        const jsonPath = path.join(docDir, `metadata.json`);
        fs.writeFileSync(jsonPath, JSON.stringify({ ...documentGraph, chunks, topics, extractedText: flatText }, null, 2));

        return { documentId, documentGraph, chunks, topics, extractedText: flatText };
    }

    /**
     * Asynchronously enriches image nodes with AI descriptions
     */
    async enrichImages(documentId, documentGraph, docDir) {
        const imageNodes = [];
        if (!documentGraph.structure || !documentGraph.structure.pages) return;

        documentGraph.structure.pages.forEach(page => {
            if (page.nodes) {
                page.nodes.forEach(node => {
                    if (node.type === 'image') imageNodes.push(node);
                });
            }
        });

        if (imageNodes.length === 0) return;

        logger.info(`[DocumentProcessor] Enriching ${imageNodes.length} images for ${documentId}`);

        for (const node of imageNodes) {
            // Find the image file with any extension (png, jpeg, webp)
            const possibleExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
            let imagePath = null;

            for (const ext of possibleExtensions) {
                const p = path.join(docDir, 'images', `${node.id}.${ext}`);
                if (fs.existsSync(p)) {
                    imagePath = p;
                    break;
                }
            }

            if (imagePath) {
                try {
                    const description = await analyzeImage(imagePath);
                    node.content.description = description;
                    node.content.alt = description.substring(0, 100);
                } catch (e) {
                    logger.warn(`[DocumentProcessor] Failed to enrich image ${node.id}: ${e.message}`);
                }
            } else {
                logger.warn(`[DocumentProcessor] Image file not found for node ${node.id}`);
            }
        }
        logger.info(`[DocumentProcessor] Enriched metadata completed for ${documentId}`);
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

        const docDir = storageService.getDocDir(userId, documentId);
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

            const totalPages = await PdfImageRenderer.renderToImages(
                pdfPath,
                docDir,
                (p) => {
                    if (onProgress) onProgress(40 + (p * 0.6));
                }
            );

            if (onProgress) await onProgress(100);

            return data.convertedPdfPath || filePath;
        } catch (e) {
            logger.warn(`[DocumentProcessor] Conversion/Rendering failed: ${e.message}`);
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

    /**
     * Converts raw text into a structured DocumentGraph
     */
    generateGraphFromText(text, name) {
        const documentId = crypto.randomUUID();
        const pages = [];
        const blocks = text.split(/\n\s*\n/); // Split by double newlines

        let currentPageNodes = [];
        let blockCount = 0;

        blocks.forEach((block, index) => {
            if (!block.trim()) return;

            currentPageNodes.push({
                id: `node-${index}`,
                type: 'text',
                content: block.trim(),
                metadata: {
                    index,
                    isHeading: block.length < 100 && block.split('\n').length === 1
                }
            });

            blockCount++;

            // Create a new "page" every 10 blocks to maintain structure
            if (blockCount >= 10) {
                pages.push({
                    pageIndex: pages.length,
                    nodes: currentPageNodes
                });
                currentPageNodes = [];
                blockCount = 0;
            }
        });

        // Add remaining nodes
        if (currentPageNodes.length > 0) {
            pages.push({
                pageIndex: pages.length,
                nodes: currentPageNodes
            });
        }

        return {
            documentId,
            name: name || 'Pasted Content',
            type: 'text/plain',
            metadata: {
                title: name,
                pageCount: pages.length,
                wordCount: text.split(/\s+/).length
            },
            pages
        };
    }

    derivePlainText(docGraph) {
        return StructuredChunker.deriveTextFromGraph(docGraph);
    }
}
