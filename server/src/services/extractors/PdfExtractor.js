import '../../utils/polyfill.js';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { DocumentRoot, DocumentPage, TextNode, ImageNode } from '../../models/DocumentGraph.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure worker for Node.js
// pdfjs-dist in Node.js typically auto-configures the worker or runs in main thread.
// Explicitly setting workerSrc to a file path often causes "fake worker" setup errors.
// pdfjs.GlobalWorkerOptions.workerSrc = ...; 

pdfjs.GlobalWorkerOptions.standardFontDataUrl = 'https://mozilla.github.io/pdf.js/standard_fonts/';

import { createCanvas, ImageData } from 'canvas';

/**
 * Adapter for identifying and extracting content from PDFs into the unified graph.
 */
export class PdfExtractor {
    constructor() { }

    /**
     * Extracts a PDF file into a DocumentRoot with high-fidelity spatial and semantic data.
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

            const docPage = new DocumentPage(i - 1, {
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

                // Calculate bounding box percentages
                const pctW = (item.width / viewport.width) * 100;
                const pctH = (item.height / viewport.height) * 100;

                // Professional Style Detection
                const fontName = (item.fontName || '').toLowerCase();
                const style = {
                    fontName: item.fontName,
                    fontSize: item.height,
                    isBold: fontName.includes('bold') || fontName.includes('black') || fontName.includes('w7') || fontName.includes('heavy'),
                    isItalic: fontName.includes('italic') || fontName.includes('oblique') || fontName.includes('slanted'),
                    color: item.color || null
                };

                const node = new TextNode(
                    item.str,
                    style,
                    { x: pctX, y: pctY, width: pctW, height: pctH },
                    { page: i }
                );

                docPage.addNode(node);
            }

            // --- IMAGE EXTRACTION ---
            try {
                const operatorList = await page.getOperatorList();
                const OPS = pdfjs.OPS;
                const transformStack = [
                    [1, 0, 0, 1, 0, 0] // Initial Identity CTM
                ];
                let currentCTM = transformStack[0];

                for (let opIdx = 0; opIdx < operatorList.fnArray.length; opIdx++) {
                    const fn = operatorList.fnArray[opIdx];
                    const args = operatorList.argsArray[opIdx];

                    // Track CTM transformations
                    if (fn === OPS.transform) {
                        const [a, b, c, d, e, f] = args;
                        const [a1, b1, c1, d1, e1, f1] = currentCTM;
                        // Matrix multiplication: [a,b,c,d,e,f] * currentCTM
                        currentCTM = [
                            a * a1 + b * c1,
                            a * b1 + b * d1,
                            c * a1 + d * c1,
                            c * b1 + d * d1,
                            e * a1 + f * c1 + e1,
                            e * b1 + f * d1 + f1
                        ];
                    } else if (fn === OPS.save) {
                        transformStack.push([...currentCTM]);
                    } else if (fn === OPS.restore) {
                        if (transformStack.length > 1) {
                            currentCTM = transformStack.pop();
                        }
                    }
                    // Detect Images
                    else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
                        const imgName = args[0];
                        let imgObj;

                        try {
                            // paintImageXObject uses a resource name, paintInlineImageXObject might pass the data
                            imgObj = fn === OPS.paintImageXObject ? await page.objs.get(imgName) : args[0];
                        } catch (e) {
                            continue;
                        }

                        if (!imgObj) continue;

                        // Calculate Position (using current CTM)
                        // In PDF, images are drawn in a [0,1]x[0,1] box.
                        // The CTM maps this box to the destination coordinates.
                        const x = currentCTM[4];
                        const y = viewport.height - (currentCTM[5] + currentCTM[3]); // currentCTM[5] is bottom, currentCTM[3] is height (scaleY)

                        const pctX = (x / viewport.width) * 100;
                        const pctY = (y / viewport.height) * 100;
                        const pctW = (currentCTM[0] / viewport.width) * 100; // currentCTM[0] is width (scaleX)
                        const pctH = (currentCTM[3] / viewport.height) * 100; // currentCTM[3] is height (scaleY)

                        // Filter out background images (heuristic: >95% area)
                        if (pctW > 95 && pctH > 95) {
                            continue;
                        }

                        // Convert image data to Base64
                        const base64Data = this.canvasToBase64(imgObj);
                        if (base64Data) {
                            const imageNode = new ImageNode(
                                base64Data,
                                'Extracted Image',
                                {
                                    x: pctX,
                                    y: pctY,
                                    width: pctW,
                                    height: pctH
                                },
                                { page: i }
                            );
                            docPage.addNode(imageNode);
                        }
                    }
                }
            } catch (err) {
                console.warn(`[PdfExtractor] Image extraction failed on page ${i}:`, err.message);
            }

            docGraph.addPage(docPage);
        }

        return docGraph;
    }

    /**
     * Converts a PDF.js image object to a Base64 data URL using node-canvas
     */
    canvasToBase64(imgObj) {
        try {
            const { width, height, data, kind } = imgObj;
            if (!width || !height || !data) return null;

            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // pdfjs data format depends on 'kind'.
            // For standard RGBA, it's 4 bytes per pixel.
            // If it's a mask or different kind, we might need pre-processing.
            // Simplified: Assume RGBA or try to normalize.

            let rgbaData;
            if (data.length === width * height * 4) {
                rgbaData = data;
            } else if (data.length === width * height * 3) {
                // RGB to RGBA
                rgbaData = new Uint8ClampedArray(width * height * 4);
                for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
                    rgbaData[j] = data[i];
                    rgbaData[j + 1] = data[i + 1];
                    rgbaData[j + 2] = data[i + 2];
                    rgbaData[j + 3] = 255;
                }
            } else {
                // Unknown format or grayscale
                return null;
            }

            const imageData = new ImageData(rgbaData, width, height);
            ctx.putImageData(imageData, 0, 0);

            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error('[PdfExtractor] Image encoding failed:', e.message);
            return null;
        }
    }
}
