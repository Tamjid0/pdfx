import express from 'express';
import fs from 'fs';
import path from 'path';
import validate from '../../middleware/validate.js';
import { getDocumentSchema, getDocumentPageSchema, getDocumentImageSchema } from '../../validations/document.validation.js';
import { verifyToken, checkDocumentOwnership, optionalVerifyToken } from '../../middleware/authMiddleware.js';
import cacheMiddleware from '../../middleware/cacheMiddleware.js';
import { deleteCachePattern } from '../../services/cacheService.js';

import Document from '../../models/Document.js';
import logger from '../../utils/logger.js';

const router = express.Router();

const BASE_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

/**
 * GET /api/v1/documents
 * List documents for a user (securely identified via token or guest mode)
 */
router.get('/', optionalVerifyToken, cacheMiddleware(600, 'docs_list'), async (req, res) => {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const documents = await Document.find({ userId, isArchived: false })
            .select('documentId type originalFile metadata createdAt summaryData notesData insightsData flashcardsData quizData mindmapData chatHistory')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);

        // Check if there are more documents
        const totalCount = await Document.countDocuments({ userId, isArchived: false });
        const hasMore = offset + documents.length < totalCount;

        res.json({
            success: true,
            data: documents,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore
            }
        });
    } catch (error) {
        logger.error('[DocumentRoutes] Error listing documents:', error);
        res.status(500).json({ error: 'Failed to list documents' });
    }
});

/**
 * GET /api/v1/documents/:documentId/images/:filename
 * Serves extracted images from disk via document lookup
 */
