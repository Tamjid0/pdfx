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
     * Derives plain text from DocumentGraph (legacy compatibility)
     * @param {DocumentRoot} docGraph
     * @returns {string}
     */
    static deriveTextFromGraph(docGraph) {
        const chunks = this.chunkByStructure(docGraph);
        return chunks.map(chunk => chunk.content).join('\n\n');
    }
}
