/**
 * Server-side reCAPTCHA verification (Google siteverify).
 * Supports v2 checkbox and v3 tokens; caller decides thresholds if using v3.
 */

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_INVALID_MESSAGE = 'Security verification failed. Please try again.';
const RECAPTCHA_UNAVAILABLE_MESSAGE = 'Security verification is temporarily unavailable. Please try again later.';

function normalizeRecaptchaMode() {
    const rawMode = String(process.env.RECAPTCHA_MODE || 'live').trim().toLowerCase();
    return rawMode === 'mock' ? 'mock' : 'live';
}

function isProduction() {
    return process.env.NODE_ENV === 'production';
}

function buildRecaptchaError({ message, statusCode, code, fieldMessage = null }) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.publicMessage = fieldMessage || message;
    error.providerMessage = message;
    if (fieldMessage) {
        error.errors = { recaptchaToken: fieldMessage };
    }
    return error;
}

export function getRecaptchaDiagnostics() {
    const mode = normalizeRecaptchaMode();
    const configured = Boolean(process.env.RECAPTCHA_SECRET_KEY);
    const production = isProduction();

    return {
        mode,
        configured,
        production,
        activeMode: mode === 'mock' && !production ? 'mock' : 'live',
        canBypass: mode === 'mock' && !production,
        productionReady: configured && mode === 'live',
    };
}

export async function verifyRecaptchaToken({ token, remoteIp }) {
    const diagnostics = getRecaptchaDiagnostics();
    if (diagnostics.mode === 'mock') {
        if (diagnostics.production) {
            throw buildRecaptchaError({
                message: 'RECAPTCHA_MODE=mock is not allowed in production.',
                statusCode: 500,
                code: 'RECAPTCHA_CONFIG_ERROR',
            });
        }

        return {
            success: true,
            mocked: true,
            challenge_ts: new Date().toISOString(),
        };
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        throw buildRecaptchaError({
            message: 'RECAPTCHA_SECRET_KEY is not configured.',
            statusCode: 503,
            code: 'RECAPTCHA_CONFIG_ERROR',
        });
    }
    if (!token || typeof token !== 'string') {
        throw buildRecaptchaError({
            message: RECAPTCHA_INVALID_MESSAGE,
            statusCode: 400,
            code: 'RECAPTCHA_VALIDATION_ERROR',
            fieldMessage: 'Security verification is required.',
        });
    }

    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (remoteIp) body.set('remoteip', remoteIp);

    let res;
    try {
        res = await fetch(VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
    } catch (error) {
        throw buildRecaptchaError({
            message: RECAPTCHA_UNAVAILABLE_MESSAGE,
            statusCode: 502,
            code: 'RECAPTCHA_ERROR',
        });
    }

    if (!res.ok) {
        throw buildRecaptchaError({
            message: RECAPTCHA_UNAVAILABLE_MESSAGE,
            statusCode: 502,
            code: 'RECAPTCHA_ERROR',
        });
    }

    const data = await res.json().catch(() => null);
    if (!data || data.success !== true) {
        const codes = (data && (data['error-codes'] || data.errorCodes)) || [];
        console.warn('[reCAPTCHA] Verification failed', codes);
        throw buildRecaptchaError({
            message: RECAPTCHA_INVALID_MESSAGE,
            statusCode: 400,
            code: 'RECAPTCHA_VALIDATION_ERROR',
            fieldMessage: RECAPTCHA_INVALID_MESSAGE,
        });
    }
    return data;
}
