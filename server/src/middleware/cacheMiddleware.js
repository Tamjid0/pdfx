import { getCache, setCache } from '../services/cacheService.js';
import logger from '../utils/logger.js';

/**
 * Generic caching middleware
 * @param {number} ttl - Time to live in seconds
 * @param {string} prefix - Optional prefix for the cache key
 */
export const cacheMiddleware = (ttl = 3600, prefix = 'cache') => {
    return async (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create a unique cache key based on URL and user (if authenticated)
        const userId = req.user?.uid || 'guest';
        const key = `${prefix}:${userId}:${req.originalUrl || req.url}`;

        try {
            const cachedData = await getCache(key);

            if (cachedData) {
                // logger.debug(`[Cache] Hit for key: ${key}`);
                return res.json(cachedData);
            }

            // Wrap res.json to cache the response before sending
            const originalJson = res.json;
            res.json = (body) => {
                // Only cache successful object responses
                if (res.statusCode >= 200 && res.statusCode < 300 && typeof body === 'object') {
                    setCache(key, body, ttl).catch(err =>
                        logger.error(`[CacheMiddleware] Background set failed: ${err.message}`)
                    );
                }
                return originalJson.call(res, body);
            };

            next();
        } catch (error) {
            logger.error(`[CacheMiddleware] Error: ${error.message}`);
            next();
        }
    };
};

export default cacheMiddleware;