router.get('/:documentId/images/:filename', optionalVerifyToken, checkDocumentOwnership(Document), validate(getDocumentImageSchema), async (req, res) => {
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
router.get('/:documentId/pages/:pageIndex', optionalVerifyToken, checkDocumentOwnership(Document), validate(getDocumentPageSchema), async (req, res) => {
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
router.get('/:documentId/pdf', optionalVerifyToken, checkDocumentOwnership(Document), validate(getDocumentSchema), async (req, res) => {
    const doc = req.currentDocument;

    try {
        // Prioritize converted PDF (for PPTX) or fallback to original (for natively uploaded PDFs)
        let pdfPath;
        if (doc.convertedPdfPath) {
            pdfPath = path.isAbsolute(doc.convertedPdfPath) ? doc.convertedPdfPath : path.join(process.cwd(), doc.convertedPdfPath);
        } else {
            pdfPath = doc.originalFile?.path;
        }

        if (!pdfPath || !fs.existsSync(pdfPath)) {
            logger.error(`[DocumentRoutes] PDF not found at: ${pdfPath}`);
            return res.status(404).json({ error: 'PDF file missing on disk' });
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(pdfPath);
    } catch (error) {
        logger.error(`[DocumentRoutes] Error serving PDF: ${error.message}`);
        res.status(500).json({ error: 'Failed to serve PDF' });
    }
});

/**
 * GET /api/v1/documents/:documentId
 * Retrieves the full Document JSON from MongoDB
 */
router.get('/:documentId', optionalVerifyToken, checkDocumentOwnership(Document), validate(getDocumentSchema), async (req, res) => {
    res.json(req.currentDocument);
});

/**
 * GET /api/v1/documents/:documentId/page/:pageIndex
 * Retrieves a specific page metadata from the document structure
 */
router.get('/:documentId/page/:pageIndex', optionalVerifyToken, checkDocumentOwnership(Document), validate(getDocumentPageSchema), async (req, res) => {
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
        logger.error('[DocumentRoutes] Error reading page:', error);
        res.status(500).json({ error: 'Failed to read page' });
    }
});

import { mergeContent } from '../../utils/merging.js';

/**
 * POST /api/v1/documents/:documentId/sync
 * Syncs AI-generated content (Chat, Summary, etc.) to the project record.
 * Supports appending and versioning.
 */
router.post('/:documentId/sync', optionalVerifyToken, checkDocumentOwnership(Document), validate(getDocumentSchema), async (req, res) => {
    const doc = req.currentDocument;
    const { documentId } = req.params;
    const { append, scope, versionName, ...fields } = req.body;
    const userId = req.user.uid;

    try {
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

                // 1. Handle Revision List Updates (e.g. from tab management)
                // If newData is an object with 'revisions', we update ONLY the revisions list
                // and skip content update logic to avoid corruption.
                if (newData && typeof newData === 'object' && Array.isArray(newData.revisions)) {
                    updateData[`${key}.revisions`] = newData.revisions;
                    continue;
                }

                // 2. Handle Merging (Append Mode)
                if (append && oldData) {
                    newData = mergeContent(oldData, newData, moduleType);
                }

                // 2. Handle Revisions (Snapshot)
                // We create a revision from the PREVIOUS active content before updating
                // FIX: Skip snapshotting if newData is null (explicit wipe) or if preventSnapshot is requested
                if (oldData && newData !== null && !req.body.preventSnapshot) {
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

        // Invalidate Cache for this user's document list
        deleteCachePattern(`docs_list:${userId}:*`).catch(err =>
            logger.error(`[Cache] Invalidation failed for user ${userId}: ${err.message}`)
        );

        res.json({
            success: true,
            message: 'Project synced successfully',
            updatedFields: updateData
        });
    } catch (error) {
        logger.error('[DocumentRoutes] Error syncing content:', error);
        res.status(500).json({ error: 'Failed to sync content' });
    }
});

// 4. Delete a revision
router.delete('/:documentId/revisions/:revisionId', verifyToken, checkDocumentOwnership(Document), async (req, res) => {
    try {
        const { documentId, revisionId } = req.params;
        const { module: moduleKey } = req.query; // e.g. 'summaryData'

        if (!moduleKey) {
            return res.status(400).json({ error: 'Module key is required' });
        }

        // Remove the revision from the specified module
        const update = {
            $pull: {
                [`${moduleKey}.revisions`]: { id: revisionId }
            }
        };

        await Document.updateOne({ documentId }, update);

        // Invalidate Cache
        const userId = req.user.uid;
        deleteCachePattern(`docs_list:${userId}:*`).catch(err =>
            logger.error(`[Cache] Invalidation failed for user ${userId}: ${err.message}`)
        );

        res.json({ success: true, message: 'Revision deleted successfully' });
    } catch (error) {
        logger.error('[DocumentRoutes] Error deleting revision:', error);
        res.status(500).json({ error: 'Failed to delete revision' });
    }
});

// 5. Rename a revision
router.patch('/:documentId/revisions/:revisionId', verifyToken, checkDocumentOwnership(Document), async (req, res) => {
    try {
        const { documentId, revisionId } = req.params;
        const { module: moduleKey, name } = req.body;

        if (!moduleKey || !name) {
            return res.status(400).json({ error: 'Module key and name are required' });
        }

        // Update the name of the specific revision
        // We use the $[<identifier>] positional operator for this
        const result = await Document.updateOne(
            { documentId, [`${moduleKey}.revisions.id`]: revisionId },
            { $set: { [`${moduleKey}.revisions.$.name`]: name } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Revision not found' });
        }

        // Invalidate Cache
        const userId = req.user.uid;
        deleteCachePattern(`docs_list:${userId}:*`).catch(err =>
            logger.error(`[Cache] Invalidation failed for user ${userId}: ${err.message}`)
        );

        res.json({ success: true, message: 'Revision renamed successfully' });
    } catch (error) {
        logger.error(`[DocumentRoutes] Error renaming revision: ${error.message}`);
        res.status(500).json({ error: 'Failed to rename revision' });
    }
});

// 6. Delete a document (soft delete)
router.delete('/:documentId', verifyToken, checkDocumentOwnership(Document), async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.uid;

        // Soft delete by setting isArchived to true
        await Document.updateOne({ documentId }, { $set: { isArchived: true } });

        // Invalidate Cache for this user's document list
        deleteCachePattern(`docs_list:${userId}:*`).catch(err =>
            logger.error(`[Cache] Invalidation failed for user ${userId}: ${err.message}`)
        );

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        logger.error(`[DocumentRoutes] Error deleting document: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

import crypto from 'crypto';

export default router;
