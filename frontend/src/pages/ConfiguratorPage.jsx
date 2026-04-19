import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { attachGuestDraftToAccount, fetchCalculation, fetchCurrentConfiguratorDraft, fetchPublicConfiguratorDraft, hydrateConfigurator, setStep, syncConfiguratorDraft, syncGuestConfiguratorDraft } from '@/features/configurator/configuratorSlice';
import { fetchPublicMasterData } from '@/features/admin/adminSlice';
import {
    ChevronRight, ChevronLeft, Check, Layout, Star, Settings,
    FileText, Zap, Save, ShieldCheck, Activity, Monitor, Palette,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge, AnimatedPageWrapper } from '@/components/common/UIComponents';

import { useTranslation } from 'react-i18next';
import { buildStoredConfiguratorSnapshot, clearGuestSessionId, clearStoredConfiguratorSnapshot, getOrCreateGuestSessionId, loadStoredConfiguratorSnapshot, saveStoredConfiguratorSnapshot } from '@/utils/configuratorDraftStorage';

import ProjectDefinitionStep from '@/components/configurator/ProjectDefinitionStep';
import RoomsLevelsStep from '@/components/configurator/RoomsLevelsStep';
import FunctionsStep from '@/components/configurator/FunctionsStep';
import RangeSelectionStep from '@/components/configurator/RangeSelectionStep';
import ColorSelectionStep from '@/components/configurator/ColorSelectionStep';
import ServicesStep from '@/components/configurator/ServicesStep';
import SummaryStep from '@/components/configurator/SummaryStep';
import GenerateOfferStep from '@/components/configurator/GenerateOfferStep';
import OfferSuccessScreen from '@/components/configurator/offer/OfferSuccessScreen';

function validateProjectStep(projectInfo = {}) {
    const errors = {};
    if (!String(projectInfo.name || '').trim()) errors.name = 'Project name is required';
    if (!String(projectInfo.buildingType || '').trim()) errors.buildingType = 'Building type is required';

    const levelsCount = parseInt(projectInfo.levelsCount, 10);
    if (!Number.isFinite(levelsCount) || levelsCount < 1) errors.levelsCount = 'Levels count must be at least 1';

    const area = Number(projectInfo.area);
    if (!Number.isFinite(area) || area <= 0) errors.area = 'Built-up area must be greater than 0';

    if (!String(projectInfo.projectComplexity || '').trim()) errors.projectComplexity = 'Project complexity is required';

    const multiplicationIndex = Number(projectInfo.projectMultiplicationIndex);
    if (!Number.isFinite(multiplicationIndex) || multiplicationIndex < 1) {
        errors.projectMultiplicationIndex = 'Multiplication index must be at least 1';
    }

    return errors;
}

function hasMeaningfulConfiguratorProgress(configuratorState = {}) {
    const projectInfo = configuratorState.projectInfo || {};
    const levels = Array.isArray(configuratorState.levels) ? configuratorState.levels : [];

    return Boolean(
        String(projectInfo.name || '').trim() ||
        String(projectInfo.buildingType || '').trim() ||
        levels.some((level) => Array.isArray(level.rooms) && level.rooms.length > 0) ||
        (Array.isArray(configuratorState.services) && configuratorState.services.length > 0) ||
        configuratorState.range ||
        configuratorState.color ||
        String(configuratorState.customerComments || '').trim()
    );
}

