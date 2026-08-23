import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleService } from '../../features/configurator/configuratorSlice';
import { Check, Settings, Briefcase, ShieldCheck, Radio, GraduationCap, Lightbulb, Info, ChevronRight } from 'lucide-react';
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

    const getServiceHighlights = (service) => {
        if (Array.isArray(service.highlights) && service.highlights.length > 0) {
            return service.highlights;
        }

        const description = String(service.description || '').trim();
        if (!description) {
            return [t('configurator.servicesStep.defaultHighlight', { defaultValue: 'Detailed scope is available in the service description.' })];
        }

        const lines = description
            .split(/\r?\n|\.|;|\u2022/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length > 1) {
            return lines;
        }

        const name = String(service.name || '').toLowerCase();
        if (name.includes('commission')) {
            return [
                t('configurator.servicesStep.commissioningBulletOne', { defaultValue: 'Functional verification and handover of the installed KNX system.' }),
                t('configurator.servicesStep.commissioningBulletTwo', { defaultValue: 'System and bus communication verification' }),
                t('configurator.servicesStep.commissioningBulletThree', { defaultValue: 'Testing of lighting, shading, HVAC and scenes' }),
            ];
        }
        if (name.includes('configuration') || name.includes('programming')) {
            return [
                t('configurator.servicesStep.configurationBulletOne', { defaultValue: 'ETS configuration, device parameters and project-specific logic.' }),
                t('configurator.servicesStep.configurationBulletTwo', { defaultValue: 'Group addresses and address assignment' }),
                t('configurator.servicesStep.configurationBulletThree', { defaultValue: 'Download, testing and corrections' }),
            ];
        }
        if (name.includes('installation')) {
            return [
                t('configurator.servicesStep.installationBulletOne', { defaultValue: 'Mounting, connection and preparation of KNX field equipment.' }),
                t('configurator.servicesStep.installationBulletTwo', { defaultValue: 'Mounting and connection of selected devices' }),
                t('configurator.servicesStep.installationBulletThree', { defaultValue: 'Cable, polarity and continuity checks' }),
            ];
        }

        return lines;
    };

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
        <div className="space-y-5 animate-fade-in pb-12 max-w-6xl mx-auto sm:space-y-6 sm:pb-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle
                    title={t('configurator.servicesStep.title', { defaultValue: 'Professional Services' })}
                    subtitle={t('configurator.servicesStep.subtitle', { defaultValue: 'Select installation, programming, and support services to include in the offer.' })}
                    badge={t('configurator.servicesStep.badge', { defaultValue: 'Step 05: Services' })}
                    className="mb-0"
                />

                <div className="rounded-xl border border-primary-200/80 bg-primary-50/80 px-4 py-2 text-right shadow-xs self-start sm:self-center">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-primary-700">{t('configurator.servicesStep.totalServices', { defaultValue: 'Selected Total' })}</span>
                    <span className="font-heading text-base font-black text-primary-800 tabular-nums">{formatCurrency(selectedTotal)}</span>
                </div>
            </div>

            <div className="max-h-[520px] sm:max-h-[600px] overflow-y-auto custom-scrollbar p-1 -m-1">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                    {visibleServices.map((service) => {
                        const isMandatory = service?.isOptionalForCustomer === false;
                        const isSelected = isMandatory || selectedServices.includes(service.id);
                        const Icon = resolveServiceIcon(service);
                        const highlights = getServiceHighlights(service);
                    return (
                        <Card
                            key={service.id}
                            onClick={() => handleToggle(service)}
                            className={clsx(
                                'group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 shadow-soft',
                                isSelected
                                    ? 'border-primary-500 bg-primary-50/40 ring-1 ring-primary-500/20'
                                    : 'border-slate-200/90 bg-white hover:border-primary-300 hover:shadow-card-hover',
                                isMandatory ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                            )}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={clsx(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors',
                                            isSelected ? 'border-primary-300 bg-primary-600 text-white shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-500'
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="truncate text-sm font-bold text-textPrimary leading-snug">{service.name}</h4>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-700">
                                                {isMandatory
                                                    ? t('configurator.servicesStep.included', { defaultValue: 'Included' })
                                                    : t('configurator.servicesStep.serviceLabel', { defaultValue: 'Optional' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-black text-primary-800 shrink-0">
                                        {formatCurrency(service.price)}
                                    </div>
                                </div>

                                {service.description ? (
                                    <p className="mt-3 text-xs leading-relaxed text-textSecondary line-clamp-2">{service.description}</p>
                                ) : null}

                                <ul className="mt-3.5 space-y-2 border-t border-slate-100 pt-3 text-xs text-textSecondary">
                                    {highlights.slice(0, 3).map((highlight, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                                            <span className="line-clamp-1">{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4 pt-2">
                                <button
                                    type="button"
                                    disabled={isMandatory}
                                    className={clsx(
                                        'flex h-8 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all shadow-xs',
                                        isSelected
                                            ? 'bg-primary-600 text-white'
                                            : 'border border-slate-200 bg-slate-50 text-textSecondary hover:bg-slate-100 hover:text-textPrimary',
                                        isMandatory && 'opacity-80 cursor-default'
                                    )}
                                >
                                    {isSelected ? (
                                        <>
                                            <Check className="h-3.5 w-3.5" />
                                            <span>{isMandatory ? t('configurator.servicesStep.included', { defaultValue: 'Included in Offer' }) : t('configurator.servicesStep.selected', { defaultValue: 'Selected' })}</span>
                                        </>
                                    ) : (
                                        <span>{t('configurator.servicesStep.addService', { defaultValue: 'Add Service' })}</span>
                                    )}
                                </button>
                            </div>
                        </Card>
                    );
                })}
                </div>
            </div>

            {/* Information Card */}
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 border border-primary-100">
                    <Info className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-textPrimary">{t('configurator.servicesStep.infoTitle', { defaultValue: 'Service Estimates & Master Data' })}</h5>
                    <p className="text-xs text-textSecondary leading-relaxed">
                        {t('configurator.servicesStep.footer', { defaultValue: 'All service prices are calculated in EUR from back-office master rates and include standard labor and deployment support.' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
