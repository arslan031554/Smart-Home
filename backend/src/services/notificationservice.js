import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const SENDGRID_PROVIDER = 'SENDGRID';
const TWILIO_PROVIDER = 'TWILIO';

const envFlag = (name, fallback = false) => {
    const value = process.env[name];
    if (value == null || value === '') return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const isProduction = () => process.env.NODE_ENV === 'production';

function buildProviderConfigError(provider, message) {
    const publicMessages = {
        [SENDGRID_PROVIDER]: 'Email delivery is not configured correctly for this environment.',
        [TWILIO_PROVIDER]: 'SMS delivery is not configured correctly for this environment.',
    };
    const error = new Error(publicMessages[provider] || 'External delivery is not configured correctly.');
    error.code = `${provider}_CONFIG_ERROR`;
    error.statusCode = 503;
    error.publicMessage = error.message;
    error.providerMessage = message;
    return error;
}

function buildProviderDeliveryError(provider, message, statusCode = 502) {
    const publicMessages = {
        [SENDGRID_PROVIDER]: 'Email delivery is temporarily unavailable. Please try again later or use SMS if available.',
        [TWILIO_PROVIDER]: 'SMS delivery is temporarily unavailable. Please try again later or use email if available.',
    };
    const error = new Error(publicMessages[provider] || 'External delivery is temporarily unavailable. Please try again later.');
    error.code = `${provider}_ERROR`;
    error.statusCode = statusCode;
    error.publicMessage = error.message;
    error.providerMessage = message;
    return error;
}

function buildDeliveryResult({ provider, to, delivered, mocked, externalId = null, reason = null }) {
    return {
        provider: provider.toLowerCase(),
        to,
        delivered: Boolean(delivered),
        mocked: Boolean(mocked),
        externalId,
        reason,
    };
}

function maybeLogMock(provider, details) {
    if (isProduction()) return;
    console.info(`[${provider}] Mock mode`, details);
}

function maybeLogOtp({ channel, destination, otp, result }) {
    if (isProduction() || !envFlag('NOTIFICATION_LOG_OTP', false)) return;
    console.info(`[OTP][${channel}] ${result?.mocked ? 'mocked' : 'sent'} to ${destination}: ${otp}`);
}

function normalizePhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (phone.trim().startsWith('+')) return `+${digits}`;
    return digits.startsWith('0') ? `+${digits.slice(1)}` : `+${digits}`;
}

function getSendGridState() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const forceMock = envFlag('SENDGRID_MOCK_MODE', false);
    const configured = Boolean(apiKey && fromEmail);

    if (forceMock && isProduction()) {
        return {
            provider: SENDGRID_PROVIDER,
            mode: 'invalid',
            configured,
            reason: 'SENDGRID_MOCK_MODE cannot be enabled in production.',
            apiKey,
            fromEmail,
        };
    }

    if (forceMock) {
        return {
            provider: SENDGRID_PROVIDER,
            mode: 'mock',
            configured,
            reason: 'Mock mode forced by SENDGRID_MOCK_MODE.',
            apiKey,
            fromEmail,
        };
    }

    if (configured) {
        return {
            provider: SENDGRID_PROVIDER,
            mode: 'live',
            configured: true,
            reason: null,
            apiKey,
            fromEmail,
        };
    }

    return {
        provider: SENDGRID_PROVIDER,
        mode: isProduction() ? 'misconfigured' : 'mock',
        configured: false,
        reason: isProduction()
            ? 'SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required in production.'
            : 'SendGrid credentials missing outside production; email delivery will stay in mock mode.',
        apiKey,
        fromEmail,
    };
}

