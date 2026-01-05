import express from 'express';
import { scrapeHtml } from '../../scraper.js';

const router = express.Router();

router.get('/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }

  try {
    const html = await scrapeHtml(url);
    res.json({ html });
  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).send({ error: 'Failed to scrape URL' });
  }
});

export default router;
