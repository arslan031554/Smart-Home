import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../../models/User.js';
import NewsletterSubscriber from '../../models/NewsletterSubscriber.js';
import * as notificationService from './notificationservice.js';
import { verifyRecaptchaToken } from '../security/recaptcha.js';
import { normalizePermissions } from '../constants/adminpermissions.js';

const normalizeNullableString = (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const normalized = String(value).trim();
    return normalized ? normalized : null;
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

let newsletterTableReady = false;

const ensureNewsletterTable = async () => {
    if (newsletterTableReady) return true;
    try {
        await NewsletterSubscriber.sync();
        newsletterTableReady = true;
        return true;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[newsletter] table sync skipped:', error?.message || error);
        }
        return false;
    }
};

const normalizeLanguage = (value) => (value === 'ro' ? 'ro' : 'en');
const DEV_TEST_ADMIN_EMAIL = 'admin@test.com';
const REGISTRATION_VERIFICATION_CHANNEL = 'email';

const hashSecret = (value) => crypto
    .createHash('sha256')
    .update(String(value || ''))
    .digest('hex');

const normalizeVerificationChannel = (value, user = null) => {
    if (value === 'sms' && user?.phone) return 'sms';
    if (value === 'email') return 'email';
    if (value === 'sms' && !user?.phone) return 'email';
    if (user?.preferredVerificationChannel === 'sms' && user?.phone) return 'sms';
    return 'email';
};

const buildAccountCompletion = (userLike) => {
    const user = typeof userLike?.toJSON === 'function' ? userLike.toJSON() : (userLike || {});
    const required = {
        fullName: Boolean(String(user.fullName || '').trim()),
        email: Boolean(String(user.email || '').trim()),
        phone: Boolean(String(user.phone || '').trim()),
        termsAccepted: Boolean(user.termsAccepted),
        cookiesAccepted: Boolean(user.cookiesAccepted),
        isVerified: Boolean(user.isVerified),
    };
    const missing = Object.entries(required).filter(([, ok]) => !ok).map(([key]) => key);
    return {
        required,
        missing,
        isComplete: missing.length === 0,
    };
};

const shouldBypassTwoFactorForDevAdmin = (user) => {
    if (process.env.NODE_ENV === 'production' || notificationService.isRealOtpDeliveryRequired()) return false;
    const normalizedEmail = normalizeEmail(user?.email);
    return normalizedEmail === DEV_TEST_ADMIN_EMAIL && user?.role === 'admin';
};

function assertOtpDeliveryIsReal(delivery, channel) {
    if (!notificationService.isRealOtpDeliveryRequired()) return;
    if (!delivery) {
        const error = new Error(`Real OTP delivery via ${channel} is required, but no delivery result was returned.`);
        error.statusCode = 503;
        throw error;
    }
    if (delivery.mocked) {
        const error = new Error(`Real OTP delivery via ${channel} is required. Disable mock mode and configure live credentials.`);
        error.statusCode = 503;
        throw error;
    }
    if (!delivery.delivered) {
        const error = new Error(`OTP delivery via ${channel} failed. Please verify the live ${channel.toUpperCase()} provider configuration.`);
        error.statusCode = 502;
        throw error;
    }
}

export const sanitizeUser = (user) => {
    if (!user) return null;
    const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete json.passwordHash;
    delete json.otpCode;
    delete json.otpExpiresAt;
    delete json.resetPasswordToken;
    delete json.resetPasswordExpiresAt;
    json.permissions = normalizePermissions(json.permissions);
    json.accountCompletion = buildAccountCompletion(json);
    return json;
};

