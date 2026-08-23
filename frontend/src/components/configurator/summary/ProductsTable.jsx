import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, Badge } from '../../common/UIComponents';
import { Package, Info, Loader2, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function mapProductLine(product, fallbackName) {
    return {
        key: product.productId || product.code || product.name,
        imageUrl: product.imageUrl || null,
        name: product.name || fallbackName,
        description: product.description || '',
        code: product.code || 'N/A',
        qty: product.quantity ?? 0,
        price: product.unitPrice ?? 0,
        subtotal: product.subtotal ?? 0,
    };
}

function ProductRow({ item, formatMoney, isRelated = false, t }) {
    return (
        <tr className={`group transition-colors align-top ${isRelated ? 'bg-slate-50/40 hover:bg-slate-50/70' : 'hover:bg-slate-50/50'}`}>
            <td className="px-5 py-3.5">
                <div className="w-12 h-12 rounded-lg border border-slate-200/80 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-300 shadow-inner">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <ImageOff className="w-4 h-4" />}
                </div>
            </td>
            <td className="px-5 py-3.5">
                <div className="flex flex-col gap-1 max-w-[420px]">
                    <span className="text-xs sm:text-sm font-bold text-textPrimary leading-snug">{item.name}</span>
                    {item.description ? <span className="text-[11px] text-textSecondary leading-relaxed line-clamp-2">{item.description}</span> : null}
                    <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${isRelated ? 'text-primary-700' : 'text-slate-400'}`}>
                        {item.code}{isRelated ? ` • ${t('configurator.summary.products.autoCalculated', { defaultValue: 'Auto calculated' })}` : ''}
                    </span>
                </div>
            </td>
            <td className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center justify-center min-w-8 h-8 px-2.5 rounded-md bg-slate-50 text-xs font-bold text-textPrimary border border-slate-200/80">{item.qty}</span>
            </td>
            <td className="px-5 py-3.5 text-right"><span className="text-xs sm:text-sm font-semibold text-textSecondary tabular-nums">{formatMoney(item.price)}</span></td>
            <td className="px-5 py-3.5 text-right"><span className="text-xs sm:text-sm font-bold text-textPrimary tabular-nums">{formatMoney(item.subtotal)}</span></td>
        </tr>
    );
}

function ProductMobileCard({ item, formatMoney, isRelated = false, t }) {
    return (
        <div className={`p-3.5 rounded-xl border ${isRelated ? 'border-primary-100 bg-primary-50/30' : 'border-slate-200/80 bg-white'} space-y-2.5 shadow-xs`}>
            <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg border border-slate-200/80 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <ImageOff className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-textPrimary leading-snug">{item.name}</h4>
                    {item.description ? <p className="text-[11px] text-textSecondary mt-0.5 line-clamp-2">{item.description}</p> : null}
                    <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider font-mono ${isRelated ? 'text-primary-700' : 'text-slate-400'}`}>
                        {item.code}{isRelated ? ` • ${t('configurator.summary.products.autoCalculated', { defaultValue: 'Auto' })}` : ''}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-textSecondary font-semibold">
                    {item.qty} × {formatMoney(item.price)}
                </span>
                <span className="font-black text-textPrimary tabular-nums">
                    {formatMoney(item.subtotal)}
                </span>
            </div>
        </div>
    );
}

