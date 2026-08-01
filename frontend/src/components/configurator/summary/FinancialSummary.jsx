import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { Calculator, TrendingDown, Hash, Info, Package, Wrench, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FinancialSummary() {
    const { t, i18n } = useTranslation();
    const { projectInfo, calculation, isCalculating } = useSelector((state) => state.configurator);
    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatMoney = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
    const hasCalculation = calculation && typeof calculation.grandTotal === 'number';
    const units = parseInt(projectInfo?.projectMultiplicationIndex, 10) || 1;
    const productsSubtotalPerProject = Number(calculation?.productsSubtotalPerProject ?? (units > 0 ? Number(calculation?.productsSubtotal || 0) / units : Number(calculation?.productsSubtotal || 0)));
    const servicesSubtotalPerProject = Number(calculation?.servicesSubtotalPerProject ?? (units > 0 ? Number(calculation?.servicesSubtotal || 0) / units : Number(calculation?.servicesSubtotal || 0)));
    const totalPerProject = Number(calculation?.totalPerProject ?? (productsSubtotalPerProject + servicesSubtotalPerProject));
    const grossTotal = Number(
        calculation?.grossTotal ??
        (Number(calculation?.productsSubtotal || 0) + Number(calculation?.servicesSubtotal || 0))
    );

    if (!hasCalculation) {
        return (
            <Card className="p-5 border-none shadow-premium-sm rounded-[1.25rem] bg-white overflow-hidden relative sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('configurator.summary.financial.title', { defaultValue: 'Grand Total' })}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{t('configurator.summary.financial.currencyNote', { defaultValue: 'All amounts in EUR, excluding VAT' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-primary-600">
                    {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Info className="w-5 h-5" />}
                    <p className="text-sm font-bold">
                        {isCalculating
                            ? t('configurator.summary.financial.refreshing', { defaultValue: 'Refreshing totals from the backend...' })
                            : t('configurator.summary.financial.waiting', { defaultValue: 'Totals will appear here after the backend calculation completes.' })}
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-5 border-none shadow-premium-sm rounded-[1.25rem] bg-white overflow-hidden relative sm:p-6">
            {isCalculating && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{t('configurator.summary.financial.recalculating', { defaultValue: 'Recalculating...' })}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                    <Calculator className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('configurator.summary.financial.title', { defaultValue: 'Grand Total' })}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{t('configurator.summary.financial.currencyNote', { defaultValue: 'All amounts in EUR, excluding VAT' })}</p>
                </div>
            </div>

            <div className="space-y-0 divide-y divide-slate-50">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-slate-300" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{t('configurator.summary.financial.productsSubtotal', { defaultValue: 'Products Subtotal / Project' })}</p>
                            <p className="text-[11px] text-slate-400">{t('configurator.summary.financial.productsHelp', { defaultValue: 'Per-project product total from the backend engine' })}</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{formatMoney(productsSubtotalPerProject)}</p>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-slate-300" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{t('configurator.summary.financial.servicesSubtotal', { defaultValue: 'Services Subtotal / Project' })}</p>
                            <p className="text-[11px] text-slate-400">{t('configurator.summary.financial.servicesHelp', { defaultValue: 'Per-project service total from the backend engine' })}</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{formatMoney(servicesSubtotalPerProject)}</p>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <Calculator className="w-4 h-4 text-slate-300" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{t('configurator.summary.financial.totalPerProject', { defaultValue: 'Total Per Project' })}</p>
                            <p className="text-[11px] text-slate-400">{t('configurator.summary.financial.totalPerProjectHelp', { defaultValue: 'Products and services before multiplying identical units' })}</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{formatMoney(totalPerProject)}</p>
                </div>

                <div className="flex items-center justify-between py-4 bg-slate-50/50 -mx-8 px-8">
                    <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-primary-400" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{t('configurator.summary.financial.multiplier', { defaultValue: 'Project Multiplication Index' })}</p>
                            <p className="text-[11px] text-slate-400">{t('configurator.summary.financial.multiplierHelp', { defaultValue: 'Applied to identical apartments, rooms, or units' })}</p>
                        </div>
                    </div>
                    <span className="text-sm font-black text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                        x {units}
                    </span>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-700">{t('configurator.summary.financial.grossTotal', { defaultValue: 'Gross Total' })}</p>
                        <p className="text-[11px] text-slate-400">{t('configurator.summary.financial.grossHelp', { defaultValue: 'All projects combined before discount' })}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{formatMoney(grossTotal)}</p>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{t('configurator.summary.financial.discountPercent', { defaultValue: 'Discount Percent' })}</p>
                            <p className="text-[11px] text-slate-400">{t('configurator.summary.financial.discountPercentHelp', { defaultValue: 'Calculated by the backend discount matrix' })}</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{Number(calculation.discountPercent || 0)}%</p>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{t('configurator.summary.financial.discountAmount', { defaultValue: 'Discount Amount' })}</p>
                            <p className="text-[11px] text-slate-400">{t('configurator.summary.financial.discountAmountHelp', { defaultValue: 'Applied to the authoritative backend total' })}</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-600 tabular-nums">-{formatMoney(calculation.discountAmount || 0)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-4 border-t-2 border-primary-50">
                <div>
                    <p className="text-base font-bold text-slate-900">{t('configurator.summary.financial.grandTotal', { defaultValue: 'Grand Total' })}</p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mt-0.5">{t('configurator.summary.financial.exVat', { defaultValue: 'EUR - Excluding VAT' })}</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-primary-600 tracking-tight tabular-nums">{formatMoney(calculation.grandTotal)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t('configurator.summary.financial.vatNote', { defaultValue: 'VAT to be added at invoice stage' })}</p>
                </div>
            </div>

            <div className="flex items-start gap-2 mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t('configurator.summary.financial.footer', { defaultValue: 'This summary is rendered directly from the backend calculation so products, services, discount, and total stay aligned with the generated offer.' })}
                </p>
            </div>
        </Card>
    );
}
