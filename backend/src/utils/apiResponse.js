/**
 * @desc    Sends a standardized API response
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};

/**
 * @desc    Sends a standardized Error response
 */
export const sendError = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};
