import { sendError } from '../utils/apiResponse.js';

function asFieldErrorMap(input) {
    if (!input) return null;
    if (typeof input === 'string') return { form: input };
    if (Array.isArray(input)) {
        // Legacy array-of-objects shape â†’ merge to a single map
        const out = {};
        for (const e of input) {
            if (e && typeof e === 'object') {
                for (const [k, v] of Object.entries(e)) {
                    if (!out[k]) out[k] = String(v);
                }
            }
        }
        return Object.keys(out).length ? out : null;
    }
    if (typeof input === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(input)) {
            if (v == null) continue;
            out[k] = typeof v === 'string' ? v : JSON.stringify(v);
        }
        return Object.keys(out).length ? out : null;
    }
    return { form: 'Invalid input' };
}

function buildSequelizeFieldErrors(err) {
    const out = {};
    const items = Array.isArray(err?.errors) ? err.errors : [];
    for (const e of items) {
        const key = e?.path || e?.validatorKey || 'form';
        const msg = e?.message || 'Invalid value';
        if (!out[key]) out[key] = msg;
    }
    return Object.keys(out).length ? out : null;
}

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err?.publicMessage || err?.message || 'Something went wrong';
    let fieldErrors = null;
    const isKnownIntegrationError = ['SENDGRID_ERROR', 'TWILIO_ERROR', 'RECAPTCHA_ERROR', 'SENDGRID_CONFIG_ERROR', 'TWILIO_CONFIG_ERROR', 'RECAPTCHA_CONFIG_ERROR'].includes(err?.code);
    const visibleIntegrationMessage = process.env.NODE_ENV !== 'production' && err?.providerMessage
        ? err.providerMessage
        : err?.publicMessage;

    // Custom validation errors thrown by services/controllers
    if (err && (err.statusCode || err.code === 'VALIDATION_ERROR')) {
        statusCode = err.statusCode || 400;
        message = message || 'Validation failed';
        fieldErrors = asFieldErrorMap(err.errors) || fieldErrors;
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        fieldErrors = buildSequelizeFieldErrors(err) || fieldErrors;
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = 'Validation failed';
        fieldErrors = buildSequelizeFieldErrors(err) || fieldErrors;
    }

    // Sequelize foreign key / DB constraint errors â†’ 400
    if (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError') {
        const databaseDetail = String(err?.parent?.message || err?.parent?.detail || '');
        const isInvalidEnumValue =
            err?.parent?.routine === 'enum_in' ||
            databaseDetail.toLowerCase().includes('invalid input value for enum');

        // Postgres invalid_text_representation covers UUIDs and enum values.
        if (err?.parent?.code === '22P02') {
            statusCode = 400;
            message = 'Validation failed';
            fieldErrors = fieldErrors || {
                form: isInvalidEnumValue
                    ? 'The database schema does not support a required application value. Please run the latest database migrations.'
                    : 'One or more IDs are not in a valid format.'
            };
        } else {
            statusCode = 400;
            message = 'Validation failed';
            fieldErrors = fieldErrors || { form: 'Invalid reference or inconsistent data. Please review your selections and try again.' };
        }
    }

    // Notification and verification provider failures -> surface as integration issues.
    if (err.code === 'SENDGRID_ERROR' || err.code === 'TWILIO_ERROR' || err.code === 'RECAPTCHA_ERROR') {
        statusCode = 502;
        if (err.code === 'SENDGRID_ERROR') message = visibleIntegrationMessage || 'Email delivery is temporarily unavailable. Please try again later or use SMS if available.';
        if (err.code === 'TWILIO_ERROR') message = visibleIntegrationMessage || 'SMS delivery is temporarily unavailable. Please try again later or use email if available.';
        if (err.code === 'RECAPTCHA_ERROR') message = visibleIntegrationMessage || 'Security verification is temporarily unavailable. Please try again later.';
    }

    if (err.code === 'SENDGRID_CONFIG_ERROR' || err.code === 'TWILIO_CONFIG_ERROR' || err.code === 'RECAPTCHA_CONFIG_ERROR') {
        statusCode = 503;
        message = visibleIntegrationMessage || 'A required external integration is not configured.';
    }

    if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
        console.error('[500]', err.message);
        console.error(err.stack);
    }

    // Never leak stack traces to end-users. Keep details in server logs only.
    if (statusCode >= 500) {
        const safeMessage = process.env.NODE_ENV === 'production' && !isKnownIntegrationError
            ? 'Unexpected server error. Please try again.'
            : message;
        return sendError(res, statusCode, safeMessage, null);
    }

    return sendError(res, statusCode, message, fieldErrors);
};

export default errorHandler;
