import './utils/polyfill.js';
import 'dotenv/config';
import { z } from 'zod';
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
import admin from 'firebase-admin';
import sanitizeRequest from './middleware/sanitize.js';
import { initBackupSchedule } from './services/backupService.js';
import { initSentry, registerSentryErrorHandler } from './config/sentry.js';


// --- Environment Validation (Production Readiness) ---
const envSchema = z.object({
    NODE_ENV: z.any().default('development'),
    PORT: z.any().default('4000'),
    MONGODB_URI: z.any().optional(),
    FIREBASE_PROJECT_ID: z.any().optional(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.any().optional(),
    CORS_ORIGIN: z.any().default('http://localhost:3000'),
    GEMINI_API_KEY: z.any().optional(),
    SENTRY_DSN: z.any().optional(),
});

const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
    logger.error(`❌ Invalid environment variables: ${JSON.stringify(envResult.error.format())}`);
    process.exit(1);
}

// Map the prefixed variable to the internal name
const env = {
    ...envResult.data,
    FIREBASE_PROJECT_ID: envResult.data.FIREBASE_PROJECT_ID || envResult.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID
};

// --- Initialize Firebase Admin ---
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        logger.info('Firebase Admin initialized from environment variable');
    } catch (err) {
        logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err.message);
    }
} else {
    admin.initializeApp({
        projectId: env.FIREBASE_PROJECT_ID
    });
    logger.info(`Firebase Admin initialized with Project ID: ${env.FIREBASE_PROJECT_ID}`);
}

// Connect to Database
connectDB();

// Start Background Worker (Safe Initialization)
initDocumentWorker().catch(err => {
    logger.error('Background worker failed to initialize:', err);
});

const app = express();

// Initialize Sentry (MUST be first)
initSentry(app);

// --- Security & Basic Middleware ---
app.use(helmet()); // Add security headers

const whitelist = [env.CORS_ORIGIN];
if (env.NODE_ENV === 'development') {
    whitelist.push('http://localhost:3001', 'http://localhost:3002');
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (whitelist.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' })); // Production hardening: lower limit from 50mb
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(sanitizeRequest); // Sanitize all inputs

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
// Register Sentry Error Handler (MUST be before other error handlers)
registerSentryErrorHandler(app);

app.use(errorConverter);
app.use(errorHandler);

// Initialize Backup Schedule
initBackupSchedule();

const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
});

server.timeout = 300000; // 5 minutes timeout for deep AI generation
server.keepAliveTimeout = 305000; // Slightly higher than timeout
server.headersTimeout = 310000; // Slightly higher than keepAliveTimeout
