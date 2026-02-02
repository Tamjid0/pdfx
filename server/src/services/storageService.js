import path from 'path';
import fs from 'fs';

const BASE_STORAGE_DIR = path.resolve(process.cwd(), 'uploads');
const INDEX_STORAGE_DIR = path.resolve(process.cwd(), 'src', 'database', 'indexes');

// Ensure base directories exist
[BASE_STORAGE_DIR, INDEX_STORAGE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * StorageService
 * Centralizes all path resolution and file storage logic.
 * This makes it easy to swap local storage for Cloud Storage (S3/GCS) later.
 */
class StorageService {
    /**
     * Gets the base directory for a user
     */
    getUserDir(userId) {
        const userDir = path.join(BASE_STORAGE_DIR, userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        return userDir;
    }

    /**
     * Gets the directory for a specific document
     */
    getDocDir(userId, documentId) {
        const docDir = path.join(this.getUserDir(userId), documentId);
        if (!fs.existsSync(docDir)) {
            fs.mkdirSync(docDir, { recursive: true });
        }
        return docDir;
    }

    /**
     * Gets the path to the FAISS index for a document
     */
    getIndexPath(documentId) {
        return path.join(INDEX_STORAGE_DIR, documentId);
    }

    /**
     * Resolves a relative storage key to an absolute path
     */
    resolvePath(relativeKey) {
        return path.resolve(process.cwd(), relativeKey);
    }

    /**
     * Utilities for typical sub-directories
     */
    getImagesDir(userId, documentId) {
        return path.join(this.getDocDir(userId, documentId), 'images');
    }

    getPagesDir(userId, documentId) {
        return path.join(this.getDocDir(userId, documentId), 'pages');
    }
}

export default new StorageService();