export default function ConfiguratorPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const configuratorState = useSelector((state) => state.configurator);
    const adminState = useSelector((state) => state.admin);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { currentStep } = configuratorState;
    const [projectValidationErrors, setProjectValidationErrors] = useState({});
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [hasBootstrappedDraft, setHasBootstrappedDraft] = useState(false);
    const hasResolvedInitialDraftRef = useRef(false);
    const stepContentRef = useRef(null);
    const masterDataStatus = adminState.masterDataStatus || {};
    const masterDataError = adminState.error;

    const requiredKeys = ['building-types', 'room-types', 'smart-functions', 'product-ranges', 'colors', 'services'];
    const optionalContentKeys = ['offer-conditions', 'disclaimers'];
    const isReady = requiredKeys.every((k) => masterDataStatus[k] === 'succeeded' || (k === 'building-types' && (adminState.buildingTypes || []).length));
    const isLoading = requiredKeys.some((k) => masterDataStatus[k] === 'loading');
    const isFailed = requiredKeys.some((k) => masterDataStatus[k] === 'failed');

    useEffect(() => {
        const returnStep = location.state?.returnStep;
        if (returnStep != null && typeof returnStep === 'number') {
            dispatch(setStep(returnStep));
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state?.returnStep, location.pathname, dispatch, navigate]);

    useEffect(() => {
        if (!isAuthenticated && currentStep > 7) {
            dispatch(setStep(7));
        }
    }, [currentStep, dispatch, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        dispatch(attachGuestDraftToAccount())
            .unwrap()
            .then((draft) => {
                if (draft?.snapshot) {
                    dispatch(hydrateConfigurator(draft.snapshot));
                    clearGuestSessionId();
                }
            })
            .catch(() => {
                // Ignore attach failures and keep the current local snapshot.
            });
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        if (!isReady) return;
        if (currentStep >= 8) return;

        const hasAnyFunctions = (configuratorState.levels || []).some((l) =>
            (l.rooms || []).some((r) => Array.isArray(r.functions) && r.functions.some((fn) => Number(fn?.quantity || 0) > 0))
        );
        if (!configuratorState.range || !hasAnyFunctions) return;

        const timer = setTimeout(() => {
            dispatch(fetchCalculation());
        }, 400);

        return () => clearTimeout(timer);
    }, [
        dispatch,
        isReady,
        currentStep,
        configuratorState.range,
        configuratorState.color,
        configuratorState.services,
        configuratorState.levels,
        configuratorState.projectInfo?.projectMultiplicationIndex,
    ]);

    useEffect(() => {
        [...requiredKeys, ...optionalContentKeys].forEach((key) => {
            dispatch(fetchPublicMasterData(key));
        });
    }, [dispatch, i18n.resolvedLanguage]);

    useEffect(() => {
        if (!Object.keys(projectValidationErrors).length) return;
        const nextErrors = validateProjectStep(configuratorState.projectInfo);
        if (JSON.stringify(nextErrors) !== JSON.stringify(projectValidationErrors)) {
            setProjectValidationErrors(nextErrors);
        }
    }, [configuratorState.projectInfo, projectValidationErrors]);

    useEffect(() => {
        if (hasResolvedInitialDraftRef.current) return;
        hasResolvedInitialDraftRef.current = true;

        const localDraft = loadStoredConfiguratorSnapshot();
        if (!hasMeaningfulConfiguratorProgress(configuratorState) && localDraft) {
            dispatch(hydrateConfigurator(localDraft));
        }

        const finalizeBootstrap = () => setHasBootstrappedDraft(true);

        if (!isAuthenticated) {
            dispatch(fetchPublicConfiguratorDraft())
                .unwrap()
                .then((draft) => {
                    if (!draft?.snapshot) return;
                    const localTs = Date.parse(localDraft?.savedAt || '');
                    const serverTs = Date.parse(draft.updatedAt || draft.lastActivityAt || '');
                    const shouldUseServer = !localDraft || (Number.isFinite(serverTs) && (!Number.isFinite(localTs) || serverTs >= localTs));
                    if (shouldUseServer) {
                        dispatch(hydrateConfigurator({ ...draft.snapshot, currentStep: draft.lastStep || draft.snapshot?.currentStep || 1 }));
                    }
                })
                .catch(() => {
                    // Keep the current in-memory or local state if restore fails.
                })
                .finally(finalizeBootstrap);
            return;
        }

        dispatch(fetchCurrentConfiguratorDraft())
            .unwrap()
            .then((draft) => {
                if (!draft?.snapshot) return;

                const localTs = Date.parse(localDraft?.savedAt || '');
                const serverTs = Date.parse(draft.updatedAt || draft.lastActivityAt || '');
                const shouldUseServer = !localDraft || (Number.isFinite(serverTs) && (!Number.isFinite(localTs) || serverTs >= localTs));

                if (shouldUseServer) {
                    dispatch(hydrateConfigurator({ ...draft.snapshot, currentStep: draft.lastStep || draft.snapshot?.currentStep || 1 }));
                }
            })
            .catch(() => {
                // Keep the current in-memory or local state if restore fails.
            })
            .finally(finalizeBootstrap);
    }, [configuratorState, dispatch, isAuthenticated]);

    useEffect(() => {
        if (!hasBootstrappedDraft) return;
        if (currentStep >= 9) return;

        if (!hasMeaningfulConfiguratorProgress(configuratorState)) {
            clearStoredConfiguratorSnapshot({ keepGuestSession: true });
            return;
        }

        const timer = setTimeout(() => {
            const snapshot = buildStoredConfiguratorSnapshot({
                ...configuratorState,
                currentStep,
                language: i18n.resolvedLanguage,
                guestSessionId: getOrCreateGuestSessionId(),
            });
            saveStoredConfiguratorSnapshot(snapshot);
            if (isAuthenticated) {
                dispatch(syncConfiguratorDraft());
            } else {
                dispatch(syncGuestConfiguratorDraft());
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [configuratorState, currentStep, dispatch, hasBootstrappedDraft, i18n.resolvedLanguage, isAuthenticated]);

    const steps = [
        { id: 1, name: t('configurator.steps.project'), icon: FileText, component: ProjectDefinitionStep },
        { id: 2, name: t('configurator.steps.rooms'), icon: Layout, component: RoomsLevelsStep },
        { id: 3, name: t('configurator.steps.functions'), icon: Zap, component: FunctionsStep },
        { id: 4, name: t('configurator.steps.productRange'), icon: Star, component: RangeSelectionStep },
        { id: 5, name: t('configurator.steps.color'), icon: Palette, component: ColorSelectionStep },
        { id: 6, name: t('configurator.steps.services'), icon: Settings, component: ServicesStep },
        { id: 7, name: t('configurator.steps.summary'), icon: Monitor, component: SummaryStep },
        { id: 8, name: t('configurator.steps.generating'), icon: Activity, component: GenerateOfferStep },
        { id: 9, name: t('configurator.steps.offerReady'), icon: ShieldCheck, component: OfferSuccessScreen },
    ];

    const CurrentStepComponent = steps.find((s) => s.id === currentStep)?.component || ProjectDefinitionStep;

    const hasAnyRooms = (configuratorState.levels || []).some(
        (l) => Array.isArray(l.rooms) && l.rooms.length > 0
    );
    const hasAnyFunctions = (configuratorState.levels || []).some((l) =>
        (l.rooms || []).some((r) =>
            Array.isArray(r.functions) && r.functions.some((fn) => Number(fn?.quantity || 0) > 0)
        )
    );

    const scrollToStepContent = () => {
        requestAnimationFrame(() => {
            const target = stepContentRef.current;
            if (!target) return;

            const top = target.getBoundingClientRect().top + window.scrollY - 24;
            window.scrollTo({
                top: Math.max(top, 0),
                behavior: 'smooth',
            });
        });
    };

    const advanceToStep = (targetStep) => {
        dispatch(setStep(targetStep));
        scrollToStepContent();
    };

    const handleNext = () => {
        const { projectInfo, range, color } = configuratorState;

        if (currentStep === 1) {
            const errors = validateProjectStep(projectInfo);
            setProjectValidationErrors(errors);
            if (Object.keys(errors).length > 0) return;
        }

        if (currentStep === 2 && !hasAnyRooms) return;
        if (currentStep === 3 && !hasAnyFunctions) return;
        if (currentStep === 4 && !range) return;
        if (currentStep === 5 && !color) return;

        if (currentStep === 6) {
            advanceToStep(7);
            return;
        }

        if (currentStep === 7) {
            if (!isAuthenticated) {
                const activationTarget = typeof document !== 'undefined'
                    ? document.getElementById('summary-account-activation')
                    : null;

                if (activationTarget) {
                    activationTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    scrollToStepContent();
                }
                return;
            }

            advanceToStep(8);
            return;
        }

        if (currentStep < steps.length) {
            advanceToStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            advanceToStep(currentStep - 1);
        }
    };

    const handleSaveDraft = async () => {
        if (!hasMeaningfulConfiguratorProgress(configuratorState)) return;
        setIsSavingDraft(true);
        try {
            const snapshot = buildStoredConfiguratorSnapshot({
                ...configuratorState,
                currentStep,
                language: i18n.resolvedLanguage,
                guestSessionId: getOrCreateGuestSessionId(),
            });
            saveStoredConfiguratorSnapshot(snapshot);
            if (isAuthenticated) {
                await dispatch(syncConfiguratorDraft()).unwrap();
            } else {
                await dispatch(syncGuestConfiguratorDraft()).unwrap();
            }
        } finally {
            setIsSavingDraft(false);
        }
    };

    const calculation = configuratorState.calculation;
    const hasBackendTotal = calculation != null && typeof calculation.grandTotal === 'number';
    const totalPrice = hasBackendTotal ? calculation.grandTotal : null;
    const noCompatibleProducts = Boolean(calculation?.noCompatibleProducts);
    const calcError = configuratorState.calcError;
    const isComplete = currentStep === steps.length;
    const progressPct = ((currentStep - 1) / (steps.length - 1)) * 100;
    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const primaryActionLabel = currentStep === 6
        ? t('configurator.reviewSummary')
        : currentStep === 7
            ? isAuthenticated
                ? t('configurator.generateFinalOffer')
                : t('configurator.activateAccountToContinue', { defaultValue: 'Activate Account to Continue' })
            : t('configurator.continue');
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    const bottomActionBar = (
        <div className="fixed inset-x-0 bottom-0 z-[999] border-t border-white/8 bg-[#121212]/95 px-4 pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_28px_rgba(0,0,0,0.35)] backdrop-blur-2xl [transform:translateZ(0)] transition-none sm:px-6 lg:px-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-300">
                        <div className="h-2 w-2 rounded-full bg-primary-300" />
                        {t('configurator.realtimeValuation')}
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-200">{t('configurator.estimatedTotal')}</p>
                        <p className="mt-1 font-heading text-3xl font-semibold leading-none text-white">
                            {totalPrice == null ? '--' : formatCurrency(totalPrice)}
                        </p>
                        {calcError ? (
                            <p className="mt-1 text-xs text-amber-200" title={calcError}>{calcError}</p>
                        ) : null}
                        {noCompatibleProducts && !calcError ? (
                            <p className="mt-1 text-xs text-amber-200">{t('configurator.noCompatibleProducts')}</p>
                        ) : null}
                    </div>
                </div>

                <div className="flex w-full items-center gap-3 sm:w-auto">
                    <Button
                        variant="secondary"
                        size="lg"
                        className="flex-1 gap-2 sm:flex-none"
                        onClick={handleBack}
                        disabled={currentStep === 1 || currentStep >= 8}
                    >
                        <ChevronLeft className="h-4.5 w-4.5" />
                        {t('configurator.goBack')}
                    </Button>
                    <Button
                        size="lg"
                        className="flex-1 gap-2 sm:flex-none"
                        onClick={handleNext}
                        disabled={currentStep >= 8}
                    >
                        {primaryActionLabel}
                        <ChevronRight className="h-4.5 w-4.5" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <AnimatedPageWrapper className="min-h-screen overflow-x-hidden px-4 pb-40 pt-6 text-textPrimary sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                {!isReady && (isLoading || isFailed) ? (
                    <Card className="rounded-[2rem] p-8 sm:p-10">
                        <div className="space-y-4 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-300">
                                {t('configurator.loadingMasterData')}
                            </p>
                            {isFailed ? (
                                <>
                                    <p className="text-sm font-medium text-textPrimary">
                                        {masterDataError || 'Failed to load required master data.'}
                                    </p>
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={() => requiredKeys.forEach((k) => dispatch(fetchPublicMasterData(k)))}
                                        >
                                            {t('configurator.retry')}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-textSecondary">{t('configurator.preparingOptions')}</p>
                            )}
                        </div>
                    </Card>
                ) : null}

                <div className="hero-frame overflow-hidden rounded-[2.3rem] px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
                    <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-4">
                            <Badge variant={isComplete ? 'success' : 'info'} className="gap-2 px-3.5 py-1.5">
                                {isComplete ? <ShieldCheck className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                                {isComplete ? t('configurator.badgeComplete') : t('configurator.badgeActive')}
                            </Badge>
                            <div className="space-y-3">
                                <h1 className="font-heading text-5xl font-semibold leading-none text-textPrimary sm:text-6xl">
                                    {t('configurator.title')}
                                </h1>
                                <p className="max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base">
                                    {isComplete ? t('configurator.completeSubtitle') : t('configurator.activeSubtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                            <button
                                className="premium-card-muted flex items-center gap-3 rounded-full px-4 py-3 text-left transition-all hover:border-primary-500/18"
                                onClick={handleSaveDraft}
                                disabled={isSavingDraft}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-[#1d1d1d] text-primary-300">
                                    <Save className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.saveDraft')}</p>
                                    <p className="text-sm font-medium text-textPrimary">{isSavingDraft ? `${t('configurator.saveDraft')}...` : t('configurator.module')}</p>
                                </div>
                            </button>

                            <div className="premium-card-muted rounded-[1.6rem] px-5 py-4 text-right">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.module')}</p>
                                <p className="mt-1 font-heading text-4xl font-semibold leading-none text-textPrimary">
                                    {String(Math.min(currentStep, 8)).padStart(2, '0')}
                                    <span className="mx-1 text-xl text-textSecondary">/</span>
                                    08
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="rounded-[2rem] p-5 sm:p-6 lg:p-7">
                    <div className="mb-7 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                            <span>{t('configurator.workflowProgress')}</span>
                            <span>{Math.round(progressPct)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                            <div
                                className="h-full rounded-full bg-gradient-brand transition-all duration-1000 ease-out"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
                        {steps.filter((s) => s.id !== 8).map((step) => {
                            const Icon = step.icon;
                            const isCompleted = currentStep > step.id;
                            const isActive = currentStep === step.id || (step.id === 9 && currentStep === 8);

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => isCompleted && advanceToStep(step.id)}
                                    className="group flex flex-col items-center gap-3 text-center"
                                    style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                                >
                                    <div className={clsx(
                                        'flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300',
                                        isCompleted
                                            ? 'border-primary-500/24 bg-primary-500/16 text-primary-200'
                                            : isActive
                                                ? 'border-primary-500/35 bg-primary-500/12 text-primary-300 shadow-soft'
                                                : 'border-white/10 bg-white/5 text-textSecondary',
                                    )}>
                                        {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </div>
                                    <span className={clsx(
                                        'text-[10px] font-semibold uppercase tracking-[0.18em]',
                                        isActive ? 'text-primary-200' : isCompleted ? 'text-textPrimary' : 'text-textSecondary',
                                    )}>
                                        {step.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Card>

                <div ref={stepContentRef} className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="w-full"
                        >
                            {isReady ? (
                                <CurrentStepComponent
                                    validationErrors={currentStep === 1 ? projectValidationErrors : {}}
                                />
                            ) : null}
                        </motion.div>
                    </AnimatePresence>
                </div>
                </div>
            </AnimatedPageWrapper>
            {typeof document !== 'undefined' ? createPortal(bottomActionBar, document.body) : null}
        </>
    );
}
