import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Shield, Sparkles } from 'lucide-react';
import ScrollToTop from '../components/common/ScrollToTop';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const normalizedPath = location.pathname.replace(/\/+$/, '');

    const isRegister = normalizedPath === '/auth/register';
    const isVerify = normalizedPath === '/auth/verify-otp' || normalizedPath === '/auth/verify';
    const isForgot = normalizedPath === '/auth/forgot-password';
    const isReset = normalizedPath === '/auth/reset-password';

    let sideTitle = t('auth.welcomeBack', { defaultValue: 'Welcome back' });
    let sideCopy = t('auth.alreadyHaveAccountPrompt', { defaultValue: 'Need an account?' });
    let sideAction = { to: '/auth/register', label: t('auth.createAccount', { defaultValue: 'Create account' }) };

    if (isRegister) {
        sideTitle = t('auth.createAccount', { defaultValue: 'Create an Account' });
        sideCopy = t('auth.alreadyHaveAccount', { defaultValue: 'Already have an account?' });
        sideAction = { to: '/auth/login', label: t('nav.login', { defaultValue: 'Log In' }) };
    } else if (isVerify) {
        sideTitle = t('auth.verifyByEmail', { defaultValue: 'Security Verification' });
        sideCopy = t('auth.otpEnterPrompt2fa', { defaultValue: 'Enter the code below to complete your login.' });
        sideAction = { to: '/auth/login', label: t('nav.login', { defaultValue: 'Log In' }) };
    } else if (isForgot) {
        sideTitle = t('auth.forgotTitle', { defaultValue: 'Reset Password' });
        sideCopy = t('auth.rememberPasswordPrompt', { defaultValue: 'Remember your password?' });
        sideAction = { to: '/auth/login', label: t('nav.login', { defaultValue: 'Log In' }) };
    } else if (isReset) {
        sideTitle = t('auth.resetTitle', { defaultValue: 'Set New Password' });
        sideCopy = t('auth.rememberPasswordPrompt', { defaultValue: 'Remember your password?' });
        sideAction = { to: '/auth/login', label: t('nav.login', { defaultValue: 'Log In' }) };
    }

    const handleBackToConfigurator = () => {
        const returnTo = location.state?.returnTo || '/configurator';
        const returnStep = location.state?.returnStep;
        navigate(returnTo, {
            state: returnStep !== undefined ? { returnStep } : undefined,
        });
    };

    return (
        <div className="relative min-h-[100dvh] w-full bg-white text-textPrimary antialiased selection:bg-emerald/20 selection:text-ink">
            <ScrollToTop />

            {/* Background Ambient Glows */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute left-[-10%] top-[-10%] h-[35rem] w-[35rem] rounded-full bg-emerald/8 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-emerald-100/50 blur-[120px]" />
            </div>

            {/* ========================================================================= */}
            {/* MOBILE TOP NAVIGATION BAR (Visible on < lg screens) */}
            {/* ========================================================================= */}
            <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-2 border-b border-emerald/20 bg-[#020a07]/96 px-3 text-white shadow-md backdrop-blur-xl sm:px-6 lg:hidden">
                <button
                    type="button"
                    onClick={handleBackToConfigurator}
                    className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-emerald-950 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:px-3.5"
                    aria-label={t('auth.backToConfigurator', { defaultValue: 'Back to Configurator' })}
                >
                    <ArrowLeft className="h-3.5 w-3.5 text-emerald-300 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-emerald-950" />
                    <span className="hidden xs:inline">{t('auth.backToConfigurator', { defaultValue: 'Back to Configurator' })}</span>
                    <span className="xs:hidden">{t('auth.backToConfiguratorShort', { defaultValue: 'Configurator' })}</span>
                </button>

                <Link to="/" className="inline-flex shrink-0 items-center transition-transform hover:opacity-90 active:scale-95" aria-label={t('app.brandName', { defaultValue: 'Green Electric' })}>
                    <img
                        src="/images/green-electric-logo.png"
                        alt={t('app.brandName', { defaultValue: 'Green Electric' })}
                        className="h-7 w-auto max-w-[130px] object-contain drop-shadow-sm xs:h-8 xs:max-w-[150px] sm:h-9 sm:max-w-[180px]"
                    />
                </Link>

                <div className="flex shrink-0 items-center">
                    <LanguageSwitcher className="origin-right scale-90 xs:scale-95 sm:scale-100" />
                </div>
            </header>

            {/* ========================================================================= */}
            {/* MAIN AUTH CONTAINER */}
            {/* ========================================================================= */}
            <div className="relative z-10 flex min-h-[calc(100dvh-4rem)] w-full lg:h-screen lg:min-h-screen">
                <div className="grid w-full lg:grid-cols-[0.92fr_1.08fr] xl:grid-cols-[0.88fr_1.12fr]">
                    
                    {/* ----------------------------------------------------------------- */}
                    {/* DESKTOP BRANDED SIDE PANEL (Visible only on >= lg screens) */}
                    {/* ----------------------------------------------------------------- */}
                    <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-10 text-white lg:flex xl:p-14">
                        {/* Desktop Ambient Lighting */}
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald/20 blur-[100px]" />
                            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-orange/20 blur-[100px]" />
                        </div>

                        {/* Top Bar: Back Button & Logo */}
                        <div className="relative z-10 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleBackToConfigurator}
                                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-emerald-950 hover:shadow-md hover:border-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                title={t('auth.backToConfigurator', { defaultValue: 'Back to Configurator' })}
                            >
                                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                                <span>{t('auth.backToConfigurator', { defaultValue: 'Back to Configurator' })}</span>
                            </button>

                            <Link to="/" className="inline-flex transition-transform hover:scale-[1.02]">
                                <img
                                    src="/images/green-electric-logo.png"
                                    alt={t('app.brandName', { defaultValue: 'Green Electric' })}
                                    className="h-12 w-auto max-w-[200px] object-contain drop-shadow-md xl:h-14"
                                />
                            </Link>
                        </div>

                        {/* Center: Hero Copy & Feature Highlights */}
                        <div className="relative z-10 my-auto max-w-lg space-y-8 py-8">
                            <div className="space-y-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                                    <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                                    Smart-Home Workspace
                                </span>
                                <h1 className="font-heading text-3xl font-bold leading-tight text-white xl:text-4xl">
                                    {sideTitle}
                                </h1>
                                <p className="text-sm font-medium leading-relaxed text-white/80">
                                    {t('auth.authPanelLeftDescription', {
                                        defaultValue: 'Manage smart-home offers, customer data, and project drafts in one secure workspace designed for modern installations.'
                                    })}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
                                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald/20 text-emerald-300">
                                        <Zap className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-white">
                                            {t('auth.fastPlanning', { defaultValue: 'Fast planning' })}
                                        </h2>
                                        <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                                            {t('auth.fastPlanningDesc', { defaultValue: 'Instant pricing and offer summaries for every customer journey.' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
                                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                                        <Shield className="h-4.5 w-4.5 text-emerald-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-white">
                                            {t('auth.secureAccess', { defaultValue: 'Secure access' })}
                                        </h2>
                                        <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                                            {t('auth.secureAccessDesc', { defaultValue: 'Keep your customer projects and offers protected at every step.' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Action link & copyright */}
                        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
                            <div className="text-xs text-white/80">
                                <span>{sideCopy}</span>
                            </div>
                            <Link
                                to={sideAction.to}
                                className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-white hover:text-ink active:scale-95"
                            >
                                {sideAction.label}
                            </Link>
                        </div>
                    </aside>

                    {/* ----------------------------------------------------------------- */}
                    {/* FORM CONTAINER (Mobile & Desktop) */}
                    {/* ----------------------------------------------------------------- */}
                    <main className="relative flex w-full flex-1 flex-col justify-between overflow-y-auto bg-white px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-12 xl:px-16">
                        {/* Desktop Language Switcher (Top Right) */}
                        <div className="hidden lg:absolute lg:right-8 lg:top-8 lg:z-20 lg:block xl:right-12">
                            <LanguageSwitcher />
                        </div>

                        {/* Form Body Centered */}
                        <div className="my-auto flex w-full flex-1 items-center justify-center">
                            <div className="w-full">
                                <Outlet />
                            </div>
                        </div>

                        {/* Subtle Footer */}
                        <footer className="mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-textSecondary/70">
                            {t('footer.copyright', { defaultValue: '© 2026 Green Electric. All rights reserved.' })}
                        </footer>
                    </main>

                </div>
            </div>
        </div>
    );
}