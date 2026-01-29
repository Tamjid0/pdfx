import xss from 'xss';

/**
 * Recursive function to sanitize strings in an object
 */
const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? xss(obj.trim()) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
};

/**
 * Middleware to sanitize all incoming request bodies
 */
export const sanitizeRequest = (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        req.body = sanitizeObject(req.body);
    }
    next();
};

export default sanitizeRequest;
