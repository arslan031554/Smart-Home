import React from 'react';
import { Card, Button } from '../../common/UIComponents';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep } from '../../../features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';

export default function GenerateOfferSection() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { calculation, isCalculating } = useSelector((state) => state.configurator);
    const hasCalculation = calculation && typeof calculation.grandTotal === 'number';
    const hasUnmetRequirements = Array.isArray(calculation?.unmetRequirements) && calculation.unmetRequirements.length > 0;
    const isBlocked = isCalculating || !hasCalculation || hasUnmetRequirements;

    const handleGenerate = () => {
        if (isBlocked) return;
        dispatch(setStep(8));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
