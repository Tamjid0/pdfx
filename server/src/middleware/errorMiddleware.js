import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

export const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (!statusCode) statusCode = 500;

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    if (process.env.NODE_ENV !== 'test') {
        logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);
        if (statusCode === 500) {
            logger.error(err.stack);
        }
    }

    res.status(statusCode).send(response);
};
