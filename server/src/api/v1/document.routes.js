import express from 'express';
import fs from 'fs';
import path from 'path';
import validate from '../../middleware/validate.js';
import { getDocumentSchema, getDocumentPageSchema, getDocumentImageSchema } from '../../validations/document.validation.js';

const router = express.Router();

const DOCUMENTS_DIR = path.resolve(process.cwd(), 'src/database/documents');

/**
 * GET /api/documents/:documentId/images/:filename
 * Serves extracted images from disk
 */
router.get('/:documentId/images/:filename', validate(getDocumentImageSchema), (req, res) => {
    const { documentId, filename } = req.params;

    const imagePath = path.join(DOCUMENTS_DIR, documentId, 'images', filename);

    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: 'Image not found' });
    }

    // Serve the image file
    res.sendFile(imagePath);
});

/**
 * GET /api/documents/:documentId
 * Retrieves the full DocumentGraph JSON
 */
router.get('/:documentId', validate(getDocumentSchema), (req, res) => {
    const { documentId } = req.params;

    const jsonPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);

    if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({ error: 'Document not found' });
    }

    try {
        const docGraph = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        res.json(docGraph);
    } catch (error) {
        console.error('[DocumentRoutes] Error reading document:', error);
        res.status(500).json({ error: 'Failed to read document' });
    }
});

/**
 * GET /api/documents/:documentId/page/:pageIndex
 * Retrieves a specific page/slide from the document
 */
router.get('/:documentId/page/:pageIndex', validate(getDocumentPageSchema), (req, res) => {
    const { documentId, pageIndex } = req.params;

    const jsonPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);

    if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({ error: 'Document not found' });
    }

    try {
        const docGraph = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const page = docGraph.structure.pages.find(p => p.index === pageIndex);

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json({
            documentId,
            page,
            metadata: {
                documentType: docGraph.type,
                totalPages: docGraph.structure.pages.length
            }
        });
    } catch (error) {
        console.error('[DocumentRoutes] Error reading page:', error);
        res.status(500).json({ error: 'Failed to read page' });
    }
});

export default router;
