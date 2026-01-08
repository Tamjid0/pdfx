import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        code: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
});

export const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 AI generation requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        code: 429,
        message: 'AI generation limit reached for this hour. Please try again later.',
    },
    handler: (req, res, next, options) => {
        logger.warn(`AI Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
});
