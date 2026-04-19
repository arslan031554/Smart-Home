import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateOffer } from '../../features/offers/offersSlice';
import { setStep, hydrateConfigurator } from '../../features/configurator/configuratorSlice';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, Database, Globe, Zap, Loader2, UserPlus, LogIn, ArrowRight, ShieldAlert, Sparkles, Fingerprint, Server } from 'lucide-react';
import { Card, SectionTitle, Button, Alert, Badge } from '../common/UIComponents';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { buildStoredConfiguratorSnapshot, clearStoredConfiguratorSnapshot, getOrCreateGuestSessionId, loadStoredConfiguratorSnapshot, saveStoredConfiguratorSnapshot } from '@/utils/configuratorDraftStorage';

export default function GenerateOfferStep() {
    const dispatch = useDispatch();
    const configurator = useSelector((state) => state.configurator);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { isGenerating } = useSelector((state) => state.offers);
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);
    const [currentPhase, setCurrentPhase] = useState(t('configurator.generateOffer.title'));
    const [showActivationPrompt, setShowActivationPrompt] = useState(false);
    const [genError, setGenError] = useState(null);
    const navigate = useNavigate();
    const { generationError } = useSelector((state) => state.offers);
    const finalizeOfferRef = useRef(null);
    const hasHydratedRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (hasHydratedRef.current) return;
        try {
            const snap = loadStoredConfiguratorSnapshot();
            if (snap) {
                dispatch(hydrateConfigurator(snap));
            }
        } catch {
            // ignore
        } finally {
            hasHydratedRef.current = true;
        }
    }, [dispatch, isAuthenticated]);

    const generationPhases = [
        { progress: 10, label: `${t('configurator.generateOffer.nodes.configuration')}...` },
        { progress: 25, label: `${t('configurator.generateOffer.nodes.configuration')}...` },
        { progress: 40, label: `${t('configurator.generateOffer.nodes.hardware')}...` },
        { progress: 55, label: `${t('configurator.generateOffer.nodes.services')}...` },
        { progress: 70, label: `${t('configurator.generateOffer.nodes.services')}...` },
        { progress: 85, label: `${t('configurator.generateOffer.nodes.documentation')}...` },
        { progress: 100, label: `${t('configurator.steps.summary')} complete` },
    ];

    useEffect(() => {
        if (!isAuthenticated) {
            setProgress(100);
            setCurrentPhase(t('configurator.generateOffer.activationTitle', { defaultValue: 'Create account to finish' }));
            setShowActivationPrompt(true);
            return undefined;
        }

        const totalDuration = 4000;
        const intervalTime = 100;
        const stepsCount = totalDuration / intervalTime;
        const increment = 100 / stepsCount;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                const phase = generationPhases.find((p) => next <= p.progress) || generationPhases[generationPhases.length - 1];
                setCurrentPhase(phase.label);

                if (next >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        if (finalizeOfferRef.current) {
                            finalizeOfferRef.current();
                        }
                    }, 800);
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [dispatch, isAuthenticated, t]);

    const finalizeOffer = useCallback(async () => {
        setGenError(null);
        const levels = Array.isArray(configurator.levels) && configurator.levels.length > 0
            ? configurator.levels
            : [{ id: 1, name: 'Ground Floor', rooms: [] }];
        const payload = {
            projectId: configurator.currentProjectId || null,
            projectInfo: configurator.projectInfo || {},
            levels,
            rangeId: configurator.range ?? null,
            colorId: configurator.color ?? null,
            serviceIds: Array.isArray(configurator.services) ? configurator.services : [],
            customerComments: configurator.customerComments || null,
            offerId: configurator.currentOfferId || null,
        };
        const resultAction = await dispatch(generateOffer(payload));
        if (generateOffer.fulfilled.match(resultAction)) {
            clearStoredConfiguratorSnapshot({ keepGuestSession: true });
            dispatch(setStep(9));
        } else {
            setGenError(resultAction.payload || generationError || 'Offer generation failed');
        }
    }, [configurator, dispatch, generationError]);
    finalizeOfferRef.current = finalizeOffer;

    const systemNodes = [
        { name: t('configurator.generateOffer.nodes.configuration'), icon: Cpu, status: progress > 20 ? 'Active' : 'Syncing' },
        { name: t('configurator.generateOffer.nodes.hardware'), icon: Database, status: progress > 40 ? 'Active' : 'Syncing' },
        { name: t('configurator.generateOffer.nodes.services'), icon: Globe, status: progress > 60 ? 'Active' : 'Syncing' },
        { name: t('configurator.generateOffer.nodes.documentation'), icon: Zap, status: progress > 80 ? 'Active' : 'Syncing' },
    ];

    return (
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-10 py-10 animate-fade-in">
            <div className="space-y-5 text-center">
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary-500/12 blur-3xl" />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow sm:h-32 sm:w-32">
                        <Activity className="h-12 w-12 animate-pulse" />
                    </div>
                </div>
                <SectionTitle
                    title={t('configurator.generateOffer.title')}
                    subtitle={t('configurator.generateOffer.subtitle')}
                    align="center"
                />
            </div>

            {genError ? <Alert variant="error">{genError}</Alert> : null}

            <Card className="w-full rounded-[2rem] p-8 sm:p-10">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                            <span>{t('configurator.generateOffer.status')}</span>
                            <span>{Math.floor(progress)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-gradient-brand transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.generateOffer.status')}</p>
                                <p className="mt-1 text-lg font-semibold text-textPrimary">{currentPhase}</p>
                            </div>
                        </div>
                        <Badge variant="info">{isGenerating ? 'Processing' : 'Queued'}</Badge>
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
                <Card className="w-full rounded-[2rem] p-8 text-center sm:p-10">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow">
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
                                saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({ ...configurator, currentStep: 8, guestSessionId: getOrCreateGuestSessionId() }));
                                navigate('/auth/register', { state: { returnTo: '/configurator', returnStep: 8 } });
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
                                saveStoredConfiguratorSnapshot(buildStoredConfiguratorSnapshot({ ...configurator, currentStep: 8, guestSessionId: getOrCreateGuestSessionId() }));
                                navigate('/auth/login', { state: { returnTo: '/configurator', returnStep: 8 } });
                            }}
                        >
                            <LogIn className="h-4.5 w-4.5" />
                            {t('configurator.generateOffer.logIn')}
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
