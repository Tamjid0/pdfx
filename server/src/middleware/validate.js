import { z } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware to validate request data against a Zod schema
 * @param {object} schema - Zod schema to validate against
 */
const validate = (schema) => (req, res, next) => {
    const validSchema = z.object(schema);
    const object = {
        params: req.params,
        query: req.query,
        body: req.body,
    };

    const result = validSchema.safeParse(object);

    if (!result.success) {
        const errorMessage = result.error.issues
            .map((details) => `${details.path.join('.')}: ${details.message}`)
            .join(', ');
        return next(new ApiError(400, errorMessage));
    }

    Object.assign(req, result.data);
    return next();
};

export default validate;
