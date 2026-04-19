import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleService } from '../../features/configurator/configuratorSlice';
import { Check, Settings, Briefcase, ShieldCheck, Radio, GraduationCap, Lightbulb, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge, Card, SectionTitle } from '../common/UIComponents';
import { useTranslation } from 'react-i18next';

const SERVICE_ICONS = {
    programming: Settings,
    installation: Briefcase,
    maintenance: ShieldCheck,
    cloud: Radio,
    training: GraduationCap,
    design: Lightbulb,
};

function resolveServiceIcon(service = {}) {
    const haystack = `${service.code || ''} ${service.name || ''}`.toLowerCase();
    if (haystack.includes('install')) return Briefcase;
    if (haystack.includes('maint')) return ShieldCheck;
    if (haystack.includes('cloud')) return Radio;
    if (haystack.includes('train')) return GraduationCap;
    if (haystack.includes('design')) return Lightbulb;
    if (haystack.includes('program') || haystack.includes('config')) return Settings;
    return SERVICE_ICONS[String(service.id || '').toLowerCase()] || Settings;
}

export default function ServicesStep() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { services: selectedServices, levels } = useSelector((state) => state.configurator);
    const servicesFromStore = useSelector((state) => state.admin.publicServices);
    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    const projectFunctionIds = React.useMemo(() => {
        const ids = new Set();
        (Array.isArray(levels) ? levels : []).forEach((level) => {
            (Array.isArray(level.rooms) ? level.rooms : []).forEach((room) => {
                const roomFunctions = Array.isArray(room.functions) ? room.functions : [];
                roomFunctions.forEach((selection) => {
                    const smartFunctionId = selection?.smartFunctionId || selection?.id;
                    if (smartFunctionId) ids.add(smartFunctionId);
                });
            });
        });
        return ids;
    }, [levels]);

    const visibleServices = React.useMemo(() => {
        const services = Array.isArray(servicesFromStore) ? servicesFromStore : [];
        return services.filter((service) => {
        const mappedFunctions = Array.isArray(service.smartFunctions) ? service.smartFunctions : [];
        if (mappedFunctions.length === 0) return true;
        return mappedFunctions.some((smartFunctionId) => projectFunctionIds.has(smartFunctionId));
        });
    }, [projectFunctionIds, servicesFromStore]);

    const handleToggle = (service) => {
        if (service?.isOptionalForCustomer === false) return;
        dispatch(toggleService(service.id));
    };

    const activeServices = visibleServices.filter((service) => service?.isOptionalForCustomer === false || selectedServices.includes(service.id));

    const selectedTotal = activeServices
        .reduce((acc, service) => acc + Number(service.price || 0), 0);

    return (
        <div className="space-y-10 animate-fade-in pb-20 max-w-5xl mx-auto">
            <SectionTitle
                title={t('configurator.servicesStep.title', { defaultValue: 'Professional Services' })}
                subtitle={t('configurator.servicesStep.subtitle', { defaultValue: 'Select the additional installation, programming, and support services that should be included in the offer.' })}
                badge={t('configurator.servicesStep.badge', { defaultValue: 'Step 06: Services' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleServices.map((service) => {
                    const isMandatory = service?.isOptionalForCustomer === false;
                    const isSelected = isMandatory || selectedServices.includes(service.id);
                    const Icon = resolveServiceIcon(service);
                    return (
                        <Card
                            key={service.id}
                            onClick={() => handleToggle(service)}
                            className={clsx(
                                'group relative overflow-hidden border-2 p-8 transition-all duration-300 active:scale-[0.98]',
                                isMandatory ? 'cursor-default' : 'cursor-pointer',
                                isSelected
                                    ? 'border-primary-500 bg-white shadow-premium ring-2 ring-primary-500/10'
                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                            )}
                        >
                            <div className="flex items-start gap-6">
                                <div className={clsx(
                                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                                    isSelected ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="flex-grow space-y-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{service.name}</h4>
                                        <div className="flex-shrink-0 text-right">
                                            <p className="text-lg font-black text-primary-600">
                                                {formatCurrency(service.price)}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{t('configurator.servicesStep.exVat', { defaultValue: 'excl. VAT' })}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{service.description}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Badge
                                            variant={isSelected ? 'success' : 'neutral'}
                                            className={clsx('text-[10px] font-bold border-none px-2.5 py-1', isSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400')}
                                        >
                                            {isMandatory
                                                ? t('configurator.servicesStep.mandatory', { defaultValue: 'Always included' })
                                                : isSelected
                                                ? t('configurator.servicesStep.added', { defaultValue: 'Added to offer' })
                                                : t('configurator.servicesStep.optional', { defaultValue: 'Optional' })}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-mono">{service.code}</span>
                                    </div>
                                </div>
                            </div>

                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {activeServices.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-7 py-5 bg-primary-950 text-white rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold">
                            {t('configurator.servicesStep.selectedCount', {
                                count: activeServices.length,
                                defaultValue: '{{count}} services selected',
                            })}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-primary-400">{formatCurrency(selectedTotal)}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('configurator.servicesStep.subtotal', { defaultValue: 'Services subtotal excl. VAT' })}</p>
                    </div>
                </div>
            )}

            {visibleServices.length === 0 ? (
                <Card className="p-6 border border-slate-100 bg-white shadow-none">
                    <p className="text-sm text-slate-500">
                        {t('configurator.servicesStep.noRelevantServices', { defaultValue: 'No services are currently mapped to the selected smart-home functions.' })}
                    </p>
                </Card>
            ) : null}

            <Card className="p-8 bg-primary-50 border border-primary-100 shadow-none">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl text-primary-600 shadow-sm">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">{t('configurator.servicesStep.noteTitle', { defaultValue: 'Services come from backoffice master data' })}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('configurator.servicesStep.noteBody', { defaultValue: 'Any service, description, or price change made in the admin area will be reflected here and in the generated offer after recalculation.' })}</p>
                    </div>
                </div>
            </Card>

            <div className="flex items-center gap-3 px-5 py-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                <Info className="w-4 h-4 text-primary-500 shrink-0" />
                <p className="text-xs text-slate-500">{t('configurator.servicesStep.footer', { defaultValue: 'All service prices are shown in EUR excluding VAT and are taken from the backend master data.' })}</p>
            </div>
        </div>
    );
}
