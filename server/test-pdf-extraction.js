
import './src/utils/polyfill.js';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure worker for Node.js - REPRODUCING CURRENT CONFIG
const workerPath = path.resolve(process.cwd(), 'src/static/pdf.worker.js');
console.log("Worker Path:", workerPath);
// pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
pdfjs.GlobalWorkerOptions.standardFontDataUrl = 'https://mozilla.github.io/pdf.js/standard_fonts/';

async function test() {
    console.log("Starting extraction test...");
    // Create a minimal PDF buffer (empty pdf header) to trigger worker loading
    // Or try to load a real file if one exists? 
    // minimal PDF header 
    const pdfData = new Uint8Array(Buffer.from("%PDF-1.7\n%EOF"));

    try {
        const loadingTask = pdfjs.getDocument({ data: pdfData });
        const doc = await loadingTask.promise;
        console.log("Document loaded:", doc.numPages);
    } catch (e) {
        console.error("Extraction failed:", e);
    }
}

test();
