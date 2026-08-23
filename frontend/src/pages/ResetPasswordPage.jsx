import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldAlert, KeyRound, Check, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { performPasswordReset, clearError } from '@/features/auth/authSlice';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { loading, error } = useSelector((state) => state.auth);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    // Extract token robustly from search params or hash fallback
    const token = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchToken = searchParams.get('token')?.trim();
        if (searchToken) return searchToken;

        if (location.hash && location.hash.includes('token=')) {
            const hashSearch = location.hash.substring(location.hash.indexOf('?'));
            const hashParams = new URLSearchParams(hashSearch);
            const hashToken = hashParams.get('token')?.trim();
            if (hashToken) return hashToken;
        }

        return '';
    }, [location.search, location.hash]);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Password strength evaluation
    const passwordStrength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
        let score = 0;
        if (password.length >= 6) score += 1;
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
        if (password.length >= 10 && /[^A-Za-z0-9]/.test(password)) score += 1;

        if (score === 1) {
            return {
                score: 1,
                label: t('auth.passwordWeak', { defaultValue: 'Weak (min 6 characters)' }),
                color: 'bg-amber-500',
                textColor: 'text-amber-600',
            };
        }
        if (score === 2) {
            return {
                score: 2,
                label: t('auth.passwordMedium', { defaultValue: 'Good' }),
                color: 'bg-blue-500',
                textColor: 'text-blue-600',
            };
        }
        return {
            score: 3,
            label: t('auth.passwordStrong', { defaultValue: 'Strong' }),
            color: 'bg-emerald',
            textColor: 'text-emerald',
        };
    }, [password, t]);

    const isMatch = Boolean(password && confirmPassword && password === confirmPassword);

    const clearFieldError = (field) => {
        setFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        const nextErrors = {};
        if (!password) {
            nextErrors.password = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        } else if (password.length < 6) {
            nextErrors.password = t('auth.errors.passwordTooShort', { defaultValue: 'Password must be at least 6 characters long.' });
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        } else if (password !== confirmPassword) {
            nextErrors.confirmPassword = t('auth.errors.passwordsDontMatch', { defaultValue: 'The passwords do not match.' });
        }

        setFormErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const result = await dispatch(performPasswordReset({ token, newPassword: password }));
        if (performPasswordReset.fulfilled.match(result)) {
            setIsSuccess(true);
        }
    };

    // -------------------------------------------------------------------------
    // 1. MISSING OR INVALID TOKEN IN URL
    // -------------------------------------------------------------------------
    if (!token) {
        return (
            <div className="w-full max-w-md mx-auto space-y-6 text-center animate-fade-in">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 shadow-sm">
                    <ShieldAlert className="h-10 w-10" />
                </div>
                <div className="space-y-2.5">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                        {t('auth.invalidTokenTitle', { defaultValue: 'Invalid or Expired Link' })}
                    </h2>
                    <p className="text-sm font-medium leading-relaxed text-textSecondary">
                        {t('auth.invalidTokenBody', {
                            defaultValue: 'This password reset link is invalid, incomplete, or has already expired. Please request a fresh reset link.'
                        })}
                    </p>
                </div>
                <div className="space-y-3 pt-2">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider shadow-lg shadow-emerald/20 hover:shadow-emerald/30 transition-all"
                        onClick={() => navigate('/auth/forgot-password')}
                    >
                        {t('auth.requestNewLink', { defaultValue: 'Request New Reset Link' })}
                    </Button>
                    <div>
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
    // 2. SUCCESS STATE
    // -------------------------------------------------------------------------
    if (isSuccess) {
        return (
            <div className="w-full max-w-md mx-auto space-y-6 text-center animate-fade-in">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald/10 text-emerald shadow-sm">
                    <div className="absolute inset-0 rounded-3xl bg-emerald/20 blur-xl pointer-events-none" />
                    <CheckCircle2 className="relative h-10 w-10 text-emerald" />
                </div>
                <div className="space-y-2.5">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                        {t('auth.resetSuccessTitle', { defaultValue: 'Password Updated!' })}
                    </h2>
                    <p className="text-sm font-medium leading-relaxed text-textSecondary">
                        {t('auth.resetSuccessBody', {
                            defaultValue: 'Your password has been successfully updated. You can now use your new password to sign in.'
                        })}
                    </p>
                </div>
                <div className="pt-2">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider gap-2 shadow-lg shadow-emerald/20 hover:shadow-emerald/30 transition-all active:scale-[0.99]"
                        onClick={() => navigate('/auth/login')}
                    >
                        <span>{t('nav.login', { defaultValue: 'Log In' })}</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // 3. SET NEW PASSWORD FORM
    // -------------------------------------------------------------------------
    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="space-y-2 text-center mb-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald shadow-sm">
                    <KeyRound className="h-6 w-6 text-emerald" />
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                    {t('auth.resetTitle', { defaultValue: 'Set New Password' })}
                </h1>
                <p className="mx-auto max-w-sm text-sm font-medium text-textSecondary leading-relaxed">
                    {t('auth.resetSubtitle', { defaultValue: 'Create a strong new password with at least 6 characters.' })}
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {error ? (
                    <div className="space-y-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <span>{t(error, { defaultValue: error })}</span>
                                {error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid') ? (
                                    <div>
                                        <Link
                                            to="/auth/forgot-password"
                                            className="font-bold underline hover:text-red-800 transition-colors"
                                        >
                                            {t('auth.requestNewLink', { defaultValue: 'Request a new reset link' })}
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Password Input */}
                <div className="space-y-1.5">
                    <Input
                        label={t('auth.newPassword', { defaultValue: 'New Password' })}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError('password');
                        }}
                        placeholder="••••••••"
                        icon={Lock}
                        trailingIcon={(
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-emerald/10 hover:text-emerald focus:outline-none"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        )}
                        required
                        error={formErrors.password}
                        className="rounded-xl bg-fog/80"
                    />

                    {/* Password Strength Indicator */}
                    {password ? (
                        <div className="space-y-1 pt-1">
                            <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-semibold text-textSecondary">
                                <span>{t('auth.passwordStrength', { defaultValue: 'Strength' })}:</span>
                                <span className={passwordStrength.textColor}>{passwordStrength.label}</span>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                    <Input
                        label={t('auth.confirmNewPassword', { defaultValue: 'Confirm New Password' })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearFieldError('confirmPassword');
                        }}
                        placeholder="••••••••"
                        icon={Lock}
                        trailingIcon={(
                            <div className="flex items-center gap-1">
                                {isMatch ? (
                                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                                        <Check className="h-4 w-4" />
                                    </div>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-emerald/10 hover:text-emerald focus:outline-none"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                </button>
                            </div>
                        )}
                        required
                        error={formErrors.confirmPassword}
                        className="rounded-xl bg-fog/80"
                    />
                </div>

                <div className="space-y-3 pt-2">
                    <Button
                        type="submit"
                        size="lg"
                        variant="primary"
                        className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider shadow-lg shadow-emerald/20 hover:shadow-emerald/30 transition-all active:scale-[0.99]"
                        loading={loading}
                    >
                        {t('auth.resetSubmit', { defaultValue: 'Update Password' })}
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
