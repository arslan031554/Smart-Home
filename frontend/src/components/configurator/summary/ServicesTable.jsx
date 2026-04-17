import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Badge } from '../../common/UIComponents';
import { Briefcase, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const safeNum = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

export default function ServicesTable() {
    const { t, i18n } = useTranslation();
    const { calculation, isCalculating } = useSelector((state) => state.configurator);
    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatMoney = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safeNum(value));
    const services = Array.isArray(calculation?.services) ? calculation.services : [];
    const total = safeNum(calculation?.servicesSubtotalPerProject ?? calculation?.servicesSubtotal, 0);

    if (isCalculating && services.length === 0) {
        return (
            <Card className="p-8 border-none shadow-premium-sm rounded-[2.5rem] bg-white">
                <div className="flex items-center gap-3 text-primary-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm font-bold">{t('configurator.summary.services.calculating', { defaultValue: 'Calculating services from the backend...' })}</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-8 border-none shadow-premium-sm rounded-[2.5rem] bg-white">
            <div className="flex items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('configurator.summary.services.title', { defaultValue: 'Services' })}</h3>
                </div>
                <Badge variant="neutral" className="bg-slate-50 border-none text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5">
                    {t('configurator.summary.services.count', { count: services.length, defaultValue: '{{count}} service lines' })}
                </Badge>
            </div>

            {services.length === 0 ? (
                <p className="text-sm text-slate-400 italic">{t('configurator.summary.services.empty', { defaultValue: 'No services are currently included in the backend-calculated offer.' })}</p>
            ) : (
                <div className="overflow-x-auto -mx-2">
                    <table className="w-full min-w-[720px] text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('configurator.summary.services.columns.service', { defaultValue: 'Service' })}</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{t('configurator.summary.services.columns.quantity', { defaultValue: 'Quantity' })}</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('configurator.summary.services.columns.unitPrice', { defaultValue: 'Unit Price' })}</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('configurator.summary.services.columns.subtotal', { defaultValue: 'Subtotal' })}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {services.map((service) => (
                                <tr key={service.serviceId || service.id || service.serviceCode} className="hover:bg-slate-50/30 transition-colors align-top">
                                    <td className="px-6 py-4">
                                        <div className="max-w-[420px]">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{service.name}</p>
                                            {service.description && (
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{service.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono">{service.serviceCode || service.code || service.serviceId || service.id}</span>
                                                {service.pricingMode && (
                                                    <span className="text-[9px] font-black bg-primary-50 text-primary-600 px-2 py-0.5 rounded uppercase tracking-widest">
                                                        {service.pricingMode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-xl bg-slate-50 text-sm font-black text-slate-900 border border-slate-100">
                                            {safeNum(service.calcQty, 1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-slate-600 tabular-nums">{formatMoney(service.unitPrice)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-slate-900 tabular-nums">{formatMoney(service.subtotal)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-100 bg-slate-50/30">
                                <td colSpan={3} className="px-6 py-5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('configurator.summary.services.footerLabel', { defaultValue: 'Services Subtotal / Project' })}</span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <span className="text-xl font-black text-primary-600 tabular-nums">{formatMoney(total)}</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </Card>
    );
}
