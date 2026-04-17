import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Globe, UserCheck } from 'lucide-react';
import { Button, Input, Checkbox, Badge } from '../components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { startGuestSession, login, clearError } from '../features/auth/authSlice';
import { attachGuestDraftToAccount, resetConfigurator } from '../features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import { hasAdminAccess } from '../constants/adminPermissions';

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const returnState = location.state?.returnTo
        ? { returnTo: location.state.returnTo, returnStep: location.state.returnStep }
        : null;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        const resultAction = await dispatch(login({ email, password }));
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
            navigate('/auth/choose-verification', {
                state: {
                    email: resultAction.payload.user?.email,
                    availableChannels: resultAction.payload.availableChannels || [],
                    ...(returnState && { returnTo: returnState.returnTo, returnStep: returnState.returnStep }),
                },
            });
        }
    };

    const handleGuestStart = () => {
        dispatch(startGuestSession());
        dispatch(resetConfigurator());
        navigate('/configurator');
    };

    return (
        <div className="mx-auto max-w-lg space-y-10 animate-fade-in">
            <div className="space-y-4 text-center animate-slide-up" style={{ animationDelay: '0.08s' }}>
                <Badge variant="info" className="mx-auto gap-2">
                    <UserCheck className="h-3.5 w-3.5" />
                    {t('auth.welcomeBack')}
                </Badge>
                <div className="space-y-3">
                    <h3 className="font-heading text-5xl font-semibold leading-none text-textPrimary">{t('auth.loginTitle')}</h3>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-textSecondary">{t('auth.loginSubtitle')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7 animate-slide-up" style={{ animationDelay: '0.16s' }}>
                {error ? (
                    <div className="rounded-2xl border border-red-500/18 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {t(error)}
                    </div>
                ) : null}

                <div className="space-y-5">
                    <Input
                        label={t('auth.email')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        icon={Mail}
                        required
                    />

                    <div className="space-y-3">
                        <Input
                            label={t('auth.password')}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="........"
                            icon={Lock}
                            required
                        />
                        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
                            <Checkbox
                                label={t('auth.rememberMe')}
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <Link to="/auth/forgot-password" className="text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200">
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <Button
                        type="submit"
                        size="lg"
                        variant="primary"
                        className="w-full gap-2"
                        loading={loading}
                    >
                        {t('nav.login')}
                        <ArrowRight className="h-4.5 w-4.5" />
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleGuestStart}
                        className="w-full gap-2"
                    >
                        <Globe className="h-4.5 w-4.5" />
                        {t('auth.continueAsGuest')}
                    </Button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-2 border-t border-white/8 pt-6 text-sm text-textSecondary animate-slide-up" style={{ animationDelay: '0.22s' }}>
                <span>{t('auth.alreadyHaveAccountPrompt')}</span>
                <Link to="/auth/register" className="font-semibold text-primary-300 transition-colors hover:text-primary-200">
                    {t('auth.createAccount')}
                </Link>
            </div>
        </div>
    );
}
