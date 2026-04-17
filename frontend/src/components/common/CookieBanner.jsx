import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { acceptCookies, declineCookies } from '../../features/ui/uiSlice';
import { Cookie, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Button } from '../common/UIComponents';
import { useTranslation } from 'react-i18next';

export default function CookieBanner() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { showCookieBanner } = useSelector((state) => state.ui);

    if (!showCookieBanner) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 z-[200] animate-slide-up">
            <div className="premium-panel relative mx-auto flex max-w-4xl flex-col items-start gap-5 overflow-hidden rounded-[2rem] p-6 md:flex-row md:items-center">

                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/55 to-transparent" />
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />

                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-soft">
                    <Cookie className="w-6 h-6" />
                </div>

                <div className="flex-grow text-center md:text-left">
                    <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                        <ShieldCheck className="w-4 h-4 text-primary-400" />
                        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">{t('cookies.title')}</h4>
                    </div>
                    <p className="max-w-lg text-sm leading-relaxed text-textSecondary">
                        {t('cookies.desc')}
                    </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                    <button
                        onClick={() => dispatch(declineCookies())}
                        className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-textSecondary transition-colors hover:bg-white/5 hover:text-textPrimary"
                    >
                        {t('cookies.essentialOnly')}
                    </button>
                    <Button
                        size="sm"
                        onClick={() => dispatch(acceptCookies())}
                        className="gap-2"
                    >
                        {t('cookies.acceptAll')}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </div>

                <button
                    onClick={() => dispatch(declineCookies())}
                    className="absolute right-4 top-4 rounded-full border border-white/8 p-2 text-textSecondary transition-colors hover:border-primary-500/20 hover:text-primary-300"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
