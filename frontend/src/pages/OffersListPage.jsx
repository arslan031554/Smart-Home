import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search,
    Filter,
    Plus,
    Eye,
    Copy,
    Trash2,
    Calendar,
    Building2,
    Layout,
    AlertCircle,
    Edit3,
    FileText,
    Clock3,
    CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '@/components/offers/StatusBadge';
import {
    Button,
    Badge,
    Card,
    Modal,
    Skeleton,
    EmptyState,
    AnimatedPageWrapper,
    SectionTitle,
    PremiumTableWrapper,
} from '@/components/common/UIComponents';
import { fetchOffers, duplicateOffer, deleteOffer } from '@/features/offers/offersSlice';
import { resetConfigurator, reopenOfferById } from '@/features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import { OFFER_STATUSES, OFFER_STATUS_TRANSLATION_KEYS, isOfferGeneratedStatus, normalizeOfferStatus } from '@/constants/offerStatuses';

export default function OffersListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { offersList: offers = [], loading: offersLoading } = useSelector((state) => state.offers);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, offerId: null });

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
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(locale);
    };

    const projectNameFor = (offer) => offer.project?.name || offer.projectName || '';
    const filteredOffers = offers.filter((offer) => {
        const projectName = projectNameFor(offer);
        const offerId = offer.id || '';
        const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase())
            || (offer.offerNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
            || offerId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || normalizeOfferStatus(offer.status) === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const draftCount = offers.filter((offer) => normalizeOfferStatus(offer.status) === 'draft').length;
    const generatedCount = offers.filter((offer) => isOfferGeneratedStatus(offer.status)).length;
    const orderedCount = offers.filter((offer) => normalizeOfferStatus(offer.status) === 'ordered').length;

    const handleDuplicate = (id) => {
        dispatch(duplicateOffer(id));
    };

    const confirmDelete = () => {
        if (deleteModal.offerId) {
            dispatch(deleteOffer(deleteModal.offerId));
            setDeleteModal({ isOpen: false, offerId: null });
        }
    };

    const handleEdit = async (offerId) => {
        const result = await dispatch(reopenOfferById(offerId));
        if (reopenOfferById.fulfilled.match(result)) {
            navigate('/configurator');
        }
    };

    const createNewOfferLink = (
        <Link to="/configurator" onClick={() => dispatch(resetConfigurator())}>
            <Button size="lg" className="gap-2">
                <Plus className="h-4.5 w-4.5" />
                {t('offers.createNewOffer')}
            </Button>
        </Link>
    );

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-10 pb-20">
            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-6">
                        <SectionTitle
                            title={t('offers.myOffersTitle')}
                            subtitle={t('offers.myOffersSubtitle')}
                            badge={t('dashboardLayout.offers', { defaultValue: 'Offers' })}
                            className="mb-0"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                {
                                    icon: FileText,
                                    label: t('offers.totalOffers', { count: offers.length }),
                                    value: offers.length,
                                },
                                {
                                    icon: Clock3,
                                    label: t('offers.statuses.offerGenerated', { defaultValue: 'Offer Generated' }),
                                    value: generatedCount,
                                },
                                {
                                    icon: CheckCircle2,
                                    label: t('offers.ordered', { defaultValue: 'Ordered' }),
                                    value: orderedCount,
                                },
                            ].map((item) => (
                                <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-white/5 px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                            <item.icon className="h-4.5 w-4.5" />
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

                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="neutral">{t('offers.drafts', { defaultValue: 'Drafts' })}: {draftCount}</Badge>
                        {createNewOfferLink}
                    </div>
                </div>
            </div>

            <Card className="rounded-[1.9rem] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-96">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                        <input
                            type="text"
                            placeholder={t('offers.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
                            <Filter className="h-4 w-4 text-primary-300" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-xs font-semibold uppercase tracking-[0.18em] text-textPrimary outline-none"
                            >
                                <option value="all">{t('offers.allOffers')}</option>
                                {OFFER_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {t(OFFER_STATUS_TRANSLATION_KEYS[status])}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Badge variant="neutral">
                            {t('offers.totalOffers', { count: filteredOffers.length })}
                        </Badge>
                    </div>
                </div>
            </Card>

            {offersLoading ? (
                <Card className="rounded-[2rem] p-8">
                    <Skeleton className="mb-4 h-16 w-full" repeat={5} />
                </Card>
            ) : filteredOffers.length > 0 ? (
                <PremiumTableWrapper>
                    <thead>
                        <tr className="border-b border-white/8 bg-white/5">
                            <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.offerId')}</th>
                            <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.projectDetails')}</th>
                            <th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.structure')}</th>
                            <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.status')}</th>
                            <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.valuation')}</th>
                            <th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                        {filteredOffers.map((offer) => (
                            <tr key={offer.id} className="transition-colors hover:bg-white/5">
                                <td className="px-6 py-5 align-top">
                                    <p className="text-sm font-medium text-textPrimary">{offer.offerNumber || offer.id}</p>
                                    <p className="mt-1 text-xs text-textSecondary">{offer.id}</p>
                                    <p className="mt-2 flex items-center gap-2 text-xs text-textSecondary">
                                        <Calendar className="h-3.5 w-3.5 text-primary-300" />
                                        {formatDate(offer.createdAt)}
                                    </p>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                            <Building2 className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-textPrimary">{projectNameFor(offer)}</p>
                                            {offer.customerName ? <p className="mt-1 text-sm text-textSecondary">{offer.customerName}</p> : null}
                                            {offer.buildingType ? (
                                                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                                    {offer.buildingType.replace(/_/g, ' ')}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                                        <div className="text-center">
                                            <p className="text-sm font-semibold leading-none text-textPrimary">{offer.roomsCount || 0}</p>
                                            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.rooms')}</p>
                                        </div>
                                        <div className="h-8 w-px bg-white/10" />
                                        <div className="text-center">
                                            <p className="text-sm font-semibold leading-none text-primary-300">{offer.functionsCount || 0}</p>
                                            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.func')}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <StatusBadge status={offer.status} />
                                </td>
                                <td className="px-6 py-5 text-right align-top">
                                    <p className="font-heading text-3xl font-semibold leading-none text-primary-300">
                                        {formatCurrency(offer.totalAmount)}
                                    </p>
                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.exclVat')}</p>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link to={`/dashboard/offers/${offer.id}`}>
                                            <button
                                                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300"
                                                title={t('offers.detail.view', { defaultValue: 'View' })}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(offer.id)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300"
                                            title={t('offers.detail.edit')}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(offer.id)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300"
                                            title={t('offers.detail.duplicate')}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, offerId: offer.id })}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-red-500/25 hover:text-red-300"
                                            title={t('offers.detail.delete')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </PremiumTableWrapper>
            ) : (
                <Card className="rounded-[2rem]">
                    <EmptyState
                        title={t('offers.noOffersTitle')}
                        description={t('offers.noOffersDesc')}
                        icon={Layout}
                        action={(
                            <Link to="/configurator" onClick={() => dispatch(resetConfigurator())}>
                                <Button size="lg">{t('offers.newConfiguration')}</Button>
                            </Link>
                        )}
                    />
                </Card>
            )}

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, offerId: null })}
                title={t('offers.deleteOfferTitle')}
                maxWidth="max-w-md"
                footer={(
                    <div className="flex w-full justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeleteModal({ isOpen: false, offerId: null })}>
                            {t('offers.cancel')}
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            {t('offers.confirmDelete')}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-4 py-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-red-500/18 bg-red-500/10 text-red-300">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-lg font-medium text-textPrimary">{t('offers.areYouSure')}</h4>
                        <p className="text-sm leading-relaxed text-textSecondary">{t('offers.deleteOfferDesc')}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-3 font-mono text-xs text-textSecondary">
                        Ref: {deleteModal.offerId}
                    </div>
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}
