import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Search, Filter, Calendar, Download, Eye, Layers, Clock,
    CheckCircle, Bell, Loader2, Euro, Mail, AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '@/components/offers/StatusBadge';
import {
    Button, Badge, Card, SectionTitle, AnimatedPageWrapper,
} from '@/components/common/UIComponents';
import SelectMenu from '@/components/common/SelectMenu';
import { Link } from 'react-router-dom';
import { updateOfferStatus, snoozeFollowUp, fetchOffers } from '@/features/offers/offersSlice';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import api from '@/utils/api';

export default function AdminOffersMonitor() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { offersList: offers = [], loading: offersLoading } = useSelector((state) => state.offers);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [valueFilter, setValueFilter] = useState('all');
    const [downloadingOfferId, setDownloadingOfferId] = useState(null);

    useEffect(() => {
        dispatch(fetchOffers());
    }, [dispatch]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
    const formatDate = (value) => {
        if (!value) return t('offers.adminMonitor.noDate');
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(locale);
    };

    const getFollowUpStatusLabel = (status) => {
        if (!status) return t('offers.adminMonitor.followupStatuses.pending');
        if (status.startsWith('reminded_')) {
            const step = Number(status.split('_')[1] || 0);
            return t('offers.adminMonitor.followupStatuses.reminded', { count: step || '?' });
        }

        const map = {
            pending: 'pending',
            snoozed: 'snoozed',
            completed: 'completed',
            no_contact: 'noContact',
        };
        return t(`offers.adminMonitor.followupStatuses.${map[status] || 'pending'}`);
    };

    const getFollowUpReasonLabel = (reason) => {
        const map = {
            offer_not_ordered: 'offerNotOrdered',
            unfinished_configuration: 'unfinishedConfiguration',
        };
        return t(`offers.adminMonitor.followupReasons.${map[reason] || 'offerNotOrdered'}`);
    };

    const filteredOffers = offers.filter((offer) => {
        const matchesSearch = (offer.projectName || '').toLowerCase().includes(searchTerm.toLowerCase())
            || (offer.offerNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
            || (offer.id || '').toLowerCase().includes(searchTerm.toLowerCase())
            || (offer.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;

        const createdAt = offer.createdAt ? new Date(offer.createdAt) : null;
        const now = new Date();
        let matchesDate = true;
        if (dateFilter === 'today') matchesDate = !!createdAt && createdAt.toDateString() === now.toDateString();
        if (dateFilter === '7d') matchesDate = !!createdAt && createdAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (dateFilter === '30d') matchesDate = !!createdAt && createdAt >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let matchesValue = true;
        if (valueFilter === 'high') matchesValue = offer.totalAmount >= 50000;
        if (valueFilter === 'medium') matchesValue = offer.totalAmount >= 10000 && offer.totalAmount < 50000;
        if (valueFilter === 'low') matchesValue = offer.totalAmount < 10000;

        return matchesSearch && matchesStatus && matchesDate && matchesValue;
    });

    const handleStatusChange = (id, newStatus) => {
        dispatch(updateOfferStatus({ id, status: newStatus }));
    };

    const handleDownloadOffer = async (offer) => {
        const offerId = offer?.id;
        if (!offerId) return;
        setDownloadingOfferId(offerId);
        try {
            const response = await api.get(`/offers/${offerId}/export/pdf`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `offer-${offer?.offerNumber || offerId}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);
        } finally {
            setDownloadingOfferId(null);
        }
    };

    if (offersLoading && !offers.length) {
        return (
            <AnimatedPageWrapper className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.loading')}</p>
            </AnimatedPageWrapper>
        );
    }

    const pendingFollowups = offers.filter((offer) => offer.followUp?.enabled && offer.followUp?.status === 'pending').length;
    const followupOffers = offers.filter((offer) => offer.followUp?.enabled);
    const orderedOffers = offers.filter((offer) => offer.status === 'ordered').length;
    const pendingDecisionOffers = offers.filter((offer) => ['offer_ready', 'waiting'].includes(offer.status)).length;

    return (
        <AnimatedPageWrapper className="space-y-8 pb-20">
            <div className="hero-frame rounded-[2.2rem] px-6 py-8 sm:px-8">
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionTitle
                        title={t('offers.adminMonitor.title')}
                        subtitle={t('offers.adminMonitor.subtitle')}
                        badge={t('offers.adminMonitor.badge')}
                        className="mb-0"
                    />
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="neutral">{t('offers.adminMonitor.totalOffers', { count: filteredOffers.length })}</Badge>
                        <Badge variant="warning">{t('offers.adminMonitor.pendingTasks', { count: pendingFollowups })}</Badge>
                    </div>
                </div>
            </div>

            <Card className="rounded-[1.9rem] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-96">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                        <input
                            type="text"
                            placeholder={t('offers.adminMonitor.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                            {
                                icon: Filter,
                                value: statusFilter,
                                onChange: setStatusFilter,
                                options: [
                                    ['all', t('offers.adminMonitor.filters.allStatuses')],
                                    ['draft', t('offers.statuses.draft')],
                                    ['in_progress', t('offers.statuses.inProgress')],
                                    ['offer_ready', t('offers.statuses.offerGenerated', { defaultValue: 'Offer Generated' })],
                                    ['waiting', t('offers.statuses.waiting')],
                                    ['ordered', t('offers.statuses.ordered')],
                                    ['cancelled', t('offers.statuses.cancelled')],
                                ],
                            },
                            {
                                icon: Calendar,
                                value: dateFilter,
                                onChange: setDateFilter,
                                options: [
                                    ['all', t('offers.adminMonitor.filters.anyDate')],
                                    ['today', t('offers.adminMonitor.filters.today')],
                                    ['7d', t('offers.adminMonitor.filters.last7Days')],
                                    ['30d', t('offers.adminMonitor.filters.last30Days')],
                                ],
                            },
                            {
                                icon: Euro,
                                value: valueFilter,
                                onChange: setValueFilter,
                                options: [
                                    ['all', t('offers.adminMonitor.filters.anyValue')],
                                    ['high', t('offers.adminMonitor.filters.highValue')],
                                    ['medium', t('offers.adminMonitor.filters.mediumValue')],
                                    ['low', t('offers.adminMonitor.filters.lowValue')],
                                ],
                            },
                        ].map((control, index) => (
                            <SelectMenu
                                key={index}
                                value={control.value}
                                onChange={control.onChange}
                                options={control.options}
                                icon={control.icon}
                                ariaLabel={control.options[0]?.[1] || 'Filter'}
                                size="compact"
                                fullWidth={false}
                                align="right"
                                buttonClassName="min-w-[168px]"
                                triggerLabelClassName="text-[10px] font-semibold uppercase tracking-[0.14em]"
                                optionLabelClassName="text-[11px] font-semibold"
                            />
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-4">
                    <SectionTitle
                        title={t('offers.adminMonitor.followupTitle')}
                        badge={t('offers.adminMonitor.pendingTasks', { count: pendingFollowups })}
                        className="mb-0"
                    />

                    {followupOffers.length === 0 ? (
                        <Card className="rounded-[2rem] p-8">
                            <p className="text-sm text-textSecondary">{t('offers.adminMonitor.noTask')}</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {followupOffers.map((offer) => (
                                <Card key={offer.id} hover className="relative h-full overflow-hidden rounded-[2rem] p-0">
                                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/55 to-transparent" />
                                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary-500/10 blur-3xl" />

                                    <div className="relative z-10 flex h-full flex-col p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={clsx(
                                                        'h-2.5 w-2.5 rounded-full',
                                                        offer.followUp.status === 'pending' ? 'bg-amber-400' :
                                                            offer.followUp.status === 'snoozed' ? 'bg-sky-400' : 'bg-emerald-400',
                                                    )} />
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                                                        {getFollowUpStatusLabel(offer.followUp.status)}
                                                    </p>
                                                </div>
                                                <Badge variant="warning" className="max-w-fit">
                                                    {getFollowUpReasonLabel(offer.followUp.reason)}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {offer.followUp.channels?.email ? <Badge variant="cyan">{t('offers.adminMonitor.channels.email')}</Badge> : null}
                                                {offer.followUp.channels?.sms ? <Badge variant="neutral">{t('offers.adminMonitor.channels.sms')}</Badge> : null}
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-2">
                                            <h3 className="text-[1.15rem] font-medium leading-tight text-textPrimary">
                                                {offer.projectName}
                                            </h3>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-primary-300">{offer.offerNumber || offer.id}</p>
                                                <p className="text-sm text-textSecondary">{t('offers.adminMonitor.reference', { id: offer.id })}</p>
                                                <p className="text-sm text-textSecondary">
                                                    {offer.customerName || t('offers.adminMonitor.anonymousClient')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <Badge variant="neutral">{formatCurrency(offer.totalAmount)}</Badge>
                                            {offer.buildingType ? (
                                                <Badge variant="neutral">
                                                    {offer.buildingType.replace(/_/g, ' ')}
                                                </Badge>
                                            ) : null}
                                        </div>

                                        <div className="mt-5 rounded-[1.45rem] border border-white/8 bg-white/5 p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                                                {t('offers.adminMonitor.table.followup')}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2 text-sm text-textPrimary">
                                                <Clock className="h-4 w-4 text-primary-300" />
                                                <span>{formatDate(offer.followUp.nextReminderAt)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            <Button
                                                size="sm"
                                                className="w-full gap-2 justify-center"
                                                disabled={!offer.customerEmail}
                                                onClick={() => {
                                                    if (!offer.customerEmail) return;
                                                    window.location.href = `mailto:${offer.customerEmail}?subject=${encodeURIComponent(`Offer follow-up: ${offer.offerNumber || offer.projectName || offer.id}`)}`;
                                                }}
                                            >
                                                <Mail className="h-4 w-4" />
                                                {t('offers.adminMonitor.contactClient')}
                                            </Button>

                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <Link to={`/admin/offers/${offer.id}`} className="block">
                                                    <Button size="sm" variant="secondary" className="w-full justify-center">
                                                        {t('offers.adminMonitor.viewHistory')}
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full justify-center"
                                                    onClick={() => dispatch(snoozeFollowUp({ id: offer.id }))}
                                                >
                                                    {t('offers.adminMonitor.snooze')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {[
                        { icon: AlertTriangle, value: pendingFollowups, label: t('offers.adminMonitor.followupTitle') },
                        { icon: Layers, value: pendingDecisionOffers, label: t('offers.statuses.waiting') },
                        { icon: CheckCircle, value: orderedOffers, label: t('offers.statuses.ordered') },
                    ].map((item) => (
                        <Card key={item.label} className="rounded-[1.7rem] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-heading text-3xl font-semibold leading-none text-textPrimary">{item.value}</p>
                                    <p className="mt-1 text-sm text-textSecondary">{item.label}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <section className="space-y-4">
                <SectionTitle
                    title={t('offers.adminMonitor.ledgerTitle')}
                    badge={t('offers.adminMonitor.totalOffers', { count: filteredOffers.length })}
                    className="mb-0"
                />

                <Card className="overflow-hidden rounded-[2rem] p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/8 bg-white/5">
                                    <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.offerId')}</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.clientProject')}</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.valuation')}</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.status')}</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.followup')}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                                {filteredOffers.map((offer) => (
                                    <tr key={offer.id} className="transition-colors hover:bg-white/5">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-medium text-textPrimary">{offer.offerNumber || offer.id}</p>
                                            <p className="mt-1 text-sm text-textSecondary">{offer.id}</p>
                                            <p className="mt-2 text-sm text-textSecondary">{formatDate(offer.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                                    <Layers className="h-4.5 w-4.5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-textPrimary">{offer.customerName || t('offers.adminMonitor.anonymousClient')}</p>
                                                    <p className="mt-1 text-sm text-textSecondary">{offer.projectName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-heading text-3xl font-semibold leading-none text-primary-300">{formatCurrency(offer.totalAmount)}</p>
                                            {offer.buildingType ? <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{offer.buildingType.replace(/_/g, ' ')}</p> : null}
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={offer.status} />
                                        </td>
                                        <td className="px-6 py-5">
                                            {offer.followUp?.enabled ? (
                                                <div>
                                                    <p className="text-sm font-medium text-textPrimary">{getFollowUpStatusLabel(offer.followUp.status)}</p>
                                                    <p className="mt-1 text-sm text-textSecondary">{formatDate(offer.followUp.nextReminderAt)}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-textSecondary">{t('offers.adminMonitor.noTask')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {offer.status === 'offer_ready' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(offer.id, 'ordered')}
                                                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/18 bg-emerald-500/10 text-emerald-300 transition-colors hover:bg-emerald-500/16"
                                                        title={t('offers.adminMonitor.markOrdered')}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                ) : null}
                                                <Link to={`/admin/offers/${offer.id}`}>
                                                    <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300" title={t('offers.adminMonitor.viewOffer')}>
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDownloadOffer(offer)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300"
                                                    title={t('offers.adminMonitor.download')}
                                                    disabled={downloadingOfferId === offer.id}
                                                >
                                                    {downloadingOfferId === offer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>
        </AnimatedPageWrapper>
    );
}
