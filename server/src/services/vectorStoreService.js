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

    /**
     * Retrieves chunks by node IDs from the DocumentGraph
     * @param {string} documentId 
     * @param {string[]} nodeIds 
     * @returns {Promise<Array>} Array of matching chunks
     */
    async getChunksByNodeIds(documentId, nodeIds) {
        try {
            const DocumentGraph = (await import('../models/DocumentGraph.js')).default;
            const graph = await DocumentGraph.findOne({ fileId: documentId });

            if (!graph) {
                logger.warn(`[VectorStore] No DocumentGraph found for ${documentId}`);
                return [];
            }

            const chunks = [];
            const pages = graph.structure?.pages || [];

            for (const page of pages) {
                if (!page.nodes) continue;

                for (const node of page.nodes) {
                    if (nodeIds.includes(node.id) && node.type === 'text') {
                        // Create a chunk-like object matching vector store format
                        chunks.push({
                            pageContent: typeof node.content === 'string' ? node.content : node.content?.text || '',
                            metadata: {
                                nodeId: node.id,
                                pageIndex: page.index,
                                type: node.type
                            }
                        });
                    }
                }
            }

            logger.info(`[VectorStore] Retrieved ${chunks.length} chunks for ${nodeIds.length} node IDs`);
            return chunks;
        } catch (error) {
            logger.error(`[VectorStore] Failed to retrieve chunks by node IDs: ${error.message}`);
            return [];
        }
    }
}

const vectorStoreService = new VectorStoreService();
export default vectorStoreService;

/**
 * Legacy support for named export
 */
export const getVectorStore = (documentId) => vectorStoreService.loadStore(documentId);

