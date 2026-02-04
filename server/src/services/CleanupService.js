import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import storageService from './storageService.js';
import logger from '../utils/logger.js';
import { deleteCachePattern } from './cacheService.js';

class CleanupService {
    /**
     * Deletes all data associated with a document: MongoDB, Files, and Index
     * @param {string} documentId 
     */
    async deleteDocument(documentId) {
        try {
            const doc = await Document.findOne({ documentId });
            if (!doc) {
                logger.warn(`[Cleanup] Document ${documentId} not found for deletion.`);
                return;
            }

            const { userId, storage, originalFile, convertedPdfPath } = doc;

            // 1. Delete Structural Files (images, pages, metadata.json)
            if (storage?.key) {
                const docDir = storageService.resolvePath(storage.key);
                if (fs.existsSync(docDir)) {
                    fs.rmSync(docDir, { recursive: true, force: true });
                    logger.debug(`[Cleanup] Deleted directory: ${docDir}`);
                }
            }

            // 2. Delete Vector Index
            const indexPath = storageService.getIndexPath(documentId);
            if (fs.existsSync(indexPath)) {
                fs.rmSync(indexPath, { recursive: true, force: true });
                logger.debug(`[Cleanup] Deleted index: ${indexPath}`);
            }

            // 3. Delete Original File (if it's not inside the docDir)
            if (originalFile?.path) {
                const absoluteOriginal = storageService.resolvePath(originalFile.path);
                if (fs.existsSync(absoluteOriginal) && !absoluteOriginal.includes(documentId)) {
                    fs.unlinkSync(absoluteOriginal);
                    logger.debug(`[Cleanup] Deleted original file: ${absoluteOriginal}`);
                }
            }

            // 4. Delete Converted PDF (if applicable)
            if (convertedPdfPath) {
                const absolutePdf = storageService.resolvePath(convertedPdfPath);
                if (fs.existsSync(absolutePdf) && !absolutePdf.includes(documentId)) {
                    fs.unlinkSync(absolutePdf);
                    logger.debug(`[Cleanup] Deleted converted PDF: ${absolutePdf}`);
                }
            }

            // 5. Delete MongoDB Record
            await Document.deleteOne({ documentId });
            logger.info(`[Cleanup] Successfully purged document ${documentId}`);

            // 6. Invalidate Cache
            if (userId) {
                deleteCachePattern(`docs_list:${userId}:*`).catch(() => { });
            }

            return true;
        } catch (error) {
            logger.error(`[Cleanup] Failed to delete document ${documentId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Perish guest data older than a certain threshold
     * @param {number} olderThanHours 
     */
    async cleanupGuests(olderThanHours = 24) {
        const thresholdDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

        try {
            const guestDocs = await Document.find({
                userId: 'guest',
                createdAt: { $lt: thresholdDate }
            }).select('documentId');

            if (guestDocs.length === 0) {
                logger.info('[Cleanup] No guest data found to purge.');
                return { count: 0 };
            }

            logger.info(`[Cleanup] Found ${guestDocs.length} guest documents to purge.`);

            let successCount = 0;
            for (const doc of guestDocs) {
                try {
                    await this.deleteDocument(doc.documentId);
                    successCount++;
                } catch (e) {
                    logger.error(`[Cleanup] Error during guest purge of ${doc.documentId}: ${e.message}`);
                }
            }

            return { total: guestDocs.length, purged: successCount };
        } catch (error) {
            logger.error(`[Cleanup] Guest cleanup failed: ${error.message}`);
            throw error;
        }
    }
}

export default new CleanupService();
