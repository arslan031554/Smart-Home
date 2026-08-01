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
        <Card className="p-5 border-none shadow-premium-sm rounded-[1.25rem] bg-white sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                    <Star className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('configurator.summary.aestheticSpecification')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Range Card */}
                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-primary-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                            <Box className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{t('configurator.summary.productLine')}</p>
                            <p className="text-base font-black text-slate-900 tracking-tight">{range?.name || t('configurator.summary.standardRange')}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">{range?.code || 'COMMERCIAL_SERIES'}</p>
                        </div>
                    </div>
                </div>

                {/* Color Card */}
                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-primary-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        {color?.hex ? (
                            <div 
                                className="w-12 h-12 rounded-xl border border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ backgroundColor: color.hex }}
                            >
                                <Check className={`w-5 h-5 ${color.hex.toUpperCase() === '#FFFFFF' ? 'text-slate-400' : 'text-white/70'}`} />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                                <Palette className="w-6 h-6" />
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{t('configurator.summary.aestheticFinish')}</p>
                            <p className="text-base font-black text-slate-900 tracking-tight">{color?.name || t('configurator.summary.refinedWhite')}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">{t('configurator.summary.architecturalGrade')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
