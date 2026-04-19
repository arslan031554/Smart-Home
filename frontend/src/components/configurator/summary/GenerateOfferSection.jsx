import React from 'react';
import { Card, Button, Badge } from '../../common/UIComponents';
import { FileText, ArrowRight, ShieldCheck, UserPlus, LogIn, Mail, MessageSquare, Building2, Receipt, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, syncGuestConfiguratorDraft } from '../../../features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { buildStoredConfiguratorSnapshot, getOrCreateGuestSessionId, saveStoredConfiguratorSnapshot } from '../../../utils/configuratorDraftStorage';

export default function GenerateOfferSection() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const configurator = useSelector((state) => state.configurator);
    const { calculation, isCalculating } = configurator;
    const { isAuthenticated } = useSelector((state) => state.auth);
    const hasCalculation = calculation && typeof calculation.grandTotal === 'number';
    const hasUnmetRequirements = Array.isArray(calculation?.unmetRequirements) && calculation.unmetRequirements.length > 0;
    const isBlocked = isCalculating || !hasCalculation || hasUnmetRequirements;

    const persistGuestProgress = () => {
        const guestSessionId = getOrCreateGuestSessionId();
        saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({
            ...configurator,
            currentStep: 7,
            guestSessionId,
        }));
        dispatch(syncGuestConfiguratorDraft()).catch(() => null);
    };

    const handleAuthRedirect = (mode) => {
        persistGuestProgress();
        navigate(`/auth/${mode}`, {
            state: {
                returnTo: '/configurator',
                returnStep: 7,
            },
        });
    };

    const handleGenerate = () => {
        if (isBlocked) return;
        dispatch(setStep(8));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isAuthenticated) {
        const activationItems = [
            {
                icon: CheckCircle2,
                label: t('configurator.summary.generate.personalDataLabel', { defaultValue: 'Personal data' }),
                helper: t('configurator.summary.generate.personalDataHelper', { defaultValue: 'Full name, email, and phone number are saved to the customer account.' }),
            },
            {
                icon: Building2,
                label: t('configurator.summary.generate.companyDataLabel', { defaultValue: 'Company data' }),
                helper: t('configurator.summary.generate.companyDataHelper', { defaultValue: 'Business information stays attached to the project and offer history.' }),
            },
            {
                icon: Receipt,
                label: t('configurator.summary.generate.invoiceDataLabel', { defaultValue: 'Invoice data' }),
                helper: t('configurator.summary.generate.invoiceDataHelper', { defaultValue: 'Billing details are stored for later offer confirmation and invoicing.' }),
            },
            {
                icon: Mail,
                label: t('configurator.summary.generate.preferencesLabel', { defaultValue: 'Newsletter, terms, and cookies' }),
                helper: t('configurator.summary.generate.preferencesHelper', { defaultValue: 'Communication preference and policy consent are captured on the real account.' }),
            },
            {
                icon: MessageSquare,
                label: t('configurator.summary.generate.verificationLabel', { defaultValue: 'Email or SMS verification' }),
                helper: t('configurator.summary.generate.verificationHelper', { defaultValue: 'The saved guest configuration is attached after the OTP verification step.' }),
            },
        ];

        return (
            <Card id="summary-account-activation" className="rounded-[2.5rem] border border-primary-500/16 bg-primary-50 p-8 shadow-soft sm:p-10">
                <div className="space-y-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.75rem] border border-primary-200 bg-white text-primary-700 shadow-soft">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                            <div className="space-y-3">
                                <Badge variant="info" className="gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {t('configurator.summary.generate.activationRequired', { defaultValue: 'Account activation required' })}
                                </Badge>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold text-textPrimary">
                                        {t('configurator.summary.generate.activationGateTitle', { defaultValue: 'Finish the customer account before generating the final offer' })}
                                    </h3>
                                    <p className="max-w-2xl text-sm leading-relaxed text-textSecondary">
                                        {t('configurator.summary.generate.activationGateBody', { defaultValue: 'The client can start the project as a guest, but the final offer, PDFs, follow-up reminders, and stored history must belong to a verified customer account. Your current configuration steps are already being saved and will be restored after sign-up or sign-in.' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                            <Button size="lg" className="gap-2" onClick={() => handleAuthRedirect('register')}>
                                <UserPlus className="h-4.5 w-4.5" />
                                {t('auth.createAccount', { defaultValue: 'Create Account' })}
                                <ArrowRight className="h-4.5 w-4.5" />
                            </Button>
                            <Button variant="secondary" size="lg" className="gap-2" onClick={() => handleAuthRedirect('login')}>
                                <LogIn className="h-4.5 w-4.5" />
                                {t('nav.login', { defaultValue: 'Log In' })}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {activationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="rounded-[1.6rem] border border-white/60 bg-white/70 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-textPrimary">{item.label}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-textSecondary">{item.helper}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-[1.6rem] border border-primary-200 bg-white/80 px-5 py-4 text-sm leading-relaxed text-textSecondary">
                        {t('configurator.summary.generate.activationGateFooter', { defaultValue: 'The registration flow already includes reCAPTCHA and email/SMS OTP verification, so the customer account is activated before the final offer is generated.' })}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-10 space-y-8 flex flex-col items-center justify-center text-center bg-slate-900 text-white border-none shadow-premium relative overflow-hidden group rounded-[2.5rem]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full -mr-48 -mt-48 blur-[100px] opacity-20 group-hover:scale-110 transition-transform duration-1000" />

            <div className="w-full relative z-10 space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                        <FileText className="w-8 h-8 text-primary-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight">{t('configurator.summary.generate.title', { defaultValue: 'Generate Offer' })}</h3>
                        <p className="text-sm font-medium text-slate-400 max-w-lg mx-auto leading-relaxed">
                            {t('configurator.summary.generate.subtitle', { defaultValue: 'Your configuration is ready. Generate the offer to save the backend totals and project details.' })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
                        <ShieldCheck className="w-4 h-4" />
                        {hasUnmetRequirements
                            ? t('configurator.summary.generate.statusMapping', { defaultValue: 'Master data update required' })
                            : !hasCalculation
                                ? t('configurator.summary.generate.statusWaiting', { defaultValue: 'Waiting for backend calculation' })
                                : isCalculating
                                    ? t('configurator.summary.generate.statusRefreshing', { defaultValue: 'Refreshing backend calculation' })
                                    : t('configurator.summary.generate.statusReady', { defaultValue: 'All validations passed' })}
                    </div>

                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        className="px-12 h-16 text-lg font-bold bg-primary-700 hover:bg-primary-800 text-white rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all group/btn min-w-[300px]"
                        disabled={isBlocked}
                    >
                        <span className="flex items-center gap-3">
                            {hasUnmetRequirements
                                ? t('configurator.summary.generate.completeMapping', { defaultValue: 'Complete Product Mapping' })
                                : t('configurator.summary.generate.cta', { defaultValue: 'Generate Offer' })}
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </Button>

                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                        {hasUnmetRequirements
                            ? t('configurator.summary.generate.blockedNote', { defaultValue: 'Generation is blocked until every configured function has a mapped product path' })
                            : t('configurator.summary.generate.footer', { defaultValue: 'Document generation may take a few seconds' })}
                    </p>
                </div>
            </div>
        </Card>
    );
}
