import React from 'react';
import { Card, Button, Badge } from '../../common/UIComponents';
import { FileText, ArrowRight, ShieldCheck, UserPlus, Mail, MessageSquare, Building2, Receipt, CheckCircle2 } from 'lucide-react';
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

    const persistGuestProgress = () => {
        const guestSessionId = getOrCreateGuestSessionId();
        saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({
            ...configurator,
            currentStep: 6,
            guestSessionId,
        }));
        dispatch(syncGuestConfiguratorDraft()).catch(() => null);
    };

    const handleAuthRedirect = (mode, returnStep = 6) => {
        persistGuestProgress();
        navigate(`/auth/${mode}`, {
            state: {
                returnTo: '/configurator',
                returnStep,
            },
        });
    };

    const handleGenerate = () => {
        if (isCalculating) return;
        if (!isAuthenticated) {
            persistGuestProgress();
            navigate('/auth/login', {
                state: {
                    returnTo: '/configurator',
                    returnStep: 6,
                },
            });
            return;
        }
        dispatch(setStep(7));
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
                icon: MessageSquare,
                label: t('configurator.summary.generate.preferencesLabel', { defaultValue: 'Newsletter, terms, and cookies' }),
                helper: t('configurator.summary.generate.preferencesHelper', { defaultValue: 'Communication preference and policy consent are captured on the real account.' }),
            },
            {
                icon: Mail,
                label: t('configurator.summary.generate.verificationLabel', { defaultValue: 'Email or SMS verification' }),
                helper: t('configurator.summary.generate.verificationHelper', { defaultValue: 'The saved guest configuration is attached after the OTP verification step.' }),
            },
        ];

        return (
            <Card id="summary-account-activation" className="rounded-2xl border border-primary-500/20 bg-primary-50/70 p-5 shadow-soft sm:p-6">
                <div className="space-y-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-700 shadow-xs">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <Badge variant="info" className="gap-1.5 px-2.5 py-0.5 text-[10px] font-bold">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {t('configurator.summary.generate.activationRequired', { defaultValue: 'Account activation required' })}
                                </Badge>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-textPrimary sm:text-xl">
                                        {t('configurator.summary.generate.activationGateTitle', { defaultValue: 'Finish the customer account before generating the final offer' })}
                                    </h3>
                                    <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-textSecondary">
                                        {t('configurator.summary.generate.activationGateBody', { defaultValue: 'The client can start the project as a guest, but the final offer, PDFs, follow-up reminders, and stored history must belong to a verified customer account. Your current configuration steps are already being saved and will be restored after sign-up or sign-in.' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col shrink-0">
                            <Button size="md" className="gap-2 rounded-lg text-xs font-bold" onClick={() => handleAuthRedirect('register')}>
                                <UserPlus className="h-4 w-4" />
                                {t('auth.createAccount', { defaultValue: 'Create Account' })}
                            </Button>
                            <Button variant="secondary" size="md" className="gap-2 rounded-lg text-xs font-semibold" onClick={() => handleAuthRedirect('login')}>
                                {t('nav.login', { defaultValue: 'Log In' })}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {activationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="rounded-xl border border-white/80 bg-white/90 p-3.5 sm:p-4 shadow-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-primary-50 text-primary-700">
                                            <Icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-bold text-textPrimary">{item.label}</p>
                                            <p className="mt-0.5 text-[11px] leading-relaxed text-textSecondary">{item.helper}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-xl border border-primary-200 bg-white/90 px-4 py-2.5 text-xs leading-relaxed text-textSecondary">
                        {t('configurator.summary.generate.activationGateFooter', { defaultValue: 'The registration flow already includes reCAPTCHA and email/SMS OTP verification, so the customer account is activated before the final offer is generated.' })}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col items-center justify-center space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center text-white shadow-soft relative overflow-hidden sm:p-6">
            <div className="w-full relative z-10 space-y-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                        <FileText className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight">{t('configurator.summary.generate.title', { defaultValue: 'Generate Offer' })}</h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-lg mx-auto leading-relaxed">
                            {t('configurator.summary.generate.subtitle', { defaultValue: 'Your configuration is ready. Generate the offer to save the backend totals and project details.' })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        className="h-11 min-w-[200px] px-6 text-xs sm:text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-xs active:scale-[0.99] transition-all group/btn sm:h-12 sm:min-w-[240px] disabled:opacity-50"
                        disabled={isCalculating}
                    >
                        <span className="flex items-center gap-2">
                            <span>{t('configurator.summary.generate.cta', { defaultValue: 'Generate Offer' })}</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </Button>

                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {t('configurator.summary.generate.footer', { defaultValue: 'Document generation may take a few seconds' })}
                    </p>
                </div>
            </div>
        </Card>
    );
}
