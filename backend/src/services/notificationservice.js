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
const requireRealOtpDelivery = () => envFlag('REQUIRE_REAL_OTP_DELIVERY', false) || isProduction();
const shouldExposeProviderMessage = () => !isProduction();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TWILIO_SID_REGEX = /^AC[a-zA-Z0-9]{32}$/;
const SENDGRID_KEY_REGEX = /^SG\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+$/;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

function buildProviderConfigError(provider, message) {
    const publicMessages = {
        [SENDGRID_PROVIDER]: 'Email delivery is not configured correctly for this environment.',
        [TWILIO_PROVIDER]: 'SMS delivery is not configured correctly for this environment.',
    };
    const publicMessage = publicMessages[provider] || 'External delivery is not configured correctly.';
    const visibleMessage = shouldExposeProviderMessage() && message ? message : publicMessage;
    const error = new Error(visibleMessage);
    error.code = `${provider}_CONFIG_ERROR`;
    error.statusCode = 503;
    error.publicMessage = publicMessage;
    error.providerMessage = message;
    return error;
}

function buildProviderDeliveryError(provider, message, statusCode = 502) {
    const publicMessages = {
        [SENDGRID_PROVIDER]: 'Email delivery is temporarily unavailable. Please try again later or use SMS if available.',
        [TWILIO_PROVIDER]: 'SMS delivery is temporarily unavailable. Please try again later or use email if available.',
    };
    const publicMessage = publicMessages[provider] || 'External delivery is temporarily unavailable. Please try again later.';
    const visibleMessage = shouldExposeProviderMessage() && message ? message : publicMessage;
    const error = new Error(visibleMessage);
    error.code = `${provider}_ERROR`;
    error.statusCode = statusCode;
    error.publicMessage = publicMessage;
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
    const trimmed = String(phone).trim();
    if (trimmed.startsWith('+')) {
        const digits = trimmed.replace(/\D/g, '');
        return digits ? `+${digits}` : '';
    }
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';
    return digits.startsWith('0') ? `+${digits.slice(1)}` : `+${digits}`;
}

function validateEmailAddress(email) {
    return EMAIL_REGEX.test(String(email || '').trim());
}

function validateTwilioCredentials(accountSid, fromNumber) {
    if (!TWILIO_SID_REGEX.test(String(accountSid || '').trim())) {
        return 'TWILIO_ACCOUNT_SID must start with AC and be a valid live Account SID.';
    }
    if (!E164_REGEX.test(String(fromNumber || '').trim())) {
        return 'TWILIO_PHONE_NUMBER must be in E.164 format, for example +15551234567.';
    }
    return null;
}

function validateSendGridCredentials(apiKey, fromEmail) {
    if (!validateEmailAddress(fromEmail)) {
        return 'SENDGRID_FROM_EMAIL must be a valid sender email address.';
    }
    if (!String(apiKey || '').trim()) {
        return 'SENDGRID_API_KEY is required when SENDGRID_MOCK_MODE=false.';
    }
    if (!SENDGRID_KEY_REGEX.test(String(apiKey || '').trim())) {
        return 'SENDGRID_API_KEY must be a valid live SendGrid API key.';
    }
    return null;
}

