import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { hfEmbeddings } from './embeddingService.js';
import storageService from './storageService.js';
import fs from 'fs';
import logger from '../utils/logger.js';

class VectorStoreService {
    /**
     * Creates and saves a new vector store from document chunks
     * @param {string} documentId 
     * @param {Array} docs - Array of { pageContent, metadata }
     */
    async saveChunks(documentId, docs) {
        try {
            logger.info(`[VectorStore] Creating index for ${documentId} with ${docs.length} chunks.`);
            const vectorStore = await FaissStore.fromDocuments(docs, hfEmbeddings);
            const indexPath = storageService.getIndexPath(documentId);
            await vectorStore.save(indexPath);
            return indexPath;
        } catch (error) {
            logger.error(`[VectorStore] Failed to save chunks for ${documentId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Loads an existing vector store for a document
     * @param {string} documentId 
     */
    async loadStore(documentId) {
        const indexPath = storageService.getIndexPath(documentId);
        if (!fs.existsSync(indexPath)) {
            throw new Error(`Vector index not found for document ${documentId}`);
        }
        return await FaissStore.load(indexPath, hfEmbeddings);
    }

    /**
     * Performs similarity search on a document's vector store
     * @param {string} documentId 
     * @param {string} query 
     * @param {number} topN 
     */
    async similaritySearch(documentId, query, topN = 10) {
        try {
            const vectorStore = await this.loadStore(documentId);
            return await vectorStore.similaritySearch(query, topN);
        } catch (error) {
            logger.error(`[VectorStore] Search failed for ${documentId}: ${error.message}`);
            throw error;
        }
    }
}

export default new VectorStoreService();
