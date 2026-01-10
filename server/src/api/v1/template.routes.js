import express from 'express';
import fs from 'fs';
import path from 'path';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const templatesPath = path.resolve(process.cwd(), 'src/data/templates.json');
    if (!fs.existsSync(templatesPath)) {
      throw new ApiError(404, 'Templates data not found');
    }
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

export default router;
