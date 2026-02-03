/**
 * StructuredChunker
 * Converts DocumentGraph JSON into semantic chunks with rich metadata.
 * 
 * Strategy:
 * - PDF: 1 page = 1 chunk
 * - PPTX: 1 slide = 1 chunk
 * - Preserves structural metadata for precise citations
 */
export class StructuredChunker {
    /**
     * Chunks a DocumentGraph by logical units (pages/slides)
     * @param {DocumentRoot} docGraph - The document graph to chunk
     * @returns {Array<{content: string, metadata: object}>}
     */
    static chunkByStructure(docGraph) {
        const chunks = [];

        if (!docGraph.structure || !docGraph.structure.pages) {
            return chunks;
        }

        for (const page of docGraph.structure.pages) {
            const pageChunks = this.createChunksFromPage(page, docGraph);
            if (pageChunks.length > 0) {
                chunks.push(...pageChunks);
            }
        }

        return chunks;
    }

    /**
     * Creates chunks from a single page/slide, splitting if content is too large.
     * @param {DocumentPage} page - The page to convert
     * @param {DocumentRoot} docGraph - The parent document
     * @returns {Array<{content: string, metadata: object}>}
     */
    static createChunksFromPage(page, docGraph) {
        const textNodes = page.nodes.filter(node => node.type === 'text');
        const imageNodes = page.nodes.filter(node => node.type === 'image');

        // Concatenate all text content from the page with IDs for Referential AI
        const rawContent = textNodes
            .map(node => `[[${node.id}]]: ${node.content.text || ''}`)
            .filter(text => text.trim())
            .join('\n');

        if (!rawContent.trim()) return [];

        // Production Targeting: ~512 token limit (approx 2000 chars)
        const MAX_CHUNK_SIZE = 2000;
        const OVERLAP = 300;

        const chunks = [];

        if (rawContent.length <= MAX_CHUNK_SIZE) {
            chunks.push({
                content: rawContent,
                metadata: this.getMetadata(page, docGraph, textNodes, imageNodes)
            });
        } else {
            // Split into sub-chunks
            let start = 0;
            let subIndex = 0;

            while (start < rawContent.length) {
                let end = start + MAX_CHUNK_SIZE;

                // Try to split at a newline if possible
                if (end < rawContent.length) {
                    const lastNewline = rawContent.lastIndexOf('\n', end);
                    if (lastNewline > start + (MAX_CHUNK_SIZE / 2)) {
                        end = lastNewline + 1;
                    }
                }

                const subContent = rawContent.substring(start, end).trim();
                if (subContent) {
                    chunks.push({
                        content: subContent,
                        metadata: {
                            ...this.getMetadata(page, docGraph, textNodes, imageNodes),
                            subIndex
                        }
                    });
                    subIndex++;
                }

                start = end - OVERLAP;
                if (start < 0) start = 0;
                if (start >= rawContent.length - 100) break; // Avoid tiny orphans
            }
        }

        return chunks;
    }

    /**
     * Build rich metadata helper
     */
    static getMetadata(page, docGraph, textNodes, imageNodes) {
        return {
            documentId: docGraph.documentId,
            documentType: docGraph.type,
            pageIndex: page.index,
            pageType: page.type, // 'page' or 'slide'
            nodeIds: page.nodes.map(n => n.id),
            textNodeCount: textNodes.length,
            imageNodeCount: imageNodes.length,
            imageUrls: imageNodes.map(n => n.content.url),
            dimensions: page.dimensions
        };
    }

    /**
     * Detects logical topics based on font size increases (headings)
     * @param {DocumentRoot} docGraph 
     * @returns {Array<{id: string, title: string, startPage: number, nodes: string[]}>}
     */
    static detectTopics(docGraph) {
        const topics = [];
        let currentTopic = null;

        // Calculate a global baseline for font sizes
        const fontHeights = [];
        docGraph.structure.pages.forEach(page => {
            (page.nodes || []).filter(n => n.type === 'text').forEach(n => {
                if (n.content.style?.fontSize) fontHeights.push(n.content.style.fontSize);
            });
        });

        // Median/Average font size
        const sortedHeights = fontHeights.sort((a, b) => a - b);
        const baselineSize = sortedHeights[Math.floor(sortedHeights.length * 0.5)] || 12;

        for (const page of docGraph.structure.pages) {
            const textNodes = (page.nodes || []).filter(node => node.type === 'text');

            for (const node of textNodes) {
                const style = node.content.style || {};
                const size = style.fontSize || 0;
                const isBold = style.isBold || false;

                // Production Grade Heading Detection
                // Trigger if: (Significantly larger) OR (Larger + Bold) OR (Standard size + Bold in specific contexts)
                const isSignificantlyLarger = size > baselineSize * 1.3;
                const isHeadingSizeAndBold = size >= baselineSize * 1.1 && isBold;
                const isSmallHeading = size >= baselineSize && isBold && node.content.text.length < 60;

                if ((isSignificantlyLarger || isHeadingSizeAndBold || isSmallHeading) && node.content.text.length < 120) {
                    // Start a new topic
                    if (currentTopic) {
                        currentTopic.endPage = page.index;
                        topics.push(currentTopic);
                    }

                    currentTopic = {
                        id: crypto.randomUUID(),
                        title: node.content.text.trim(),
                        startPage: page.index,
                        nodes: [node.id]
                    };
                } else {
                    // Append to current topic if it exists
                    if (currentTopic) {
                        currentTopic.nodes.push(node.id);
                    } else {
                        // Fallback first topic
                        currentTopic = {
                            id: 'intro',
                            title: 'Introduction',
                            startPage: 0,
                            nodes: [node.id]
                        };
                    }
                }
            }
        }

        if (currentTopic) {
            currentTopic.endPage = docGraph.structure.pages.length - 1;
            topics.push(currentTopic);
        }

        // Return all detected topics without aggressive filtering
        return topics;
    }

    /**
     * Derives plain text from DocumentGraph (legacy compatibility)
     * @param {DocumentRoot} docGraph
     * @returns {string}
     */
    static deriveTextFromGraph(docGraph) {
        const chunks = this.chunkByStructure(docGraph);
        return chunks.map(chunk => chunk.content).join('\n\n');
    }
}

import crypto from 'crypto';
