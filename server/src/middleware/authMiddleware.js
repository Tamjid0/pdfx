import admin from 'firebase-admin';
import logger from '../utils/logger.js';

/**
 * Middleware to verify Firebase ID tokens (Strict)
 * Returns 401 if token is missing or invalid
 */
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        logger.error('Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

/**
 * Middleware to check if the user is the owner of the document
 * Assumes verifyToken has been called and req.user is populated
 * Assumes doc is fetched or documentId is in params
 */
export const checkDocumentOwnership = (DocumentModel) => async (req, res, next) => {
    const documentId = req.params.documentId || req.body.documentId;
    const userId = req.user?.uid;

    if (!documentId) return next();
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required for ownership check.' });

    try {
        const doc = await DocumentModel.findOne({ documentId });
        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Document not found.'
            });
        }

        if (doc.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not own this document.'
            });
        }

        req.currentDocument = doc;
        next();
    } catch (error) {
        logger.error('Ownership check failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authorization.'
        });
    }
};
