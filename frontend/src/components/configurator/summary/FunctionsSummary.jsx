import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, Badge } from '../../common/UIComponents';
import {
    Sun, Thermometer, Shield, Monitor, Layers, Zap,
    Battery, Camera, Key, Droplets, Waves, Box, Activity,
} from 'lucide-react';
import { aggregateFunctionsForSummary } from '../../../utils/calculationUtils';
import { useTranslation } from 'react-i18next';

const ICON_MAP = {
    Sun,
    Thermometer,
    Shield,
    Monitor,
    Layers,
    Zap,
    Battery,
    Camera,
    Key,
    Droplets,
    Waves,
    Activity,
};

function FunctionIcon({ iconName }) {
    const Icon = ICON_MAP[iconName] || Box;
    return <Icon className="w-5 h-5" />;
}

export default function FunctionsSummary({ levels }) {
    const { t } = useTranslation();
    const rawSmartFunctions = useSelector((state) => state.admin.smartFunctions);
    const smartFunctions = useMemo(
        () => (Array.isArray(rawSmartFunctions) ? rawSmartFunctions : []),
        [rawSmartFunctions],
    );
    const aggregatedFunctions = useMemo(() => aggregateFunctionsForSummary(levels), [levels]);

    const functions = useMemo(() => aggregatedFunctions
        .map((item) => {
            const master = smartFunctions.find((fn) => fn.id === item.id) || {};
            return {
                ...item,
                name: master.name || item.name || t('configurator.summary.configuredFunction', { defaultValue: 'Configured Function' }),
                description: master.description || item.description || '',
                icon: master.icon || item.icon || null,
            };
        })
        .filter((item) => Number(item.totalQty) > 0), [aggregatedFunctions, smartFunctions, t]);

    if (functions.length === 0) {
        return (
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textSecondary mb-2">
                    <Activity className="h-4 w-4 text-primary-700" /> {t('offers.detail.functionsChapter', { defaultValue: 'Functions' })}
                </h3>
                <p className="text-xs sm:text-sm text-textSecondary italic">{t('offers.detail.noFunctions', { defaultValue: 'No smart functions currently selected.' })}</p>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                        <Activity className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">
                        {t('offers.detail.functionsChapter', { defaultValue: 'Functions' })}
                    </h3>
                </div>
                <Badge variant="neutral" className="border-none bg-slate-100 text-[10px] font-bold text-textSecondary uppercase tracking-wider px-3 py-1">
                    {t('configurator.summary.usedFunctions', { count: functions.length, defaultValue: '{{count}} Used Functions' })}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {functions.map((fn) => (
                    <div key={fn.id} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#f9faf6] p-4 space-y-3 hover:border-primary-200 transition-all">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="h-11 w-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-primary-700 shadow-xs shrink-0">
                                    <FunctionIcon iconName={fn.icon} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm sm:text-[15px] font-bold text-textPrimary leading-snug">{fn.name}</p>
                                    {fn.description && (
                                        <p className="text-xs text-textSecondary mt-0.5 leading-relaxed line-clamp-2">{fn.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[9px] font-bold text-textSecondary uppercase tracking-wider">{t('configurator.summary.quantity', { defaultValue: 'Quantity' })}</p>
                                <p className="text-lg font-black text-textPrimary tabular-nums">× {fn.totalQty}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">
                                {t('configurator.summary.activeRooms', { count: fn.rooms?.length || 0, defaultValue: 'Active in {{count}} room' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

