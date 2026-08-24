import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearGeneratedOffer, generateOffer } from '../../features/offers/offersSlice';
import { setStep, hydrateConfigurator, resetConfigurator } from '../../features/configurator/configuratorSlice';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, Database, Globe, Zap, Loader2, UserPlus, LogIn, ArrowRight, ShieldAlert, Fingerprint, Server, RotateCcw, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Card, SectionTitle, Button, Alert, Badge } from '../common/UIComponents';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { buildStoredConfiguratorSnapshot, clearStoredConfiguratorSnapshot, getOrCreateGuestSessionId, loadStoredConfiguratorSnapshot, saveStoredConfiguratorSnapshot } from '@/utils/configuratorDraftStorage';

function hasMeaningfulOfferState(configurator = {}) {
    const projectInfo = configurator.projectInfo || {};
    const levels = Array.isArray(configurator.levels) ? configurator.levels : [];
    return Boolean(
        String(projectInfo.name || '').trim() ||
        String(projectInfo.buildingType || '').trim() ||
        configurator.range ||
        levels.some((level) => Array.isArray(level.rooms) && level.rooms.length > 0)
    );
}

export default function GenerateOfferStep() {
    const dispatch = useDispatch();
    const configurator = useSelector((state) => state.configurator);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { isGenerating, generationError } = useSelector((state) => state.offers);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [progress, setProgress] = useState(15);
    const [currentPhase, setCurrentPhase] = useState(t('configurator.generateOffer.title'));
    const [genError, setGenError] = useState(null);
    const showActivationPrompt = !isAuthenticated;
    const visibleProgress = showActivationPrompt ? 100 : progress;
    const visibleCurrentPhase = showActivationPrompt
        ? t('configurator.generateOffer.activationTitle', { defaultValue: 'Create account to finish' })
        : currentPhase;

    const hasHydratedRef = useRef(false);
    const hasSubmittedRef = useRef(false);
    const cancelledRef = useRef(false);

    useEffect(() => {
        if (hasHydratedRef.current) return;
        hasHydratedRef.current = true;
        if (!isAuthenticated) return;
        if (configurator.currentProjectId || configurator.currentOfferId || hasMeaningfulOfferState(configurator)) return;

        try {
            const snap = loadStoredConfiguratorSnapshot();
            if (snap) {
                dispatch(hydrateConfigurator(snap));
            }
        } catch {
            // ignore
        }
    }, [configurator, dispatch, isAuthenticated]);

    const generationPhases = useMemo(() => [
        { progress: 15, label: `${t('configurator.generateOffer.nodes.validation')}...` },
        { progress: 35, label: `${t('configurator.generateOffer.nodes.pricing')}...` },
        { progress: 60, label: `${t('configurator.generateOffer.nodes.devices')}...` },
        { progress: 80, label: `${t('configurator.generateOffer.nodes.services')}...` },
        { progress: 90, label: `${t('configurator.generateOffer.nodes.documentation')}...` },
        { progress: 100, label: t('configurator.generateOffer.summaryComplete', { defaultValue: '{{summary}} complete', summary: t('configurator.steps.summary') }) },
    ], [t]);

    const finalizeOffer = useCallback(async () => {
        if (cancelledRef.current || hasSubmittedRef.current || isGenerating) return;
        hasSubmittedRef.current = true;
        setGenError(null);

        const levels = Array.isArray(configurator.levels) && configurator.levels.length > 0
            ? configurator.levels
            : [{ id: 1, name: 'Ground Floor', rooms: [] }];

        const currentLang = (i18n?.resolvedLanguage || i18n?.language || 'en').startsWith('ro') ? 'ro' : 'en';

        const payload = {
            projectId: configurator.currentProjectId || null,
            projectInfo: configurator.projectInfo || {},
            levels,
            rangeId: configurator.range ?? null,
            serviceIds: Array.isArray(configurator.services) ? configurator.services : [],
            customerComments: configurator.customerComments || null,
            customerCommentsEn: configurator.customerCommentsEn ?? configurator.customerComments ?? '',
            customerCommentsRo: configurator.customerCommentsRo ?? '',
            offerId: configurator.currentOfferId || null,
            language: currentLang,
        };

        const resultAction = await dispatch(generateOffer(payload));
        if (cancelledRef.current) return;

        if (generateOffer.fulfilled.match(resultAction)) {
            setProgress(100);
            const createdOffer = resultAction.payload;
            const offerId = createdOffer?.id || null;

            // Save snapshot with created offerId
            const snapshot = buildStoredConfiguratorSnapshot({
                ...configurator,
                currentOfferId: offerId,
                currentStep: 8,
                guestSessionId: getOrCreateGuestSessionId(),
            });
            saveStoredConfiguratorSnapshot(snapshot);

            setTimeout(() => {
                dispatch(setStep(8));
            }, 500);
        } else {
            hasSubmittedRef.current = false;
            setGenError(resultAction.payload || generationError || 'Offer generation failed');
        }
    }, [configurator, dispatch, generationError, isGenerating, i18n]);

    // Main trigger effect
    useEffect(() => {
        if (!isAuthenticated) return;

        // Start after the effect has synchronized the authenticated render.
        const timer = window.setTimeout(() => finalizeOffer(), 0);
        return () => window.clearTimeout(timer);
    }, [isAuthenticated, finalizeOffer]);

    // Progress bar animation while processing
    useEffect(() => {
        if (!isGenerating) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                const next = prev + 5;
                const phase = generationPhases.find((p) => next <= p.progress) || generationPhases[generationPhases.length - 1];
                setCurrentPhase(phase.label);
                return next;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [isGenerating, generationPhases]);

    const handleRetry = useCallback(() => {
        hasSubmittedRef.current = false;
        cancelledRef.current = false;
        setProgress(15);
        finalizeOffer();
    }, [finalizeOffer]);

    const handleStartNewConfigurator = useCallback(() => {
        cancelledRef.current = true;
        hasSubmittedRef.current = false;
        clearStoredConfiguratorSnapshot({ keepGuestSession: true });
        dispatch(resetConfigurator());
        dispatch(clearGeneratedOffer());
        navigate('/configurator', { replace: true, state: { freshConfigurator: true } });
    }, [dispatch, navigate]);

    const handleGoBackToSummary = useCallback(() => {
        cancelledRef.current = true;
        hasSubmittedRef.current = false;
        dispatch(setStep(6));
    }, [dispatch]);

    const systemNodes = [
        { name: t('configurator.generateOffer.nodes.configuration'), icon: Cpu, status: visibleProgress > 20 ? 'Active' : 'Syncing' },
        { name: t('configurator.generateOffer.nodes.hardware'), icon: Database, status: visibleProgress > 45 ? 'Active' : 'Syncing' },
        { name: t('configurator.generateOffer.nodes.services'), icon: Globe, status: visibleProgress > 70 ? 'Active' : 'Syncing' },
        { name: t('configurator.generateOffer.nodes.documentation'), icon: Zap, status: visibleProgress > 90 ? 'Active' : 'Syncing' },
    ];

    return (
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-5 py-3 animate-fade-in sm:space-y-6 sm:py-5">
            <div className="space-y-3 text-center">
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary-500/10 blur-2xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700 shadow-soft sm:h-20 sm:w-20">
                        <Activity className="h-8 w-8 animate-pulse sm:h-10 sm:w-10" />
                    </div>
                </div>
                <SectionTitle
                    title={t('configurator.generateOffer.title')}
                    subtitle={t('configurator.generateOffer.subtitle')}
                    align="center"
                    className="mb-0"
                />
            </div>

            {genError ? (
                <div className="w-full space-y-3">
                    <Alert variant="error">{genError}</Alert>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="gap-1.5 rounded-xl"
                            onClick={handleRetry}
                        >
                            <RefreshCcw className="h-3.5 w-3.5" />
                            {t('configurator.retry', { defaultValue: 'Retry Offer Generation' })}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-1.5 rounded-xl"
                            onClick={handleGoBackToSummary}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            {t('configurator.goBack', { defaultValue: 'Back to Summary' })}
                        </Button>
                    </div>
                </div>
            ) : null}

            <Card className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-6">
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                            <span>{t('configurator.generateOffer.status')}</span>
                            <span>{Math.floor(visibleProgress)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${visibleProgress}%` }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">{t('configurator.generateOffer.status')}</p>
                                <p className="text-sm sm:text-base font-bold text-textPrimary">{visibleCurrentPhase}</p>
                            </div>
                        </div>
                        <Badge variant="info" className="self-start sm:self-auto text-[10px] font-bold">{isGenerating ? 'Processing' : 'Queued'}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                        {systemNodes.map((node) => (
                            <div
                                key={node.name}
                                className={clsx(
                                    'rounded-xl border p-3 transition-all duration-200',
                                    node.status === 'Active'
                                        ? 'border-primary-300 bg-primary-50/70 text-textPrimary shadow-xs'
                                        : 'border-slate-200 bg-slate-50/60 text-textSecondary',
                                )}
                            >
                                <div className={clsx(
                                    'mb-2 flex h-8 w-8 items-center justify-center rounded-lg border',
                                    node.status === 'Active' ? 'border-primary-200 bg-white text-primary-700 shadow-xs' : 'border-slate-200 bg-white text-slate-400',
                                )}>
                                    <node.icon className="h-3.5 w-3.5" />
                                </div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">{t('configurator.generateOffer.nodeStep')}</p>
                                <p className="mt-0.5 text-xs font-bold text-textPrimary truncate">{node.name}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center border-t border-slate-100 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="w-full gap-2 rounded-xl sm:w-auto"
                            onClick={handleStartNewConfigurator}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {t('configurator.generateOffer.startNewConfigurator', { defaultValue: 'Start New Configurator' })}
                        </Button>
                    </div>
                </div>
            </Card>

            {showActivationPrompt ? (
                <Card className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-soft sm:p-7">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs sm:h-16 sm:w-16">
                        <Fingerprint className="h-7 w-7" />
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="font-heading text-xl sm:text-2xl font-black text-textPrimary">{t('configurator.generateOffer.activationTitle')}</h3>
                        <p className="mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-textSecondary">
                            {t('configurator.generateOffer.activationBody', { defaultValue: 'Create or log into your customer account to finalize and store your proposal. Your configuration is already saved.' })}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-w-md mx-auto">
                        <Button
                            variant="primary"
                            size="md"
                            className="gap-2 rounded-xl font-bold"
                            onClick={() => {
                                saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({ ...configurator, currentStep: 6, guestSessionId: getOrCreateGuestSessionId() }));
                                navigate('/auth/register', { state: { returnTo: '/configurator', returnStep: 6 } });
                            }}
                        >
                            <UserPlus className="h-4 w-4" />
                            {t('configurator.generateOffer.createAccount')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="secondary"
                            size="md"
                            className="gap-2 rounded-xl font-bold"
                            onClick={() => {
                                saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({ ...configurator, currentStep: 6, guestSessionId: getOrCreateGuestSessionId() }));
                                navigate('/auth/login', { state: { returnTo: '/configurator', returnStep: 6 } });
                            }}
                        >
                            <LogIn className="h-4 w-4" />
                            {t('configurator.generateOffer.logIn')}
                        </Button>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                        <ShieldAlert className="h-3.5 w-3.5 text-primary-700" />
                        {t('configurator.generateOffer.secureSaved')}
                    </div>
                </Card>
            ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-textSecondary shadow-xs">
                    <Server className="h-3.5 w-3.5 text-primary-700" />
                    {t('configurator.generateOffer.secureConnection')}
                </div>
            )}
        </div>
    );
}
