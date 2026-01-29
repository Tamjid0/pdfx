import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

// Production Readiness: Add CloudWatch logging
// If AWS credentials are provided, we stream logs to CloudWatch
// Otherwise, we fallback to console/file logs (Dev mode)

const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
];

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.CLOUDWATCH_GROUP_NAME) {
    console.log('[Logger] Initializing CloudWatch Transport...');
    transports.push(new WinstonCloudWatch({
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
        logStreamName: process.env.CLOUDWATCH_STREAM_NAME || `server-${new Date().toISOString().split('T')[0]}`,
        awsRegion: process.env.AWS_REGION || 'us-east-1',
        jsonMessage: true,
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
        awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    }));
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: transports,
});

export default logger;
