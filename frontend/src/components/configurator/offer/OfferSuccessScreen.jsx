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
        <AnimatedPageWrapper className="mx-auto max-w-5xl space-y-6 py-4 sm:space-y-8 sm:py-6">
            <div className="space-y-4 text-center">
                <div className="relative inline-block">
                    <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-primary-50 text-primary-700 shadow-soft sm:h-20 sm:w-20">
                        <CheckCircle2 className="h-8 w-8 text-primary-600 sm:h-10 sm:w-10" />
                    </div>
                    <div className="absolute -inset-2 -z-10 rounded-full bg-primary-400/10 blur-xl animate-pulse" />
                </div>

                <SectionTitle
                    title={t('offerSuccess.title', { defaultValue: 'Offer Generated Successfully' })}
                    subtitle={t('offerSuccess.downloadPrompt', { defaultValue: 'Your proposal is ready. Download the official PDF proposal or technical manifest below.' })}
                    badge={t('offerSuccess.badge', { defaultValue: 'Step 07: Offer Ready' })}
                    className="flex flex-col items-center mb-0"
                />
            </div>

            <DocumentsSection offerId={offerId} />

            {!offerId ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-700">
                    {t('offerSuccess.savingHelp', { defaultValue: 'If you do not see download buttons, the offer may still be saving. Please wait a moment.' })}
                </p>
            ) : null}

            {offerId ? (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200">
                    <Link to={`/dashboard/offers/${offerId}`}>
                        <Button variant="primary" size="md" className="gap-2 rounded-xl text-xs font-bold">
                            <Eye className="h-4 w-4" />
                            {t('offerSuccess.viewDetails', { defaultValue: 'View Full Offer Details' })}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>

                    <Button variant="secondary" size="md" className="gap-2 rounded-xl text-xs font-semibold" onClick={handleStartNewConfigurator}>
                        <RotateCcw className="h-4 w-4" />
                        {t('configurator.generateOffer.startNewConfigurator', { defaultValue: 'Start New Configurator' })}
                    </Button>
                </div>
            ) : null}
        </AnimatedPageWrapper>
    );
}
