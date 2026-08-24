import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRange } from '../../features/configurator/configuratorSlice';
import { CheckCircle2, Box, ChevronDown } from 'lucide-react';
import { Card, SectionTitle, Alert } from '../common/UIComponents';
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

function RangeCard({ rangeItem, isActive, index, onSelect, t }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const fallbackImage = getRangeFallbackImage(
        rangeItem.id || rangeItem.code || rangeItem.name,
        index,
        0
    );
    const resolvedImage = resolveRangeImageUrl(rangeItem.imageUrl || rangeItem.image);
    const imageSrc = resolvedImage || fallbackImage;

    const description = rangeItem.description || '';
    const shouldTruncate = description.length > 100;

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 cursor-pointer border rounded-2xl flex flex-col justify-between ${isActive
                ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md'
                : 'border-slate-200 hover:border-primary-300 shadow-soft hover:shadow-card-hover bg-white'
                }`}
            onClick={() => onSelect(rangeItem.id)}
        >
            <div>
                {/* Product Visualization */}
                <div className="h-44 sm:h-52 overflow-hidden relative">
                    <img
                        src={imageSrc}
                        alt={rangeItem.name}
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackImage;
                        }}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-105' : 'group-hover:scale-105 brightness-95 group-hover:brightness-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {isActive && (
                        <div className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-md">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    )}

                    <div className="absolute bottom-3.5 left-4 right-4">
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                            {rangeItem.name}
                        </h3>
                    </div>
                </div>

                <div className="p-4 sm:p-5">
                    {description ? (
                        <div className="space-y-2">
                            <p className={`text-xs text-textSecondary leading-relaxed transition-all duration-200 ${!isExpanded && shouldTruncate ? 'line-clamp-2' : ''}`}>
                                {description}
                            </p>
                            {shouldTruncate && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded((prev) => !prev);
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 transition-colors focus:outline-none"
                                >
                                    <span>
                                        {isExpanded
                                            ? t('configurator.range.showLess', { defaultValue: 'Show less' })
                                            : t('configurator.range.readMore', { defaultValue: 'Read more' })}
                                    </span>
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                <div className="h-1 w-full rounded-full bg-slate-100 relative overflow-hidden">
                    <div
                        className={`absolute inset-0 bg-primary-600 transition-all duration-500 ${isActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}`}
                    />
                </div>
            </div>
        </Card>
    );
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
        <div className="space-y-5 animate-fade-in pb-12 max-w-7xl mx-auto sm:space-y-6 sm:pb-16">
            <SectionTitle
                title={t('configurator.range.title', { defaultValue: 'Choose Product Range' })}
                subtitle={t('configurator.range.subtitle', { defaultValue: 'Select the design and finish aesthetic for your smart home devices.' })}
                badge={t('configurator.range.badge', { defaultValue: 'Step 04: Product Range' })}
                className="mb-2 sm:mb-4"
            />

            <div className="max-h-[520px] sm:max-h-[600px] overflow-y-auto custom-scrollbar p-1 -m-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                    {RANGES.filter(r => r?.isVisible !== false).map((r, index) => (
                        <RangeCard
                            key={r.id}
                            rangeItem={r}
                            isActive={range === r.id}
                            index={index}
                            onSelect={(id) => dispatch(setRange(id))}
                            t={t}
                        />
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div className="rounded-2xl border border-primary-200/80 bg-white p-4 shadow-soft sm:p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                        <Box className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-textPrimary">{t('configurator.range.projectLevelTitle', { defaultValue: 'Project-wide Range' })}</h4>
                        <p className="text-xs text-textSecondary leading-relaxed">
                            {t('configurator.range.projectLevelHelp', { defaultValue: 'The selected range applies across all configured rooms to ensure uniform design and hardware compatibility.' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Workflow Points */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700 font-black text-xs border border-primary-100">1</div>
                    <h4 className="mt-2.5 text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.range.stepOneTitle', { defaultValue: 'Consistent specification' })}</h4>
                    <p className="mt-1 text-xs text-textSecondary leading-relaxed">{t('configurator.range.stepOneDescription', { defaultValue: 'The same product family is used across all selected rooms.' })}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700 font-black text-xs border border-primary-100">2</div>
                    <h4 className="mt-2.5 text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.range.stepTwoTitle', { defaultValue: 'Automatic compatibility' })}</h4>
                    <p className="mt-1 text-xs text-textSecondary leading-relaxed">{t('configurator.range.stepTwoDescription', { defaultValue: 'Only products supported by the chosen range remain available.' })}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700 font-black text-xs border border-primary-100">3</div>
                    <h4 className="mt-2.5 text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.range.stepThreeTitle', { defaultValue: 'Editable before offer' })}</h4>
                    <p className="mt-1 text-xs text-textSecondary leading-relaxed">{t('configurator.range.stepThreeDescription', { defaultValue: 'Change the project range without rebuilding room structure.' })}</p>
                </div>
            </div>
        </div>
    );
}
