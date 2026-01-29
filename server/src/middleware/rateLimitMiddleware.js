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
    // Priority 1: Authenticated User ID
    if (req.user?.uid) return req.user.uid;
    // Priority 2: Request IP (Standard fallback)
    return req.ip;
};

/**
 * Global API Limiter (Infrastructure protection)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    validate: false, // Disable all built-in validations to prevent IPv6 crash
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
 * AI Generation Limiter
 */
export const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    validate: false, // Disable all built-in validations to prevent IPv6 crash
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
