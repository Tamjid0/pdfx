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
 * GET /api/v1/documents/:documentId/pages/:pageIndex
 * Serves the pre-rendered static PNG of a specific page
 */
router.get('/:documentId/pages/:pageIndex', validate(getDocumentPageSchema), (req, res) => {
    const { documentId, pageIndex } = req.params;

    // Pages are stored as 1.png, 2.png etc. 
    // The validation schema transforms pageIndex to Number.
    const imagePath = path.join(DOCUMENTS_DIR, documentId, 'pages', `${pageIndex}.png`);

    if (!fs.existsSync(imagePath)) {
        // Fallback for immediate response if processing isn't done (though it should be)
        return res.status(404).json({ error: 'Page image not found' });
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache aggressively (1 year)
    res.sendFile(imagePath);
});

/**
 * GET /api/v1/documents/:documentId/pdf
 * Serves the converted PDF of a presentation
 */
router.get('/:documentId/pdf', validate(getDocumentSchema), (req, res) => {
    const { documentId } = req.params;
    const jsonPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);

    if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({ error: 'Document not found' });
    }

    try {
        const docGraph = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        if (!docGraph.convertedPdfPath && !docGraph.originalFilePath) {
            return res.status(404).json({ error: 'PDF source not found for this document' });
        }

        let pdfPath;
        if (docGraph.convertedPdfPath) {
            pdfPath = path.join(DOCUMENTS_DIR, docGraph.convertedPdfPath);
        } else {
            pdfPath = docGraph.originalFilePath;
        }
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ error: 'PDF file missing on disk' });
        }

        // Ensure browser doesn't cache the PDF too aggressively to assist fragment navigation
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(pdfPath);
    } catch (error) {
        console.error('[DocumentRoutes] Error serving PDF:', error);
        res.status(500).json({ error: 'Failed to serve PDF' });
    }
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
