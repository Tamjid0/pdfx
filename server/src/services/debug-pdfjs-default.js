import '../utils/polyfill.js';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

console.log("Imported default object keys:", Object.keys(pdfjs));
console.log("GlobalWorkerOptions exists:", !!pdfjs.GlobalWorkerOptions);
console.log("getDocument exists:", !!pdfjs.getDocument);
