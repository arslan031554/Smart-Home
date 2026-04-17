import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, Badge } from '../../common/UIComponents';
import { Package, Info, Loader2, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProductsTable() {
    const { t, i18n } = useTranslation();
    const { calculation, isCalculating } = useSelector((state) => state.configurator);
    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatMoney = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
    const backendProducts = Array.isArray(calculation?.products) ? calculation.products : [];
    const total = Number(calculation?.productsSubtotalPerProject ?? calculation?.productsSubtotal ?? 0);
    const unmetRequirements = Array.isArray(calculation?.unmetRequirements) ? calculation.unmetRequirements : [];

    const items = useMemo(() => backendProducts.map((product) => ({
        key: product.productId || product.code || product.name,
        imageUrl: product.imageUrl || null,
        name: product.name || t('configurator.summary.products.defaultName', { defaultValue: 'Product' }),
        description: product.description || '',
        code: product.code || 'N/A',
        qty: product.quantity ?? 0,
        price: product.unitPrice ?? 0,
        subtotal: product.subtotal ?? 0,
    })), [backendProducts, t]);

    if (isCalculating && items.length === 0) {
        return (
            <Card className="p-8 border-none shadow-premium-sm rounded-[2rem] bg-white">
                <div className="flex items-center gap-3 text-primary-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm font-bold">{t('configurator.summary.products.calculating', { defaultValue: 'Calculating products from the backend...' })}</p>
                </div>
            </Card>
        );
    }

    if (items.length === 0) {
        return (
            <Card className="p-6 border-none shadow-premium-sm rounded-[2rem] bg-white">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-600" /> {t('configurator.summary.products.title', { defaultValue: 'Products' })}
                </h3>
                {unmetRequirements.length > 0 ? (
                    <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                        {t('configurator.summary.products.missingMappings', { defaultValue: 'The backend found required functions that do not have a complete product mapping yet. Update the master data before generating the offer.' })}
                    </p>
                ) : (
                    <p className="text-xs text-slate-400 font-medium italic">
                        {t('configurator.summary.products.waiting', { defaultValue: 'Backend-calculated products will appear here after the configuration is recalculated.' })}
                    </p>
                )}
            </Card>
        );
    }

    return (
        <Card className="p-8 border-none shadow-premium-sm overflow-hidden rounded-[2.5rem] bg-white">
            <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                        <Package className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('configurator.summary.products.title', { defaultValue: 'Products' })}</h3>
                </div>
                <Badge variant="neutral" className="bg-slate-50 border-none text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5">
                    {t('configurator.summary.products.count', { count: items.length, defaultValue: '{{count}} line items' })}
                </Badge>
            </div>

            <div className="overflow-x-auto -mx-2">
                <table className="w-full text-left min-w-[860px]">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('configurator.summary.products.columns.photo', { defaultValue: 'Photo' })}</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('configurator.summary.products.columns.product', { defaultValue: 'Product' })}</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{t('configurator.summary.products.columns.quantity', { defaultValue: 'Quantity' })}</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('configurator.summary.products.columns.unitPrice', { defaultValue: 'Unit Price' })}</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('configurator.summary.products.columns.subtotal', { defaultValue: 'Subtotal' })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <tr key={item.key} className="group hover:bg-slate-50/30 transition-colors align-top">
                                <td className="px-6 py-4">
                                    <div className="w-16 h-16 rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-300 shadow-inner">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageOff className="w-5 h-5" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5 max-w-[420px]">
                                        <span className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{item.name}</span>
                                        {item.description && (
                                            <span className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.description}</span>
                                        )}
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 font-mono">{item.code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-xl bg-slate-50 text-sm font-black text-slate-900 border border-slate-100 group-hover:bg-white transition-colors">
                                        {item.qty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-slate-600 tabular-nums">{formatMoney(item.price)}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-black text-slate-900 tabular-nums">{formatMoney(item.subtotal)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-100 bg-slate-50/30">
                            <td colSpan={4} className="px-6 py-5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('configurator.summary.products.footerLabel', { defaultValue: 'Products Subtotal / Project' })}</span>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <span className="text-xl font-black text-primary-600 tabular-nums">{formatMoney(total)}</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-6 flex items-center gap-3 p-4 bg-primary-50 rounded-2xl border border-primary-50">
                <Info className="w-4 h-4 text-primary-500 shrink-0" />
                <p className="text-[10px] font-bold text-primary-800/70 leading-relaxed italic">
                    {t('configurator.summary.products.footer', { defaultValue: 'Products shown here come directly from the backend calculation and use the authoritative offer result.' })}
                </p>
            </div>
            {unmetRequirements.length > 0 && (
                <div className="mt-4 flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-900/80 leading-relaxed">
                        {t('configurator.summary.products.footerWarning', { defaultValue: 'Some configured functions still have missing product mappings. The offer remains blocked until master data is completed.' })}
                    </p>
                </div>
            )}
        </Card>
    );
}
