import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, KeyRound, ExternalLink, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { Button, Input } from '@/components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { clearError, requestPasswordReset } from '@/features/auth/authSlice';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [fieldError, setFieldError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return undefined;
        const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (fieldError) setFieldError('');
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setFieldError(t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' }));
            return;
        }
        if (!EMAIL_PATTERN.test(trimmedEmail)) {
            setFieldError(t('auth.errors.invalidEmail', { defaultValue: 'Please enter a valid email address.' }));
            return;
        }

        const result = await dispatch(requestPasswordReset(trimmedEmail));
        if (requestPasswordReset.fulfilled.match(result)) {
            setIsSubmitted(true);
            setResendTimer(60);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || loading) return;
        dispatch(clearError());
        const result = await dispatch(requestPasswordReset(email.trim()));
        if (requestPasswordReset.fulfilled.match(result)) {
            setResendTimer(60);
        }
    };

    // -------------------------------------------------------------------------
    // SUCCESS / EMAIL SENT STATE
    // -------------------------------------------------------------------------
    if (isSubmitted) {
        return (
            <div className="w-full max-w-md mx-auto space-y-6 text-center animate-fade-in">
                {/* Hero Icon */}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald/10 text-emerald shadow-sm">
                    <div className="absolute inset-0 rounded-3xl bg-emerald/20 blur-xl pointer-events-none" />
                    <CheckCircle2 className="relative h-10 w-10 text-emerald" />
                </div>

                {/* Header */}
                <div className="space-y-2.5">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                        {t('auth.resetCheckEmailTitle', { defaultValue: 'Check Your Email' })}
                    </h2>
                    <p className="text-sm font-medium leading-relaxed text-textSecondary">
                        {t('auth.resetCheckEmailBody', { defaultValue: "We've sent a password reset link to" })}{' '}
                        <span className="font-bold text-emerald break-all">{email}</span>.
                    </p>
                </div>

                {/* Info Card */}
                <div className="rounded-2xl border border-emerald/15 bg-emerald/5 p-4 text-left text-xs font-medium leading-relaxed text-textSecondary space-y-2">
                    <div className="flex items-center gap-2 text-emerald font-semibold">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{t('auth.resetCheckEmailHint', { defaultValue: 'Link expires in 1 hour. If you do not see the email, check your spam or junk folder.' })}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                    {/* Open Gmail quick shortcut */}
                    <a
                        href="https://mail.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald/20 transition-all hover:bg-emerald-600 hover:shadow-emerald/30 active:scale-[0.99]"
                    >
                        <span>{t('auth.openGmail', { defaultValue: 'Open Gmail' })}</span>
                        <ExternalLink className="h-4 w-4" />
                    </a>

                    {/* Resend button with cooldown */}
                    <Button
                        variant="secondary"
                        size="lg"
                        className="w-full min-h-[44px] rounded-full text-xs font-bold tracking-wider gap-2 border-emerald/20 bg-white hover:bg-emerald/5 text-textPrimary"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || loading}
                        loading={loading}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {resendTimer > 0
                            ? t('auth.resendIn', { seconds: resendTimer, defaultValue: `Resend link in ${resendTimer}s` })
                            : t('auth.resetResend', { defaultValue: 'Resend Reset Link' })}
                    </Button>

                    {/* Back to Login */}
                    <div className="pt-2 text-center">
                        <Link
                            to="/auth/login"
                            className="inline-flex min-h-[36px] items-center gap-2 text-sm font-bold text-textSecondary transition-colors hover:text-emerald"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('auth.backToLogin', { defaultValue: 'Back to Log In' })}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // INITIAL FORM STATE
    // -------------------------------------------------------------------------
    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="space-y-2 text-center mb-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald shadow-sm">
                    <KeyRound className="h-6 w-6 text-emerald" />
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                    {t('auth.forgotTitle', { defaultValue: 'Reset Your Password' })}
                </h1>
                <p className="mx-auto max-w-sm text-sm font-medium text-textSecondary leading-relaxed">
                    {t('auth.forgotSubtitle', {
                        defaultValue: 'Enter your registered email address and we will send you a secure link to reset your password.'
                    })}
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {error ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                        {t(error, { defaultValue: error })}
                    </div>
                ) : null}

                <div className="space-y-1.5">
                    <Input
                        label={t('auth.email', { defaultValue: 'Email Address' })}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@email.com"
                        icon={Mail}
                        required
                        error={fieldError}
                        className="rounded-xl bg-fog/80"
                    />
                </div>

                <div className="space-y-3 pt-2">
                    <Button
                        type="submit"
                        size="lg"
                        variant="primary"
                        className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider gap-2 shadow-lg shadow-emerald/20 hover:shadow-emerald/30 transition-all active:scale-[0.99]"
                        loading={loading}
                    >
                        <span>{t('auth.forgotSubmit', { defaultValue: 'Send Reset Link' })}</span>
                        <Send className="h-4 w-4" />
                    </Button>

                    <div className="text-center pt-2">
                        <Link
                            to="/auth/login"
                            className="inline-flex min-h-[36px] items-center gap-2 text-sm font-bold text-textSecondary transition-colors hover:text-emerald"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('auth.backToLogin', { defaultValue: 'Back to Log In' })}
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