async function issueVerificationOtpForUser(user, channelInput, options = {}) {
    if (!user) throw new Error('User not found');
    const { allowVerified = false, reason = 'account_verification' } = options;
    if (!allowVerified && user.isVerified) throw new Error('User already verified');
    if (reason === 'login_2fa' && !user.isVerified) {
        throw new Error('Account must be verified before login');
    }

    const channel = normalizeVerificationChannel(channelInput, user);
    if (channel === 'sms' && !user.phone) {
        throw new Error('Phone number not available for SMS verification');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const previousOtpCode = user.otpCode;
    const previousOtpExpiresAt = user.otpExpiresAt;
    const previousOtpChannel = user.otpChannel;
    user.otpCode = hashSecret(otp);
    user.otpExpiresAt = Date.now() + 600000;
    user.otpChannel = channel;
    user.preferredVerificationChannel = channel;
    await user.save();

    let delivery = null;
    try {
        if (channel === 'sms') {
            delivery = await notificationService.sendOtpSms(user.phone, otp);
        } else {
            delivery = await notificationService.sendOtpEmail(user.email, otp, user.fullName);
        }
    } catch (error) {
        user.otpCode = previousOtpCode;
        user.otpExpiresAt = previousOtpExpiresAt;
        user.otpChannel = previousOtpChannel;
        await user.save();
        throw error;
    }

    try {
        assertOtpDeliveryIsReal(delivery, channel);
    } catch (error) {
        user.otpCode = previousOtpCode;
        user.otpExpiresAt = previousOtpExpiresAt;
        user.otpChannel = previousOtpChannel;
        await user.save();
        throw error;
    }

    return { otp, channel, delivery, reason };
}

export const register = async (userData, context = {}) => {
    const {
        email,
        password,
        company,
        companyName,
        fullName,
        phone,
        invoiceName,
        invoiceVat,
        invoiceAddress,
        recaptchaToken,
        agreeTerms,
        newsletter,
        cookiesAccepted,
        preferredLanguage,
    } = userData || {};

    await verifyRecaptchaToken({
        token: recaptchaToken,
        remoteIp: context.remoteIp,
    });

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
        email: normalizedEmail,
        passwordHash,
        role: 'customer',
        fullName: normalizeNullableString(fullName),
        companyName: normalizeNullableString(companyName ?? company),
        phone: normalizeNullableString(phone),
        invoiceName: normalizeNullableString(invoiceName),
        invoiceVat: normalizeNullableString(invoiceVat),
        invoiceAddress: normalizeNullableString(invoiceAddress),
        termsAccepted: Boolean(agreeTerms),
        newsletterSubscribed: Boolean(newsletter),
        cookiesAccepted: Boolean(cookiesAccepted),
        preferredLanguage: normalizeLanguage(preferredLanguage),
        preferredVerificationChannel: REGISTRATION_VERIFICATION_CHANNEL,
    });

    let otpDelivery = null;
    let deliveryError = null;

    try {
        otpDelivery = await issueVerificationOtpForUser(user, REGISTRATION_VERIFICATION_CHANNEL, {
            allowVerified: false,
            reason: 'account_verification',
        });
    } catch (error) {
        deliveryError = error.message;
    }

    return {
        user,
        verification: {
            channel: otpDelivery?.channel || REGISTRATION_VERIFICATION_CHANNEL,
            delivery: otpDelivery?.delivery || null,
            error: deliveryError,
        },
    };
};

export const login = async (email, password) => {
    const user = await User.findOne({ where: { email: String(email || '').trim().toLowerCase() } });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const availableChannels = [];
    if (user.phone) availableChannels.push('sms');
    if (user.email) availableChannels.push('email');
    const preferredVerificationChannel = normalizeVerificationChannel(user.preferredVerificationChannel, user);

    if (!user.isVerified) {
        let otpDelivery = null;
        let deliveryError = null;
        try {
            otpDelivery = await issueVerificationOtpForUser(user, preferredVerificationChannel, {
                allowVerified: false,
                reason: 'account_verification',
            });
        } catch (error) {
            // If preferred channel fails, still allow user to try other channels
            deliveryError = error.message;
            // Try to send to any available channel
            if (availableChannels.length > 0) {
                const alternativeChannel = preferredVerificationChannel === 'sms' && availableChannels.includes('email')
                    ? 'email'
                    : availableChannels.includes('sms')
                    ? 'sms'
                    : availableChannels[0];
                try {
                    otpDelivery = await issueVerificationOtpForUser(user, alternativeChannel, {
                        allowVerified: false,
                        reason: 'account_verification',
                    });
                    deliveryError = null; // Success with alternative channel
                } catch (altError) {
                    // Both channels failed, but still let user try manual selection
                    deliveryError = altError.message;
                }
            }
        }

        const error = new Error('Verification required');
        error.statusCode = 403;
        error.data = {
            requiresVerification: true,
            verificationReason: 'account_verification',
            availableChannels, // Always show both channels even if delivery had issues
            preferredVerificationChannel,
            delivery: otpDelivery?.delivery ? {
                provider: otpDelivery.delivery.provider,
                mocked: otpDelivery.delivery.mocked,
                delivered: otpDelivery.delivery.delivered,
            } : null,
            deliveryError, // Include error message if any
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
            },
        };
        throw error;
    }

    // ALL users (including admin) MUST verify with OTP on login - no exceptions
    let otpDelivery = null;
    let deliveryError = null;
    try {
        otpDelivery = await issueVerificationOtpForUser(user, preferredVerificationChannel, {
            allowVerified: true,
            reason: 'login_2fa',
        });
    } catch (error) {
        // If preferred channel fails, still allow user to try other channels
        deliveryError = error.message;
        // Try to send to any available channel
        if (availableChannels.length > 0) {
            const alternativeChannel = preferredVerificationChannel === 'sms' && availableChannels.includes('email')
                ? 'email'
                : availableChannels.includes('sms')
                ? 'sms'
                : availableChannels[0];
            try {
                otpDelivery = await issueVerificationOtpForUser(user, alternativeChannel, {
                    allowVerified: true,
                    reason: 'login_2fa',
                });
                deliveryError = null; // Success with alternative channel
            } catch (altError) {
                // Both channels failed, but still let user try manual selection
                deliveryError = altError.message;
            }
        }
    }

    const error = new Error('Two-factor verification required');
    error.statusCode = 403;
    error.data = {
        requiresVerification: true,
        verificationReason: 'login_2fa',
        availableChannels, // Always show both channels even if delivery had issues
        preferredVerificationChannel,
        delivery: otpDelivery?.delivery ? {
            provider: otpDelivery.delivery.provider,
            mocked: otpDelivery.delivery.mocked,
            delivered: otpDelivery.delivery.delivered,
        } : null,
        deliveryError, // Include error message if any
        user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
        },
    };
    throw error;
};

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

