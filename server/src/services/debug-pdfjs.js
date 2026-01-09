import '../utils/polyfill.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
console.log("Keys on pdfjs export:", Object.keys(pdfjs));
console.log("pdfjs.GlobalWorkerOptions:", pdfjs.GlobalWorkerOptions);
console.log("pdfjs.default:", pdfjs.default);
if (pdfjs.default) {
    console.log("Keys on pdfjs.default:", Object.keys(pdfjs.default));
}
