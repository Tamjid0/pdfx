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
            const Document = (await import('../models/Document.js')).default;
            const doc = await Document.findOne({ documentId: documentId });

            if (!doc || !doc.structure) {
                logger.warn(`[VectorStore] No document structure found for ${documentId}`);
                return [];
            }


            console.log(`[VectorStore] 🔍 Document found:`, {
                hasDoc: !!doc,
                structureKeys: doc.structure ? Object.keys(doc.structure) : [],
                structure_structureKeys: doc.structure?.structure ? Object.keys(doc.structure.structure) : []
            });

            // Handle different structure formats
            // Format 1: Direct structure object (legacy?)
            // Format 2: DocumentRoot instance (current) -> has .structure property
            const pages = doc.structure?.structure?.pages || doc.structure?.pages || [];

            const chunks = []; // Re-declare chunks here

            console.log(`[VectorStore] 🔍 Document query result:`, {
                foundDoc: !!doc,
                hasStructure: !!doc.structure,
                pagesCount: pages.length,
                requestedNodeIds: nodeIds,
                samplePageNodes: pages[0]?.nodes?.length || 0
            });

            for (const page of pages) {
                if (!page.nodes) continue;

                // DEBUG: Show sample node IDs from first page
                if (page === pages[0]) {
                    const sampleNodes = page.nodes.slice(0, 3).map(n => ({ id: n.id, type: n.type }));
                    console.log(`[VectorStore] 🔍 Sample node IDs in database:`, sampleNodes);
                    console.log(`[VectorStore] 🔍 Requested node IDs:`, nodeIds);
                }

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

