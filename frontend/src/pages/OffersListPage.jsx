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
    Layout,
    AlertCircle,
    AlertTriangle,
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
    const rawOffers = useSelector((state) => state.offers?.offersList);
    const offers = Array.isArray(rawOffers) ? rawOffers : [];
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

    const projectNameFor = (offer) => offer?.project?.name || offer?.projectName || '';
    const safeOffers = offers.filter(Boolean);
    const filteredOffers = safeOffers.filter((offer) => {
        const projectName = projectNameFor(offer);
        const offerId = offer.id || '';
        const offerNumber = String(offer.offerNumber || '');
        const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase())
            || offerNumber.toLowerCase().includes(searchTerm.toLowerCase())
            || offerId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || normalizeOfferStatus(offer.status) === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const draftCount = safeOffers.filter((offer) => normalizeOfferStatus(offer.status) === 'draft').length;
    const generatedCount = safeOffers.filter((offer) => isOfferGeneratedStatus(offer.status)).length;
    const orderedCount = safeOffers.filter((offer) => normalizeOfferStatus(offer.status) === 'ordered').length;

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
        <Link to="/configurator" state={{ freshConfigurator: true }} onClick={() => dispatch(resetConfigurator())}>
            <Button size="lg" className="gap-2">
                <Plus className="h-4.5 w-4.5" />
                {t('offers.createNewOffer')}
            </Button>
        </Link>
    );

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl pb-12 px-2 sm:px-4 lg:px-6 mt-4">
            <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md relative rounded-sm p-4 sm:p-5 lg:p-6 transition-all duration-700 group/bg space-y-8">
            <div className="bg-primary-600/5 border border-primary-500/10 overflow-hidden rounded-sm px-5 py-6 sm:px-6 relative">
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
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
                                <div key={item.label} className="rounded-sm border border-primary-500/15 bg-white px-4 py-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/10 text-primary-400">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{item.label}</p>
                                            <p className="mt-1 font-heading text-2xl font-bold leading-none text-primary-600">{item.value}</p>
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

            <Card className="rounded-sm p-4 bg-white shadow-sm border border-gray-100">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-96">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                        <input
                            type="text"
                            placeholder={t('offers.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-sm border border-gray-200 bg-gray-50 px-4 py-2.5">
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
                    </div>
                </div>
            </Card>

            {filteredOffers.length > 0 ? (
                <PremiumTableWrapper>
                    <thead>
                        <tr>
                            <th className="w-16 px-6 py-4"></th>
                            <th className="px-6 py-4">{t('offers.list.project', { defaultValue: 'Project' })}</th>
                            <th className="px-6 py-4">{t('offers.list.status', { defaultValue: 'Status' })}</th>
                            <th className="px-6 py-4 text-right">{t('offers.list.amount', { defaultValue: 'Amount' })}</th>
                            <th className="w-24 px-6 py-4 text-center">{t('offers.list.actions', { defaultValue: 'Actions' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOffers.map((offer) => (
                            <tr key={offer.id} className="align-top transition-colors hover:bg-white/5">
                                <td className="px-6 py-5 text-center align-top">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary-500/10 text-primary-400">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <Link to={`/dashboard/offers/${offer.id}`} className="block group">
                                        <p className="text-sm font-bold uppercase tracking-[0.02em] text-textPrimary transition-colors group-hover:text-primary-400">
                                            {projectNameFor(offer) || t('offers.list.unnamedProject', { defaultValue: 'Unnamed Project' })}
                                        </p>
                                        <p className="mt-1.5 text-xs text-textSecondary font-medium">
                                            {offer.offerNumber ? offer.offerNumber.split('-').slice(0, -1).join('-') : ''}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(offer.createdAt)}
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <StatusBadge status={offer.status} />
                                </td>
                                <td className="px-6 py-5 text-right align-top">
                                    <p className="font-heading text-3xl font-semibold leading-none text-primary-600">
                                        {formatCurrency(offer.totalAmount)}
                                    </p>
                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.exclVat')}</p>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link to={`/dashboard/offers/${offer.id}`}>
                                            <button
                                                className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-white text-textSecondary transition-colors hover:border-primary-500/30 hover:text-primary-500 shadow-sm"
                                                title={t('offers.detail.view', { defaultValue: 'View' })}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(offer.id)}
                                            className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-white text-textSecondary transition-colors hover:border-primary-500/30 hover:text-primary-500 shadow-sm"
                                            title={t('offers.detail.edit')}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(offer.id)}
                                            className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-white text-textSecondary transition-colors hover:border-primary-500/30 hover:text-primary-500 shadow-sm"
                                            title={t('offers.detail.duplicate')}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, offerId: offer.id })}
                                            className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-white text-textSecondary transition-colors hover:border-red-500/30 hover:text-red-500 shadow-sm"
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
                <Card className="rounded-sm bg-white shadow-sm border border-gray-100">
                    <EmptyState
                        title={t('offers.noOffersTitle')}
                        description={t('offers.noOffersDesc')}
                        icon={Layout}
                        action={(
                            <Link to="/configurator" state={{ freshConfigurator: true }} onClick={() => dispatch(resetConfigurator())}>
                                <Button size="lg">{t('offers.newConfiguration')}</Button>
                            </Link>
                        )}
                    />
                </Card>
            )}
            </div>

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, offerId: null })}
                title={t('offers.deleteOfferTitle')}
                maxWidth="max-w-md"
                footer={(
                    <div className="grid w-full grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full justify-center !rounded-xl !min-h-11 border-gray-200 bg-white font-bold text-textPrimary shadow-sm hover:bg-gray-50 active:scale-[0.98]"
                            onClick={() => setDeleteModal({ isOpen: false, offerId: null })}
                        >
                            {t('offers.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            className="w-full justify-center !rounded-xl !min-h-11 bg-red-600 font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 active:scale-[0.98]"
                            onClick={confirmDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            {t('offers.confirmDelete')}
                        </Button>
                    </div>
                )}
            >
                <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-2 py-4 text-center sm:px-4 sm:py-6">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/15 to-red-500/5 text-red-500 shadow-sm ring-8 ring-red-500/5">
                        <AlertTriangle className="h-8 w-8 stroke-[2.2]" />
                    </div>
                    <div className="space-y-1.5">
                        <h4 className="text-xl font-heading font-black tracking-tight text-textPrimary">{t('offers.areYouSure')}</h4>
                        <p className="text-sm font-medium leading-relaxed text-textSecondary">{t('offers.deleteOfferDesc')}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 px-4 py-2 font-mono text-xs font-semibold text-textSecondary">
                        Ref: {deleteModal.offerId}
                    </div>
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}
