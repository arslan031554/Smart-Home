import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    ArrowLeft,
    Download,
    Printer,
    Mail,
    CheckCircle,
    Building2,
    MapPin,
    Zap,
    TrendingDown,
    Calendar,
    ArrowRight,
    Bell,
    Loader2,
    AlertCircle,
    Edit3,
    Copy,
    Trash2,
    ShieldCheck,
    Box,
    MessageSquare,
    ClipboardList,
    Layers3,
    Wrench,
} from 'lucide-react';
import { StatusBadge } from '@/components/offers/StatusBadge';
import {
    Button,
    Badge,
    Card,
    SectionTitle,
    AnimatedPageWrapper,
    PremiumTableWrapper,
    Alert,
} from '@/components/common/UIComponents';
import { fetchOfferById, duplicateOffer, deleteOffer, updateOfferStatus } from '@/features/offers/offersSlice';
import api from '@/utils/api';
import { reopenOfferById } from '@/features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import { hasAdminAccess } from '@/constants/adminPermissions';

export default function OfferDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { currentOffer: offer, loading } = useSelector((state) => state.offers);
    const { user } = useSelector((state) => state.auth);
    const [exporting, setExporting] = useState(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchOfferById(id));
        }
    }, [dispatch, id]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
    const formatDate = (value) => {
        if (!value) return t('offers.detail.noDate');
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(locale);
    };
    const getFollowupReasonLabel = (reason) => {
        const map = {
            offer_not_ordered: 'offerNotOrdered',
            unfinished_configuration: 'unfinishedConfiguration',
        };
        return t(`offers.followupReasons.${map[reason] || 'processVerification'}`);
    };

    if (loading && !offer) {
        return (
            <AnimatedPageWrapper className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-textSecondary">{t('offers.detail.loading')}</p>
            </AnimatedPageWrapper>
        );
    }

    if (!offer) {
        return (
            <AnimatedPageWrapper className="mx-auto max-w-2xl space-y-6">
                <Alert variant="error">{t('offers.detail.notFound')}</Alert>
                <Link to="/dashboard/offers">
                    <Button variant="outline">{t('offers.detail.backToOffers')}</Button>
                </Link>
            </AnimatedPageWrapper>
        );
    }

    const snapshot = offer.calculationSnapshot || {};
    const snapshotProjectInfo = snapshot.projectInfo || {};
    const snapshotLevels = Array.isArray(snapshot.levels) ? snapshot.levels : [];
    const projectName = snapshotProjectInfo.name ?? offer.project?.name ?? offer.projectName ?? t('offers.detail.projectFallback');
    const buildingTypeName = offer.project?.buildingType?.name ?? snapshotProjectInfo.buildingTypeName ?? offer.buildingType ?? t('offers.detail.unknownBuildingType');
    const products = offer.products ?? [];
    const services = offer.services ?? [];
    const hardwareItems = products.map((p) => ({
        name: p.productName,
        code: p.productCode,
        qty: p.quantity,
        price: p.unitPrice,
        subtotal: p.subtotal,
    }));
    const roomsCount = snapshotLevels.reduce((acc, level) => acc + (Array.isArray(level.rooms) ? level.rooms.length : 0), 0);
    const functionsCount = snapshotLevels.reduce((acc, level) => acc + (Array.isArray(level.rooms) ? level.rooms.reduce((roomAcc, room) => {
        const selections = Array.isArray(room.functionSelections) ? room.functionSelections : (Array.isArray(room.functions) ? room.functions : []);
        return roomAcc + selections.filter((selection) => Number(selection?.quantity || 0) > 0).length;
    }, 0) : 0), 0);
    const grandTotal = offer.grandTotal ?? 0;
    const productsSubtotal = offer.productsSubtotal ?? 0;
    const servicesSubtotal = offer.servicesSubtotal ?? 0;
    const discountAmount = offer.discountAmount ?? 0;
    const follow = offer.followUp || offer.followup || null;
    const projectMultiplier = Math.max(1, parseInt(snapshotProjectInfo.projectMultiplicationIndex ?? offer.project?.multiplicationIndex ?? 1, 10) || 1);
    const snapshotBreakdown = snapshot.calculationBreakdown || {};
    const totalPerProject = snapshotBreakdown.totalPerProject ?? (
        (snapshotBreakdown.productsSubtotalPerProject ?? (projectMultiplier > 0 ? productsSubtotal / projectMultiplier : productsSubtotal)) +
        (snapshotBreakdown.servicesSubtotalPerProject ?? (projectMultiplier > 0 ? servicesSubtotal / projectMultiplier : servicesSubtotal))
    );
    const grossTotal = snapshotBreakdown.grossTotal ?? (productsSubtotal + servicesSubtotal);
    const customerEmail = offer?.project?.user?.email || offer?.customerEmail;

    const handleExport = async (format) => {
        setExporting(format);
        try {
            const res = await api.get(`/offers/${id}/export/${format}`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `offer-${id}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } finally {
            setExporting(null);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleEmail = () => {
        if (!customerEmail) return;
        const subject = encodeURIComponent(`${offer.offerNumber || t('offers.detail.title')} - ${projectName}`);
        window.location.href = `mailto:${customerEmail}?subject=${subject}`;
    };

    const handleEditOffer = async () => {
        const result = await dispatch(reopenOfferById(id));
        if (reopenOfferById.fulfilled.match(result)) {
            navigate('/configurator');
        }
    };

    const handleDuplicateOffer = async () => {
        const result = await dispatch(duplicateOffer(id));
        if (duplicateOffer.fulfilled.match(result)) {
            navigate('/dashboard/offers');
        }
    };

    const handleDeleteOffer = async () => {
        const shouldDelete = window.confirm(t('offers.deleteOfferDesc'));
        if (!shouldDelete) return;
        const result = await dispatch(deleteOffer(id));
        if (deleteOffer.fulfilled.match(result)) {
            navigate('/dashboard/offers');
        }
    };

    const handleAcceptOffer = async () => {
        if (accepting || offer.status === 'ordered' || offer.status === 'cancelled') return;
        setAccepting(true);
        try {
            await dispatch(updateOfferStatus({ id, status: 'ordered' })).unwrap();
        } finally {
            setAccepting(false);
        }
    };

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-10 pb-20">
            <div className="flex items-center justify-between gap-4">
                <Link to="/dashboard/offers" className="inline-flex items-center gap-2 text-sm font-medium text-textSecondary transition-colors hover:text-primary-300">
                    <ArrowLeft className="h-4 w-4" />
                    {t('offers.detail.backToOffers')}
                </Link>
            </div>

            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <StatusBadge status={offer.status} />
                                <Badge variant="neutral" className="gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {t('offers.detail.established', { date: formatDate(offer.createdAt) })}
                                </Badge>
                                <Badge variant="primary" className="gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {t('offers.detail.technicalVerified')}
                                </Badge>
                            </div>

                            <SectionTitle
                                title={projectName}
                                subtitle={t('offers.detail.subtitle')}
                                badge={t('offers.detail.recordReference', { id })}
                                className="mb-0"
                            />

                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                                    <Building2 className="h-4 w-4 text-primary-300" />
                                    {buildingTypeName}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                                    <MapPin className="h-4 w-4 text-primary-300" />
                                    {t('offers.detail.location')}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                                    <ClipboardList className="h-4 w-4 text-primary-300" />
                                    {t('offers.detail.specificationVersion')}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 p-1.5">
                                <Button variant="ghost" className="h-10 w-10 rounded-full p-0" title={t('offers.detail.print')} onClick={handlePrint}>
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" className="h-10 w-10 rounded-full p-0" title={t('offers.detail.email')} onClick={handleEmail} disabled={!customerEmail}>
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button variant="secondary" size="lg" className="gap-2" onClick={handleEditOffer}>
                                <Edit3 className="h-4.5 w-4.5" />
                                {t('offers.detail.edit')}
                            </Button>
                            <Button variant="outline" size="lg" className="gap-2" onClick={handleDuplicateOffer}>
                                <Copy className="h-4.5 w-4.5" />
                                {t('offers.detail.duplicate')}
                            </Button>
                            <Button variant="secondary" size="lg" className="gap-2 border-red-500/20 text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={handleDeleteOffer}>
                                <Trash2 className="h-4.5 w-4.5" />
                                {t('offers.detail.delete')}
                            </Button>
                            <Button size="lg" className="gap-2" onClick={() => handleExport('pdf')} disabled={!!exporting}>
                                {exporting === 'pdf' ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
                                {t('offers.detail.exportPdf')}
                            </Button>
                            {hasAdminAccess(user) ? (
                                <Button variant="outline" size="lg" className="gap-2" onClick={() => handleExport('excel')} disabled={!!exporting}>
                                    {exporting === 'excel' ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
                                    {t('offers.detail.exportExcel', { defaultValue: 'Export Excel' })}
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                icon: Layers3,
                                label: t('offers.detail.rooms'),
                                value: roomsCount || offer.roomsCount || 0,
                            },
                            {
                                icon: Zap,
                                label: t('offers.detail.smartFeatures'),
                                value: functionsCount || offer.functionsCount || 0,
                            },
                            {
                                icon: Box,
                                label: t('offers.detail.lineItems', { count: hardwareItems.length }),
                                value: hardwareItems.length,
                            },
                            {
                                icon: Wrench,
                                label: t('offers.detail.servicesTitle'),
                                value: services.length,
                            },
                        ].map((item) => (
                            <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 px-5 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{item.label}</p>
                                        <p className="mt-1 font-heading text-3xl font-semibold leading-none text-textPrimary">{item.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <SectionTitle
                                title={t('offers.detail.billOfMaterials')}
                                badge={t('offers.detail.lineItems', { count: hardwareItems.length })}
                                className="mb-0"
                            />
                        </div>

                        <PremiumTableWrapper>
                            <thead>
                                <tr className="border-b border-white/8 bg-white/5">
                                    <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.componentSpec')}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.quantity')}</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.unitNet')}</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.totalNet')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                                {hardwareItems.length ? hardwareItems.map((item, idx) => (
                                    <tr key={`${item.code}-${idx}`} className="transition-colors hover:bg-white/5">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-medium uppercase tracking-[0.02em] text-textPrimary">{item.name}</p>
                                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{item.code}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-sm font-medium text-textPrimary">
                                                {item.qty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-medium text-textSecondary">{formatCurrency(item.price || 0)}</td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-sm font-semibold text-textPrimary">{formatCurrency(item.subtotal || 0)}</p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-sm text-textSecondary">
                                            {t('offers.detail.noHardware', { defaultValue: 'No hardware line items were generated for this offer yet.' })}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </PremiumTableWrapper>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle
                            title={t('offers.detail.servicesTitle')}
                            badge={t('offers.detail.quantityShort', { count: services.length })}
                            className="mb-0"
                        />

                        {services.length ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {services.map((service) => (
                                    <Card key={service.serviceId || service.id} className="rounded-[1.8rem] p-6">
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-heading text-3xl font-semibold leading-none text-primary-300">
                                                        {formatCurrency(service.subtotal ?? 0)}
                                                    </p>
                                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.detail.calculatedNet')}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-lg font-medium leading-tight text-textPrimary">{service.serviceName ?? service.name}</p>
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <Badge variant="neutral">
                                                        {t('offers.detail.quantityShort', { count: service.calcQty ?? 1 })}
                                                    </Badge>
                                                    {service.pricingMode ? <Badge variant="primary">{service.pricingMode}</Badge> : null}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="rounded-[2rem] p-8 text-center">
                                <p className="text-sm text-textSecondary">{t('offers.detail.noServices')}</p>
                            </Card>
                        )}
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="hero-frame rounded-[2.2rem] p-8">
                        <div className="space-y-8">
                            <div>
                                <Badge variant="primary" className="mb-4">{t('offers.detail.financialTitle')}</Badge>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.productsServices')} / {t('offers.detail.perProject', 'Per Project')}</span>
                                        <span className="font-medium text-textPrimary">{formatCurrency(totalPerProject)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.quantity')}</span>
                                        <span className="font-medium text-textPrimary">x {projectMultiplier}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.grossTotal', 'Gross Total')}</span>
                                        <span className="font-medium text-textPrimary">{formatCurrency(grossTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-emerald-300">
                                        <span className="inline-flex items-center gap-2">
                                            <TrendingDown className="h-4 w-4" />
                                            {t('offers.detail.discount')}
                                        </span>
                                        <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[1.8rem] border border-primary-500/18 bg-primary-500/10 px-5 py-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-200">{t('offers.detail.grandTotal')}</p>
                                <p className="mt-3 font-heading text-5xl font-semibold leading-none text-textPrimary">{formatCurrency(grandTotal)}</p>
                                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.detail.exclVat')}</p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full gap-2"
                                onClick={handleAcceptOffer}
                                disabled={accepting || offer.status === 'ordered' || offer.status === 'cancelled'}
                            >
                                {accepting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : null}
                                {t('offers.detail.accept')}
                                <ArrowRight className="h-4.5 w-4.5" />
                            </Button>

                            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                                {t('offers.detail.validFor')}
                            </p>
                        </div>
                    </div>

                    <Card className="rounded-[2rem] p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('offers.detail.lifecycle')}</h3>
                                <p className="text-sm text-textSecondary">{t('offers.detail.autoGeneratedNote')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {follow?.enabled ? (
                                <div className="space-y-4 rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.detail.nextContact')}</span>
                                        <Badge variant="neutral">{formatDate(follow.nextReminderAt)}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.detail.channel')}</span>
                                        <div className="flex gap-2">
                                            {follow.channels?.email ? (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-primary-300" title={t('offers.detail.emailChannel')}>
                                                    <Mail className="h-3.5 w-3.5" />
                                                </div>
                                            ) : null}
                                            {follow.channels?.sms ? (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-primary-300" title={t('offers.detail.smsChannel')}>
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <Badge variant="primary">{getFollowupReasonLabel(follow.reason)}</Badge>
                                </div>
                            ) : (
                                <p className="text-sm text-textSecondary">{t('offers.detail.noFollowup')}</p>
                            )}
                        </div>
                    </Card>
                </aside>
            </div>
        </AnimatedPageWrapper>
    );
}
