import express from 'express';
import mongoose from 'mongoose';
import { isRedisConnected } from '../../services/queueService.js';
import logger from '../../utils/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const health = {
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime(),
        services: {
            server: 'UP',
            database: 'UNKNOWN',
            redis: 'UNKNOWN',
        }
    };

    try {
        // Check Database
        // If using mongoose/mongodb
        if (mongoose.connection.readyState === 1) {
            health.services.database = 'UP';
        } else {
            health.status = 'DEGRADED';
            health.services.database = 'DOWN';
        }

        // Check Redis
        const redisStatus = await isRedisConnected();
        if (redisStatus) {
            health.services.redis = 'UP';
        } else {
            health.status = 'DEGRADED';
            health.services.redis = 'DOWN';
        }

        const statusCode = health.status === 'UP' ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(503).json({
            status: 'DOWN',
            error: error.message
        });
    }
});

export default router;
