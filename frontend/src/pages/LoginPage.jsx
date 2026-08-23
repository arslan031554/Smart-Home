import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Alert } from '../components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../features/auth/authSlice';
import { attachGuestDraftToAccount } from '../features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import { hasAdminAccess } from '../constants/adminPermissions';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const returnState = location.state?.returnTo
        ? { returnTo: location.state.returnTo, returnStep: location.state.returnStep }
        : null;
    const isReturningToConfigurator = location.state?.returnTo === '/configurator';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const clearFieldError = (field) => {
        setFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        const trimmedEmail = email.trim();
        const nextErrors = {};
        if (!trimmedEmail) nextErrors.email = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        else if (!EMAIL_PATTERN.test(trimmedEmail)) nextErrors.email = t('auth.errors.invalidEmail', { defaultValue: 'Please enter a valid email address.' });
        if (!password) nextErrors.password = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        setFormErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const resultAction = await dispatch(login({ email: trimmedEmail, password }));
        if (login.fulfilled.match(resultAction)) {
            const user = resultAction.payload.data.user;
            await dispatch(attachGuestDraftToAccount()).unwrap().catch(() => null);
            if (returnState?.returnTo) {
                navigate(returnState.returnTo, { state: { returnStep: returnState.returnStep } });
            } else {
                const destination = user?.role === 'admin'
                    ? '/'
                    : hasAdminAccess(user)
                        ? '/admin'
                        : '/';
                navigate(destination);
            }
        } else if (resultAction.payload?.message === 'verification_required') {
            navigate('/auth/verify-otp', {
                state: {
                    email: resultAction.payload.user?.email,
                    channel: 'email',
                    availableChannels: ['email'],
                    verificationReason: resultAction.payload.verificationReason || 'login_2fa',
                    deliveryError: resultAction.payload.deliveryError || null,
                    message: resultAction.payload.deliveryError ? null : t('auth.errors.otpSent', { channel: 'Email', defaultValue: 'Verification code sent to your email.' }),
                    ...(returnState && { returnTo: returnState.returnTo, returnStep: returnState.returnStep }),
                },
            });
        }
    };

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                        {t('auth.loginTitle', { defaultValue: 'Log In to Your Account' })}
                    </h1>
                    <p className="text-sm font-medium text-textSecondary">
                        {t('auth.loginSubtitle', { defaultValue: 'Enter your credentials to access your Smart Home workspace.' })}
                    </p>
                </div>

                {error ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                        {t(error, { defaultValue: error })}
                    </div>
                ) : null}

                {isReturningToConfigurator ? (
                    <Alert variant="info" className="rounded-xl">
                        {t('auth.resumeConfiguratorTitle', { defaultValue: 'Resume your saved configuration' })}
                    </Alert>
                ) : null}

                <div className="space-y-4">
                    <Input
                        label={t('auth.email', { defaultValue: 'Email Address' })}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                        placeholder="you@email.com"
                        icon={Mail}
                        required
                        error={formErrors.email}
                        className="rounded-xl bg-fog/80"
                    />

                    <div className="space-y-1.5">
                        <Input
                            label={t('auth.password', { defaultValue: 'Password' })}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                            placeholder="••••••••"
                            icon={Lock}
                            trailingIcon={(
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-emerald/10 hover:text-emerald focus:outline-none"
                                    aria-label={showPassword ? t('auth.hidePassword', { defaultValue: 'Hide password' }) : t('auth.showPassword', { defaultValue: 'Show password' })}
                                >
                                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                </button>
                            )}
                            required
                            error={formErrors.password}
                            className="rounded-xl bg-fog/80"
                        />
                        <div className="flex justify-end pt-1">
                            <button
                                type="button"
                                onClick={() => navigate('/auth/forgot-password')}
                                className="inline-flex min-h-[32px] items-center text-xs font-bold text-emerald hover:text-emerald-700 transition-colors focus:outline-none"
                            >
                                {t('auth.forgotPassword', { defaultValue: 'Forgot password?' })}
                            </button>
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider"
                    loading={loading}
                >
                    {t('nav.login', { defaultValue: 'Log In' })}
                    <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="pt-2 text-center text-sm text-textSecondary">
                    {t('auth.noAccountPrompt', { defaultValue: "Don't have an account?" })}{' '}
                    <Link
                        to="/auth/register"
                        className="font-bold text-emerald transition-colors hover:text-emerald-700 hover:underline"
                    >
                        {t('auth.createAccount', { defaultValue: 'Create an Account' })}
                    </Link>
                </div>
            </form>
        </div>
    );
}
