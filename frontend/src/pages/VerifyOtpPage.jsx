import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button, Alert, Progress } from '../components/common/UIComponents';
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
        if (timer <= 0) return undefined;
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
            }, 1400);
        } else {
            setError(normalizeApiError(resultAction.payload).message || t('auth.errors.otpInvalid', { defaultValue: 'Invalid or expired verification code. Please try again.' }));
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputs.current[0]?.focus(), 50);
        }
    };

    const handleResend = async () => {
        setError(null);
        setIsLoading(true);
        const resultAction = await dispatch(resendOtp({ email, channel: 'email' }));
        setIsLoading(false);
        if (resendOtp.fulfilled.match(resultAction)) {
            setDeliveryWarning(null);
            setSuccessMessage(t('auth.errors.otpSent', { channel: 'Email', defaultValue: 'Verification code sent to your email.' }));
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputs.current[0]?.focus(), 50);
        } else {
            setDeliveryWarning(null);
            setError(normalizeApiError(resultAction.payload).message || t('auth.errors.otpSendFailed', { defaultValue: 'Failed to send verification code. Please try again later.' }));
        }
    };

    if (!email) return null;

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            {step === 2 ? (
                <div className="space-y-6">
                    <div className="space-y-2 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald shadow-sm">
                            <Mail className="h-5 w-5" />
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                            {t('auth.verifyByEmail', { defaultValue: 'Security Verification' })}
                        </h1>
                        <p className="mx-auto max-w-sm text-sm leading-relaxed text-textSecondary">
                            {t('auth.otpEmailNotice', { email, defaultValue: `We sent a 6-digit code to ${email}.` })}{' '}
                            {verificationReason === 'login_2fa'
                                ? t('auth.otpEnterPrompt2fa', 'Enter the code below to complete your login.')
                                : t('auth.otpEnterPrompt', 'Enter the code below to finish verifying your account.')}
                        </p>
                    </div>

                    {deliveryWarning ? (
                        <Alert variant="warning" className="rounded-xl">
                            <div className="space-y-1">
                                <p className="font-semibold text-textPrimary">{deliveryWarning}</p>
                                <p className="text-xs">{t('auth.otpInitialDeliveryFailed', 'We could not deliver the first code. Use resend below to request a fresh email OTP.')}</p>
                            </div>
                        </Alert>
                    ) : null}
                    {error ? <Alert variant="error" className="rounded-xl">{error}</Alert> : null}
                    {successMessage ? <Alert variant="success" className="rounded-xl">{successMessage}</Alert> : null}

                    <div className="flex justify-center gap-1.5 sm:gap-2.5" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="one-time-code"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-emerald/20 bg-fog/80 text-center text-lg sm:text-2xl font-bold text-textPrimary shadow-sm transition-all focus:border-emerald focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald/12"
                            />
                        ))}
                    </div>

                    <div className="space-y-4 pt-1">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                <span>{t('auth.timeRemaining', 'Time Remaining')}</span>
                                <span className={timer < 20 ? 'font-bold text-red-500' : 'font-bold text-emerald'}>{timer}s</span>
                            </div>
                            <Progress value={(timer / 60) * 100} variant={timer < 20 ? 'danger' : 'primary'} />
                        </div>

                        <Button
                            size="lg"
                            className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider"
                            onClick={handleVerify}
                            loading={isLoading}
                            disabled={otp.some((d) => !d) || isLoading}
                        >
                            {t('auth.confirmVerification', 'Confirm Verification')}
                        </Button>

                        <button
                            type="button"
                            className="mx-auto flex min-h-[36px] items-center gap-2 text-sm font-bold text-textSecondary transition-colors hover:text-emerald disabled:opacity-40 focus:outline-none"
                            onClick={handleResend}
                            disabled={timer > 0 || isLoading}
                        >
                            <RotateCcw className="h-4 w-4" />
                            {timer > 0 ? t('auth.resendIn', { seconds: timer, defaultValue: `Resend code in ${timer}s` }) : t('auth.resendCode', 'Resend Code')}
                        </button>
                    </div>
                </div>
            ) : null}

            {step === 3 ? (
                <div className="space-y-6 py-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald/10 text-emerald shadow-sm">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-heading text-2xl font-bold text-textPrimary sm:text-3xl">{t('auth.verificationComplete', 'Verification Complete')}</h2>
                        <p className="text-sm font-medium text-textSecondary">{t('auth.redirectingAfterVerification', 'Your identity has been confirmed. Redirecting...')}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}