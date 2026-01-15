import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Service to render PDF pages to static images on the server using Native Poppler (pdftoppm).
 * This replaces the Node.js canvas/pdfjs implementation for performance and stability.
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

        console.log(`[PdfImageRenderer] Starting Native Poppler Rendering: ${pdfPath}`);

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
                console.log(`[PdfImageRenderer] Poppler Log: ${data}`);
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[PdfImageRenderer] pdftoppm process exited with code ${code}`);
                    return reject(new Error(`pdftoppm failed with code ${code}`));
                }

                console.log(`[PdfImageRenderer] Native rendering completed.`);

                // Normalization Step:
                // pdftoppm outputs: page-1.png, page-01.png (depending on digit count) or page-1.png
                // It usually does page-1.png, page-10.png etc.
                // WE WANT: 1.png, 2.png

                try {
                    const files = fs.readdirSync(pagesDir).filter(f => f.startsWith('page-') && f.endsWith('.png'));

                    files.forEach(file => {
                        // Extract number
                        const match = file.match(/page-(\d+)\.png/);
                        if (match) {
                            const pageNum = parseInt(match[1]); // pdftoppm uses 1-based index by default? Yes.
                            // However, we want strict '1.png'
                            // pdftoppm might pad zeros if many pages.
                            // parseInt handles "01" -> 1.

                            const oldPath = path.join(pagesDir, file);
                            const newPath = path.join(pagesDir, `${pageNum}.png`);

                            fs.renameSync(oldPath, newPath);
                        }
                    });

                    // Count total pages
                    const finalFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.png'));
                    console.log(`[PdfImageRenderer] Renamed and verified ${finalFiles.length} images.`);

                    if (onProgress) onProgress(100);
                    resolve(finalFiles.length);

                } catch (err) {
                    console.error("[PdfImageRenderer] Error renaming files:", err);
                    reject(err);
                }
            });

            process.on('error', (err) => {
                console.error("[PdfImageRenderer] Failed to start pdftoppm:", err);
                reject(err);
            });
        });
    }
}

export default new PdfImageRenderer();
