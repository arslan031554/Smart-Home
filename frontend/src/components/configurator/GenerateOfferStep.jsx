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
        configurator.color ||
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
            colorId: configurator.color ?? null,
            serviceIds: Array.isArray(configurator.services) ? configurator.services : [],
            customerComments: configurator.customerComments || null,
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
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-6 py-4 animate-fade-in sm:space-y-8 sm:py-6">
            <div className="space-y-5 text-center">
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary-500/12 blur-3xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow sm:h-28 sm:w-28">
                        <Activity className="h-12 w-12 animate-pulse" />
                    </div>
                </div>
                <SectionTitle
                    title={t('configurator.generateOffer.title')}
                    subtitle={t('configurator.generateOffer.subtitle')}
                    align="center"
                />
            </div>

            {genError ? (
                <div className="w-full space-y-4">
                    <Alert variant="error">{genError}</Alert>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            className="gap-2"
                            onClick={handleRetry}
                        >
                            <RefreshCcw className="h-4 w-4" />
                            {t('configurator.retry', { defaultValue: 'Retry Offer Generation' })}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            className="gap-2"
                            onClick={handleGoBackToSummary}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('configurator.goBack', { defaultValue: 'Back to Summary' })}
                        </Button>
                    </div>
                </div>
            ) : null}

            <Card className="w-full rounded-[1.25rem] p-5 sm:rounded-[1.5rem] sm:p-7">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                            <span>{t('configurator.generateOffer.status')}</span>
                            <span>{Math.floor(visibleProgress)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-gradient-brand transition-all duration-300" style={{ width: `${visibleProgress}%` }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.generateOffer.status')}</p>
                                <p className="mt-1 text-lg font-semibold text-textPrimary">{visibleCurrentPhase}</p>
                            </div>
                        </div>
                        <Badge variant="info">{isGenerating ? 'Processing' : 'Queued'}</Badge>
                    </div>

                    <div className="flex justify-center border-t border-white/8 pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            className="w-full gap-2 sm:w-auto"
                            onClick={handleStartNewConfigurator}
                        >
                            <RotateCcw className="h-4.5 w-4.5" />
                            {t('configurator.generateOffer.startNewConfigurator', { defaultValue: 'Start New Configurator' })}
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {systemNodes.map((node) => (
                            <div
                                key={node.name}
                                className={clsx(
                                    'rounded-[1.6rem] border p-5 transition-all duration-300',
                                    node.status === 'Active'
                                        ? 'border-primary-500/20 bg-primary-500/10 text-textPrimary'
                                        : 'border-white/8 bg-white/5 text-textSecondary',
                                )}
                            >
                                <div className={clsx(
                                    'mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border',
                                    node.status === 'Active' ? 'border-primary-500/18 bg-primary-500/12 text-primary-300' : 'border-white/8 bg-[#1d1d1d]',
                                )}>
                                    <node.icon className="h-4.5 w-4.5" />
                                </div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.generateOffer.nodeStep')}</p>
                                <p className="mt-2 text-base font-semibold text-textPrimary">{node.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {showActivationPrompt ? (
                <Card className="w-full rounded-[1.25rem] p-5 text-center sm:rounded-[1.5rem] sm:p-7">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow sm:h-24 sm:w-24">
                        <Fingerprint className="h-10 w-10" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-heading text-4xl font-semibold text-textPrimary">{t('configurator.generateOffer.activationTitle')}</h3>
                        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-textSecondary">
                            {t('configurator.generateOffer.activationBody', { defaultValue: 'Create or log into the real customer account to continue. The registration flow uses reCAPTCHA plus email or SMS OTP verification, and your saved guest steps will be restored after activation.' })}
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <Button
                            variant="primary"
                            size="lg"
                            className="gap-2"
                            onClick={() => {
                                saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({ ...configurator, currentStep: 6, guestSessionId: getOrCreateGuestSessionId() }));
                                navigate('/auth/register', { state: { returnTo: '/configurator', returnStep: 6 } });
                            }}
                        >
                            <UserPlus className="h-4.5 w-4.5" />
                            {t('configurator.generateOffer.createAccount')}
                            <ArrowRight className="h-4.5 w-4.5" />
                        </Button>

                        <Button
                            variant="secondary"
                            size="lg"
                            className="gap-2"
                            onClick={() => {
                                saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({ ...configurator, currentStep: 6, guestSessionId: getOrCreateGuestSessionId() }));
                                navigate('/auth/login', { state: { returnTo: '/configurator', returnStep: 6 } });
                            }}
                        >
                            <LogIn className="h-4.5 w-4.5" />
                            {t('configurator.generateOffer.logIn')}
                        </Button>
                    </div>

                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            className="mx-auto gap-2"
                            onClick={handleStartNewConfigurator}
                        >
                            <RotateCcw className="h-4.5 w-4.5" />
                            {t('configurator.generateOffer.startNewConfigurator', { defaultValue: 'Start New Configurator' })}
                        </Button>
                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                        <ShieldAlert className="h-4 w-4 text-primary-300" />
                        {t('configurator.generateOffer.secureSaved')}
                    </div>
                </Card>
            ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm text-textSecondary">
                    <Server className="h-4.5 w-4.5 text-primary-300" />
                    {t('configurator.generateOffer.secureConnection')}
                </div>
            )}
        </div>
    );
}
