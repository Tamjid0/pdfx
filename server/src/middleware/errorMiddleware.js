import logger from '../utils/logger.js';

export const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof Error)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new Error(message);
        error.statusCode = statusCode;
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
        logger.error(err);
    }

    res.status(statusCode).send(response);
};