function getSendGridState() {
    const apiKey = String(process.env.SENDGRID_API_KEY || '').trim();
    const fromEmail = String(process.env.SENDGRID_FROM_EMAIL || '').trim();
    const forceMock = envFlag('SENDGRID_MOCK_MODE', false);
    const configured = Boolean(fromEmail) && (forceMock || Boolean(apiKey));

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
        if (!fromEmail) {
            return {
                provider: SENDGRID_PROVIDER,
                mode: 'misconfigured',
                configured: false,
                reason: 'SENDGRID_FROM_EMAIL is required.',
                apiKey,
                fromEmail,
            };
        }
        if (!validateEmailAddress(fromEmail)) {
            return {
                provider: SENDGRID_PROVIDER,
                mode: 'misconfigured',
                configured: false,
                reason: 'SENDGRID_FROM_EMAIL must be a valid sender email address.',
                apiKey,
                fromEmail,
            };
        }
        return {
            provider: SENDGRID_PROVIDER,
            mode: 'mock',
            configured: true,
            reason: 'Mock mode forced by SENDGRID_MOCK_MODE.',
            apiKey,
            fromEmail,
        };
    }

    const validationError = validateSendGridCredentials(apiKey, fromEmail);
    if (validationError) {
        return {
            provider: SENDGRID_PROVIDER,
            mode: 'misconfigured',
            configured,
            reason: validationError,
            apiKey,
            fromEmail,
        };
    }

    return {
        provider: SENDGRID_PROVIDER,
        mode: 'live',
        configured: true,
        reason: null,
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
        const validationError = validateTwilioCredentials(accountSid, fromNumber);
        if (validationError) {
            return {
                provider: TWILIO_PROVIDER,
                mode: 'misconfigured',
                configured: true,
                reason: validationError,
                accountSid,
                authToken,
                fromNumber,
            };
        }
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
            senderEmail: email.fromEmail || null,
        },
        sms: {
            mode: sms.mode,
            configured: sms.configured,
            reason: sms.reason,
        },
        otpDebugLogging: envFlag('NOTIFICATION_LOG_OTP', false) && !isProduction(),
        requireRealOtpDelivery: requireRealOtpDelivery(),
    };
}

export function isRealOtpDeliveryRequired() {
    return requireRealOtpDelivery();
}

export function getConfiguredEmailSender() {
    return String(process.env.SENDGRID_FROM_EMAIL || '').trim() || null;
}

function buildEmailPayload(to, from, subject, text, html, attachments = null) {
    const msg = {
        to,
        from,
        subject,
        text,
        html,
    };
    if (Array.isArray(attachments) && attachments.length) {
        msg.attachments = attachments;
    }
    return msg;
}

function getEmailPayloadLog(msg) {
    return {
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        attachments: Array.isArray(msg.attachments)
            ? msg.attachments.map((attachment) => ({
                filename: attachment.filename,
                type: attachment.type,
                disposition: attachment.disposition,
                contentLength: typeof attachment.content === 'string' ? attachment.content.length : null,
            }))
            : [],
    };
}

export const sendEmail = async (to, subject, text, html, attachments = null) => {
    const state = ensureLiveSendGrid();
    const msg = buildEmailPayload(to, state.fromEmail, subject, text, html, attachments);

    console.info(`[SendGrid] Using from email ${msg.from} (${state.mode} mode) for recipient ${msg.to}`);

    if (state.mode === 'mock') {
        maybeLogMock(SENDGRID_PROVIDER, getEmailPayloadLog(msg));
        return buildDeliveryResult({
            provider: SENDGRID_PROVIDER,
            to,
            delivered: false,
            mocked: true,
            reason: state.reason,
        });
    }

    try {
        const [response] = await sgMail.send(msg);
        const messageId = response?.headers?.['x-message-id'] || response?.headers?.['X-Message-Id'] || null;
        console.info(`[SendGrid] Email sent to ${to} from ${msg.from}`);
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

export const sendTestEmail = async ({ to, subject, text, html } = {}) => {
    const sender = getConfiguredEmailSender();
    const finalSubject = String(subject || '').trim() || 'Smart Home Configurator SendGrid Test';
    const finalText = String(text || '').trim() || `This is a SendGrid test email from ${sender || 'the configured sender email'}.`;
    const finalHtml = String(html || '').trim() || `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4F46E5;">SendGrid Test Email</h2>
            <p>This test email was generated by the Smart Home Configurator backend.</p>
            <p><strong>Configured sender:</strong> ${sender || 'missing'}</p>
            <p style="color: #6B7280; font-size: 14px;">If you received this message, the SendGrid email path is working.</p>
        </div>
    `;
    return sendEmail(to, finalSubject, finalText, finalHtml);
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
