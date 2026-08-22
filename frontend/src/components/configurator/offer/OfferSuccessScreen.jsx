import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { SectionTitle, AnimatedPageWrapper, Button } from '../../common/UIComponents';
import { CheckCircle2, Eye, RotateCcw, ArrowRight } from 'lucide-react';

import DocumentsSection from './DocumentsSection';
import { useTranslation } from 'react-i18next';
import { loadStoredConfiguratorSnapshot, clearStoredConfiguratorSnapshot } from '@/utils/configuratorDraftStorage';
import { resetConfigurator } from '@/features/configurator/configuratorSlice';
import { clearGeneratedOffer } from '@/features/offers/offersSlice';

export default function OfferSuccessScreen() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { generatedOffer, currentOffer } = useSelector((state) => state.offers);
    const configurator = useSelector((state) => state.configurator);

    const snapshot = loadStoredConfiguratorSnapshot();
    const offer = generatedOffer || currentOffer || {};
    const offerId = offer.id ?? configurator.currentOfferId ?? snapshot?.currentOfferId ?? null;

    const handleStartNewConfigurator = () => {
        clearStoredConfiguratorSnapshot({ keepGuestSession: true });
        dispatch(resetConfigurator());
        dispatch(clearGeneratedOffer());
        navigate('/configurator', { replace: true, state: { freshConfigurator: true } });
    };

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-10 py-8">
            <div className="space-y-6 text-center">
                <div className="relative inline-block">
                    <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] border-4 border-white bg-emerald-50 shadow-premium sm:h-28 sm:w-28">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 sm:h-14 sm:w-14" />
                    </div>
                    <div className="absolute -inset-4 -z-10 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
                </div>

                <SectionTitle
                    title={t('offerSuccess.title', { defaultValue: 'Offer Generated Successfully' })}
                    subtitle={t('offerSuccess.downloadPrompt', { defaultValue: 'Your proposal is ready. Download the official PDF proposal or technical manifest below.' })}
                    badge={t('offerSuccess.badge', { defaultValue: 'Step 07: Offer Ready' })}
                    className="flex flex-col items-center"
                />
            </div>

            <DocumentsSection offerId={offerId} />

            {!offerId ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
                    {t('offerSuccess.savingHelp', { defaultValue: 'If you do not see download buttons, the offer may still be saving. Please wait a moment.' })}
                </p>
            ) : null}

            {offerId ? (
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-200">
                    <Link to={`/dashboard/offers/${offerId}`}>
                        <Button variant="primary" size="lg" className="gap-2 rounded-xl">
                            <Eye className="h-4.5 w-4.5" />
                            {t('offerSuccess.viewDetails', { defaultValue: 'View Full Offer Details' })}
                            <ArrowRight className="h-4.5 w-4.5" />
                        </Button>
                    </Link>

                    <Button variant="secondary" size="lg" className="gap-2 rounded-xl" onClick={handleStartNewConfigurator}>
                        <RotateCcw className="h-4.5 w-4.5" />
                        {t('configurator.generateOffer.startNewConfigurator', { defaultValue: 'Start New Configurator' })}
                    </Button>
                </div>
            ) : null}
        </AnimatedPageWrapper>
    );
}
