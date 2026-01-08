import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import { errorConverter, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter, aiGenerationLimiter } from './middleware/rateLimitMiddleware.js';
import { scrapeHtml } from './services/scraper.js';
import apiRoutes from './api/index.js';

const app = express();

// Security & Basic Middleware
app.use(cors());
app.use(express.json());

// Apply global rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Other API routes
app.use('/api', apiRoutes);

// Scrape route (under /api)
app.get('/api/scrape', async (req, res, next) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send({ error: 'URL is required' });
    }

    try {
        const html = await scrapeHtml(url);
        res.json({ html });
    } catch (error) {
        next(error); // Pass to centralized error handler
    }
});

// Error handling initialization
app.use(errorConverter);
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
