import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRange } from '../../features/configurator/configuratorSlice';
import { CheckCircle2, Sparkles, Box } from 'lucide-react';
import { Card, SectionTitle, Badge, Alert } from '../common/UIComponents';
import rangeImage12 from '../../assets/12.JPG';
import rangeImage13 from '../../assets/13.jfif';
import rangeImage14 from '../../assets/14.jfif';
import { useTranslation } from 'react-i18next';

const RANGE_ASSET_IMAGES = [rangeImage12, rangeImage13, rangeImage14];

function hashString(value) {
    const text = String(value || '');
    return text.split('').reduce((sum, ch, idx) => sum + (ch.charCodeAt(0) * (idx + 1)), 0);
}

function resolveRangeImageUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;

    try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const apiOrigin = new URL(
            apiBase,
            typeof window !== 'undefined' ? window.location.origin : undefined
        ).origin;
        return `${apiOrigin}${raw.startsWith('/') ? raw : `/${raw}`}`;
    } catch {
        return raw;
    }
}

function getRangeFallbackImage(seedValue, index, randomOffset = 0) {
    const seedString = String(seedValue || index || '');
    const hash = hashString(seedString);
    return RANGE_ASSET_IMAGES[(hash + randomOffset) % RANGE_ASSET_IMAGES.length];
}

export default function RangeSelectionStep() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { range } = useSelector((state) => state.configurator);
    const RANGES = useSelector((state) => state.admin.publicProductRanges) || [];

    if (!Array.isArray(RANGES) || RANGES.length === 0) {
        return (
            <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto sm:space-y-8 sm:pb-20">
                <SectionTitle
                    title={t('configurator.range.title', { defaultValue: 'Choose Product Range' })}
                    subtitle={t('configurator.range.loading', { defaultValue: 'Loading available product ranges...' })}
                    badge={t('configurator.range.badge', { defaultValue: 'Step 04: Product Range' })}
                />
                <Alert variant="info" className="p-6 rounded-2xl">
                    {t('configurator.range.loadingHelp', { defaultValue: 'Product ranges are loading. If this persists, please refresh the page.' })}
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto sm:space-y-8 sm:pb-20">
            <SectionTitle
                title={t('configurator.range.title', { defaultValue: 'Choose Product Range' })}
                subtitle={t('configurator.range.subtitle', { defaultValue: 'Select the product range for your entire project. This choice affects which products are eligible in the automatic calculation.' })}
                badge={t('configurator.range.badge', { defaultValue: 'Step 04: Product Range' })}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {RANGES.filter(r => r?.isVisible !== false).map((r, index) => {
                    const isActive = range === r.id;
                    const fallbackImage = getRangeFallbackImage(
                        r.id || r.code || r.name,
                        index,
                        0
                    );
                    const resolvedImage = resolveRangeImageUrl(r.imageUrl || r.image);
                    const imageSrc = resolvedImage || fallbackImage;
                    
                    return (
                        <Card
                            key={r.id}
                            className={`group relative overflow-hidden transition-all duration-500 cursor-pointer border rounded-[1.25rem] sm:rounded-[1.5rem] ${isActive
                                ? 'border-primary-600 ring-8 ring-primary-600/5 shadow-premium'
                                : 'border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-md bg-white'
                                }`}
                            onClick={() => dispatch(setRange(r.id))}
                        >
                            {/* Product Visualization */}
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={imageSrc}
                                    alt={r.name}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = fallbackImage;
                                    }}
                                    className={`w-full h-full object-cover transition-transform duration-1000 ${isActive ? 'scale-105' : 'group-hover:scale-105 brightness-95 group-hover:brightness-100'}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                                
                                {isActive && (
                                    <div className="absolute top-6 left-6 w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>
                                )}

                                <div className="absolute bottom-6 left-8 right-8">
                                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                                        {r.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className="bg-white/20 backdrop-blur-md border-none text-[8px] font-bold text-white uppercase tracking-[0.2em] px-3 py-1">
                                            {r.code || 'SERIES_' + r.id.slice(0,3).toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-5 sm:p-6 sm:space-y-5">
                                <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-3">
                                    {r.description || ''}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {(r.features || [
                                        t('configurator.range.features.premium', { defaultValue: 'Premium Finish' }),
                                        t('configurator.range.features.reliable', { defaultValue: 'Reliable Module' }),
                                        t('configurator.range.features.smart', { defaultValue: 'Smart Integration' }),
                                    ]).map((feature) => (
                                        <div key={feature} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500 border border-slate-100">
                                            <Sparkles className="w-3 h-3 text-primary-400" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2">
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 relative overflow-hidden">
                                        <div
                                            className={`absolute inset-0 bg-primary-600 transition-all duration-700 ${isActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Alert
                variant="info"
                className="mt-8 rounded-[1.25rem] border border-emerald-700/35 bg-gradient-to-r from-[#052e16] via-[#064e3b] to-[#052e16] p-6 text-white shadow-xl relative overflow-hidden group sm:p-8 sm:rounded-[1.5rem] [&>svg]:text-white"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -mr-32 -mt-32 blur-[80px] opacity-40" />
                <div className="flex items-start gap-6 relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl text-white flex items-center justify-center shadow-inner border border-white/15">
                        <Box className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold leading-none text-white">{t('configurator.range.projectLevelTitle', { defaultValue: 'Project-level range' })}</h4>
                        <p className="text-sm font-medium text-white leading-relaxed max-w-3xl">
                            {t('configurator.range.projectLevelHelp', { defaultValue: 'The selected range applies to your whole project and is used by the system to calculate compatible products from your chosen smart functions.' })}
                        </p>
                    </div>
                </div>
            </Alert>
        </div>
    );
}
