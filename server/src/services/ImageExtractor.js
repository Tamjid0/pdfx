import fs from 'fs';
import logger from '../utils/logger.js';
import path from 'path';

/**
 * ImageExtractor
 * Extracts Base64-encoded images from DocumentGraph and saves them to disk.
 * Updates the DocumentGraph JSON to reference file paths instead of data URLs.
 */
export class ImageExtractor {
    /**
     * Extracts images from a DocumentGraph and saves them to disk
     * @param {string} documentId - The document ID
     * @param {Object} docGraph - The document graph containing images
     * @param {string} docDir - The specific directory for this document
     * @returns {Promise<{extractedCount: number, imagePaths: string[]}>}
     */
    static async extractAndSave(documentId, docGraph, docDir) {
        const imageDir = path.join(docDir, 'images');

        // Ensure image directory exists
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }

        let extractedCount = 0;
        const imagePaths = [];

        if (!docGraph.structure || !docGraph.structure.pages) {
            return { extractedCount, imagePaths };
        }

        for (const page of docGraph.structure.pages) {
            const imageNodes = page.nodes.filter(node => node.type === 'image');

            for (let imgIndex = 0; imgIndex < imageNodes.length; imgIndex++) {
                const imageNode = imageNodes[imgIndex];
                const imageUrl = imageNode.content.url;

                // Check if it's a Base64 data URL
                if (imageUrl && imageUrl.startsWith('data:image/')) {
                    try {
                        const result = await this.saveBase64Image(
                            imageUrl,
                            imageDir,
                            page.index,
                            imgIndex,
                            documentId
                        );

                        // Update the node to reference the file path (via API for local)
                        imageNode.content.url = result.relativePath;
                        imagePaths.push(result.absolutePath);
                        extractedCount++;
                    } catch (error) {
                        logger.error(`[ImageExtractor] Failed to extract image from page ${page.index}: ${error.message}`);
                    }
                }
            }
        }

        // Save the updated DocumentGraph back to disk (metadata)
        if (extractedCount > 0) {
            const docPath = path.join(docDir, `metadata.json`);
            fs.writeFileSync(docPath, JSON.stringify(docGraph, null, 2));
        }

        return { extractedCount, imagePaths };
    }

    /**
     * Saves a Base64 image to disk
     * @param {string} dataUrl - The Base64 data URL
     * @param {string} imageDir - Directory to save the image
     * @param {number} pageIndex - Page/slide index
     * @param {number} imgIndex - Image index within the page
     * @param {string} documentId - Document ID for path construction
     * @returns {Promise<{absolutePath: string, relativePath: string}>}
     */
    static async saveBase64Image(dataUrl, imageDir, pageIndex, imgIndex, documentId) {
        // Extract MIME type and Base64 data
        const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid Base64 image format');
        }

        const extension = matches[1]; // png, jpeg, etc.
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate filename
        const filename = `slide_${pageIndex}_img_${imgIndex}.${extension}`;
        const absolutePath = path.join(imageDir, filename);

        // Write to disk
        fs.writeFileSync(absolutePath, buffer);

        // Return both absolute and relative paths
        const relativePath = `/api/documents/${documentId}/images/${filename}`;

        return { absolutePath, relativePath };
    }

    /**
     * Checks if a DocumentGraph contains Base64 images
     * @param {DocumentRoot} docGraph
     * @returns {boolean}
     */
    static hasBase64Images(docGraph) {
        if (!docGraph.structure || !docGraph.structure.pages) {
            return false;
        }

        for (const page of docGraph.structure.pages) {
            const imageNodes = page.nodes.filter(node => node.type === 'image');
            for (const imageNode of imageNodes) {
                if (imageNode.content.url && imageNode.content.url.startsWith('data:image/')) {
                    return true;
                }
            }
        }

        return false;
    }
}
