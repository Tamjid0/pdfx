import fs from 'fs';
import path from 'path';
import '../utils/polyfill.js';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { fileURLToPath, pathToFileURL } from 'url';

// Configure PDF.js worker
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

pdfjs.GlobalWorkerOptions.standardFontDataUrl = 'https://mozilla.github.io/pdf.js/standard_fonts/';
const workerPath = path.resolve(process.cwd(), 'src/static/pdf.worker.js');
// pdfjs-dist legacy build in Node requires a string path, NOT a file URL
// or in many cases, no workerSrc at all if the file is in the right place.
// But if we must set it, it should be a path.
// pdfjs.GlobalWorkerOptions.workerSrc = workerPath;

/**
 * Checks the file type and ensures it's allowed.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<{mime: string, ext: string}>} - The file type object or throws an error.
 */
export async function checkFileType(filePath) {
    const buffer = fs.readFileSync(filePath);
    const { fileTypeFromBuffer } = await import('file-type');
    const type = await fileTypeFromBuffer(buffer);

    const allowedMimeTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'application/octet-stream' // Allow generic binary, checking extension below
    ];

    if (!type || !allowedMimeTypes.includes(type.mime)) {
        // Double check for PPTX/PPT if it was detected as zip or similar/unknown but has right extension
        // Note: file-type often detects PPTX as 'application/zip' or 'application/x-zip-compressed'
        const isZip = type && (type.mime === 'application/zip' || type.mime === 'application/x-zip-compressed');
        const hasPptExtension = filePath.match(/\.(pptx|ppt)$/i);

        // If it's a known zip/compressed format OR generic octet-stream AND has the right extension
        if ((isZip || !type || type.mime === 'application/octet-stream') && hasPptExtension) {
            // It's likely a valid office file
            return { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx' };
        }

        throw new Error(`Invalid file type: ${type?.mime || 'unknown'}. Only PDF, TXT, and Presentation files are allowed.`);
    }
    return type;
}

/**
 * Extracts text content from a PDF file.
 * @param {string} filePath - The path to the PDF file.
 * @returns {Promise<string>} - The extracted text content.
 */
export async function extractTextFromPdf(filePath) {
    const buffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(buffer);
    const doc = await pdfjs.getDocument({ data: uint8Array }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
}

/**
 * Cleans the extracted text content.
 * @param {string} text - The raw text content.
 * @returns {string} - The cleaned text content.
 */
export function cleanText(text) {
    // Remove repeated headers & footers (placeholder - needs more advanced logic)
    // Remove page numbers (placeholder - needs regex based on common patterns)
    // Remove empty or garbage OCR blocks (placeholder - needs context-aware cleaning)
    // Collapse excessive whitespace
    let cleanedText = text.replace(/\s+/g, ' ').trim(); // Replace multiple spaces with a single space and trim

    // Basic cleaning for now, will enhance later based on testing with various PDFs
    return cleanedText;
}