function getTwilioState() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const forceMock = envFlag('TWILIO_MOCK_MODE', false);
    const configured = Boolean(accountSid && authToken && fromNumber);

    if (forceMock && isProduction()) {
        return {
            provider: TWILIO_PROVIDER,
            mode: 'invalid',
            configured,
            reason: 'TWILIO_MOCK_MODE cannot be enabled in production.',
            accountSid,
            authToken,
            fromNumber,
        };
    }

    if (forceMock) {
        return {
            provider: TWILIO_PROVIDER,
            mode: 'mock',
            configured,
            reason: 'Mock mode forced by TWILIO_MOCK_MODE.',
            accountSid,
            authToken,
            fromNumber,
        };
    }

    if (configured) {
        return {
            provider: TWILIO_PROVIDER,
            mode: 'live',
            configured: true,
            reason: null,
            accountSid,
            authToken,
            fromNumber,
        };
    }

    return {
        provider: TWILIO_PROVIDER,
        mode: isProduction() ? 'misconfigured' : 'mock',
        configured: false,
        reason: isProduction()
            ? 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are required in production.'
            : 'Twilio credentials missing outside production; SMS delivery will stay in mock mode.',
        accountSid,
        authToken,
        fromNumber,
    };
}

function ensureLiveSendGrid() {
    const state = getSendGridState();
    if (state.mode === 'invalid' || state.mode === 'misconfigured') {
        throw buildProviderConfigError(SENDGRID_PROVIDER, state.reason);
    }
    if (state.mode === 'live') {
        sgMail.setApiKey(state.apiKey);
    }
    return state;
}

function ensureLiveTwilio() {
    const state = getTwilioState();
    if (state.mode === 'invalid' || state.mode === 'misconfigured') {
        throw buildProviderConfigError(TWILIO_PROVIDER, state.reason);
    }
    return state;
}

export function getNotificationIntegrationStatus() {
    const email = getSendGridState();
    const sms = getTwilioState();

    return {
        email: {
            mode: email.mode,
            configured: email.configured,
            reason: email.reason,
        },
        sms: {
            mode: sms.mode,
            configured: sms.configured,
            reason: sms.reason,
        },
        otpDebugLogging: envFlag('NOTIFICATION_LOG_OTP', false) && !isProduction(),
    };
}

export const sendEmail = async (to, subject, text, html, attachments = null) => {
    const state = ensureLiveSendGrid();

    if (state.mode === 'mock') {
        maybeLogMock(SENDGRID_PROVIDER, { to, subject });
        return buildDeliveryResult({
            provider: SENDGRID_PROVIDER,
            to,
            delivered: false,
            mocked: true,
            reason: state.reason,
        });
    }

    const msg = {
        to,
        from: state.fromEmail,
        subject,
        text,
        html,
    };
    if (Array.isArray(attachments) && attachments.length) {
        msg.attachments = attachments;
    }

    try {
        const [response] = await sgMail.send(msg);
        const messageId = response?.headers?.['x-message-id'] || response?.headers?.['X-Message-Id'] || null;
        console.info(`[SendGrid] Email sent to ${to}`);
        return buildDeliveryResult({
            provider: SENDGRID_PROVIDER,
            to,
            delivered: true,
            mocked: false,
            externalId: messageId,
        });
    } catch (error) {
        const providerMessage = error?.response?.body?.errors?.[0]?.message || error?.message || 'Email send failed';
        console.error('[SendGrid] Email delivery failed', providerMessage);
        throw buildProviderDeliveryError(SENDGRID_PROVIDER, providerMessage);
    }
};

export const sendSms = async (to, body) => {
    const state = ensureLiveTwilio();

    if (state.mode === 'mock') {
        maybeLogMock(TWILIO_PROVIDER, { to, bodyPreview: String(body || '').slice(0, 80) });
        return buildDeliveryResult({
            provider: TWILIO_PROVIDER,
            to,
            delivered: false,
            mocked: true,
            reason: state.reason,
        });
    }

    const toE164 = normalizePhone(to);
    if (!toE164) {
        const error = buildProviderDeliveryError(TWILIO_PROVIDER, 'The stored phone number is not valid for SMS delivery.', 400);
        error.message = 'The stored phone number is not valid for SMS delivery.';
        error.publicMessage = error.message;
        throw error;
    }

    try {
        const client = twilio(state.accountSid, state.authToken);
        const response = await client.messages.create({
            body,
            from: state.fromNumber,
            to: toE164,
        });
        console.info(`[Twilio] SMS sent to ${toE164}`);
        return buildDeliveryResult({
            provider: TWILIO_PROVIDER,
            to: toE164,
            delivered: true,
            mocked: false,
            externalId: response?.sid || null,
        });
    } catch (error) {
        const providerMessage = error?.message || 'SMS send failed';
        console.error('[Twilio] SMS delivery failed', providerMessage);
        throw buildProviderDeliveryError(TWILIO_PROVIDER, providerMessage);
    }
};

