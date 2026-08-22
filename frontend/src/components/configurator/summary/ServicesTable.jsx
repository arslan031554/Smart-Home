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
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
                <div className="flex items-center gap-3 text-primary-700">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-xs sm:text-sm font-bold">{t('configurator.summary.services.calculating', { defaultValue: 'Calculating services from the backend...' })}</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center justify-between mb-5 gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.services.title', { defaultValue: 'Services' })}</h3>
                </div>
                <Badge variant="neutral" className="bg-slate-100 border-none text-[10px] font-bold text-textSecondary uppercase tracking-wider px-3 py-1">
                    {t('configurator.summary.services.count', { count: services.length, defaultValue: '{{count}} service lines' })}
                </Badge>
            </div>

            {services.length === 0 ? (
                <p className="text-xs sm:text-sm text-textSecondary italic">{t('configurator.summary.services.empty', { defaultValue: 'No services are currently included in the backend-calculated offer.' })}</p>
            ) : (
                <div className="overflow-x-auto -mx-1">
                    <table className="w-full min-w-[700px] text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-5 py-3 text-[10px] font-bold text-textSecondary uppercase tracking-wider">{t('configurator.summary.services.columns.service', { defaultValue: 'Service' })}</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-textSecondary uppercase tracking-wider text-center">{t('configurator.summary.services.columns.quantity', { defaultValue: 'Quantity' })}</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-textSecondary uppercase tracking-wider text-right">{t('configurator.summary.services.columns.unitPrice', { defaultValue: 'Unit Price' })}</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-textSecondary uppercase tracking-wider text-right">{t('configurator.summary.services.columns.subtotal', { defaultValue: 'Subtotal' })}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.map((service) => (
                                <tr key={service.serviceId || service.id || service.serviceCode} className="hover:bg-slate-50/50 transition-colors align-top">
                                    <td className="px-5 py-3.5">
                                        <div className="max-w-[420px]">
                                            <p className="text-xs sm:text-sm font-bold text-textPrimary leading-snug">{service.name}</p>
                                            {service.description && (
                                                <p className="text-[11px] text-textSecondary mt-0.5 leading-relaxed line-clamp-2">{service.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{service.serviceCode || service.code || service.serviceId || service.id}</span>
                                                {service.pricingMode && (
                                                    <span className="text-[9px] font-bold bg-primary-50 text-primary-700 px-1.5 py-0.2 rounded uppercase tracking-wider">
                                                        {service.pricingMode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="inline-flex items-center justify-center min-w-8 h-8 px-2.5 rounded-md bg-slate-50 text-xs font-bold text-textPrimary border border-slate-200/80">
                                            {safeNum(service.calcQty, 1)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-xs sm:text-sm font-semibold text-textSecondary tabular-nums">{formatMoney(service.unitPrice)}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-xs sm:text-sm font-bold text-textPrimary tabular-nums">{formatMoney(service.subtotal)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                                <td colSpan={3} className="px-5 py-4">
                                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{t('configurator.summary.services.footerLabel', { defaultValue: 'Services Subtotal / Project' })}</span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <span className="text-lg font-black text-primary-700 tabular-nums">{formatMoney(total)}</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </Card>
    );
}
