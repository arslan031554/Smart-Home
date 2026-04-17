import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const fieldErrors = {};
    for (const err of errors.array()) {
        const key = err.path || 'form';
        // Keep the first error per field (most actionable) to avoid noise.
        if (!fieldErrors[key]) fieldErrors[key] = err.msg || 'Invalid value';
    }

    return sendError(res, 400, 'Validation failed', fieldErrors);
};
