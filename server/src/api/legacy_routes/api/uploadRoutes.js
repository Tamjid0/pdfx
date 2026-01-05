
import express from 'express';
import multer from 'multer';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path'; // Import path module
import { fileURLToPath, pathToFileURL } from 'url'; // Import fileURLToPath and pathToFileURL

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


pdfjs.GlobalWorkerOptions.standardFontDataUrl = 'https://mozilla.github.io/pdf.js/standard_fonts/';
const workerPath = path.resolve(process.cwd(), 'src/static/pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const router = express.Router();
// Ensure the uploads directory exists
const uploadsDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    const buffer = fs.readFileSync(filePath);
    // Dynamically import file-type to avoid CJS/ESM issues
    const { fileTypeFromBuffer } = await import('file-type'); 
    const type = await fileTypeFromBuffer(buffer);

    // Security: Check for allowed MIME types
    const allowedMimeTypes = ['application/pdf', 'text/plain'];
    if (!type || !allowedMimeTypes.includes(type.mime)) {
      fs.unlinkSync(filePath); // Clean up the uploaded file
      return res.status(400).send({ error: 'Invalid file type. Only PDF and TXT files are allowed.' });
    }

    let textContent = '';

    if (type.mime === 'application/pdf') {
      const uint8Array = new Uint8Array(buffer);
      const doc = await pdfjs.getDocument({ data: uint8Array }).promise;
      let text = '';
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      textContent = text;
    } else if (type.mime === 'text/plain') {
      textContent = buffer.toString('utf-8');
    }

    res.json({ html: `<p>${textContent.replace(/\n/g, '<br>')}</p>` });
  } catch (error) {
    console.error('File processing failed:', error);
    res.status(500).send({ error: 'Failed to process file.' });
  }
});

export default router;
