/**
 * @typedef {Object} Position
 * @property {number} x - Left position (percentage or points)
 * @property {number} y - Top position (percentage or points)
 * @property {number} [width] - Width of element
 * @property {number} [height] - Height of element
 */

/**
 * @typedef {Object} NodeSource
 * @property {number} [page] - Page number (1-based) for PDF
 * @property {number} [slide] - Slide number (1-based) for PPTX
 * @property {string} [section] - Section name for DOCX
 */

/**
 * Base class for all content nodes in the document graph.
 */
class ContentNode {
    /**
     * @param {string} type - 'text', 'image', 'shape', 'table', 'list'
     * @param {Object} content - The actual content payload
     * @param {Position} position - Spatial information
     * @param {NodeSource} source - Origin information
     */
    constructor(type, content, position = {}, source = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.content = content;
        this.position = position;
        this.source = source;
    }
}

/**
 * Represents a text block.
 */
class TextNode extends ContentNode {
    /**
     * @param {string} text - The raw text
     * @param {Object} [style] - Formatting info (fontSize, weight, color)
     * @param {Position} position
     * @param {NodeSource} source
     */
    constructor(text, style = {}, position, source) {
        super('text', { text, style }, position, source);
    }
}

/**
 * Represents an image.
 */
class ImageNode extends ContentNode {
    /**
     * @param {string} url - Local or remote URL to the image resource
     * @param {string} [alt] - Alt text
     * @param {Position} position
     * @param {NodeSource} source
     */
    constructor(url, alt = '', position, source) {
        super('image', { url, alt }, position, source);
    }
}

/**
 * Represents a single page or slide container.
 */
class DocumentPage {
    /**
     * @param {number} index - 1-based index
     * @param {Object} dimensions - { width, height }
     * @param {string} [type='page'] - 'page' or 'slide'
     */
    constructor(index, dimensions = {}, type = 'page') {
        this.index = index;
        this.type = type; // 'page' or 'slide'
        this.dimensions = dimensions;
        this.nodes = []; // Array of ContentNode
    }

    addNode(node) {
        this.nodes.push(node);
    }
}

/**
 * The Root Document Graph.
 * Single source of truth for a processed file.
 */
class DocumentRoot {
    /**
     * @param {string} originalFileName
     * @param {string} mimeType
     * @param {string} [title]
     */
    constructor(originalFileName, mimeType, title) {
        this.documentId = crypto.randomUUID();
        this.type = this.detectType(mimeType);
        this.originalFile = {
            name: originalFileName,
            mime: mimeType,
            processedAt: new Date().toISOString()
        };
        this.metadata = {
            title: title || originalFileName,
            pageCount: 0,
            language: 'en' // default
        };
        this.structure = {
            pages: [] // Array of DocumentPage
        };
    }

    detectType(mime) {
        if (mime.includes('pdf')) return 'pdf';
        if (mime.includes('presentation') || mime.includes('powerpoint')) return 'pptx';
        if (mime.includes('word') || mime.includes('document')) return 'docx';
        return 'unknown';
    }

    addPage(page) {
        this.structure.pages.push(page);
        this.metadata.pageCount = this.structure.pages.length;
    }
}

import crypto from 'crypto';

export { DocumentRoot, DocumentPage, ContentNode, TextNode, ImageNode };
