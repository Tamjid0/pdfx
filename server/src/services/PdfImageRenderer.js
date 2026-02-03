import { spawn } from 'child_process';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

/**
 * Service to render PDF pages to static images on the server using Native Poppler (pdftoppm).
 * This replaces the Node.js canvas/pdfjs implementation for performance and stability.
 * verification: This relies on 'poppler-utils' being installed in the Docker container.
 */
class PdfImageRenderer {

    /**
     * Renders all pages of a PDF to PNG images using pdftoppm.
     * @param {string} pdfPath - Absolute path to the source PDF.
     * @param {string} outputDir - Directory to save images (e.g., .../documents/{id}).
     * @param {Function} onProgress - Optional callback(progressPercent).
     * @returns {Promise<number>} - Promise resolving to total page count.
     */
    async renderToImages(pdfPath, outputDir, onProgress = null) {
        // Ensure pages directory exists
        const pagesDir = path.join(outputDir, 'pages');
        if (!fs.existsSync(pagesDir)) {
            fs.mkdirSync(pagesDir, { recursive: true });
        }


        // Output prefix for pdftoppm. It will generate files like {prefix}-1.png, {prefix}-2.png
        // We use 'page' as prefix, so we get page-1.png, page-2.png
        const outputPrefix = path.join(pagesDir, 'page');

        return new Promise((resolve, reject) => {
            // Command: pdftoppm -png -r 150 input.pdf output_prefix
            // -png: Output format
            // -r 150: DPI (Resolution). 150 is good balance.

            const process = spawn('pdftoppm', [
                '-png',
                '-r', '150',
                pdfPath,
                outputPrefix
            ]);

            process.stdout.on('data', (data) => {
                // pdftoppm might output progress info or warnings here
                // console.log(`stdout: ${data}`);
            });

            process.stderr.on('data', (data) => {
                // Poppler logs warnings to stderr, not necessarily fatal
                if (data.toString().toLowerCase().includes('error')) {
                    logger.error(`[PdfImageRenderer] Poppler Error: ${data}`);
                }
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    logger.error(`[PdfImageRenderer] pdftoppm process exited with code ${code}`);
                    return reject(new Error(`pdftoppm failed with code ${code}`));
                }


                // Normalization Step:
                try {
                    const files = fs.readdirSync(pagesDir).filter(f => f.startsWith('page-') && f.endsWith('.png'));

                    files.forEach(file => {
                        // Extract number
                        const match = file.match(/page-(\d+)\.png/);
                        if (match) {
                            const pageNum = parseInt(match[1]);
                            // pdftoppm output -> 1.png

                            const oldPath = path.join(pagesDir, file);
                            const newPath = path.join(pagesDir, `${pageNum}.png`);

                            fs.renameSync(oldPath, newPath);
                        }
                    });

                    // Count total pages
                    const finalFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.png'));

                    if (onProgress) onProgress(100);
                    resolve(finalFiles.length);

                } catch (err) {
                    logger.error(`[PdfImageRenderer] Error renaming files: ${err.message}`);
                    reject(err);
                }
            });

            process.on('error', (err) => {
                logger.error(`[PdfImageRenderer] Failed to start pdftoppm: ${err.message}`);
                reject(err);
            });
        });
    }
}

export default new PdfImageRenderer();
