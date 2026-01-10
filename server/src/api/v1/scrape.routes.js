import express from 'express';
import { scrapeHtml } from '../../services/scraper.js';
import validate from '../../middleware/validate.js';
import { scrapeSchema } from '../../validations/scrape.validation.js';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

router.get('/', validate(scrapeSchema), async (req, res, next) => {
  const { url } = req.query;

  try {
    const html = await scrapeHtml(url);
    res.json({ html });
  } catch (error) {
    next(error);
  }
});

export default router;
