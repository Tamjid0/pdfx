import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/templates', (req, res) => {
  try {
    const templatesPath = path.resolve(__dirname, '../../../data/templates.json');
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
    res.json(templates);
  } catch (error) {
    console.error('Error reading templates:', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

export default router;
