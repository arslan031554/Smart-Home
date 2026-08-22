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
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6 overflow-hidden relative">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                        <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.financial.title', { defaultValue: 'Grand Total' })}</h3>
                        <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.currencyNote', { defaultValue: 'All amounts in EUR, excluding VAT' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 text-primary-700">
                    {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Info className="w-5 h-5" />}
                    <p className="text-xs sm:text-sm font-bold">
                        {isCalculating
                            ? t('configurator.summary.financial.refreshing', { defaultValue: 'Refreshing totals from the backend...' })
                            : t('configurator.summary.financial.waiting', { defaultValue: 'Totals will appear here after the backend calculation completes.' })}
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6 overflow-hidden relative">
            {isCalculating && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-primary-700 animate-spin" />
                        <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">{t('configurator.summary.financial.recalculating', { defaultValue: 'Recalculating...' })}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2.5 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                    <Calculator className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.financial.title', { defaultValue: 'Grand Total' })}</h3>
                    <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.currencyNote', { defaultValue: 'All amounts in EUR, excluding VAT' })}</p>
                </div>
            </div>

            <div className="space-y-0 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-textSecondary" />
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-textPrimary">{t('configurator.summary.financial.productsSubtotal', { defaultValue: 'Products Subtotal / Project' })}</p>
                            <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.productsHelp', { defaultValue: 'Per-project product total from the backend engine' })}</p>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-textPrimary tabular-nums">{formatMoney(productsSubtotalPerProject)}</p>
                </div>

                <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                        <Wrench className="w-4 h-4 text-textSecondary" />
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-textPrimary">{t('configurator.summary.financial.servicesSubtotal', { defaultValue: 'Services Subtotal / Project' })}</p>
                            <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.servicesHelp', { defaultValue: 'Per-project service total from the backend engine' })}</p>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-textPrimary tabular-nums">{formatMoney(servicesSubtotalPerProject)}</p>
                </div>

                <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                        <Calculator className="w-4 h-4 text-textSecondary" />
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-textPrimary">{t('configurator.summary.financial.totalPerProject', { defaultValue: 'Total Per Project' })}</p>
                            <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.totalPerProjectHelp', { defaultValue: 'Products and services before multiplying identical units' })}</p>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-textPrimary tabular-nums">{formatMoney(totalPerProject)}</p>
                </div>

                <div className="flex items-center justify-between py-3.5 bg-[#f9faf6] -mx-5 px-5 sm:-mx-6 sm:px-6">
                    <div className="flex items-center gap-2.5">
                        <Hash className="w-4 h-4 text-primary-700" />
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-textPrimary">{t('configurator.summary.financial.multiplier', { defaultValue: 'Project Multiplication Index' })}</p>
                            <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.multiplierHelp', { defaultValue: 'Applied to identical apartments, rooms, or units' })}</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-200">
                        x {units}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3.5">
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-textPrimary">{t('configurator.summary.financial.grossTotal', { defaultValue: 'Gross Total' })}</p>
                        <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.grossHelp', { defaultValue: 'All projects combined before discount' })}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-textPrimary tabular-nums">{formatMoney(grossTotal)}</p>
                </div>

                <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-textPrimary">{t('configurator.summary.financial.discountPercent', { defaultValue: 'Discount Percent' })}</p>
                            <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.discountPercentHelp', { defaultValue: 'Calculated by the backend discount matrix' })}</p>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-textPrimary tabular-nums">{Number(calculation.discountPercent || 0)}%</p>
                </div>

                <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-textPrimary">{t('configurator.summary.financial.discountAmount', { defaultValue: 'Discount Amount' })}</p>
                            <p className="text-[11px] text-textSecondary">{t('configurator.summary.financial.discountAmountHelp', { defaultValue: 'Applied to the authoritative backend total' })}</p>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 tabular-nums">-{formatMoney(calculation.discountAmount || 0)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-5 mt-3 border-t-2 border-slate-200">
                <div>
                    <p className="text-sm sm:text-base font-bold text-textPrimary">{t('configurator.summary.financial.grandTotal', { defaultValue: 'Grand Total' })}</p>
                    <p className="text-[11px] text-textSecondary uppercase tracking-wider">{t('configurator.summary.financial.exVat', { defaultValue: 'EUR - Excluding VAT' })}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-black text-primary-700 tracking-tight tabular-nums">{formatMoney(calculation.grandTotal)}</p>
                    <p className="text-[10px] text-textSecondary mt-0.5">{t('configurator.summary.financial.vatNote', { defaultValue: 'VAT to be added at invoice stage' })}</p>
                </div>
            </div>

            <div className="flex items-start gap-2.5 mt-5 p-3.5 bg-[#f9faf6] rounded-xl border border-slate-200/80">
                <Info className="w-4 h-4 text-textSecondary shrink-0 mt-0.5" />
                <p className="text-[11px] text-textSecondary leading-relaxed">
                    {t('configurator.summary.financial.footer', { defaultValue: 'This summary is rendered directly from the backend calculation so products, services, discount, and total stay aligned with the generated offer.' })}
                </p>
            </div>
        </Card>
    );
}