export const sendOtpEmail = async (email, otpCode) => {
    const subject = 'Your Verification Code';
    const text = `Your verification code is: ${otpCode}. It will expire in 10 minutes.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4F46E5;">Verification Code</h2>
            <p>Use the following code to verify your account or login:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; padding: 10px 0;">${otpCode}</div>
            <p style="color: #6B7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
    `;
    const result = await sendEmail(email, subject, text, html);
    maybeLogOtp({ channel: 'email', destination: email, otp: otpCode, result });
    return result;
};

export const resendOtpEmail = async (email, otpCode) => {
    return sendOtpEmail(email, otpCode);
};

export const sendOtpSms = async (phone, otpCode) => {
    const body = `Your Smart Home Configurator code: ${otpCode}. Valid for 10 mins.`;
    const result = await sendSms(phone, body);
    maybeLogOtp({ channel: 'sms', destination: phone, otp: otpCode, result });
    return result;
};

export const resendOtpSms = async (phone, otpCode) => {
    return sendOtpSms(phone, otpCode);
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Use this link: ${resetUrl}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #4F46E5;">Password Reset</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #6B7280;">If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, subject, text, html);
};

export const sendReminderSms = async (phone, message) => {
    return sendSms(phone, message);
};

export const sendReminderEmail = async (email, subject, body) => {
    return sendEmail(email, subject, body, `<p>${String(body || '').replace(/\n/g, '<br>')}</p>`);
};

export const sendOfferPdfEmail = async ({ to, customerName, offerNumber, offerUrl, pdfBuffer, language = 'en' }) => {
    if (!to || !pdfBuffer) return buildDeliveryResult({
        provider: SENDGRID_PROVIDER,
        to,
        delivered: false,
        mocked: false,
        reason: 'Missing email recipient or PDF buffer.',
    });

    const safeName = customerName || 'there';
    const lang = language === 'ro' ? 'ro' : 'en';
    const subject = lang === 'ro'
        ? `Oferta ta Smart Home - ${offerNumber}`
        : `Your Smart Home Offer - ${offerNumber}`;
    const text = lang === 'ro'
        ? `Salut ${safeName},\n\nOferta ta ${offerNumber} este gata.\nO poti vedea si online aici: ${offerUrl}\n\nCu stima,\nEchipa Smart Home`
        : `Hi ${safeName},\n\nYour smart home offer ${offerNumber} is ready.\nYou can also view it online here: ${offerUrl}\n\nBest regards,\nSmart Home Team`;
    const html = lang === 'ro'
        ? `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color:#0f172a;">Oferta ta este gata</h2>
            <p>Salut ${safeName},</p>
            <p>Oferta ta <strong>${offerNumber}</strong> este atasata ca PDF.</p>
            <p>O poti vedea si online aici:</p>
            <p><a href="${offerUrl}" style="display:inline-block;padding:12px 18px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Vezi oferta</a></p>
            <p style="margin-top:18px;color:#64748b;font-size:12px;">Daca nu ai solicitat aceasta oferta, te rugam sa ignori acest email.</p>
        </div>
        `
        : `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color:#0f172a;">Your offer is ready</h2>
            <p>Hi ${safeName},</p>
            <p>Your smart home offer <strong>${offerNumber}</strong> is attached as a PDF.</p>
            <p>You can also view it online here:</p>
            <p><a href="${offerUrl}" style="display:inline-block;padding:12px 18px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">View Offer</a></p>
            <p style="margin-top:18px;color:#64748b;font-size:12px;">If you did not request this, please ignore this email.</p>
        </div>
        `;
    const attachments = [{
        content: Buffer.from(pdfBuffer).toString('base64'),
        type: 'application/pdf',
        filename: `offer-${offerNumber}.pdf`,
        disposition: 'attachment',
    }];
    return sendEmail(to, subject, text, html, attachments);
};
