import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { attachGuestDraftToAccount, clearConfiguratorCalculation, fetchCalculation, fetchCurrentConfiguratorDraft, fetchPublicConfiguratorDraft, hydrateConfigurator, resetConfigurator, setStep, syncConfiguratorDraft, syncGuestConfiguratorDraft } from '@/features/configurator/configuratorSlice';
import { clearGeneratedOffer } from '@/features/offers/offersSlice';
import { fetchPublicMasterData } from '@/features/admin/adminSlice';
import {
    ChevronRight, ChevronLeft, Check, Layout, Star, Settings,
    FileText, Zap, Save, ShieldCheck, Activity, Monitor, Palette, RotateCcw,
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
        String(configuratorState.customerComments || '').trim()
    );
}

function hasCalculationPrerequisites(configuratorState = {}) {
    const levels = Array.isArray(configuratorState.levels) ? configuratorState.levels : [];
    const hasAnyFunctions = levels.some((level) =>
        (level.rooms || []).some((room) =>
            Array.isArray(room.functions) && room.functions.some((fn) => Number(fn?.quantity || 0) > 0)
        )
    );

    return Boolean(configuratorState.range && hasAnyFunctions);
}
const REQUIRED_MASTER_DATA_KEYS = ['building-types', 'room-types', 'smart-functions', 'product-ranges', 'colors', 'services'];
const OPTIONAL_CONTENT_KEYS = ['offer-conditions', 'disclaimers'];

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
    const preserveLoadedWorkspaceRef = useRef(false);
    const processedFreshStartRef = useRef(false);
    const stepContentRef = useRef(null);
    const masterDataStatus = adminState.masterDataStatus || {};
    const masterDataError = adminState.error;

    const isReady = REQUIRED_MASTER_DATA_KEYS.every((k) => masterDataStatus[k] === 'succeeded' || (k === 'building-types' && (adminState.buildingTypes || []).length));
    const isLoading = REQUIRED_MASTER_DATA_KEYS.some((k) => masterDataStatus[k] === 'loading');
    const isFailed = REQUIRED_MASTER_DATA_KEYS.some((k) => masterDataStatus[k] === 'failed');
    const hasCalculationInputs = hasCalculationPrerequisites(configuratorState);


    useEffect(() => {
        if (location.state?.freshConfigurator !== true || processedFreshStartRef.current) return;
        processedFreshStartRef.current = true;
        hasResolvedInitialDraftRef.current = true;
        preserveLoadedWorkspaceRef.current = true;
        clearStoredConfiguratorSnapshot({ keepGuestSession: true });
        dispatch(resetConfigurator());
        setHasBootstrappedDraft(true);
        navigate(location.pathname, { replace: true, state: {} });
    }, [dispatch, location.pathname, location.state?.freshConfigurator, navigate]);

    useEffect(() => {
        if (location.state?.workspaceLoaded !== true || hasResolvedInitialDraftRef.current) return;
        hasResolvedInitialDraftRef.current = true;
        preserveLoadedWorkspaceRef.current = true;
        setHasBootstrappedDraft(true);
        navigate(location.pathname, { replace: true, state: {} });
    }, [location.pathname, location.state?.workspaceLoaded, navigate]);

    useEffect(() => {
        if (hasCalculationInputs || !configuratorState.calculation) return;
        dispatch(clearConfiguratorCalculation());
    }, [configuratorState.calculation, dispatch, hasCalculationInputs]);
    useEffect(() => {
        const returnStep = location.state?.returnStep;
        if (returnStep != null && typeof returnStep === 'number') {
            dispatch(setStep(returnStep));
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state?.returnStep, location.pathname, dispatch, navigate]);

    useEffect(() => {
        if (!isAuthenticated && currentStep > 6) {
            dispatch(setStep(6));
        }
    }, [currentStep, dispatch, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || location.state?.workspaceLoaded === true || preserveLoadedWorkspaceRef.current) return;
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
    }, [dispatch, isAuthenticated, location.state?.workspaceLoaded]);

    useEffect(() => {
        if (!isReady) return;
        if (currentStep >= 7) return;

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
        configuratorState.services,
        configuratorState.levels,
        configuratorState.projectInfo?.projectMultiplicationIndex,
    ]);

    useEffect(() => {
        [...REQUIRED_MASTER_DATA_KEYS, ...OPTIONAL_CONTENT_KEYS].forEach((key) => {
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
        if (currentStep >= 8) return;

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
        { id: 5, name: t('configurator.steps.services'), icon: Settings, component: ServicesStep },
        { id: 6, name: t('configurator.steps.summary'), icon: Monitor, component: SummaryStep },
        { id: 7, name: t('configurator.steps.generating'), icon: Activity, component: GenerateOfferStep },
        { id: 8, name: t('configurator.steps.offerReady'), icon: ShieldCheck, component: OfferSuccessScreen },
    ];

    const visibleSteps = steps.filter((step) => step.id !== 7);
    const visibleCurrentStepId = currentStep === 7 ? 8 : currentStep;
    const currentVisibleIndex = Math.max(0, visibleSteps.findIndex((step) => step.id === visibleCurrentStepId));
    const currentVisibleStep = visibleSteps[currentVisibleIndex] || visibleSteps[0];
    const CurrentStepComponent = steps.find((s) => s.id === currentStep)?.component || ProjectDefinitionStep;
    const currentDisplayStep = steps.find((s) => s.id === currentStep) || currentVisibleStep;

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
        const { projectInfo, range } = configuratorState;

        if (currentStep === 1) {
            const errors = validateProjectStep(projectInfo);
            setProjectValidationErrors(errors);
            if (Object.keys(errors).length > 0) return;
        }

        if (currentStep === 2 && !hasAnyRooms) return;
        if (currentStep === 3 && !hasAnyFunctions) return;
        if (currentStep === 4 && !range) return;

        if (currentStep === 5) {
            advanceToStep(6);
            return;
        }

        if (currentStep === 6) {
            if (!isAuthenticated) {
                const guestSessionId = getOrCreateGuestSessionId();
                saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({
                    ...configuratorState,
                    currentStep: 6,
                    guestSessionId,
                }));
                dispatch(syncGuestConfiguratorDraft()).catch(() => null);
                navigate('/auth/login', {
                    state: {
                        returnTo: '/configurator',
                        returnStep: 6,
                    },
                });
                return;
            }

            advanceToStep(7);
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

    const handleStartNewConfigurator = () => {
        clearStoredConfiguratorSnapshot({ keepGuestSession: true });
        dispatch(resetConfigurator());
        dispatch(clearGeneratedOffer());
        navigate('/configurator', { replace: true, state: { freshConfigurator: true } });
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
    const hasBackendTotal = hasCalculationInputs && calculation != null && typeof calculation.grandTotal === 'number';
    const totalPrice = hasBackendTotal ? calculation.grandTotal : null;
    const noCompatibleProducts = Boolean(calculation?.noCompatibleProducts);
    const calcError = configuratorState.calcError;
    const isComplete = currentStep === steps.length;
    const progressPct = currentStep === 7
        ? 92
        : (currentVisibleIndex / Math.max(visibleSteps.length - 1, 1)) * 100;
    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const primaryActionLabel = currentStep === 5
        ? t('configurator.reviewSummary')
        : currentStep === 6
            ? t('configurator.generateFinalOffer')
            : t('configurator.continue');
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    const renderStepButton = (step, index, isMobile = false) => {
        const Icon = step.icon;
        const isCompleted = visibleCurrentStepId > step.id;
        const isActive = visibleCurrentStepId === step.id;
        const displayIndex = index + 1;
        const statusLabel = isCompleted
            ? t('configurator.stepStatus.complete', { defaultValue: 'Complete' })
            : isActive
                ? t('configurator.stepStatus.current', { defaultValue: 'Current' })
                : t('configurator.stepStatus.upcoming', { defaultValue: 'Upcoming' });

        if (isMobile) {
            return (
                <button
                    key={step.id}
                    onClick={() => isCompleted && advanceToStep(step.id)}
                    aria-current={isActive ? 'step' : undefined}
                    className={clsx(
                        'group flex shrink-0 snap-center items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all duration-200',
                        isCompleted
                            ? 'border-primary-500/30 bg-primary-500/10 text-textPrimary hover:bg-primary-500/15 cursor-pointer'
                            : isActive
                                ? 'border-primary-600 bg-white text-textPrimary shadow-sm ring-1 ring-primary-500/30'
                                : 'border-slate-200/80 bg-white/70 text-textSecondary cursor-default'
                    )}
                >
                    <div className={clsx(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-all',
                        isCompleted
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : isActive
                                ? 'border-primary-500/40 bg-primary-50 text-primary-700'
                                : 'border-slate-200 bg-slate-50 text-slate-400'
                    )}>
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 pr-1">
                        <span className="block truncate text-xs font-bold text-textPrimary max-w-[110px]">
                            {step.name}
                        </span>
                        <span className={clsx(
                            'block text-[9px] font-bold uppercase tracking-wider',
                            isActive ? 'text-primary-700' : 'text-slate-400'
                        )}>
                            {String(displayIndex).padStart(2, '0')} • {statusLabel}
                        </span>
                    </div>
                </button>
            );
        }

        return (
            <button
                key={step.id}
                onClick={() => isCompleted && advanceToStep(step.id)}
                aria-current={isActive ? 'step' : undefined}
                className={clsx(
                    'group relative flex min-w-0 flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-300',
                    isCompleted
                        ? 'border-primary-500/25 bg-primary-500/8 text-textPrimary hover:-translate-y-0.5 hover:border-primary-500/40 hover:bg-primary-500/12 cursor-pointer'
                        : isActive
                            ? 'border-primary-600 bg-white text-textPrimary shadow-sm ring-1 ring-primary-500/30 cursor-default'
                            : 'border-slate-200/90 bg-white/80 text-textSecondary cursor-default'
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className={clsx(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
                        isCompleted
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : isActive
                                ? 'border-primary-500/30 bg-primary-50 text-primary-700 shadow-xs'
                                : 'border-slate-200 bg-slate-50 text-slate-400'
                    )}>
                        {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {String(displayIndex).padStart(2, '0')}/{String(visibleSteps.length).padStart(2, '0')}
                    </span>
                </div>

                <div className="mt-3 min-w-0">
                    <p className="truncate text-xs font-bold leading-tight text-textPrimary">
                        {step.name}
                    </p>
                    <p className={clsx(
                        'mt-1 text-[10px] font-black uppercase tracking-[0.14em]',
                        isActive ? 'text-primary-700 font-bold' : 'text-slate-400 font-medium'
                    )}>
                        {statusLabel}
                    </p>
                </div>
            </button>
        );
    };

    const bottomActionBar = (
        <div className="fixed inset-x-0 bottom-0 z-[999] border-t border-slate-200/90 bg-white/95 px-3 py-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-[0_-12px_36px_rgba(0,0,0,0.08)] backdrop-blur-2xl [transform:translateZ(0)] transition-none sm:px-6 sm:py-3.5 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {/* Price and Live Valuation indicator */}
                <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-5">
                    <div className="flex items-center gap-2 rounded-lg border border-primary-200/80 bg-primary-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
                        <span className="truncate max-w-[130px] sm:max-w-none">{t('configurator.realtimeValuation')}</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary sm:inline hidden">
                            {t('configurator.estimatedTotal')}:
                        </span>
                        <span className="font-heading text-lg font-extrabold leading-none text-textPrimary sm:text-2xl">
                            {totalPrice == null ? '--' : formatCurrency(totalPrice)}
                        </span>
                    </div>
                </div>

                {calcError ? (
                    <p className="text-[11px] font-medium text-amber-700 truncate" title={calcError}>{calcError}</p>
                ) : null}
                {noCompatibleProducts && !calcError ? (
                    <p className="text-[11px] font-medium text-amber-700 truncate">{t('configurator.noCompatibleProducts')}</p>
                ) : null}

                {/* Action Buttons */}
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Button
                        variant="secondary"
                        size="md"
                        className="h-10 px-2.5 sm:px-3.5 rounded-xl shrink-0 gap-1 text-[11px]"
                        onClick={handleStartNewConfigurator}
                        title={t('configurator.generateOffer.startNewConfigurator', { defaultValue: 'Start New Configurator' })}
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="hidden md:inline">{t('configurator.generateOffer.startNewConfigurator', { defaultValue: 'Start New' })}</span>
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        className="h-10 px-3 sm:px-4 rounded-xl shrink-0 gap-1.5 text-[11px]"
                        onClick={handleBack}
                        disabled={currentStep === 1 || currentStep >= 8}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>{t('configurator.goBack')}</span>
                    </Button>
                    <Button
                        size="md"
                        className="h-10 flex-1 sm:flex-none sm:min-w-[160px] rounded-xl gap-1.5 text-xs font-bold"
                        onClick={handleNext}
                        disabled={currentStep >= 8}
                    >
                        <span>{primaryActionLabel}</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <AnimatedPageWrapper className="configurator-theme min-h-screen overflow-x-hidden pb-28 text-textPrimary">
                <section className="w-full px-2.5 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                        {!isReady && (isLoading || isFailed) ? (
                            <Card className="rounded-2xl p-6 text-center">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary-700">
                                        {t('configurator.loadingMasterData')}
                                    </p>
                                    {isFailed ? (
                                        <>
                                            <p className="text-sm font-medium text-textPrimary">
                                                {masterDataError || 'Failed to load required master data.'}
                                            </p>
                                            <div className="flex justify-center pt-2">
                                                <Button
                                                    onClick={() => REQUIRED_MASTER_DATA_KEYS.forEach((k) => dispatch(fetchPublicMasterData(k)))}
                                                >
                                                    {t('configurator.retry')}
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-textSecondary">{t('configurator.preparingOptions')}</p>
                                    )}
                                </div>
                            </Card>
                        ) : null}

                        {/* Top Hero Banner */}
                        <div className="relative overflow-hidden rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-[#061b10] via-[#0d2e1c] to-[#061b10] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.16)] sm:p-6 lg:p-7">
                            {/* Ambient dynamic background lighting */}
                            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                            <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />
                            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

                            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                            {isComplete ? (
                                                <ShieldCheck className="h-3 w-3 text-emerald-300" />
                                            ) : (
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                                            )}
                                            {isComplete ? t('configurator.badgeComplete', { defaultValue: 'Configuration Complete' }) : t('configurator.badgeActive', { defaultValue: 'System Configuration Active' })}
                                        </div>
                                        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                                            {currentDisplayStep?.name}
                                        </span>
                                    </div>
                                    <h1 className="font-heading text-2xl font-black uppercase tracking-tight text-white sm:text-3xl lg:text-4xl drop-shadow-sm">
                                        {t('configurator.title', { defaultValue: 'Smart Building Configurator' })}
                                    </h1>
                                    <p className="max-w-2xl text-xs font-medium leading-relaxed text-emerald-100/85 sm:text-sm">
                                        {isComplete ? t('configurator.completeSubtitle', { defaultValue: 'Your smart configuration is ready for formal offer generation.' }) : t('configurator.activeSubtitle', { defaultValue: 'Define and customise your smart environment through our structured planning process.' })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                                    <button
                                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-[#061e12]/80 px-3.5 py-2 text-xs font-bold text-white shadow-xs backdrop-blur-md transition-all hover:border-emerald-400 hover:bg-[#0a2e1c] hover:shadow-[0_0_12px_rgba(96,185,63,0.25)] disabled:opacity-50 cursor-pointer active:scale-95"
                                        onClick={handleSaveDraft}
                                        disabled={isSavingDraft}
                                    >
                                        <Save className="h-3.5 w-3.5 text-emerald-400" />
                                        <span>{isSavingDraft ? `${t('configurator.saveDraft', { defaultValue: 'Saving' })}...` : t('configurator.saveDraft', { defaultValue: 'Save Draft' })}</span>
                                    </button>

                                    {/* High-Contrast Luminous Workflow Progress Box */}
                                    <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-[#0a2c1b] to-[#04160d] px-3.5 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.3)] ring-1 ring-white/10 min-w-[130px]">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-300/90">
                                                {t('configurator.workflowProgress', { defaultValue: 'Workflow Progress' })}
                                            </span>
                                            <span className="font-heading text-sm font-black text-white">
                                                <span className="text-emerald-400">{String(currentVisibleIndex + 1).padStart(2, '0')}</span>
                                                <span className="text-emerald-100/50 text-xs">/{String(visibleSteps.length).padStart(2, '0')}</span>
                                            </span>
                                        </div>
                                        {/* Mini progress bar */}
                                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-emerald-950/80 border border-emerald-800/50">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#60b93f] transition-all duration-500 shadow-[0_0_8px_rgba(96,185,63,0.7)]"
                                                style={{ width: `${Math.max(12, ((currentVisibleIndex + 1) / visibleSteps.length) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Responsive Stepper Navigation */}
                        <Card className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-soft sm:p-4">
                            {/* Progress bar line */}
                            <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-textSecondary sm:mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary-700 font-extrabold">{t('configurator.stepStatus.current', { defaultValue: 'Current' })}:</span>
                                    <span className="text-textPrimary">{currentDisplayStep?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>{Math.round(progressPct)}%</span>
                                    <div className="h-1.5 w-20 sm:w-32 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-gradient-brand transition-all duration-500 ease-out"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Step Scroller */}
                            <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
                                {visibleSteps.map((step, index) => renderStepButton(step, index, true))}
                            </div>

                            {/* Desktop 7-step Pipeline */}
                            <div className="hidden gap-2.5 lg:grid lg:grid-cols-7">
                                {visibleSteps.map((step, index) => renderStepButton(step, index, false))}
                            </div>
                        </Card>

                        {/* Active Step Content Container */}
                        <div ref={stepContentRef} className="relative min-h-[460px] rounded-2xl border border-slate-200/70 bg-[#f7f8f2] p-2.5 sm:p-4 lg:p-6 shadow-xs">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
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
                </section>
            </AnimatedPageWrapper>
            {currentStep < 8 && typeof document !== 'undefined' ? createPortal(bottomActionBar, document.body) : null}
        </>
    );
}
