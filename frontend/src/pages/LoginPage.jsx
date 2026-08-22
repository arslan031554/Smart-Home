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
        if (!trimmedEmail) nextErrors.email = t('auth.errors.fieldRequired');
        else if (!EMAIL_PATTERN.test(trimmedEmail)) nextErrors.email = t('auth.errors.invalidEmail');
        if (!password) nextErrors.password = t('auth.errors.fieldRequired');
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
                    message: resultAction.payload.deliveryError ? null : t('auth.errors.otpSent', { channel: 'Email' }),
                    ...(returnState && { returnTo: returnState.returnTo, returnStep: returnState.returnStep }),
                },
            });
        }
    };

    return (
        <div className="w-full max-w-sm animate-fade-in">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <h2 className="text-center font-heading text-3xl font-semibold text-textPrimary">
                    {t('nav.login')}
                </h2>

                {error ? (
                    <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                        {t(error)}
                    </div>
                ) : null}

                {isReturningToConfigurator ? (
                    <Alert variant="info" className="rounded-md">
                        {t('auth.resumeConfiguratorTitle', { defaultValue: 'Resume your saved configuration' })}
                    </Alert>
                ) : null}

                <Input
                    label={t('auth.email')}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                    placeholder="you@email.com"
                    icon={Mail}
                    required
                    error={formErrors.email}
                    className="rounded-md bg-fog"
                />

                <div className="space-y-2">
                    <Input
                        label={t('auth.password')}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                        placeholder="........"
                        icon={Lock}
                        trailingIcon={(
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-textSecondary transition-colors hover:text-textPrimary focus:outline-none"
                                aria-label={showPassword ? t('auth.hidePassword', { defaultValue: 'Hide password' }) : t('auth.showPassword', { defaultValue: 'Show password' })}
                            >
                                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        )}
                        required
                        error={formErrors.password}
                        className="rounded-md bg-fog"
                    />
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => navigate('/auth/forgot-password')}
                            className="text-xs font-semibold text-textSecondary transition-colors hover:text-primary-500"
                        >
                            {t('auth.forgotPassword')}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    className="w-full rounded-md"
                    loading={loading}
                >
                    {t('nav.login')}
                    <ArrowRight className="h-4.5 w-4.5" />
                </Button>

                <div className="text-center text-sm text-textSecondary">
                    {t('auth.noAccountPrompt', { defaultValue: "Don't have an account?" })}{' '}
                    <Link to="/auth/register" className="font-semibold text-primary-500 transition-colors hover:text-primary-700">
                        {t('auth.createAccount')}
                    </Link>
                </div>
            </form>
        </div>
    );
}
