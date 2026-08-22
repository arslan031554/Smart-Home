import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import ScrollToTop from '../components/common/ScrollToTop';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const normalizedPath = location.pathname.replace(/\/+$/, '');
    const compactAuthPages = ['/auth/login', '/auth/register', '/auth/verify-otp'];
    const isCompactAuthPage = compactAuthPages.includes(normalizedPath);

    if (isCompactAuthPage) {
        const isRegister = normalizedPath === '/auth/register';
        const isVerify = normalizedPath === '/auth/verify-otp';
        const sideTitle = isRegister
            ? t('auth.createAccount', { defaultValue: 'Create an Account' })
            : isVerify
                ? t('auth.verifyByEmail', { defaultValue: 'Verify by Email' })
                : t('auth.welcomeBack', { defaultValue: 'Welcome back' });
        const sideCopy = isRegister
            ? t('auth.alreadyHaveAccount', { defaultValue: 'Already have an account?' })
            : isVerify
                ? t('auth.otpEnterPrompt2fa', { defaultValue: 'Enter the code below to complete your login.' })
                : t('auth.alreadyHaveAccountPrompt', { defaultValue: 'Need an account?' });
        const sideAction = isRegister
            ? { to: '/auth/login', label: t('nav.login') }
            : { to: '/auth/register', label: t('auth.createAccount') };

        return (
            <div className="relative min-h-screen overflow-hidden bg-gradient-surface text-textPrimary">
                <ScrollToTop />
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/95 px-3 py-2 text-sm font-semibold text-textPrimary shadow-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 sm:left-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('auth.back', { defaultValue: 'Back' })}
                </button>
                <div className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute left-0 top-0 h-[26rem] w-[26rem] bg-primary-500/10 blur-[120px]" />
                    <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] bg-primary-100/70 blur-[110px]" />
                </div>

                <div className="relative z-10 flex h-screen w-full items-stretch justify-center">
                    <div className="grid h-full w-full overflow-hidden rounded-none border border-emerald/12 bg-white shadow-premium md:grid-cols-[0.95fr_1.05fr]">
                        <aside className="relative flex min-h-full flex-1 flex-col items-center justify-center gap-5 bg-gradient-brand px-8 py-10 text-center text-white animate-slide-in-left">
                            <Link to="/" className="inline-flex rounded-md px-4 py-3 shadow-soft">
                                <img
                                    src="/images/green-electric-logo.png"
                                    alt={t('app.brandName')}
                                    className="h-14 w-auto max-w-[220px] object-contain"
                                />
                            </Link>
                            <div className="space-y-4 max-w-[22rem] text-left">
                                <h1 className="font-heading text-3xl font-semibold leading-tight">{sideTitle}</h1>
                                <p className="text-sm font-medium text-white/80">{sideCopy}</p>
                                <p className="text-sm leading-relaxed text-white/75">
                                    {t('auth.authPanelLeftDescription', { defaultValue: 'Manage smart-home offers, customer data, and project drafts in one secure workspace designed for modern installations.' })}
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-white">⚡</span>
                                        <div>
                                            <p className="font-semibold text-white">{t('auth.fastPlanning', { defaultValue: 'Fast planning' })}</p>
                                            <p className="text-sm text-white/75">{t('auth.fastPlanningDesc', { defaultValue: 'Instant pricing and offer summaries for every customer journey.' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-white">🔒</span>
                                        <div>
                                            <p className="font-semibold text-white">{t('auth.secureAccess', { defaultValue: 'Secure access' })}</p>
                                            <p className="text-sm text-white/75">{t('auth.secureAccessDesc', { defaultValue: 'Keep your customer projects and offers protected at every step.' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!isVerify ? (
                                <Link
                                    to={sideAction.to}
                                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/45 px-8 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
                                >
                                    {sideAction.label}
                                </Link>
                            ) : null}
                        </aside>

                        <main className="relative flex h-full w-full items-center justify-center overflow-y-auto px-0 py-0 animate-slide-in-right">
                            <div className="absolute right-4 top-4">
                                <LanguageSwitcher />
                            </div>
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    const highlights = [
        {
            icon: ShieldCheck,
            title: t('auth.securityVerification', { defaultValue: 'Protected access' }),
            description: t('auth.verificationRequiredDesc', { defaultValue: 'Verification keeps project drafts, offers, and customer records secure across every step.' }),
        },
        {
            icon: SlidersHorizontal,
            title: t('nav.configurator'),
            description: t('auth.authPanelConfigurator', { defaultValue: 'Continue smart-home planning, pricing, and offer generation without losing your current progress.' }),
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-surface px-4 py-6 text-textPrimary sm:px-6 lg:px-8">
            <ScrollToTop />
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/95 px-3 py-2 text-sm font-semibold text-textPrimary shadow-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 sm:left-6"
            >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.back', { defaultValue: 'Back' })}
            </button>

            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-primary-500/12 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-white/8 blur-[110px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,83,45,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,83,45,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-15" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
                <div className="hero-frame auth-shell grid w-full overflow-hidden rounded-[2.25rem] border border-white/10 animate-fade-in">
                    <div className="auth-shell__aside relative flex flex-col gap-10 border-b border-white/8 px-6 py-8 sm:px-10 lg:border-b-0 lg:px-12 lg:py-12 animate-slide-in-left">
                        <div className="flex items-start justify-between gap-4">
                            <Link to="/" className="group inline-flex items-center gap-3">
                                <img
                                    src="/images/green-electric-logo.png"
                                    alt={t('app.brandName')}
                                    className="h-14 w-auto max-w-[230px] object-contain shadow-lg shadow-emerald/10 transition-transform duration-300 group-hover:-translate-y-0.5"
                                />
                            </Link>
                            <LanguageSwitcher />
                        </div>

                        <div className="space-y-6 lg:pt-2">
                            <div className="chip w-fit">{t('auth.welcomeBack', { defaultValue: 'Welcome back' })}</div>
                            <div className="space-y-4">
                                <h1 className="max-w-md font-heading text-5xl font-semibold leading-none text-textPrimary sm:text-6xl">
                                    {t('auth.authPanelTitle', { defaultValue: 'Access your premium smart-home workspace.' })}
                                </h1>
                                <p className="max-w-xl text-base leading-relaxed text-textSecondary">
                                    {t('footer.tagline')}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {highlights.map((item) => (
                                <div key={item.title} className="premium-card-muted rounded-[1.75rem] p-5">
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-textPrimary">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-textSecondary">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                        <div className="premium-panel relative w-full max-w-[46rem] overflow-hidden rounded-[2rem] border border-white/10 px-6 py-8 sm:px-10 sm:py-10 animate-slide-in-right">
                            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
                            <div className="relative z-10">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="relative z-10 mt-6 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-textSecondary">
                {t('footer.copyright')}
            </p>
        </div>
    );
}