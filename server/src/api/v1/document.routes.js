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
            .select('documentId type originalFile metadata createdAt summaryData notesData insightsData flashcardsData quizData mindmapData chatHistory')
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

import { mergeContent } from '../../utils/merging.js';

/**
 * POST /api/v1/documents/:documentId/sync
 * Syncs AI-generated content (Chat, Summary, etc.) to the project record.
 * Supports appending and versioning.
 */
router.post('/:documentId/sync', validate(getDocumentSchema), async (req, res) => {
    const { documentId } = req.params;
    const { append, scope, versionName, ...fields } = req.body;

    try {
        const doc = await Document.findOne({ documentId });
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const versionedFields = ['summaryData', 'notesData', 'insightsData', 'flashcardsData', 'quizData'];
        const updateData = { lastAccessedAt: Date.now() };

        for (const key of Object.keys(fields)) {
            if (versionedFields.includes(key)) {
                const moduleType = key.replace('Data', '');
                let oldData = doc[key]?.content;

                // Fallback for Legacy Phase 10 logic (data was stored directly without the .content wrapper)
                if (!oldData && doc[key]) {
                    const legacyData = doc[key];
                    // Check if it's the legacy format (not null, and has module-specific fields or is the data itself)
                    if (typeof legacyData === 'object' && !legacyData.revisions) {
                        oldData = legacyData;
                    }
                }

                let newData = fields[key];

                // 1. Handle Merging (Append Mode)
                if (append && oldData) {
                    newData = mergeContent(oldData, newData, moduleType);
                }

                // 2. Handle Revisions (Snapshot)
                // We create a revision from the PREVIOUS active content before updating
                if (oldData) {
                    const revisions = doc[key]?.revisions || [];
                    const prevScope = doc[key]?.activeScope || { type: 'all' };

                    // Auto-generate name if not provided
                    let revisionName = versionName;
                    if (!revisionName) {
                        const draftCount = revisions.filter(r => r.name?.startsWith('Draft ')).length;
                        revisionName = `Draft ${draftCount + 1}`;
                    }

                    const newRevision = {
                        id: crypto.randomUUID(),
                        name: revisionName,
                        timestamp: new Date(),
                        scope: prevScope,
                        data: oldData
                    };

                    // Add to revisions, keep only latest 10
                    const updatedRevisions = [newRevision, ...revisions].slice(0, 10);
                    updateData[`${key}.revisions`] = updatedRevisions;
                }

                // 3. Update Active Content
                const currentScope = scope || { type: 'all' };
                updateData[`${key}.content`] = newData;
                updateData[`${key}.activeScope`] = currentScope;

            } else {
                // Non-versioned fields (chatHistory, metadata, etc.)
                updateData[key] = fields[key];
            }
        }

        await Document.updateOne({ documentId }, { $set: updateData });

        res.json({
            success: true,
            message: 'Project synced successfully',
            updatedFields: updateData
        });
    } catch (error) {
        console.error('[DocumentRoutes] Error syncing content:', error);
        res.status(500).json({ error: 'Failed to sync content' });
    }
});

// 4. Delete a revision
router.delete('/:documentId/revisions/:revisionId', async (res, req) => {
    try {
        const { documentId, revisionId } = req.params;
        const { module: moduleKey } = req.query; // e.g. 'summaryData'

        if (!moduleKey) {
            return res.status(400).json({ error: 'Module key is required' });
        }

        const doc = await Document.findOne({ documentId });
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        // Remove the revision from the specified module
        const update = {
            $pull: {
                [`${moduleKey}.revisions`]: { id: revisionId }
            }
        };

        await Document.updateOne({ documentId }, update);

        res.json({ success: true, message: 'Revision deleted successfully' });
    } catch (error) {
        console.error('[DocumentRoutes] Error deleting revision:', error);
        res.status(500).json({ error: 'Failed to delete revision' });
    }
});

// 5. Rename a revision
router.patch('/:documentId/revisions/:revisionId', async (res, req) => {
    try {
        const { documentId, revisionId } = req.params;
        const { module: moduleKey, name } = req.body;

        if (!moduleKey || !name) {
            return res.status(400).json({ error: 'Module key and name are required' });
        }

        const doc = await Document.findOne({ documentId });
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        // Update the name of the specific revision
        // We use the $[<identifier>] positional operator for this
        const result = await Document.updateOne(
            { documentId, [`${moduleKey}.revisions.id`]: revisionId },
            { $set: { [`${moduleKey}.revisions.$.name`]: name } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Revision not found' });
        }

        res.json({ success: true, message: 'Revision renamed successfully' });
    } catch (error) {
        console.error('[DocumentRoutes] Error renaming revision:', error);
        res.status(500).json({ error: 'Failed to rename revision' });
    }
});

import crypto from 'crypto';

export default router;
