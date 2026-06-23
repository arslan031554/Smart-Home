import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';
import ScrollToTop from '../components/common/ScrollToTop';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
    const { t } = useTranslation();

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

            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-primary-500/12 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-white/8 blur-[110px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,83,45,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,83,45,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-15" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
                <div className="hero-frame auth-shell grid w-full overflow-hidden rounded-[2.25rem] border border-white/10">
                    <div className="auth-shell__aside relative flex flex-col gap-10 border-b border-white/8 px-6 py-8 sm:px-10 lg:border-b-0 lg:px-12 lg:py-12">
                        <div className="flex items-start justify-between gap-4">
                            <Link to="/" className="group inline-flex items-center gap-3">
                                <img
                                    src="/images/green-electric-logo.png"
                                    alt={t('app.brandName')}
                                    className="h-14 w-auto max-w-[230px] rounded-md bg-white p-2 object-contain shadow-lg shadow-emerald/10 transition-transform duration-300 group-hover:-translate-y-0.5"
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
                        <div className="premium-panel relative w-full max-w-[46rem] overflow-hidden rounded-[2rem] border border-white/10 px-6 py-8 sm:px-10 sm:py-10">
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
