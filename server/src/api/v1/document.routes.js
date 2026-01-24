import express from 'express';
import fs from 'fs';
import path from 'path';
import validate from '../../middleware/validate.js';
import { getDocumentSchema, getDocumentPageSchema, getDocumentImageSchema } from '../../validations/document.validation.js';

import Document from '../../models/Document.js';

const router = express.Router();

const BASE_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

/**
 * GET /api/v1/documents
 * List documents for a user
 */
router.get('/', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required to list documents' });
    }

    try {
        const documents = await Document.find({ userId, isArchived: false })
            .select('documentId type originalFile metadata createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('[DocumentRoutes] Error listing documents:', error);
        res.status(500).json({ error: 'Failed to list documents' });
    }
});

/**
 * GET /api/v1/documents/:documentId/images/:filename
 * Serves extracted images from disk via document lookup
 */
router.get('/:documentId/images/:filename', validate(getDocumentImageSchema), async (req, res) => {
    const { documentId, filename } = req.params;

    try {
        const doc = await Document.findOne({ documentId });
        if (!doc || !doc.storage?.key) {
            return res.status(404).json({ error: 'Document or storage path not found' });
        }

        const imagePath = path.join(process.cwd(), doc.storage.key, 'images', filename);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.sendFile(imagePath);
    } catch (error) {
        res.status(500).json({ error: 'Failed to serve image' });
    }
});

/**
 * GET /api/v1/documents/:documentId/pages/:pageIndex
 * Serves the pre-rendered static PNG of a specific page
 */
router.get('/:documentId/pages/:pageIndex', validate(getDocumentPageSchema), async (req, res) => {
    const { documentId, pageIndex } = req.params;

    try {
        const doc = await Document.findOne({ documentId });
        if (!doc || !doc.storage?.key) {
            return res.status(404).json({ error: 'Document or storage path not found' });
        }

        const imagePath = path.join(process.cwd(), doc.storage.key, 'pages', `${pageIndex}.png`);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Page image not found' });
        }

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.sendFile(imagePath);
    } catch (error) {
        res.status(500).json({ error: 'Failed to serve page image' });
    }
});

/**
 * GET /api/v1/documents/:documentId/pdf
 * Serves the converted PDF or original source
 */
router.get('/:documentId/pdf', validate(getDocumentSchema), async (req, res) => {
    const { documentId } = req.params;

    try {
        const doc = await Document.findOne({ documentId });
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        // Prioritize converted PDF (for PPTX) or fallback to original (for natively uploaded PDFs)
        let pdfPath;
        if (doc.convertedPdfPath) {
            pdfPath = path.isAbsolute(doc.convertedPdfPath) ? doc.convertedPdfPath : path.join(process.cwd(), doc.convertedPdfPath);
        } else {
            pdfPath = doc.originalFile?.path;
        }

        if (!pdfPath || !fs.existsSync(pdfPath)) {
            console.error(`[DocumentRoutes] PDF not found at: ${pdfPath}`);
            return res.status(404).json({ error: 'PDF file missing on disk' });
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(pdfPath);
    } catch (error) {
        console.error('[DocumentRoutes] Error serving PDF:', error);
        res.status(500).json({ error: 'Failed to serve PDF' });
    }
});

/**
 * GET /api/v1/documents/:documentId
 * Retrieves the full Document JSON from MongoDB
 */
router.get('/:documentId', validate(getDocumentSchema), async (req, res) => {
    const { documentId } = req.params;

    try {
        const doc = await Document.findOne({ documentId });

        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json(doc);
    } catch (error) {
        console.error('[DocumentRoutes] Error reading document:', error);
        res.status(500).json({ error: 'Failed to read document' });
    }
});

/**
 * GET /api/v1/documents/:documentId/page/:pageIndex
 * Retrieves a specific page metadata from the document structure
 */
router.get('/:documentId/page/:pageIndex', validate(getDocumentPageSchema), async (req, res) => {
    const { documentId, pageIndex } = req.params;

    try {
        const doc = await Document.findOne({ documentId });

        if (!doc || !doc.structure?.pages) {
            return res.status(404).json({ error: 'Document or structure not found' });
        }

        const page = doc.structure.pages.find(p => p.index === pageIndex);

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json({
            documentId,
            page,
            metadata: {
                documentType: doc.type,
                totalPages: doc.structure.pages.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read page' });
    }
});

/**
 * POST /api/v1/documents/:documentId/sync
 * Syncs AI-generated content (Chat, Summary, etc.) to the project record.
 */
router.post('/:documentId/sync', validate(getDocumentSchema), async (req, res) => {
    const { documentId } = req.params;
    const content = req.body; // Expects selective fields: summaryData, chatHistory, etc.

    try {
        const doc = await Document.findOneAndUpdate(
            { documentId },
            {
                ...content,
                lastAccessedAt: Date.now()
            },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({
            success: true,
            message: 'Project synced successfully'
        });
    } catch (error) {
        console.error('[DocumentRoutes] Error syncing content:', error);
        res.status(500).json({ error: 'Failed to sync content' });
    }
});

export default router;
