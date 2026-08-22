import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { Palette, Box, Check, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RangeColorSummary({ range: rangeId, color: colorId }) {
    const { t } = useTranslation();
    const productRanges = useSelector((state) => {
        const adminRanges = state.admin.productRanges || [];
        return adminRanges.length > 0 ? adminRanges : (state.admin.publicProductRanges || []);
    });
    const colors = useSelector((state) => {
        const adminColors = state.admin.colors || [];
        return adminColors.length > 0 ? adminColors : (state.admin.publicColors || []);
    });

    const range = productRanges.find(r => r.id === rangeId);
    const color = colors.find(c => c.id === colorId);

    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                    <Star className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.aestheticSpecification', { defaultValue: 'Aesthetic Specification' })}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Range Card */}
                <div className="flex items-center justify-between p-4 bg-[#f9faf6] border border-slate-200/80 rounded-xl group hover:bg-white hover:border-primary-200 hover:shadow-xs transition-all">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-primary-700 shadow-xs group-hover:bg-primary-600 group-hover:text-white transition-all">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider leading-none mb-1">{t('configurator.summary.productLine', { defaultValue: 'Product Line' })}</p>
                            <p className="text-sm font-bold text-textPrimary">{range?.name || t('configurator.summary.standardRange', { defaultValue: 'Standard Range' })}</p>
                            <p className="text-[10px] text-textSecondary mt-0.5 font-medium">{range?.code || 'COMMERCIAL_SERIES'}</p>
                        </div>
                    </div>
                </div>

                {/* Color Card */}
                <div className="flex items-center justify-between p-4 bg-[#f9faf6] border border-slate-200/80 rounded-xl group hover:bg-white hover:border-primary-200 hover:shadow-xs transition-all">
                    <div className="flex items-center gap-3.5">
                        {color?.hex ? (
                            <div 
                                className="w-10 h-10 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center transition-transform group-hover:scale-105"
                                style={{ backgroundColor: color.hex }}
                            >
                                <Check className={`w-4 h-4 ${color.hex.toUpperCase() === '#FFFFFF' ? 'text-slate-400' : 'text-white/80'}`} />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-primary-700 shadow-xs group-hover:bg-primary-600 group-hover:text-white transition-all">
                                <Palette className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider leading-none mb-1">{t('configurator.summary.aestheticFinish', { defaultValue: 'Aesthetic Finish' })}</p>
                            <p className="text-sm font-bold text-textPrimary">{color?.name || t('configurator.summary.colorPostOffer', { defaultValue: 'To be chosen with client' })}</p>
                            <p className="text-[10px] text-textSecondary mt-0.5 font-medium italic">{color ? t('configurator.summary.architecturalGrade', { defaultValue: 'Architectural Grade' }) : t('configurator.summary.colorPostOfferSub', { defaultValue: 'Will be specified together with client after offer issuance' })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
