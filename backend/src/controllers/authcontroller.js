import * as authService from '../services/authservice.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
    try {
        const forwardedFor = typeof req.headers['x-forwarded-for'] === 'string'
            ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
            : null;
        const { user, verification } = await authService.register(req.body, {
            remoteIp: forwardedFor || req.ip || null,
        });
        const userResponse = authService.sanitizeUser(user);

        const availableChannels = user.email ? ['email'] : [];

        sendResponse(res, 201, true, 'Registration successful. Verification required.', {
            requiresVerification: true,
            verificationReason: 'account_verification',
            availableChannels,
            verification: verification ? {
                channel: verification.channel,
                delivery: verification.delivery ? {
                    provider: verification.delivery.provider,
                    mocked: verification.delivery.mocked,
                    delivered: verification.delivery.delivered,
                } : null,
                error: verification.error || null,
            } : null,
            deliveryError: verification?.error || null,
            user: {
                id: userResponse.id,
                email: userResponse.email,
                phone: userResponse.phone,
                fullName: userResponse.fullName,
                companyName: userResponse.companyName,
                invoiceName: userResponse.invoiceName,
                invoiceVat: userResponse.invoiceVat,
                invoiceAddress: userResponse.invoiceAddress,
                newsletterSubscribed: userResponse.newsletterSubscribed,
                termsAccepted: userResponse.termsAccepted,
                cookiesAccepted: userResponse.cookiesAccepted,
                preferredLanguage: userResponse.preferredLanguage,
                preferredVerificationChannel: userResponse.preferredVerificationChannel,
                accountCompletion: userResponse.accountCompletion,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);
        const userResponse = authService.sanitizeUser(user);

        sendResponse(res, 200, true, 'Login successful', {
            user: userResponse,
            token
        });
    } catch (error) {
        if (error.statusCode === 403 && error.data?.requiresVerification) {
            const reason = String(error.data.verificationReason || 'account_verification').toLowerCase();
            const message = reason === 'login_2fa'
                ? 'Two-factor verification required'
                : 'Account verification required';
            return sendResponse(res, 403, false, message, error.data);
        }
        if (error.message === 'Invalid credentials') {
            return sendError(res, 401, 'Invalid credentials');
        }
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        sendResponse(res, 200, true, 'User profile fetched successfully', { user });
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (req, res, next) => {
    try {
        const updated = await authService.updateUserProfile(req.user.id, req.body);
        sendResponse(res, 200, true, 'User profile updated successfully', { user: updated });
    } catch (error) {
        next(error);
    }
};

export const newsletterSubscribe = async (req, res, next) => {
    try {
        const subscription = await authService.subscribeNewsletter(req.body.email);
        sendResponse(
            res,
            200,
            true,
            subscription.alreadySubscribed ? 'You are already subscribed to updates.' : 'Subscription saved successfully',
            {
            email: subscription.email,
            alreadySubscribed: subscription.alreadySubscribed,
        }
        );
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otpCode } = req.body;
        if (!email || !otpCode) {
            return sendError(res, 400, 'Email and OTP code are required');
        }

        const { user, token } = await authService.verifyOtp(email, otpCode);
        const userResponse = authService.sanitizeUser(user);

        sendResponse(res, 200, true, 'Account verified successfully', {
            user: userResponse,
            token
        });
    } catch (error) {
        next(error);
    }
};

export const sendVerificationOtp = async (req, res, next) => {
    try {
        const { email, channel } = req.body;
        if (!email || !channel) {
            return sendError(res, 400, 'Email and channel are required');
        }

        const { delivery, channel: finalChannel } = await authService.sendVerificationOtp(email, channel);
        sendResponse(res, 200, true, `Verification code sent via ${finalChannel.toUpperCase()}`, {
            channel: finalChannel,
            delivery: delivery ? {
                provider: delivery.provider,
                mocked: delivery.mocked,
                delivered: delivery.delivered,
            } : null
        });
    } catch (error) {
        next(error);
    }
};

export const resendOtp = async (req, res, next) => {
    try {
        const { email, channel } = req.body;
        if (!email) {
            return sendError(res, 400, 'Email is required');
        }

        const { delivery, channel: finalChannel } = await authService.resendOtp(email, channel || 'email');
        sendResponse(res, 200, true, 'New verification code sent successfully', {
            channel: finalChannel,
            delivery: delivery ? {
                provider: delivery.provider,
                mocked: delivery.mocked,
                delivered: delivery.delivered,
            } : null
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return sendError(res, 400, 'Email is required');
        }

        await authService.forgotPassword(email);
        sendResponse(res, 200, true, 'Password reset link sent to your email');
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return sendError(res, 400, 'Token and new password are required');
        }

        await authService.resetPassword(token, newPassword);
        sendResponse(res, 200, true, 'Password reset successful');
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const updated = await authService.updateUserProfile(req.user.id, {});
        if (updated) {
            // keep logout side effects minimal; audit field is best-effort elsewhere
        }

        res.clearCookie('token');
        sendResponse(res, 200, true, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
};
