import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import logger from '../utils/logger.js';

const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
});

/**
 * Common key generator for rate limiters
 * Prioritizes UID (if logged in) or falls back to IP
 */
const keyGenerator = (req) => {
    return req.user?.uid || req.ip;
};

/**
 * Global API Limiter (Infrastructure protection)
 * Prevents basic DDoS/brute-force attacks
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:api:',
    }),
    message: {
        code: 429,
        message: 'Too many requests. Please wait a moment before trying again.',
    },
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for ${keyGenerator(req)} on ${req.path}`);
        res.status(options.statusCode).send(options.message);
    },
});

/**
 * AI Generation Limiter (Abuse prevention)
 * Prevents intentional or accidental high-volume AI calls
 * NOTE: This is for infrastructure safety, not business logic limits.
 */
export const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Hard cap per hour per user/IP
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:ai:',
    }),
    message: {
        code: 429,
        message: 'AI foundation limit reached for this hour. Please try again later.',
    },
    handler: (req, res, next, options) => {
        logger.warn(`AI Rate limit exceeded for ${keyGenerator(req)} on ${req.path}`);
        res.status(options.statusCode).send(options.message);
    },
});

export default {
    apiLimiter,
    aiGenerationLimiter,
};
