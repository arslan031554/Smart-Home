import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    Search, Filter, Calendar, Download, Eye, Layers, Clock,
    CheckCircle, Bell, Loader2, Euro, Mail, AlertTriangle,
    RotateCcw, MessageSquare,
} from 'lucide-react';
import { StatusBadge } from '@/components/offers/StatusBadge';
import {
    Button, Badge, Card, SectionTitle, AnimatedPageWrapper,
} from '@/components/common/UIComponents';
import SelectMenu from '@/components/common/SelectMenu';
import { Link, useSearchParams } from 'react-router-dom';
import { snoozeFollowUp, updateFollowUpSettings } from '@/features/offers/offersSlice';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import api from '@/utils/api';
import { OFFER_STATUSES, OFFER_STATUS_TRANSLATION_KEYS, isOfferGeneratedStatus, normalizeOfferStatus } from '@/constants/offerStatuses';

export default function AdminOffersMonitor() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [offers, setOffers] = useState([]);
    const [offersLoading, setOffersLoading] = useState(false);
    const [offersError, setOffersError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        sort: 'created_at_desc',
    });
    const [clientFilter, setClientFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [projectFilterLabel, setProjectFilterLabel] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [sort, setSort] = useState('created_at_desc');
    const [downloadingOfferId, setDownloadingOfferId] = useState(null);
    const [updatingFollowupId, setUpdatingFollowupId] = useState(null);

    const fetchAdminOffers = useCallback(async (nextPage = pagination.page) => {
        setOffersLoading(true);
        setOffersError(null);
        try {
            const params = {
                page: nextPage,
                limit: pagination.limit,
                sort,
            };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (clientFilter.trim()) params.client = clientFilter.trim();
            if (projectFilter) params.projectId = projectFilter;
            if (minValue !== '') params.min_value = minValue;
            if (maxValue !== '') params.max_value = maxValue;

            const response = await api.get('/admin/offers', { params });
            const data = response.data.data || {};
            setOffers(Array.isArray(data.items) ? data.items : []);
            setPagination({
                total: Number(data.total || 0),
                page: Number(data.page || nextPage),
                limit: Number(data.limit || pagination.limit),
                totalPages: Number(data.totalPages || 1),
                sort: data.sort || sort,
            });
        } catch (error) {
            setOffers([]);
            setOffersError(error.response?.data?.message || t('offers.adminMonitor.error', { defaultValue: 'Failed to load offers' }));
        } finally {
            setOffersLoading(false);
        }
    }, [clientFilter, dateFrom, dateTo, maxValue, minValue, pagination.limit, pagination.page, projectFilter, sort, statusFilter, t]);

    useEffect(() => {
        const nextProjectId = searchParams.get('projectId') || '';
        const nextProjectLabel = searchParams.get('project') || '';
        const nextClient = searchParams.get('client') || '';
        setProjectFilter(nextProjectId);
        setProjectFilterLabel(nextProjectLabel);
        setClientFilter(nextClient);
    }, [searchParams]);
    useEffect(() => {
        fetchAdminOffers(1);
    }, [clientFilter, dateFrom, dateTo, maxValue, minValue, projectFilter, sort, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const resetFilters = () => {
        setClientFilter('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        setMinValue('');
        setMaxValue('');
        setSort('created_at_desc');
        setProjectFilter('');
        setProjectFilterLabel('');
        setSearchParams({});
    };


    const handleFollowupChannelToggle = async (offer, patch) => {
        if (!offer?.id) return;
        setUpdatingFollowupId(offer.id);
        try {
            await dispatch(updateFollowUpSettings({ id: offer.id, ...patch })).unwrap();
            await fetchAdminOffers(pagination.page);
        } finally {
            setUpdatingFollowupId(null);
        }
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

    const pendingFollowups = offers.filter((offer) => offer.followUp?.enabled && offer.followUp?.status === 'pending').length;
    const followupOffers = offers.filter((offer) => offer.followUp?.enabled);
    const orderedOffers = offers.filter((offer) => normalizeOfferStatus(offer.status) === 'ordered').length;
    const generatedOffers = offers.filter((offer) => isOfferGeneratedStatus(offer.status)).length;

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
                        <Badge variant="neutral">{t('offers.adminMonitor.totalOffers', { count: pagination.total })}</Badge>
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
                            placeholder={t('offers.adminMonitor.clientSearchPlaceholder', { defaultValue: 'Client name or email' })}
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {[
                            {
                                icon: Filter,
                                value: statusFilter,
                                onChange: setStatusFilter,
                                options: [
                                    ['all', t('offers.adminMonitor.filters.allStatuses')],
                                    ...OFFER_STATUSES.map((status) => [status, t(OFFER_STATUS_TRANSLATION_KEYS[status])]),
                                ],
                            },
                            {
                                icon: Euro,
                                value: sort,
                                onChange: setSort,
                                options: [
                                    ['created_at_desc', t('offers.adminMonitor.sort.newest', { defaultValue: 'Newest' })],
                                    ['created_at_asc', t('offers.adminMonitor.sort.oldest', { defaultValue: 'Oldest' })],
                                    ['value_desc', t('offers.adminMonitor.sort.valueHigh', { defaultValue: 'Value high' })],
                                    ['value_asc', t('offers.adminMonitor.sort.valueLow', { defaultValue: 'Value low' })],
                                    ['status_asc', t('offers.adminMonitor.sort.statusAsc', { defaultValue: 'Status A-Z' })],
                                    ['status_desc', t('offers.adminMonitor.sort.statusDesc', { defaultValue: 'Status Z-A' })],
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
                        <label className="flex min-w-[140px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-textPrimary focus-within:border-primary-500/25 focus-within:ring-4 focus-within:ring-primary-500/10">
                            <Calendar className="h-4 w-4 text-textSecondary" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full bg-transparent text-[11px] font-semibold uppercase tracking-[0.12em] text-textPrimary outline-none"
                                aria-label={t('offers.adminMonitor.filters.dateFrom', { defaultValue: 'Date from' })}
                            />
                        </label>
                        <label className="flex min-w-[140px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-textPrimary focus-within:border-primary-500/25 focus-within:ring-4 focus-within:ring-primary-500/10">
                            <Calendar className="h-4 w-4 text-textSecondary" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full bg-transparent text-[11px] font-semibold uppercase tracking-[0.12em] text-textPrimary outline-none"
                                aria-label={t('offers.adminMonitor.filters.dateTo', { defaultValue: 'Date to' })}
                            />
                        </label>
                        <label className="flex min-w-[118px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-textPrimary focus-within:border-primary-500/25 focus-within:ring-4 focus-within:ring-primary-500/10">
                            <Euro className="h-4 w-4 text-textSecondary" />
                            <input
                                type="number"
                                min="0"
                                value={minValue}
                                onChange={(e) => setMinValue(e.target.value)}
                                placeholder={t('offers.adminMonitor.filters.minValue', { defaultValue: 'Min' })}
                                className="w-full bg-transparent text-[11px] font-semibold uppercase tracking-[0.12em] text-textPrimary outline-none placeholder:text-textSecondary"
                            />
                        </label>
                        <label className="flex min-w-[118px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-textPrimary focus-within:border-primary-500/25 focus-within:ring-4 focus-within:ring-primary-500/10">
                            <Euro className="h-4 w-4 text-textSecondary" />
                            <input
                                type="number"
                                min="0"
                                value={maxValue}
                                onChange={(e) => setMaxValue(e.target.value)}
                                placeholder={t('offers.adminMonitor.filters.maxValue', { defaultValue: 'Max' })}
                                className="w-full bg-transparent text-[11px] font-semibold uppercase tracking-[0.12em] text-textPrimary outline-none placeholder:text-textSecondary"
                            />
                        </label>
                        <Button size="sm" variant="outline" className="gap-2" onClick={resetFilters}>
                            <RotateCcw className="h-4 w-4" />
                            {t('offers.adminMonitor.filters.reset', { defaultValue: 'Reset' })}
                        </Button>
                    </div>
                </div>
            </Card>

            {projectFilter ? (
                <Card className="rounded-[1.5rem] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminProjects.projectFilter', { defaultValue: 'Project Filter' })}</p>
                            <p className="mt-1 text-sm font-medium text-textPrimary">{projectFilterLabel || projectFilter}</p>
                        </div>
                        <Link to="/admin/projects" className="text-sm font-medium text-primary-300 transition-colors hover:text-primary-200">
                            {t('adminProjects.backToProjects', { defaultValue: 'Back to Projects' })}
                        </Link>
                    </div>
                </Card>
            ) : null}
            {offersError ? (
                <Card className="rounded-[2rem] p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-red-300">{offersError}</p>
                        <Button size="sm" variant="secondary" onClick={() => fetchAdminOffers(pagination.page)}>
                            {t('offers.adminMonitor.retry', { defaultValue: 'Retry' })}
                        </Button>
                    </div>
                </Card>
            ) : null}

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
                                                <Badge variant="warning" className="max-w-full whitespace-normal text-left leading-snug">
                                                    {getFollowUpReasonLabel(offer.followUp.reason)}
                                                </Badge>
                                            </div>

                                            <div className="flex min-w-0 flex-wrap justify-end gap-2">
                                                {offer.followUp.channels?.email ? <Badge variant="cyan" className="max-w-full">{t('offers.adminMonitor.channels.email')}</Badge> : null}
                                                {offer.followUp.channels?.sms ? <Badge variant="neutral" className="max-w-full">{t('offers.adminMonitor.channels.sms')}</Badge> : null}
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-2">
                                            <h3 className="break-words text-[1.15rem] font-medium leading-tight text-textPrimary">
                                                {offer.projectName}
                                            </h3>
                                            <div className="min-w-0 space-y-1">
                                                <p className="break-all text-sm font-medium text-primary-300">{offer.offerNumber || offer.id}</p>
                                                <p className="break-all text-sm leading-relaxed text-textSecondary">{t('offers.adminMonitor.reference', { id: offer.id })}</p>
                                                <p className="break-words text-sm text-textSecondary">
                                                    {offer.customerName || t('offers.adminMonitor.anonymousClient')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex min-w-0 flex-wrap gap-2">
                                            <Badge variant="neutral" className="max-w-full">{formatCurrency(offer.totalAmount)}</Badge>
                                            {offer.buildingType ? (
                                                <Badge variant="neutral" className="max-w-full whitespace-normal text-left leading-snug">
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
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <Button
                                                    size="sm"
                                                    variant={offer.followUp.channels?.email ? 'accent' : 'outline'}
                                                    className="min-w-0 w-full justify-center gap-2 whitespace-normal px-3 text-center leading-tight"
                                                    disabled={updatingFollowupId === offer.id}
                                                    onClick={() => handleFollowupChannelToggle(offer, {
                                                        channelEmail: !offer.followUp.channels?.email,
                                                    })}
                                                >
                                                    <Mail className="h-4 w-4" />
                                                    {offer.followUp.channels?.email
                                                        ? t('offers.adminMonitor.channels.emailOn', { defaultValue: 'Email On' })
                                                        : t('offers.adminMonitor.channels.emailOff', { defaultValue: 'Email Off' })}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={offer.followUp.channels?.sms ? 'accent' : 'outline'}
                                                    className="min-w-0 w-full justify-center gap-2 whitespace-normal px-3 text-center leading-tight"
                                                    disabled={updatingFollowupId === offer.id}
                                                    onClick={() => handleFollowupChannelToggle(offer, {
                                                        channelSms: !offer.followUp.channels?.sms,
                                                    })}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    {offer.followUp.channels?.sms
                                                        ? t('offers.adminMonitor.channels.smsOn', { defaultValue: 'SMS On' })
                                                        : t('offers.adminMonitor.channels.smsOff', { defaultValue: 'SMS Off' })}
                                                </Button>
                                            </div>

                                            <Button
                                                size="sm"
                                                className="min-w-0 w-full justify-center gap-2 whitespace-normal px-3 text-center leading-tight"
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
                                                    <Button size="sm" variant="secondary" className="min-w-0 w-full justify-center whitespace-normal px-3 text-center leading-tight">
                                                        {t('offers.adminMonitor.viewHistory')}
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="min-w-0 w-full justify-center whitespace-normal px-3 text-center leading-tight"
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
                        { icon: Layers, value: generatedOffers, label: t('offers.statuses.offerGenerated', { defaultValue: 'Offer Generated' }) },
                        { icon: CheckCircle, value: orderedOffers, label: t('offers.statuses.ordered') },
                    ].map((item) => (
                        <Card key={item.label} className="rounded-[1.7rem] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
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
                    badge={t('offers.adminMonitor.totalOffers', { count: pagination.total })}
                    className="mb-0"
                />

                <Card className="overflow-hidden rounded-[2rem] p-0">
                    {offersLoading && !offers.length ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4">
                            <Loader2 className="h-9 w-9 animate-spin text-primary-300" />
                            <p className="text-sm font-medium uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.loading')}</p>
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-6 text-center">
                            <Bell className="h-9 w-9 text-primary-300" />
                            <div>
                                <p className="text-lg font-medium text-textPrimary">{t('offers.adminMonitor.emptyTitle', { defaultValue: 'No offers match these filters' })}</p>
                                <p className="mt-2 text-sm text-textSecondary">{t('offers.adminMonitor.emptyDesc', { defaultValue: 'Reset filters or widen the date and value range.' })}</p>
                            </div>
                        </div>
                    ) : (
                    <div className="relative overflow-x-auto">
                        {offersLoading ? (
                            <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-white/5">
                                <div className="h-full w-1/3 animate-pulse bg-primary-300" />
                            </div>
                        ) : null}
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
                                {offers.map((offer) => (
                                    <tr key={offer.id} className="transition-colors hover:bg-white/5">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-medium text-textPrimary">{offer.offerNumber || offer.id}</p>
                                            <p className="mt-1 text-sm text-textSecondary">{offer.id}</p>
                                            <p className="mt-2 text-sm text-textSecondary">{formatDate(offer.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
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
                                                <Link to={`/admin/offers/${offer.id}`}>
                                                    <button className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300" title={t('offers.adminMonitor.viewOffer')}>
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDownloadOffer(offer)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300"
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
                    )}
                </Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-textSecondary">
                        {t('offers.adminMonitor.pagination', {
                            defaultValue: 'Page {{page}} of {{totalPages}}',
                            page: pagination.page,
                            totalPages: pagination.totalPages,
                        })}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={offersLoading || pagination.page <= 1}
                            onClick={() => fetchAdminOffers(pagination.page - 1)}
                        >
                            {t('offers.adminMonitor.previous', { defaultValue: 'Previous' })}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={offersLoading || pagination.page >= pagination.totalPages}
                            onClick={() => fetchAdminOffers(pagination.page + 1)}
                        >
                            {t('offers.adminMonitor.next', { defaultValue: 'Next' })}
                        </Button>
                    </div>
                </div>
            </section>
        </AnimatedPageWrapper>
    );
}
