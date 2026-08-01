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

const CHANNEL_LABEL_KEYS = {
    IN: 'configurator.functions.scope.room',
    OUT: 'configurator.functions.scope.level',
    GENERAL: 'configurator.functions.scope.project',
};

const CHANNEL_COLORS = {
    IN: 'bg-blue-50 text-blue-600 border-blue-100',
    OUT: 'bg-violet-50 text-violet-600 border-violet-100',
    GENERAL: 'bg-amber-50 text-amber-600 border-amber-100',
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
                name: master.name || item.name || t('configurator.summary.configuredFunction'),
                description: master.description || item.description || '',
                icon: master.icon || item.icon || null,
                channelType: master.channelType || item.channelType || 'GENERAL',
            };
        })
        .filter((item) => Number(item.totalQty) > 0), [aggregatedFunctions, smartFunctions, t]);

    if (functions.length === 0) {
        return (
            <Card className="p-6 border-none shadow-premium-sm rounded-2xl bg-white">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary-600" /> {t('offers.detail.functionsChapter')}
                </h3>
                <p className="text-sm text-slate-400 italic">{t('offers.detail.noFunctions')}</p>
            </Card>
        );
    }

    return (
        <Card className="p-5 border-none shadow-premium-sm rounded-[1.25rem] bg-white sm:p-6">
            <div className="flex items-center justify-between mb-8 gap-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary-600" /> {t('offers.detail.functionsChapter')}
                </h3>
                <Badge variant="neutral" className="bg-slate-50 border-none text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5">
                    {t('configurator.summary.usedFunctions', { count: functions.length })}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {functions.map((fn) => (
                    <div key={fn.id} className="rounded-3xl border border-slate-100 bg-slate-50/40 p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                                    <FunctionIcon iconName={fn.icon} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{fn.name}</p>
                                    {fn.description && (
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{fn.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('configurator.summary.quantity')}</p>
                                <p className="text-xl font-black text-slate-900 tabular-nums">× {fn.totalQty}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${CHANNEL_COLORS[fn.channelType] || CHANNEL_COLORS.GENERAL}`}>
                                {t(CHANNEL_LABEL_KEYS[fn.channelType] || CHANNEL_LABEL_KEYS.GENERAL)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {t('configurator.summary.activeRooms', { count: fn.rooms?.length || 0 })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
