import '../../utils/polyfill.js';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { DocumentRoot, DocumentPage, TextNode } from '../../models/DocumentGraph.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure worker for Node.js
// pdfjs-dist in Node.js typically auto-configures the worker or runs in main thread.
// Explicitly setting workerSrc to a file path often causes "fake worker" setup errors.
// pdfjs.GlobalWorkerOptions.workerSrc = ...; 

pdfjs.GlobalWorkerOptions.standardFontDataUrl = 'https://mozilla.github.io/pdf.js/standard_fonts/';

/**
 * Adapter for identifying and extracting content from PDFs into the unified graph.
 */
export class PdfExtractor {
    constructor() { }

    /**
     * Extracts a PDF file into a DocumentRoot.
     * @param {string} filePath - Path to the PDF file.
     * @param {string} originalName - Original filename.
     * @returns {Promise<DocumentRoot>}
     */
    async extract(filePath, originalName) {
        const buffer = fs.readFileSync(filePath);
        const uint8Array = new Uint8Array(buffer);
        const pdfDoc = await pdfjs.getDocument({ data: uint8Array }).promise;

        const docGraph = new DocumentRoot(originalName, 'application/pdf');

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 });
            const content = await page.getTextContent();

            const docPage = new DocumentPage(i, {
                width: viewport.width,
                height: viewport.height
            });

            // Normalize content to Nodes
            for (const item of content.items) {
                // Skip empty strings
                if (!item.str || !item.str.trim()) continue;

                // PDF coordinates: (0,0) is usually bottom-left, but we want top-left.
                // item.transform is [scaleX, skewY, skewX, scaleY, x, y]
                const tx = item.transform;
                const x = tx[4];
                const y = viewport.height - tx[5]; // Flip Y for top-left origin

                // Convert to percentage for resolution independence
                const pctX = (x / viewport.width) * 100;
                const pctY = (y / viewport.height) * 100;

                // Basic font style extraction
                const style = {
                    fontName: item.fontName,
                    height: item.height // This is often the font size
                };

                const node = new TextNode(
                    item.str,
                    style,
                    { x: pctX, y: pctY },
                    { page: i }
                );

                docPage.addNode(node);
            }

            docGraph.addPage(docPage);
        }

        return docGraph;
    }
}
