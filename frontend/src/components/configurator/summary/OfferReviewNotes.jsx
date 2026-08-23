import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Modal } from '../../common/UIComponents';
import { ArrowRight, BookOpen, CheckCircle2, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { setStep, syncGuestConfiguratorDraft } from '../../../features/configurator/configuratorSlice';
import { buildStoredConfiguratorSnapshot, getOrCreateGuestSessionId, saveStoredConfiguratorSnapshot } from '../../../utils/configuratorDraftStorage';
import { useTranslation } from 'react-i18next';

export default function OfferReviewNotes() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const disclaimers = useSelector((state) => state.admin.disclaimers) || [];
    const configurator = useSelector((state) => state.configurator);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) triggerRef.current?.focus?.();
    }, [isOpen]);

    const fullText = disclaimers.map((disclaimer) => disclaimer.text).filter(Boolean).join('\n\n');
    const preview = fullText.length > 400 ? `${fullText.slice(0, 400).trim()}...` : fullText;
    const { isCalculating } = configurator;

    const persistGuestProgress = () => {
        const guestSessionId = getOrCreateGuestSessionId();
        saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({
            ...configurator,
            currentStep: 6,
            guestSessionId,
        }));
        dispatch(syncGuestConfiguratorDraft()).catch(() => null);
    };

    const handleAuthRedirect = (mode) => {
        persistGuestProgress();
        navigate(`/auth/${mode}`, {
            state: {
                returnTo: '/configurator',
                returnStep: 6,
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

    const activationItems = [
        {
            icon: CheckCircle2,
            label: t('configurator.summary.generate.personalDataLabel', { defaultValue: 'Personal data' }),
            helper: t('configurator.summary.generate.personalDataHelper', { defaultValue: 'Full name, email, and phone number are saved to the customer account.' }),
        },
        {
            icon: CheckCircle2,
            label: t('configurator.summary.generate.companyDataLabel', { defaultValue: 'Company data' }),
            helper: t('configurator.summary.generate.companyDataHelper', { defaultValue: 'Business information stays attached to the project and offer history.' }),
        },
        {
            icon: CheckCircle2,
            label: t('configurator.summary.generate.invoiceDataLabel', { defaultValue: 'Invoice data' }),
            helper: t('configurator.summary.generate.invoiceDataHelper', { defaultValue: 'Billing details are stored for later offer confirmation and invoicing.' }),
        },
        {
            icon: CheckCircle2,
            label: t('configurator.summary.generate.preferencesLabel', { defaultValue: 'Newsletter, terms, and cookies' }),
            helper: t('configurator.summary.generate.preferencesHelper', { defaultValue: 'Communication preference and policy consent are captured on the real account.' }),
        },
        {
            icon: CheckCircle2,
            label: t('configurator.summary.generate.verificationLabel', { defaultValue: 'Email or SMS verification' }),
            helper: t('configurator.summary.generate.verificationHelper', { defaultValue: 'The saved guest configuration is attached after the OTP verification step.' }),
        },
    ];

    const accountActivationBlock = !isAuthenticated ? (
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
                            <CheckCircle2 className="h-4 w-4" />
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
    ) : null;

    return (
        <>
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                            {t('configurator.summary.reviewBadge', { defaultValue: 'FINAL REVIEW' })}
                        </Badge>

                        <div className="space-y-2.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">
                                {t('configurator.summary.offerNotes.title', { defaultValue: 'IMPORTANT OFFER NOTES' })}
                            </h3>
                            <ul className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-textSecondary">
                                <li className="flex gap-2.5 items-start">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <span>
                                        {t('configurator.summary.offerNotes.point1', { defaultValue: 'The offer is based on the configuration and quantities shown in this summary.' })}
                                    </span>
                                </li>
                                <li className="flex gap-2.5 items-start">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <span>
                                        {t('configurator.summary.offerNotes.point2', { defaultValue: 'Final technical specifications remain subject to detailed project design and site validation.' })}
                                    </span>
                                </li>
                                <li className="flex gap-2.5 items-start">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <span>
                                        {t('configurator.summary.offerNotes.point3', { defaultValue: 'Items not included in the summary are outside the current calculated scope.' })}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {preview ? (
                            <p className="text-xs text-textSecondary whitespace-pre-line pt-2 border-t border-slate-100">
                                {preview}
                            </p>
                        ) : (
                            <p className="text-xs text-textSecondary italic pt-2 border-t border-slate-100">
                                {t('configurator.summary.offerNotes.noDisclaimer', { defaultValue: 'No disclaimer text is configured.' })}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 justify-end">
                        <Button
                            ref={triggerRef}
                            variant="outline"
                            size="sm"
                            disabled={!fullText}
                            onClick={() => setIsOpen(true)}
                            className="rounded-lg border-primary-500/40 text-primary-700 hover:bg-primary-50 text-xs font-semibold px-3 py-1.5"
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            {t('configurator.summary.disclaimer.readFull', { defaultValue: 'Read Full Disclaimer' })}
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="mt-4">
                {accountActivationBlock || (
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-[#0d2818] via-[#123821] to-[#0d2818] border border-emerald-800/40 shadow-soft sm:py-5 sm:px-6">
                        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs">
                                    <Check className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                                        {t('configurator.summary.generate.reviewLabel', { defaultValue: 'Project summary reviewed' })}
                                    </h4>
                                    <p className="text-xs sm:text-[13px] font-medium text-emerald-100/90 leading-relaxed">
                                        {t('configurator.summary.generate.reviewCopy', { defaultValue: 'All sections remain editable until the offer is generated.' })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isCalculating}
                                className="h-11 min-w-[170px] rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm px-6 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-primary-500/25 disabled:opacity-50"
                            >
                                {isCalculating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>{t('configurator.summary.financial.recalculating', { defaultValue: 'Recalculating...' })}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t('configurator.summary.generate.cta', { defaultValue: 'Generate Offer' })}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={t('configurator.summary.disclaimer.title', { defaultValue: 'Disclaimer' })}
                maxWidth="max-w-3xl"
                footer={<Button type="button" variant="ghost" className="rounded-lg" onClick={() => setIsOpen(false)}>{t('common.close', { defaultValue: 'Close' })}</Button>}
            >
                <div className="max-h-[65dvh] space-y-4 overflow-y-auto whitespace-pre-line rounded-xl bg-slate-50 p-4 text-xs sm:text-sm leading-relaxed text-textPrimary border border-slate-200">
                    {fullText}
                </div>
            </Modal>
        </>
    );
}

