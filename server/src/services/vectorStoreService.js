import fs from 'fs';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { hfEmbeddings } from './embeddingService.js';
import storageService from './storageService.js';

// Production Cache: Stores loaded FaissStore instances to avoid redundant disk I/O
const vectorStoreCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Loads a vector store from disk or returns it from cache.
 * @param {string} fileId - Unique identifier for the document.
 * @returns {Promise<FaissStore|null>}
 */
export const getVectorStore = async (fileId) => {
    // 1. Check Cache
    if (vectorStoreCache.has(fileId)) {
        const cached = vectorStoreCache.get(fileId);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            cached.timestamp = Date.now(); // Refresh TTL
            return cached.instance;
        }
        vectorStoreCache.delete(fileId);
    }

    const vectorStorePath = storageService.getIndexPath(fileId);
    if (fs.existsSync(vectorStorePath)) {
        const instance = await FaissStore.load(vectorStorePath, hfEmbeddings);

        // 2. Update Cache
        vectorStoreCache.set(fileId, {
            instance,
            timestamp: Date.now()
        });

        // Optional: Simple Cache Eviction (keep latest 50 docs)
        if (vectorStoreCache.size > 50) {
            const oldestKey = vectorStoreCache.keys().next().value;
            vectorStoreCache.delete(oldestKey);
        }

        return instance;
    }
    return null;
};
