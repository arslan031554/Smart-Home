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
        <div className="space-y-6 animate-fade-in pb-16 max-w-5xl mx-auto sm:space-y-8 sm:pb-20">
            <SectionTitle
                title={t('configurator.servicesStep.title', { defaultValue: 'Professional Services' })}
                subtitle={t('configurator.servicesStep.subtitle', { defaultValue: 'Select the additional installation, programming, and support services that should be included in the offer.' })}
                badge={t('configurator.servicesStep.badge', { defaultValue: 'Step 05: Services' })}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                'group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-6 transition-all duration-300 active:scale-[0.98] sm:p-7',
                                isMandatory ? 'cursor-default shadow-sm' : 'cursor-pointer hover:border-slate-300 hover:shadow-lg'
                            )}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            'flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-900',
                                            isSelected ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-slate-900">{service.name}</h4>
                                            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-700">{t('configurator.servicesStep.serviceLabel', { defaultValue: 'Optional' })}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                                    {formatCurrency(service.price)}
                                </div>
                            </div>

                            <p className="mt-5 text-sm leading-relaxed text-slate-600">{service.description}</p>

                            <ul className="mt-5 space-y-3 text-sm text-slate-500">
                                {highlights.slice(0, 4).map((highlight, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-bold text-slate-600">
                                <span>{t('configurator.servicesStep.viewScope', { defaultValue: 'View full scope' })}</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>

                            {isSelected && (
                                <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-emerald-950 p-7 text-white shadow-xl">
                <div className="grid gap-4 xl:grid-cols-4 xl:items-start">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">{t('configurator.servicesStep.bottomHeadline', { defaultValue: 'Select only what the project needs' })}</p>
                        <h3 className="text-xl font-black leading-tight">{t('configurator.servicesStep.bottomTitle', { defaultValue: 'Service prices and descriptions are loaded from the back-office master data.' })}</h3>
                    </div>
                    <div className="flex h-full rounded-3xl border border-emerald-800 bg-emerald-900/70 px-5 py-4">
                        <div className="flex items-center gap-3 text-emerald-200">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700/30">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{t('configurator.servicesStep.bottomPointOneTitle', { defaultValue: 'Clear scope' })}</p>
                                <p className="text-xs text-emerald-300">{t('configurator.servicesStep.bottomPointOneDescription', { defaultValue: 'Core activities are visible before selection.' })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-full rounded-3xl border border-emerald-800 bg-emerald-900/70 px-5 py-4">
                        <div className="flex items-center gap-3 text-emerald-200">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700/30">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{t('configurator.servicesStep.bottomPointTwoTitle', { defaultValue: 'Full details' })}</p>
                                <p className="text-xs text-emerald-300">{t('configurator.servicesStep.bottomPointTwoDescription', { defaultValue: 'Expanded technical scope remains available.' })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-full rounded-3xl border border-emerald-800 bg-emerald-900/70 px-5 py-4">
                        <div className="flex items-center gap-3 text-emerald-200">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700/30">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{t('configurator.servicesStep.bottomPointThreeTitle', { defaultValue: 'Automatic totals' })}</p>
                                <p className="text-xs text-emerald-300">{t('configurator.servicesStep.bottomPointThreeDescription', { defaultValue: 'The offer updates immediately after selection.' })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {visibleServices.length === 0 ? (
                <Card className="p-6 border border-slate-100 bg-white shadow-none">
                    <p className="text-sm text-slate-500">
                        {t('configurator.servicesStep.noRelevantServices', { defaultValue: 'No services are currently mapped to the selected smart-home functions.' })}
                    </p>
                </Card>
            ) : null}

            <div className="flex items-center gap-3 px-5 py-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                <Info className="w-4 h-4 text-primary-500 shrink-0" />
                <p className="text-xs text-slate-500">{t('configurator.servicesStep.footer', { defaultValue: 'All service prices are shown in EUR excluding VAT and are taken from the backend master data.' })}</p>
            </div>
        </div>
    );
}
