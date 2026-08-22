import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
    Search, Filter, Calendar, Download, Eye, Layers, Clock,
    CheckCircle, Bell, Loader2, Euro, Mail, AlertTriangle,
    RotateCcw, MessageSquare, FileText,
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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FOLLOWUP_STATUS_FILTERS = Object.freeze([
    { value: 'pending', translationKey: 'pending' },
    { value: 'reminded', translationKey: 'reminderSent' },
    { value: 'attempted', translationKey: 'reminderAttempted' },
    { value: 'snoozed', translationKey: 'snoozed' },
]);

function normalizeProjectFilter(value) {
    const projectId = String(value || '').trim();
    return UUID_PATTERN.test(projectId) ? projectId : '';
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function AdminOffersMonitor() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialProjectFilter = normalizeProjectFilter(searchParams.get('projectId'));
    const initialProjectFilterLabel = searchParams.get('project') || '';
    const initialClientFilter = searchParams.get('client') || '';
    const requestIdRef = useRef(0);
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
    const [clientFilter, setClientFilter] = useState(initialClientFilter);
    const [projectFilter, setProjectFilter] = useState(initialProjectFilter);
    const [projectFilterLabel, setProjectFilterLabel] = useState(initialProjectFilterLabel);
    const [statusFilter, setStatusFilter] = useState('all');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [sort, setSort] = useState('created_at_desc');
    const [downloadingOfferId, setDownloadingOfferId] = useState(null);
    const [updatingFollowupId, setUpdatingFollowupId] = useState(null);

    // Local filter states for unified filter bar
    const [localClient, setLocalClient] = useState(initialClientFilter);
    const [localStatus, setLocalStatus] = useState('all');
    const [localValueRange, setLocalValueRange] = useState('all');
    const [localMinVal, setLocalMinVal] = useState('');
    const [localMaxVal, setLocalMaxVal] = useState('');
    const [localDateRange, setLocalDateRange] = useState('all');
    const [localDateFrom, setLocalDateFrom] = useState('');
    const [localDateTo, setLocalDateTo] = useState('');
    const [localOwner, setLocalOwner] = useState('');
    const [filterError, setFilterError] = useState('');

    const fetchAdminOffers = useCallback(async (nextPage = pagination.page) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        const activeClientFilter = clientFilter.trim();
        const activeOwnerFilter = ownerFilter.trim();
        const activeProjectFilter = normalizeProjectFilter(projectFilter);
        setOffersLoading(true);
        setOffersError(null);
        try {
            const params = {
                page: nextPage,
                limit: pagination.limit,
                sort,
            };
            if (statusFilter !== 'all') params.followup_status = statusFilter;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (activeClientFilter) params.client = activeClientFilter;
            if (activeOwnerFilter) params.owner = activeOwnerFilter;
            if (activeProjectFilter) params.projectId = activeProjectFilter;
            if (minValue !== '') params.min_value = minValue;
            if (maxValue !== '') params.max_value = maxValue;

            const response = await api.get('/admin/offers', { params });
            if (requestId !== requestIdRef.current) return;
            const data = response.data.data || {};
            const rawItems = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
            const hasUnexpectedProject = activeProjectFilter && rawItems.some((offer) => offer.projectId && offer.projectId !== activeProjectFilter);
            const items = hasUnexpectedProject ? rawItems.filter((offer) => offer.projectId === activeProjectFilter) : rawItems;
            setOffers(items);
            setPagination({
                total: hasUnexpectedProject ? items.length : Number(data.total || items.length || 0),
                page: Number(data.page || nextPage),
                limit: Number(data.limit || pagination.limit),
                totalPages: hasUnexpectedProject ? Math.max(1, Math.ceil(items.length / pagination.limit)) : Number(data.totalPages || 1),
                sort: data.sort || sort,
            });
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            setOffers([]);
            setOffersError(error.response?.data?.message || t('offers.adminMonitor.error', { defaultValue: 'Failed to load offers' }));
        } finally {
            if (requestId === requestIdRef.current) setOffersLoading(false);
        }
    }, [clientFilter, dateFrom, dateTo, maxValue, minValue, ownerFilter, pagination.limit, pagination.page, projectFilter, sort, statusFilter, t]);

    useEffect(() => {
        const nextProjectId = normalizeProjectFilter(searchParams.get('projectId'));
        const nextProjectLabel = searchParams.get('project') || '';
        const nextClient = searchParams.get('client') || '';
        setProjectFilter(nextProjectId);
        setProjectFilterLabel(nextProjectLabel);
        setClientFilter(nextClient);
        setLocalClient(nextClient);
    }, [searchParams]);

    useEffect(() => {
        fetchAdminOffers(1);
    }, [clientFilter, dateFrom, dateTo, maxValue, minValue, ownerFilter, projectFilter, sort, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
    const displayText = (value, fallback = '-') => {
        if (value === null || value === undefined || value === '') return fallback;
        if (value instanceof Date) return value.toLocaleDateString(locale);
        const type = typeof value;
        if (type === 'string' || type === 'number' || type === 'boolean') return String(value);
        if (type === 'object') {
            const candidate = value.name ?? value.label ?? value.title ?? value.fullName ?? value.email ?? value.slug ?? value.id ?? value.value ?? value.date ?? value.iso;
            if (candidate === value) return fallback;
            return displayText(candidate, fallback);
        }
        return String(value);
    };

    const formatDate = (value) => {
        const fallback = t('offers.adminMonitor.noDate');
        if (!value) return fallback;

        let source = value;
        if (typeof value === 'object' && !(value instanceof Date)) {
            source = value.date ?? value.iso ?? value.value ?? value.createdAt ?? value.updatedAt ?? value.timestamp;
            if (!source && typeof value.seconds === 'number') source = value.seconds * 1000;
        }

        const date = new Date(source);
        if (Number.isNaN(date.getTime())) return displayText(source, fallback);
        return date.toLocaleDateString(locale);
    };

    const getFollowUpStatusLabel = (status) => {
        const normalized = String(status || 'pending').toLowerCase();
        if (normalized.startsWith('reminded_')) {
            const step = Number(normalized.split('_')[1] || 0);
            return t('offers.adminMonitor.followupStatuses.reminded', { count: step || '?' });
        }
        if (normalized.startsWith('attempted_')) {
            const step = Number(normalized.split('_')[1] || 0);
            return t('offers.adminMonitor.followupStatuses.attempted', {
                count: step || '?',
                defaultValue: 'Reminder {{count}} attempted',
            });
        }
        if (normalized === 'reminded') {
            return t('offers.adminMonitor.followupStatuses.reminderSent', { defaultValue: 'Reminder sent' });
        }
        if (normalized === 'attempted') {
            return t('offers.adminMonitor.followupStatuses.reminderAttempted', { defaultValue: 'Reminder attempted' });
        }

        const map = {
            pending: 'pending',
            snoozed: 'snoozed',
            completed: 'completed',
            no_contact: 'noContact',
        };
        return t(`offers.adminMonitor.followupStatuses.${map[normalized] || 'pending'}`);
    };

    const getFollowUpReasonLabel = (reason) => {
        const normalized = String(reason || 'offer_not_ordered');
        const map = {
            offer_not_ordered: 'offerNotOrdered',
            unfinished_configuration: 'unfinishedConfiguration',
        };
        return t(`offers.adminMonitor.followupReasons.${map[normalized] || 'offerNotOrdered'}`);
    };

    const formatBuildingType = (buildingType) => {
        if (!buildingType) return '';
        return displayText(buildingType, '').replace(/_/g, ' ');
    };

    const handleApplyFilters = () => {
        let newMin = '';
        let newMax = '';
        if (localValueRange === 'under_5k') {
            newMin = '0';
            newMax = '5000';
        } else if (localValueRange === '5k_20k') {
            newMin = '5000';
            newMax = '20000';
        } else if (localValueRange === '20k_50k') {
            newMin = '20000';
            newMax = '50000';
        } else if (localValueRange === 'over_50k') {
            newMin = '50000';
            newMax = '';
        } else if (localValueRange === 'custom') {
            newMin = localMinVal.trim();
            newMax = localMaxVal.trim();
            const parsedMin = newMin === '' ? null : Number(newMin);
            const parsedMax = newMax === '' ? null : Number(newMax);
            if ((parsedMin !== null && (!Number.isFinite(parsedMin) || parsedMin < 0))
                || (parsedMax !== null && (!Number.isFinite(parsedMax) || parsedMax < 0))) {
                setFilterError(t('offers.adminMonitor.filters.invalidValue', {
                    defaultValue: 'Value limits must be valid non-negative numbers.',
                }));
                return;
            }
            if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
                setFilterError(t('offers.adminMonitor.filters.invalidValueOrder', {
                    defaultValue: 'Minimum value cannot be greater than maximum value.',
                }));
                return;
            }
        }

        let newFrom = '';
        let newTo = '';
        if (localDateRange === 'today') {
            const today = formatDateInput(new Date());
            newFrom = today;
            newTo = today;
        } else if (localDateRange === 'this_week') {
            const now = new Date();
            const day = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
            newFrom = formatDateInput(startOfWeek);
            newTo = formatDateInput(now);
        } else if (localDateRange === 'this_month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            newFrom = formatDateInput(startOfMonth);
            newTo = formatDateInput(now);
        } else if (localDateRange === 'custom') {
            newFrom = localDateFrom;
            newTo = localDateTo;
            if (newFrom && newTo && newFrom > newTo) {
                setFilterError(t('offers.adminMonitor.filters.invalidDateOrder', {
                    defaultValue: 'Start date cannot be after end date.',
                }));
                return;
            }
        }

        setFilterError('');
        setClientFilter(localClient.trim());
        setOwnerFilter(localOwner.trim());
        setStatusFilter(localStatus);
        setMinValue(newMin);
        setMaxValue(newMax);
        setDateFrom(newFrom);
        setDateTo(newTo);
    };

    const resetFilters = () => {
        setLocalClient('');
        setLocalStatus('all');
        setLocalValueRange('all');
        setLocalMinVal('');
        setLocalMaxVal('');
        setLocalDateRange('all');
        setLocalDateFrom('');
        setLocalDateTo('');
        setLocalOwner('');

        setClientFilter('');
        setOwnerFilter('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        setMinValue('');
        setMaxValue('');
        setSort('created_at_desc');
        setProjectFilterLabel('');
        setFilterError('');
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
            const lang = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('ro') ? 'ro' : 'en';
            const response = await api.get(`/offers/${offerId}/export/pdf?lang=${lang}`, { responseType: 'blob' });
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

    const handleExportCSV = () => {
        if (!offers.length) return;
        const headers = ['Offer ID', 'Offer Number', 'Date', 'Client Name', 'Client Email', 'Project Name', 'Valuation', 'Status', 'Next Follow-up'];
        const rows = offers.map(offer => [
            offer.id,
            offer.offerNumber || '',
            offer.createdAt ? new Date(offer.createdAt).toLocaleDateString(locale) : '',
            offer.customerName || 'Anonymous',
            offer.customerEmail || '',
            offer.projectName || '',
            offer.totalAmount || 0,
            offer.status || '',
            offer.followUp?.enabled && offer.followUp?.nextReminderAt ? new Date(offer.followUp.nextReminderAt).toLocaleDateString(locale) : 'None'
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => {
                const str = String(val).replace(/"/g, '""');
                return str.includes(',') ? `"${str}"` : str;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `offers-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const pendingFollowups = offers.filter((offer) => offer.followUp && typeof offer.followUp === 'object' && offer.followUp.enabled && offer.followUp.status === 'pending').length;
    const followupOffers = offers.filter((offer) => offer.followUp && typeof offer.followUp === 'object' && offer.followUp.enabled);

    // Calculates how many pending follow-up alerts are past their next reminder date
    const overdueActions = offers.filter((offer) => {
        if (!offer.followUp || typeof offer.followUp !== 'object' || !offer.followUp.enabled || offer.followUp.status !== 'pending') return false;
        if (!offer.followUp?.nextReminderAt) return false;
        return new Date(offer.followUp.nextReminderAt) < new Date();
    }).length;

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-6 pb-20">
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                    {t('offers.adminMonitor.badge', { defaultValue: 'ADMIN / OFFER PIPELINE' })}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                                {t('offers.adminMonitor.title', { defaultValue: 'Global Offer Monitoring' })}
                            </h1>
                            <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                                {t('offers.adminMonitor.subtitle', { defaultValue: 'Track customer follow-ups, offer status and transaction progress from one view.' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full xl:w-auto xl:self-start">
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleExportCSV}
                            className="!rounded-sm flex-1 sm:flex-none justify-center h-10 px-5 text-[11px] font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-500/40 bg-white hover:bg-primary-50/50 w-full sm:w-auto"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {t('offers.adminMonitor.exportData', { defaultValue: 'Export data' })}
                        </Button>
                        <Link to="/configurator" className="w-full sm:w-auto flex-1 sm:flex-none">
                            <Button size="md" className="!rounded-sm justify-center h-10 px-6 text-[11px] font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 w-full">
                                {t('offers.adminMonitor.newOffer', { defaultValue: 'New offer' })}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {[
                    { value: pendingFollowups, label: t('offers.adminMonitor.stats.activeFollowups', { defaultValue: 'Active follow-ups' }), desc: t('offers.adminMonitor.stats.updatedRecords', { defaultValue: 'Updated from current records' }), color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)' },
                    { value: pagination.total, label: t('offers.adminMonitor.stats.offersPipeline', { defaultValue: 'Offers in pipeline' }), desc: t('offers.adminMonitor.stats.updatedRecords', { defaultValue: 'Updated from current records' }), color: '#60b93f', bg: 'rgba(96,185,63,0.10)', border: 'rgba(96,185,63,0.22)' },
                    { value: overdueActions, label: t('offers.adminMonitor.stats.overdueActions', { defaultValue: 'Overdue actions' }), desc: t('offers.adminMonitor.stats.updatedRecords', { defaultValue: 'Updated from current records' }), color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)' },
                    { value: t('offers.adminMonitor.stats.live', { defaultValue: 'LIVE' }), label: t('offers.adminMonitor.stats.adminMonitoring', { defaultValue: 'Admin monitoring' }), desc: t('offers.adminMonitor.stats.realtimeView', { defaultValue: 'Real-time administrative view' }), color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.22)' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border shadow-sm rounded-sm p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300" style={{ borderColor: stat.border }}>
                        <div className="flex flex-col justify-between h-full space-y-4">
                            <div>
                                <span className="text-3xl font-black block mb-2 leading-none" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 leading-snug">
                                    {stat.label}
                                </h3>
                            </div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-500">
                                {stat.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Unified Filter Bar */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 mb-6 w-full overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 w-full">
                    {/* Search Field */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                        <input
                            type="text"
                            placeholder={t('offers.adminMonitor.clientSearchPlaceholder', { defaultValue: 'Search customer or email' })}
                            value={localClient}
                            onChange={(e) => setLocalClient(e.target.value)}
                            maxLength={160}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleApplyFilters();
                            }}
                            className="w-full rounded-full border border-gray-300/80 bg-white py-2.5 pl-10 pr-4 text-sm text-graphite placeholder:text-gray-400 focus:border-emerald/40 focus:outline-none focus:ring-2 focus:ring-emerald/10 transition-all font-medium"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative min-w-[150px]">
                        <select
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                            className="w-full bg-white border border-gray-300/80 rounded-full px-4 py-2.5 text-sm text-graphite font-medium focus:outline-none focus:border-emerald/40 focus:ring-2 focus:ring-emerald/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3E%3Cpath stroke=%27%233f4d47%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.6rem_center] pr-8"
                        >
                            <option value="all">{t('offers.adminMonitor.filters.allStatuses', { defaultValue: 'All statuses' })}</option>
                            {FOLLOWUP_STATUS_FILTERS.map(({ value, translationKey }) => (
                                <option key={value} value={value}>
                                    {t(`offers.adminMonitor.followupStatuses.${translationKey}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Value Range Dropdown */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={localValueRange}
                            onChange={(e) => {
                                setLocalValueRange(e.target.value);
                                if (e.target.value !== 'custom') {
                                    setLocalMinVal('');
                                    setLocalMaxVal('');
                                }
                            }}
                            className="w-full bg-white border border-gray-300/80 rounded-full px-4 py-2.5 text-sm text-graphite font-medium focus:outline-none focus:border-emerald/40 focus:ring-2 focus:ring-emerald/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3E%3Cpath stroke=%27%233f4d47%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.6rem_center] pr-8"
                        >
                            <option value="all">{t('offers.adminMonitor.filters.allValues', { defaultValue: 'All values' })}</option>
                            <option value="under_5k">{t('offers.adminMonitor.filters.under5k', { defaultValue: 'Under €5,000' })}</option>
                            <option value="5k_20k">{t('offers.adminMonitor.filters.5kTo20k', { defaultValue: '€5,000 - €20,000' })}</option>
                            <option value="20k_50k">{t('offers.adminMonitor.filters.20kTo50k', { defaultValue: '€20,000 - €50,000' })}</option>
                            <option value="over_50k">{t('offers.adminMonitor.filters.over50k', { defaultValue: 'Over €50,000' })}</option>
                            <option value="custom">{t('offers.adminMonitor.filters.customValue', { defaultValue: 'Custom range...' })}</option>
                        </select>
                    </div>

                    {/* Date Preset Dropdown */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={localDateRange}
                            onChange={(e) => {
                                setLocalDateRange(e.target.value);
                                if (e.target.value !== 'custom') {
                                    setLocalDateFrom('');
                                    setLocalDateTo('');
                                }
                            }}
                            className="w-full bg-white border border-gray-300/80 rounded-full px-4 py-2.5 text-sm text-graphite font-medium focus:outline-none focus:border-emerald/40 focus:ring-2 focus:ring-emerald/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3E%3Cpath stroke=%27%233f4d47%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.6rem_center] pr-8"
                        >
                            <option value="all">{t('offers.adminMonitor.filters.allDates', { defaultValue: 'All dates' })}</option>
                            <option value="today">{t('offers.adminMonitor.filters.today', { defaultValue: 'Today' })}</option>
                            <option value="this_week">{t('offers.adminMonitor.filters.thisWeek', { defaultValue: 'This week' })}</option>
                            <option value="this_month">{t('offers.adminMonitor.filters.thisMonth', { defaultValue: 'This month' })}</option>
                            <option value="custom">{t('offers.adminMonitor.filters.customDate', { defaultValue: 'Custom range...' })}</option>
                        </select>
                    </div>

                    {/* Owner Input */}
                    <div className="relative min-w-[140px]">
                        <input
                            type="text"
                            placeholder={t('offers.adminMonitor.filters.owner', { defaultValue: 'Owner' })}
                            value={localOwner}
                            onChange={(e) => setLocalOwner(e.target.value)}
                            maxLength={160}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleApplyFilters();
                            }}
                            className="w-full rounded-full border border-gray-300/80 bg-white py-2.5 px-4 text-sm text-graphite placeholder:text-gray-400 focus:border-emerald/40 focus:outline-none focus:ring-2 focus:ring-emerald/10 transition-all font-medium"
                        />
                    </div>

                    {/* Apply & Reset Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="primary"
                            onClick={handleApplyFilters}
                            className="inline-flex h-10 min-w-[68px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-emerald px-4 text-[10px] font-semibold uppercase tracking-[0.05em] text-ink transition-all duration-300 hover:bg-[#58ad37] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-55 shadow-sm"
                        >
                            {t('offers.adminMonitor.filters.apply', { defaultValue: 'Apply' })}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="inline-flex h-10 min-w-[76px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-emerald/30 bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-emerald transition-all duration-300 hover:border-emerald hover:bg-emerald/10 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-55 shadow-sm"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>{t('offers.adminMonitor.filters.resetShort', { defaultValue: 'Reset' })}</span>
                        </Button>
                    </div>
                </div>

                {filterError ? (
                    <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                        {filterError}
                    </p>
                ) : null}

                {/* Sub-inputs for custom ranges */}
                {(localValueRange === 'custom' || localDateRange === 'custom') && (
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-emerald-500/8 mt-1 animate-slide-up">
                        {localValueRange === 'custom' && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                                    {t('offers.adminMonitor.filters.customValueRange', { defaultValue: 'Value Range (€)' })}:
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={t('offers.adminMonitor.filters.minValue', { defaultValue: 'Min' })}
                                    value={localMinVal}
                                    onChange={(e) => setLocalMinVal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleApplyFilters();
                                    }}
                                    className="w-24 bg-white border border-gray-300/80 rounded-full px-3 py-1.5 text-xs text-graphite placeholder:text-gray-400 focus:outline-none focus:border-emerald/45"
                                />
                                <span className="text-xs text-textSecondary">-</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={t('offers.adminMonitor.filters.maxValue', { defaultValue: 'Max' })}
                                    value={localMaxVal}
                                    onChange={(e) => setLocalMaxVal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleApplyFilters();
                                    }}
                                    className="w-24 bg-white border border-gray-300/80 rounded-full px-3 py-1.5 text-xs text-graphite placeholder:text-gray-400 focus:outline-none focus:border-emerald/45"
                                />
                            </div>
                        )}

                        {localDateRange === 'custom' && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                                    {t('offers.adminMonitor.filters.customDateRange', { defaultValue: 'Date Range' })}:
                                </span>
                                <input
                                    type="date"
                                    max={localDateTo || undefined}
                                    value={localDateFrom}
                                    onChange={(e) => setLocalDateFrom(e.target.value)}
                                    className="bg-white border border-gray-300/80 rounded-full px-3 py-1.5 text-xs text-graphite focus:outline-none focus:border-emerald/45"
                                />
                                <span className="text-xs text-textSecondary">{t('offers.adminMonitor.filters.to', { defaultValue: 'to' })}</span>
                                <input
                                    type="date"
                                    min={localDateFrom || undefined}
                                    value={localDateTo}
                                    onChange={(e) => setLocalDateTo(e.target.value)}
                                    className="bg-white border border-gray-300/80 rounded-full px-3 py-1.5 text-xs text-graphite focus:outline-none focus:border-emerald/45"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

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

            {/* Follow-up tasks grid widening */}
            <div className="space-y-4">
                <SectionTitle
                    title={t('offers.adminMonitor.followupTitle')}
                    badge={t('offers.adminMonitor.pendingTasks', { count: pendingFollowups })}
                    className="mb-0"
                />

                {followupOffers.length === 0 ? (
                    <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-8 mb-6">
                        <p className="text-sm text-textSecondary">{t('offers.adminMonitor.noTask')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                        {followupOffers.map((offer) => (
                            <div key={displayText(offer.id || offer.offerNumber)} className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary-500/30 group relative h-full flex flex-col rounded-sm transition-all duration-300">

                                <div className="relative z-10 flex h-full flex-col p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className={clsx(
                                                    'h-2.5 w-2.5 rounded-full',
                                                    offer.followUp.status === 'pending' ? 'bg-amber-400' :
                                                        offer.followUp.status === 'snoozed' ? 'bg-sky-400' :
                                                            String(offer.followUp.status).startsWith('attempted') ? 'bg-red-400' : 'bg-emerald-400',
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
                                            {displayText(offer.projectName, t('offers.adminMonitor.untitledProject', { defaultValue: 'Untitled project' }))}
                                        </h3>
                                        <div className="min-w-0 space-y-1">
                                            <p className="break-all text-sm font-medium text-primary-300">{displayText(offer.offerNumber || offer.id)}</p>
                                            {/* <p className="break-all text-sm leading-relaxed text-textSecondary">{t('offers.adminMonitor.reference', { id: displayText(offer.id) })}</p> */}
                                            <p className="break-words text-sm text-textSecondary">
                                                {displayText(offer.customerName, t('offers.adminMonitor.anonymousClient'))}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex min-w-0 flex-wrap gap-2">
                                        <Badge variant="neutral" className="max-w-full">{formatCurrency(offer.totalAmount)}</Badge>
                                        {offer.buildingType ? (
                                            <Badge variant="neutral" className="max-w-full whitespace-normal text-left leading-snug">
                                                {formatBuildingType(offer.buildingType)}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    <div className="mt-5 rounded-sm border border-gray-200 bg-gray-50 p-4 shadow-sm">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                                            {t('offers.adminMonitor.table.followup')}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <Clock className="h-4 w-4 text-primary-500" />
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
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <section className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <SectionTitle
                        title={t('offers.adminMonitor.ledgerTitle')}
                        badge={t('offers.adminMonitor.totalOffers', { count: pagination.total })}
                        className="mb-0 animate-none"
                    />

                    {/* Inline Sort Control */}
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-textSecondary uppercase tracking-wider">
                            {t('offers.adminMonitor.sort.sortBy', { defaultValue: 'Sort by' })}:
                        </span>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-white border border-gray-300/80 rounded-full px-3 py-1.5 text-xs text-graphite font-semibold focus:outline-none focus:border-emerald/45 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3E%3Cpath stroke=%27%233f4d47%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1rem] bg-[right_0.4rem_center] pr-7"
                        >
                            <option value="created_at_desc">{t('offers.adminMonitor.sort.newest', { defaultValue: 'Newest' })}</option>
                            <option value="created_at_asc">{t('offers.adminMonitor.sort.oldest', { defaultValue: 'Oldest' })}</option>
                            <option value="value_desc">{t('offers.adminMonitor.sort.valueHigh', { defaultValue: 'Value high' })}</option>
                            <option value="value_asc">{t('offers.adminMonitor.sort.valueLow', { defaultValue: 'Value low' })}</option>
                            <option value="status_asc">{t('offers.adminMonitor.sort.statusAsc', { defaultValue: 'Status A-Z' })}</option>
                            <option value="status_desc">{t('offers.adminMonitor.sort.statusDesc', { defaultValue: 'Status Z-A' })}</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-sm mb-6">
                    {offersLoading && !offers.length ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4">
                            <Loader2 className="h-9 w-9 animate-spin text-primary-500" />
                            <p className="text-sm font-bold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.loading')}</p>
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-6 text-center">
                            <Bell className="h-9 w-9 text-primary-300" />
                            <div>
                                <p className="text-lg font-bold text-gray-800">{t('offers.adminMonitor.emptyTitle', { defaultValue: 'No offers match these filters' })}</p>
                                <p className="mt-2 text-sm text-textSecondary">{t('offers.adminMonitor.emptyDesc', { defaultValue: 'Reset filters or widen the date and value range.' })}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            {offersLoading ? (
                                <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-gray-100">
                                    <div className="h-full w-1/3 animate-pulse bg-primary-500" />
                                </div>
                            ) : null}
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.offerId')}</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.clientProject')}</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.valuation')}</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.status')}</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.followup')}</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.adminMonitor.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {offers.map((offer) => (
                                        <tr key={displayText(offer.id || offer.offerNumber)} className="transition-colors hover:bg-gray-50">
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-gray-800">{displayText(offer.offerNumber || offer.id)}</p>
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-textSecondary">{displayText(offer.id)}</p>
                                                <p className="mt-2 text-sm text-textSecondary">{formatDate(offer.createdAt)}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                                                        <Layers className="h-4.5 w-4.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-textPrimary">{displayText(offer.customerName, t('offers.adminMonitor.anonymousClient'))}</p>
                                                        <p className="mt-1 text-sm text-textSecondary">{displayText(offer.projectName, t('offers.adminMonitor.untitledProject', { defaultValue: 'Untitled project' }))}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-heading text-3xl font-semibold leading-none text-primary-300">{formatCurrency(offer.totalAmount)}</p>
                                                {offer.buildingType ? <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{formatBuildingType(offer.buildingType)}</p> : null}
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
                </div>
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