export default function ProductsTable() {
    const { t, i18n } = useTranslation();
    const { calculation, isCalculating } = useSelector((state) => state.configurator);
    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatMoney = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
    const backendProducts = useMemo(() => (Array.isArray(calculation?.products) ? calculation.products : []), [calculation]);
    const backendRelatedProducts = useMemo(() => (Array.isArray(calculation?.relatedProducts) ? calculation.relatedProducts : []), [calculation]);
    const total = Number(calculation?.productsSubtotalPerProject ?? calculation?.productsSubtotal ?? 0);
    const unmetRequirements = Array.isArray(calculation?.unmetRequirements) ? calculation.unmetRequirements : [];

    const items = useMemo(() => backendProducts.map((product) => mapProductLine(product, t('configurator.summary.products.defaultName', { defaultValue: 'Product' }))), [backendProducts, t]);
    const relatedItems = useMemo(() => backendRelatedProducts.map((product) => mapProductLine(product, t('configurator.summary.products.relatedDefaultName', { defaultValue: 'Related Product' }))), [backendRelatedProducts, t]);
    const lineCount = items.length + relatedItems.length;

    if (isCalculating && lineCount === 0) {
        return (
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-5">
                <div className="flex items-center gap-3 text-primary-700">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-xs sm:text-sm font-bold">{t('configurator.summary.products.calculating', { defaultValue: 'Calculating products from the backend...' })}</p>
                </div>
            </Card>
        );
    }

    if (lineCount === 0) {
        return (
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-700" /> {t('configurator.summary.products.title', { defaultValue: 'Products' })}
                </h3>
                {unmetRequirements.length > 0 ? (
                    <p className="text-xs text-amber-700 font-semibold leading-relaxed">{t('configurator.summary.products.missingMappings', { defaultValue: 'The backend found required functions that do not have a complete product mapping yet. Update the master data before generating the offer.' })}</p>
                ) : (
                    <p className="text-xs text-textSecondary italic">{t('configurator.summary.products.waiting', { defaultValue: 'Backend-calculated products will appear here after the configuration is recalculated.' })}</p>
                )}
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                        <Package className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.products.title', { defaultValue: 'Products' })}</h3>
                </div>
                <Badge variant="neutral" className="bg-slate-100 border-none text-[9px] font-bold text-textSecondary uppercase tracking-wider px-2.5 py-1">
                    {t('configurator.summary.products.count', { count: lineCount, defaultValue: '{{count}} items' })}
                </Badge>
            </div>

            {/* Mobile Cards List (< 768px) */}
            <div className="md:hidden space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {items.map((item) => <ProductMobileCard key={item.key} item={item} formatMoney={formatMoney} t={t} />)}
                {relatedItems.length > 0 ? (
                    <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-800 px-1">{t('configurator.summary.products.relatedTitle', { defaultValue: 'Related Products' })}</span>
                        <div className="mt-2 space-y-2.5">
                            {relatedItems.map((item) => <ProductMobileCard key={`related-${item.key}`} item={item} formatMoney={formatMoney} isRelated t={t} />)}
                        </div>
                    </div>
                ) : null}

                <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{t('configurator.summary.products.footerLabel', { defaultValue: 'Subtotal / Project' })}</span>
                    <span className="text-base font-black text-primary-700 tabular-nums">{formatMoney(total)}</span>
                </div>
            </div>

            {/* Desktop Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto max-h-[460px] overflow-y-auto custom-scrollbar -mx-1">
                <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-4 py-2.5 text-[10px] font-bold text-textSecondary uppercase tracking-wider">{t('configurator.summary.products.columns.photo', { defaultValue: 'Photo' })}</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-textSecondary uppercase tracking-wider">{t('configurator.summary.products.columns.product', { defaultValue: 'Product' })}</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-textSecondary uppercase tracking-wider text-center">{t('configurator.summary.products.columns.quantity', { defaultValue: 'Quantity' })}</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-textSecondary uppercase tracking-wider text-right">{t('configurator.summary.products.columns.unitPrice', { defaultValue: 'Unit Price' })}</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-textSecondary uppercase tracking-wider text-right">{t('configurator.summary.products.columns.subtotal', { defaultValue: 'Subtotal' })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => <ProductRow key={item.key} item={item} formatMoney={formatMoney} t={t} />)}
                        {relatedItems.length > 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-2 bg-primary-50/50">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary-800">{t('configurator.summary.products.relatedTitle', { defaultValue: 'Related Products' })}</div>
                                </td>
                            </tr>
                        ) : null}
                        {relatedItems.map((item) => <ProductRow key={`related-${item.key}`} item={item} formatMoney={formatMoney} isRelated t={t} />)}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                            <td colSpan={4} className="px-4 py-3">
                                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{t('configurator.summary.products.footerLabel', { defaultValue: 'Products Subtotal / Project' })}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="text-base font-black text-primary-700 tabular-nums">{formatMoney(total)}</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-3.5 flex items-center gap-2.5 p-3 bg-[#f9faf6] rounded-xl border border-slate-200/80">
                <Info className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                <p className="text-[11px] text-textSecondary leading-relaxed">{t('configurator.summary.products.footer', { defaultValue: 'Products shown here come directly from the backend calculation.' })}</p>
            </div>
        </Card>
    );
}