export const getUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: {
            exclude: ['passwordHash', 'otpCode', 'otpExpiresAt', 'resetPasswordToken', 'resetPasswordExpiresAt']
        }
    });
    return sanitizeUser(user);
};

export const updateUserProfile = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }

    const {
        fullName,
        phone,
        companyName,
        invoiceName,
        invoiceVat,
        invoiceAddress,
        newsletterSubscribed,
        preferredLanguage,
        preferredVerificationChannel,
    } = data || {};

    if (fullName !== undefined) user.fullName = normalizeNullableString(fullName);
    if (phone !== undefined) user.phone = normalizeNullableString(phone);
    if (companyName !== undefined) user.companyName = normalizeNullableString(companyName);
    if (invoiceName !== undefined) user.invoiceName = normalizeNullableString(invoiceName);
    if (invoiceVat !== undefined) user.invoiceVat = normalizeNullableString(invoiceVat);
    if (invoiceAddress !== undefined) user.invoiceAddress = normalizeNullableString(invoiceAddress);
    if (newsletterSubscribed !== undefined) user.newsletterSubscribed = Boolean(newsletterSubscribed);
    if (preferredLanguage !== undefined) user.preferredLanguage = normalizeLanguage(preferredLanguage);
    if (preferredVerificationChannel !== undefined) {
        user.preferredVerificationChannel = normalizeVerificationChannel(preferredVerificationChannel, {
            ...user.toJSON(),
            phone: phone !== undefined ? normalizeNullableString(phone) : user.phone,
        });
    }

    await user.save();

    return sanitizeUser(user);
};

export const subscribeNewsletter = async (emailInput) => {
    const email = normalizeEmail(emailInput);
    if (!email) {
        const error = new Error('Email is required');
        error.statusCode = 400;
        error.errors = { email: 'Please provide a valid email' };
        throw error;
    }

    const user = await User.findOne({ where: { email } });
    const userWasSubscribed = Boolean(user?.newsletterSubscribed);
    let alreadySubscribed = userWasSubscribed;

    const canPersistNewsletterSubscribers = await ensureNewsletterTable();
    if (canPersistNewsletterSubscribers) {
        const [, created] = await NewsletterSubscriber.findOrCreate({
            where: { email },
            defaults: {
                source: 'footer',
                subscribedAt: new Date(),
            },
        });
        if (!created) alreadySubscribed = true;
    }

    if (user && !user.newsletterSubscribed) {
        user.newsletterSubscribed = true;
        await user.save();
    }

    return { email, alreadySubscribed };
};

export const verifyOtp = async (email, otpCode) => {
    const user = await User.findOne({ where: { email: String(email || '').trim().toLowerCase() } });
    const submittedCode = String(otpCode || '');
    const submittedHash = hashSecret(submittedCode);
    const storedCode = String(user?.otpCode || '');

    if (!user || (storedCode !== submittedHash && storedCode !== submittedCode)) {
        throw new Error('Invalid OTP');
    }

    if (new Date() > user.otpExpiresAt) {
        throw new Error('OTP expired');
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.otpChannel = null;
    await user.save();

    const token = generateToken(user.id);

    return { user, token };
};

export const forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email: String(email || '').trim().toLowerCase() } });
    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const previousToken = user.resetPasswordToken;
    const previousExpiresAt = user.resetPasswordExpiresAt;
    user.resetPasswordToken = hashSecret(resetToken);
    user.resetPasswordExpiresAt = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    try {
        await notificationService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
        user.resetPasswordToken = previousToken;
        user.resetPasswordExpiresAt = previousExpiresAt;
        await user.save();
        throw error;
    }

    return resetToken;
};

export const resetPassword = async (token, newPassword) => {
    const submittedToken = String(token || '');
    const submittedHash = hashSecret(submittedToken);
    const Op = User.sequelize.Sequelize.Op;
    const user = await User.findOne({
        where: {
            resetPasswordToken: { [Op.in]: [submittedHash, submittedToken] },
            resetPasswordExpiresAt: { [Op.gt]: new Date() }
        }
    });

    if (!user) {
        throw new Error('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return user;
};

export const sendVerificationOtp = async (email, channel) => {
    const user = await User.findOne({ where: { email: String(email || '').trim().toLowerCase() } });
    if (!user) throw new Error('User not found');
    return issueVerificationOtpForUser(user, channel, {
        allowVerified: true,
        reason: user.isVerified ? 'login_2fa' : 'account_verification',
    });
};

export const resendOtp = async (email, channel) => {
    return sendVerificationOtp(email, channel);
};
