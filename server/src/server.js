import './utils/polyfill.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger.js';
import { errorConverter, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter, aiGenerationLimiter } from './middleware/rateLimitMiddleware.js';
import { scrapeHtml } from './services/scraper.js';
import apiRoutes from './api/index.js';
import { initDocumentWorker } from './workers/documentWorker.js';
import connectDB from './config/database.js';

// Connect to Database
connectDB();

// Start Background Worker (Safe Initialization)
initDocumentWorker().catch(err => {
    logger.error('Background worker failed to initialize:', err);
});

const app = express();

// Security & Basic Middleware
app.use(helmet()); // Add security headers
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Limit payload size
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Structured Request Logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Apply global rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Other API routes
app.use('/api', apiRoutes);


// Error handling initialization
app.use(errorConverter);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
