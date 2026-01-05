import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { scrapeHtml } from './services/scraper.js';
import apiRoutes from './api/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Other API routes
app.use('/api', apiRoutes);

// ⭐ FIXED: Your scrape route MUST be under /api
app.get('/api/scrape', async (req, res) => {
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

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
