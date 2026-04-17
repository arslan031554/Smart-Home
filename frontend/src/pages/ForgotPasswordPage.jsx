import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, ShieldCheck } from 'lucide-react';
import { Button, Input, Badge } from '@/components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { clearError, requestPasswordReset } from '@/features/auth/authSlice';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        const result = await dispatch(requestPasswordReset(email));
        if (requestPasswordReset.fulfilled.match(result)) {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="mx-auto max-w-md space-y-8 py-8 text-center animate-fade-in">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow">
                    <Send className="h-11 w-11" />
                </div>
                <div className="space-y-3">
                    <h3 className="font-heading text-4xl font-semibold text-textPrimary">{t('auth.resetCheckEmailTitle', 'Check Your Email')}</h3>
                    <p className="text-sm leading-relaxed text-textSecondary">
                        {t('auth.resetCheckEmailBody', 'A password reset link has been sent to')} <span className="font-semibold text-primary-200">{email}</span>.
                    </p>
                </div>
                <div className="space-y-3">
                    <Button variant="primary" className="w-full" onClick={() => setIsSubmitted(false)}>
                        {t('auth.resetResend', 'Resend Reset Link')}
                    </Button>
                    <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary-300">
                        <ArrowLeft className="h-4 w-4" />
                        {t('nav.login')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg space-y-8 animate-fade-in">
            <div className="space-y-4 text-center">
                <Badge variant="warning" className="mx-auto gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('auth.securityVerification', 'Account Security')}
                </Badge>
                <div className="space-y-3">
                    <h3 className="font-heading text-5xl font-semibold leading-none text-textPrimary">{t('auth.forgotTitle', 'Reset Password')}</h3>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-textSecondary">
                        {t('auth.forgotSubtitle', 'Enter your registered email address below to receive a secure password reset link.')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error ? <div className="rounded-2xl border border-red-500/18 bg-red-500/10 px-4 py-3 text-sm text-red-200">{t(error)}</div> : null}
                <Input
                    label={t('auth.email')}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    icon={Mail}
                    required
                />

                <div className="space-y-3 pt-2">
                    <Button type="submit" className="w-full gap-2" loading={loading}>
                        {t('auth.forgotSubmit', 'Send Reset Link')}
                        <Send className="h-4.5 w-4.5" />
                    </Button>
                    <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary-300">
                        <ArrowLeft className="h-4 w-4" />
                        {t('nav.login')}
                    </Link>
                </div>
            </form>
        </div>
    );
}
