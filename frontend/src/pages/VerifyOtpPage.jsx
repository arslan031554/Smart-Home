import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Smartphone, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button, Alert, Progress, Badge } from '../components/common/UIComponents';
import { verifyOtp, resendOtp } from '../features/auth/authSlice';
import { attachGuestDraftToAccount } from '../features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '../utils/normalizeApiError';
import { hasAdminAccess } from '../constants/adminPermissions';

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const {
        email,
        channel = 'email',
        message: initialMessage,
        returnTo,
        returnStep,
        verificationReason = 'account_verification',
        deliveryError = null,
        availableChannels = ['email'],
    } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState(2);
    const [timer, setTimer] = useState(deliveryError ? 0 : 60);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deliveryWarning, setDeliveryWarning] = useState(deliveryError || null);
    const [successMessage, setSuccessMessage] = useState(deliveryError ? null : (initialMessage || null));
    const inputs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/auth/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        setTimeout(() => inputs.current[0]?.focus(), 100);
    }, []);

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputs.current[5]?.focus();
        }
        e.preventDefault();
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length < 6) return;

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const resultAction = await dispatch(verifyOtp({ email, otpCode, channel }));
        setIsLoading(false);

        if (verifyOtp.fulfilled.match(resultAction)) {
            await dispatch(attachGuestDraftToAccount()).unwrap().catch(() => null);
            setStep(3);
            const user = resultAction.payload.user;
            setTimeout(() => {
                if (returnTo) {
                    navigate(returnTo, { state: returnStep != null ? { returnStep } : {} });
                } else {
                    const destination = user?.role === 'admin'
                        ? '/'
                        : hasAdminAccess(user)
                            ? '/admin'
                            : '/';
                    navigate(destination);
                }
            }, 1800);
        } else {
            setError(normalizeApiError(resultAction.payload).message || t('auth.errors.otpInvalid'));
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputs.current[0]?.focus(), 50);
        }
    };

    const handleResend = async () => {
        setError(null);
        setIsLoading(true);
        const resultAction = await dispatch(resendOtp({ email, channel }));
        setIsLoading(false);
        if (resendOtp.fulfilled.match(resultAction)) {
            setDeliveryWarning(null);
            setSuccessMessage(t('auth.errors.otpSent', { channel: channel === 'sms' ? 'SMS' : 'Email' }));
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputs.current[0]?.focus(), 50);
        } else {
            setDeliveryWarning(null);
            setError(normalizeApiError(resultAction.payload).message || t('auth.errors.otpSendFailed'));
        }
    };

    if (!email) return null;

    const ChannelIcon = channel === 'sms' ? Smartphone : Mail;
    const canChangeVerificationMethod = Array.isArray(availableChannels) && availableChannels.length > 1;

    return (
        <div className="mx-auto max-w-xl py-6 animate-fade-in">
            {step === 2 ? (
                <div className="space-y-8">
                    <div className="space-y-4 text-center">
                        <Badge variant="info" className="mx-auto gap-2">
                            <ChannelIcon className="h-3.5 w-3.5" />
                            {channel === 'sms' ? t('auth.verifyBySms') : t('auth.verifyByEmail')}
                        </Badge>
                        <div className="space-y-3">
                            <h3 className="font-heading text-4xl font-semibold text-textPrimary">
                                {channel === 'sms' ? t('auth.verifyBySms') : t('auth.verifyByEmail')}
                            </h3>
                            <p className="mx-auto max-w-md text-sm leading-relaxed text-textSecondary">
                                {channel === 'sms'
                                    ? t('auth.otpSmsNotice', 'We sent a 6-digit code to your linked phone number.')
                                    : t('auth.otpEmailNotice', { email, defaultValue: `We sent a 6-digit code to ${email}.` })}
                                {' '}
                                {verificationReason === 'login_2fa'
                                    ? t('auth.otpEnterPrompt2fa', 'Enter the code below to complete your login.')
                                    : t('auth.otpEnterPrompt', 'Enter the code below to finish verifying your account.')}
                            </p>
                        </div>
                    </div>

                    {deliveryWarning ? (
                        <Alert variant="warning">
                            <div className="space-y-1">
                                <p className="font-semibold text-textPrimary">{deliveryWarning}</p>
                                <p>{t('auth.otpInitialDeliveryFailed', 'We could not deliver the first code. Use resend below to request a fresh email OTP.')}</p>
                            </div>
                        </Alert>
                    ) : null}
                    {error ? <Alert variant="error">{error}</Alert> : null}
                    {successMessage ? <Alert variant="success">{successMessage}</Alert> : null}

                    <div className="flex justify-center gap-2 sm:gap-3 px-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="h-14 w-11 rounded-2xl border border-white/10 bg-[#1f1f1f] text-center text-xl font-semibold text-textPrimary transition-all duration-300 focus:border-primary-500/45 focus:outline-none focus:ring-4 focus:ring-primary-500/10 sm:h-16 sm:w-14 sm:text-2xl"
                            />
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                <span>{t('auth.timeRemaining', 'Time Remaining')}</span>
                                <span className={timer < 20 ? 'text-red-300' : 'text-primary-300'}>{timer}s</span>
                            </div>
                            <Progress value={(timer / 60) * 100} variant={timer < 20 ? 'danger' : 'primary'} />
                        </div>

                        <Button size="lg" className="w-full" onClick={handleVerify} loading={isLoading} disabled={otp.some((d) => !d) || isLoading}>
                            {t('auth.confirmVerification', 'Confirm Verification')}
                        </Button>

                        <div className="flex flex-col items-center gap-2 text-center">
                            <button
                                className="text-sm font-semibold text-textSecondary transition-colors hover:text-primary-300 disabled:opacity-40"
                                onClick={handleResend}
                                disabled={timer > 0 || isLoading}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    {timer > 0 ? t('auth.resendIn', { seconds: timer, defaultValue: `Resend code in ${timer}s` }) : t('auth.resendCode', 'Resend Code')}
                                </span>
                            </button>
                            {canChangeVerificationMethod ? (
                                <button
                                    className="text-sm font-medium text-textSecondary transition-colors hover:text-primary-300"
                                    onClick={() => navigate('/auth/choose-verification', {
                                        state: {
                                            email,
                                            availableChannels,
                                            verificationReason,
                                        },
                                    })}
                                >
                                    {t('auth.changeVerificationMethod', 'Change verification method')}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            {step === 3 ? (
                <div className="space-y-8 py-8 text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow">
                        <CheckCircle2 className="h-14 w-14" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-heading text-4xl font-semibold text-textPrimary">{t('auth.verificationComplete', 'Verification Complete')}</h3>
                        <p className="text-sm text-textSecondary">{t('auth.redirectingAfterVerification', 'Your identity has been confirmed. Redirecting...')}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
