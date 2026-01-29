import Redis from 'ioredis';
import logger from '../utils/logger.js';

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
};

let redis = null;

/**
 * Initializes the Redis client if it doesn't exist
 */
const getRedisClient = () => {
    if (!redis) {
        redis = new Redis({
            ...connection,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
        });

        redis.on('error', (err) => {
            if (!err.message.includes('ECONNREFUSED')) {
                logger.error(`[CacheService] Redis Error: ${err.message}`);
            }
        });

        redis.on('connect', () => {
            logger.info('[CacheService] Redis connected for caching');
        });
    }
    return redis;
};

/**
 * Gets a value from cache
 */
export const getCache = async (key) => {
    try {
        const client = getRedisClient();
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

/**
 * Sets a value in cache with an optional TTL (in seconds)
 */
export const setCache = async (key, value, ttl = 3600) => {
    try {
        const client = getRedisClient();
        const data = JSON.stringify(value);
        if (ttl) {
            await client.setex(key, ttl, data);
        } else {
            await client.set(key, data);
        }
    } catch (error) {
        logger.error(`[CacheService] Set failed for key ${key}: ${error.message}`);
    }
};

/**
 * Deletes a key from cache
 */
export const deleteCache = async (key) => {
    try {
        const client = getRedisClient();
        await client.del(key);
    } catch (error) {
        logger.error(`[CacheService] Delete failed for key ${key}: ${error.message}`);
    }
};

/**
 * Deletes multiple keys matching a pattern (e.g. user:docs:*)
 */
export const deleteCachePattern = async (pattern) => {
    try {
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
            logger.info(`[CacheService] Invalidated ${keys.length} keys matching: ${pattern}`);
        }
    } catch (error) {
        logger.error(`[CacheService] Pattern delete failed for ${pattern}: ${error.message}`);
    }
};

export default {
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern
};
