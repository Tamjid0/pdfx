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
            console.warn('[StructuredChunker] No pages found in document structure');
            return chunks;
        }

        for (const page of docGraph.structure.pages) {
            const chunk = this.createChunkFromPage(page, docGraph);
            if (chunk.content.trim()) {
                chunks.push(chunk);
            }
        }

        return chunks;
    }

    /**
     * Creates a chunk from a single page/slide
     * @param {DocumentPage} page - The page to convert
     * @param {DocumentRoot} docGraph - The parent document
     * @returns {{content: string, metadata: object}}
     */
    static createChunkFromPage(page, docGraph) {
        const textNodes = page.nodes.filter(node => node.type === 'text');
        const imageNodes = page.nodes.filter(node => node.type === 'image');

        // Concatenate all text content from the page
        const content = textNodes
            .map(node => node.content.text || '')
            .filter(text => text.trim())
            .join('\n');

        // Build rich metadata
        const metadata = {
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

        // Add slide-specific metadata if applicable
        if (page.type === 'slide' && page.title) {
            metadata.slideTitle = page.title;
        }

        return { content, metadata };
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
