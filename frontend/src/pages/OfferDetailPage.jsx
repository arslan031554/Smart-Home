import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import {
    ArrowLeft,
    Download,
    Printer,
    Mail,
    Building2,
    MapPin,
    Zap,
    TrendingDown,
    Calendar,
    ArrowRight,
    Bell,
    Loader2,
    Edit3,
    Copy,
    Trash2,
    ShieldCheck,
    Box,
    MessageSquare,
    MessageSquareText,
    ClipboardList,
    Layers3,
    Wrench,
    Home,
    ImageOff,
    FileText,
    Palette,
    Tag,
    Gauge,
    Hash,
    Briefcase,
    Layout,
    Activity,
    Sun,
    Thermometer,
    Shield,
    Monitor,
    Layers,
    Battery,
    Camera,
    Key,
    Droplets,
    Check,
    Waves,
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
import { fetchOfferById, duplicateOffer, deleteOffer, updateOfferStatus, updateOfferColor } from '@/features/offers/offersSlice';
import { fetchPublicMasterData } from '@/features/admin/adminSlice';
import api from '@/utils/api';
import { reopenOfferById } from '@/features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import { hasAdminAccess } from '@/constants/adminPermissions';

const FUNCTION_ICON_MAP = {
    Sun,
    Thermometer,
    Shield,
    Monitor,
    Layers,
    Zap,
    Battery,
    Camera,
    Key,
    Droplets,
    Waves,
    Activity,
};

const PUBLIC_MASTER_DATA_KEYS = [
    'building-types',
    'room-types',
    'smart-functions',
    'product-ranges',
    'colors',
    'services',
    'offer-conditions',
    'disclaimers',
];

function FunctionIcon({ iconName, className = 'h-5 w-5' }) {
    const Icon = FUNCTION_ICON_MAP[iconName] || Box;
    return <Icon className={className} />;
}

function normalizeCount(value, fallback = 1) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function humanizeValue(value, fallback = '-') {
    if (!value) return fallback;
    return String(value)
        .split('_')
        .filter(Boolean)
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
        .join(' ');
}

function aggregateUsedFunctions(levels = [], functionMap = new Map()) {
    const aggregated = new Map();

    (Array.isArray(levels) ? levels : []).forEach((level) => {
        (Array.isArray(level?.rooms) ? level.rooms : []).forEach((room) => {
            const roomCount = normalizeCount(room?.roomCount ?? room?.count, 1);
            const selections = Array.isArray(room?.functionSelections)
                ? room.functionSelections
                : (Array.isArray(room?.functions) ? room.functions : []);

            selections.forEach((selection) => {
                const functionId = selection?.smartFunctionId || selection?.id;
                const quantity = Math.max(0, Number(selection?.quantity || 0)) * roomCount;
                if (!functionId || quantity <= 0) return;

                const master = functionMap.get(functionId) || {};
                const existing = aggregated.get(functionId) || {
                    id: functionId,
                    name: master.name || selection?.name || 'Configured Function',
                    description: master.description || selection?.description || '',
                    icon: master.icon || selection?.icon || null,
                    quantity: 0,
                    rooms: [],
                };

                existing.quantity += quantity;
                existing.rooms.push({
                    roomName: room?.name || 'Room',
                    levelName: level?.name || 'Level',
                });
                aggregated.set(functionId, existing);
            });
        });
    });

    return Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildLevelSummaries(levels = [], roomTypeMap = new Map(), functionMap = new Map()) {
    return (Array.isArray(levels) ? levels : []).map((level, levelIndex) => ({
        id: level?.id || `level-${levelIndex}`,
        name: level?.name || `Level ${levelIndex + 1}`,
        rooms: (Array.isArray(level?.rooms) ? level.rooms : []).map((room, roomIndex) => {
            const roomCount = normalizeCount(room?.roomCount ?? room?.count, 1);
            const selections = Array.isArray(room?.functionSelections)
                ? room.functionSelections
                : (Array.isArray(room?.functions) ? room.functions : []);

            const functions = selections
                .map((selection) => {
                    const functionId = selection?.smartFunctionId || selection?.id;
                    const master = functionMap.get(functionId) || {};
                    const quantity = Math.max(0, Number(selection?.quantity || 0));
                    if (!functionId || quantity <= 0) return null;

                    return {
                        id: functionId,
                        name: master.name || selection?.name || 'Configured Function',
                        icon: master.icon || selection?.icon || null,
                        quantity,
                    };
                })
                .filter(Boolean);

            return {
                id: room?.id || `${level?.id || levelIndex}-room-${roomIndex}`,
                name: room?.name || roomTypeMap.get(room?.type)?.name || 'Room',
                typeName: roomTypeMap.get(room?.type)?.name || humanizeValue(room?.type, 'Room'),
                roomCount,
                functions,
            };
        }),
    }));
}

export default function OfferDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { currentOffer: offer, loading } = useSelector((state) => state.offers);
    const { user } = useSelector((state) => state.auth);
    const adminState = useSelector((state) => state.admin);
    const [updatingColor, setUpdatingColor] = useState(false);
    const [exporting, setExporting] = useState(null);
    const [sendingReminder, setSendingReminder] = useState(false);
    const [accepting, setAccepting] = useState(false);

    const handleSaveColorSelection = async (colorId) => {
        if (updatingColor || !id) return;
        setUpdatingColor(true);
        try {
            await dispatch(updateOfferColor({ id, colorId })).unwrap();
        } catch (err) {
            console.error('Failed to update color:', err);
        } finally {
            setUpdatingColor(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        dispatch(fetchOfferById(id));
        PUBLIC_MASTER_DATA_KEYS.forEach((key) => {
            dispatch(fetchPublicMasterData(key));
        });
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

    const isDashboardOfferRoute = location.pathname.startsWith('/dashboard/offers/');
    const isAdminOfferRoute = location.pathname.startsWith('/admin/offers/');
    const backListRoute = isAdminOfferRoute ? '/admin/offers' : '/dashboard/offers';

    if (loading && (!offer || offer.id !== id)) {
        return (
            <AnimatedPageWrapper className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-textSecondary">{t('offers.detail.loading')}</p>
            </AnimatedPageWrapper>
        );
    }

    if (!offer || offer.id !== id) {
        return (
            <AnimatedPageWrapper className="mx-auto max-w-2xl space-y-6">
                <Alert variant="error">{t('offers.detail.notFound')}</Alert>
                <Link to={backListRoute}>
                    <Button variant="outline">{t('offers.detail.backToOffers')}</Button>
                </Link>
            </AnimatedPageWrapper>
        );
    }

    const snapshot = offer.calculationSnapshot || {};
    const snapshotProjectInfo = snapshot.projectInfo || {};
    const snapshotLevels = Array.isArray(snapshot.levels) ? snapshot.levels : [];
    const projectName = snapshotProjectInfo.name ?? offer.project?.name ?? offer.projectName ?? t('offers.detail.projectFallback');
    const buildingTypeName = snapshotProjectInfo.buildingTypeName ?? offer.project?.buildingType?.name ?? offer.buildingType ?? t('offers.detail.unknownBuildingType');
    const productRanges = Array.isArray(adminState.productRanges) && adminState.productRanges.length > 0
        ? adminState.productRanges
        : (Array.isArray(adminState.publicProductRanges) ? adminState.publicProductRanges : []);
    const colors = Array.isArray(adminState.colors) && adminState.colors.length > 0
        ? adminState.colors
        : (Array.isArray(adminState.publicColors) ? adminState.publicColors : []);
    const roomTypes = Array.isArray(adminState.roomTypes) ? adminState.roomTypes : [];
    const smartFunctions = Array.isArray(adminState.smartFunctions) ? adminState.smartFunctions : [];
    const conditions = Array.isArray(adminState.conditions) ? adminState.conditions : [];
    const disclaimers = Array.isArray(adminState.disclaimers) ? adminState.disclaimers : [];
    const smartFunctionMap = new Map(smartFunctions.map((item) => [item.id, item]));
    const roomTypeMap = new Map(roomTypes.map((item) => [item.id, item]));
    const products = Array.isArray(offer.products) ? offer.products : [];
    const services = Array.isArray(offer.services) ? offer.services : [];
    const allHardwareItems = products.map((product) => ({
        name: product.productName,
        code: product.productCode,
        description: product.productDescription,
        qty: product.quantity,
        price: product.unitPrice,
        subtotal: product.subtotal,
        imageUrl: product.imageUrl || null,
        rangeName: product.rangeName || null,
        colorName: product.colorName || null,
        lineType: product.lineType === 'RELATED' ? 'RELATED' : 'STANDARD',
    }));
    const hardwareItems = allHardwareItems.filter((item) => item.lineType !== 'RELATED');
    const relatedHardwareItems = allHardwareItems.filter((item) => item.lineType === 'RELATED');
    const roomsCount = snapshotLevels.reduce((acc, level) => acc + (Array.isArray(level?.rooms) ? level.rooms.length : 0), 0);
    const functionsCount = snapshotLevels.reduce((acc, level) => acc + (Array.isArray(level?.rooms) ? level.rooms.reduce((roomAcc, room) => {
        const selections = Array.isArray(room?.functionSelections) ? room.functionSelections : (Array.isArray(room?.functions) ? room.functions : []);
        return roomAcc + selections.filter((selection) => Number(selection?.quantity || 0) > 0).length;
    }, 0) : 0), 0);
    const grandTotal = offer.grandTotal ?? 0;
    const productsSubtotal = offer.productsSubtotal ?? 0;
    const servicesSubtotal = offer.servicesSubtotal ?? 0;
    const discountAmount = offer.discountAmount ?? 0;
    const discountPercent = offer.discountPercent ?? snapshot.calculationBreakdown?.discountPercent ?? 0;
    const follow = offer.followUp || offer.followup || null;
    const projectMultiplier = Math.max(
        1,
        parseInt(
            snapshot.calculationBreakdown?.projectMultiplier ??
            snapshotProjectInfo.projectMultiplicationIndex ??
            offer.project?.multiplicationIndex ??
            1,
            10,
        ) || 1,
    );
    const snapshotBreakdown = snapshot.calculationBreakdown || {};
    const totalPerProject = snapshotBreakdown.totalPerProject ?? (
        (snapshotBreakdown.productsSubtotalPerProject ?? (projectMultiplier > 0 ? productsSubtotal / projectMultiplier : productsSubtotal)) +
        (snapshotBreakdown.servicesSubtotalPerProject ?? (projectMultiplier > 0 ? servicesSubtotal / projectMultiplier : servicesSubtotal))
    );
    const grossTotal = snapshotBreakdown.grossTotal ?? (productsSubtotal + servicesSubtotal);
    const customerEmail = offer?.project?.user?.email || offer?.customerEmail;
    const selectedRangeId = snapshot.selectedRangeId ?? snapshot.rangeId ?? null;
    const selectedColorId = snapshot.selectedColorId ?? snapshot.colorId ?? null;
    const selectedRange = productRanges.find((item) => item.id === selectedRangeId) || null;
    const selectedColor = colors.find((item) => item.id === selectedColorId) || null;
    const rangeLabel = selectedRange?.name || allHardwareItems.find((item) => item.rangeName)?.rangeName || t('offers.detail.notSelected', { defaultValue: 'Not selected' });
    const colorLabel = selectedColor?.name || allHardwareItems.find((item) => item.colorName)?.colorName || t('offers.detail.notSelected', { defaultValue: 'Not selected' });
    const buildingDescription = snapshotProjectInfo.buildingTypeDescription || offer.project?.buildingType?.description || '';
    const projectDescription = snapshotProjectInfo.description || offer.project?.description || '';
    const customerComments = offer.customerComments || snapshot.customerComments || '';
    const clientType = snapshotProjectInfo.clientType || 'private';
    const companyName = snapshotProjectInfo.companyName || '';
    const levelSummaries = buildLevelSummaries(snapshotLevels, roomTypeMap, smartFunctionMap);
    const usedFunctions = aggregateUsedFunctions(snapshotLevels, smartFunctionMap);
    const normalizedStatus = String(offer.status || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    const isAdminUser = hasAdminAccess(user);
    const canAcceptOffer = isDashboardOfferRoute && normalizedStatus === 'offer_generated';
    const canUseEmailShortcut = isAdminOfferRoute && isAdminUser && Boolean(customerEmail);
    const canSendReminderEmail = isAdminOfferRoute && isAdminUser && normalizedStatus === 'offer_generated' && Boolean(customerEmail);

    const handleExport = async (format) => {
        setExporting(format);
        try {
            const lang = (i18n?.resolvedLanguage || i18n?.language || 'en').startsWith('ro') ? 'ro' : 'en';
            const res = await api.get(`/offers/${id}/export/${format}?lang=${lang}`, { responseType: 'blob' });
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

    const handleSendReminderEmail = async () => {
        if (sendingReminder || !canSendReminderEmail) return;
        setSendingReminder(true);
        try {
            await api.post(`/offers/${id}/followup/send-reminder`);
            await dispatch(fetchOfferById(id));
        } finally {
            setSendingReminder(false);
        }
    };

    const handleEditOffer = async () => {
        const result = await dispatch(reopenOfferById(id));
        if (reopenOfferById.fulfilled.match(result)) {
            navigate('/configurator', { state: { workspaceLoaded: true } });
        }
    };

    const handleDuplicateOffer = async () => {
        const result = await dispatch(duplicateOffer(id));
        if (duplicateOffer.fulfilled.match(result)) {
            navigate(backListRoute);
        }
    };

    const handleDeleteOffer = async () => {
        const shouldDelete = window.confirm(t('offers.deleteOfferDesc'));
        if (!shouldDelete) return;
        const result = await dispatch(deleteOffer(id));
        if (deleteOffer.fulfilled.match(result)) {
            navigate(backListRoute);
        }
    };

    const handleAcceptOffer = async () => {
        if (accepting || !canAcceptOffer) return;
        setAccepting(true);
        try {
            await dispatch(updateOfferStatus({ id, status: 'ordered' })).unwrap();
        } finally {
            setAccepting(false);
        }
    };

    const projectFacts = [
        {
            icon: Tag,
            label: t('offers.detail.projectNameLabel', { defaultValue: 'Project Name' }),
            value: projectName,
        },
        {
            icon: Building2,
            label: t('offers.detail.buildingTypeLabel', { defaultValue: 'Building Type' }),
            value: buildingTypeName,
        },
        {
            icon: Briefcase,
            label: t('offers.detail.clientTypeLabel', { defaultValue: 'Client Type' }),
            value: clientType === 'company'
                ? t('offers.detail.companyClient', { defaultValue: 'Business / Company' })
                : t('offers.detail.privateClient', { defaultValue: 'Private Individual' }),
        },
        companyName
            ? {
                icon: Briefcase,
                label: t('offers.detail.companyNameLabel', { defaultValue: 'Company Name' }),
                value: companyName,
            }
            : null,
        {
            icon: Layers3,
            label: t('offers.detail.levelsLabel', { defaultValue: 'Levels' }),
            value: String(snapshotProjectInfo.levelsCount || offer.project?.levelsCount || snapshotLevels.length || 0),
        },
        {
            icon: MapPin,
            label: t('offers.detail.areaLabel', { defaultValue: 'Built-up Area' }),
            value: snapshotProjectInfo.area || offer.project?.builtUpArea
                ? `${snapshotProjectInfo.area || offer.project?.builtUpArea} m2`
                : t('offers.detail.notSpecified', { defaultValue: 'Not specified' }),
        },
        {
            icon: Gauge,
            label: t('offers.detail.complexityLabel', { defaultValue: 'Project Complexity' }),
            value: snapshotProjectInfo.projectComplexity || offer.project?.projectComplexity || t('offers.detail.notSpecified', { defaultValue: 'Not specified' }),
        },
        {
            icon: Hash,
            label: t('offers.detail.multiplierLabel', { defaultValue: 'Multiplication Index' }),
            value: `x ${projectMultiplier}`,
        },
        {
            icon: Layout,
            label: t('offers.detail.rangeLabel', { defaultValue: 'Product Range' }),
            value: rangeLabel,
        },
        {
            icon: Palette,
            label: t('offers.detail.colorLabel', { defaultValue: 'Color / Finish' }),
            value: colorLabel,
        },
    ].filter(Boolean);

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl pb-12 px-2 sm:px-4 lg:px-6 mt-4">
            <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md relative rounded-sm p-4 sm:p-5 lg:p-6 transition-all duration-700 group/bg space-y-8">
            <div className="flex items-center justify-between gap-4">
                <Link to={backListRoute} className="inline-flex items-center gap-2 text-sm font-medium text-textSecondary transition-colors hover:text-primary-300">
                    <ArrowLeft className="h-4 w-4" />
                    {t('offers.detail.backToOffers')}
                </Link>
            </div>

            <div className="bg-primary-600/5 border border-primary-500/10 overflow-hidden rounded-sm px-5 py-6 sm:px-6 relative">
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

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
                                <span className="inline-flex items-center gap-2 rounded-sm border border-primary-500/15 bg-white px-4 py-2 shadow-sm">
                                    <Building2 className="h-4 w-4 text-primary-300" />
                                    {buildingTypeName}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-sm border border-primary-500/15 bg-white px-4 py-2 shadow-sm">
                                    <MapPin className="h-4 w-4 text-primary-300" />
                                    {rangeLabel}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-sm border border-primary-500/15 bg-white px-4 py-2 shadow-sm">
                                    <ClipboardList className="h-4 w-4 text-primary-300" />
                                    {offer.offerNumber ? String(offer.offerNumber).split('-').slice(0, -1).join('-') : ''}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 xl:justify-end mt-4 xl:mt-0">
                            {/* Actions Group 1: Print & Email */}
                            <div className="flex items-center gap-1 rounded-sm border border-primary-500/15 bg-white p-1 shadow-sm">
                                <Button variant="ghost" className="h-8 w-8 rounded-sm p-0 text-textSecondary hover:text-primary-500" title={t('offers.detail.print')} onClick={handlePrint}>
                                    <Printer className="h-4 w-4" />
                                </Button>
                                {canUseEmailShortcut ? (
                                    <Button variant="ghost" className="h-8 w-8 rounded-sm p-0 text-textSecondary hover:text-primary-500" title={t('offers.detail.email')} onClick={handleEmail}>
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                ) : null}
                            </div>

                            {/* Actions Group 2: Manage */}
                            <div className="flex items-center gap-1 rounded-sm border border-primary-500/15 bg-white p-1 shadow-sm">
                                <Button variant="ghost" className="h-8 w-8 rounded-sm p-0 text-textSecondary hover:text-primary-500" title={t('offers.detail.edit')} onClick={handleEditOffer}>
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" className="h-8 w-8 rounded-sm p-0 text-textSecondary hover:text-primary-500" title={t('offers.detail.duplicate')} onClick={handleDuplicateOffer}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" className="h-8 w-8 rounded-sm p-0 text-red-400 hover:bg-red-50 hover:text-red-600" title={t('offers.detail.delete')} onClick={handleDeleteOffer}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Actions Group 3: Primary actions */}
                            <div className="flex items-center gap-2">
                                <Button size="sm" className="gap-2 shadow-sm" onClick={() => handleExport('pdf')} disabled={!!exporting}>
                                    {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    {t('offers.detail.exportPdf')}
                                </Button>
                                {isAdminUser ? (
                                    <Button variant="outline" size="sm" className="gap-2 bg-white shadow-sm" onClick={() => handleExport('excel')} disabled={!!exporting}>
                                        {exporting === 'excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        {t('offers.detail.exportExcel', { defaultValue: 'Export Excel' })}
                                    </Button>
                                ) : null}
                                {canSendReminderEmail ? (
                                    <Button variant="outline" size="sm" className="gap-2 bg-white shadow-sm" onClick={handleSendReminderEmail} disabled={sendingReminder}>
                                        {sendingReminder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                                        {t('offers.detail.sendReminderEmail', { defaultValue: 'Send Reminder Email' })}
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                icon: Layers3,
                                label: t('offers.detail.rooms'),
                                value: roomsCount || offer.roomsCount || 0,
                                color: '#60b93f',
                                bg: 'rgba(96,185,63,0.10)',
                                border: 'rgba(96,185,63,0.22)',
                                glow: 'rgba(96,185,63,0.18)',
                            },
                            {
                                icon: Zap,
                                label: t('offers.detail.smartFeatures'),
                                value: functionsCount || offer.functionsCount || 0,
                                color: '#f59e0b',
                                bg: 'rgba(245,158,11,0.10)',
                                border: 'rgba(245,158,11,0.22)',
                                glow: 'rgba(245,158,11,0.15)',
                            },
                            {
                                icon: Box,
                                label: t('offers.detail.lineItems', { count: allHardwareItems.length }),
                                value: allHardwareItems.length,
                                color: '#3b82f6',
                                bg: 'rgba(59,130,246,0.10)',
                                border: 'rgba(59,130,246,0.22)',
                                glow: 'rgba(59,130,246,0.15)',
                            },
                            {
                                icon: Wrench,
                                label: t('offers.detail.servicesTitle'),
                                value: services.length,
                                color: '#8b5cf6',
                                bg: 'rgba(139,92,246,0.10)',
                                border: 'rgba(139,92,246,0.22)',
                                glow: 'rgba(139,92,246,0.15)',
                            },
                        ].map((item, idx) => (
                            <div
                                key={item.label}
                                className="db-stat-card group relative overflow-hidden rounded-sm p-4 cursor-default"
                                style={{
                                    '--sc': item.color,
                                    '--sb': item.bg,
                                    '--sborder': item.border,
                                    '--sglow': item.glow,
                                    animationDelay: `${idx * 80}ms`,
                                }}
                            >
                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary leading-none">
                                            {item.label}
                                        </p>
                                        <p className="font-heading text-4xl font-black leading-none" style={{ color: item.color }}>
                                            {item.value}
                                        </p>
                                    </div>
                                    <div
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm transition-transform duration-300 group-hover:scale-110 shadow-sm"
                                        style={{ background: item.bg, border: `1px solid ${item.border}`, color: item.color }}
                                    >
                                        <item.icon className="h-4.5 w-4.5" />
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
                        <SectionTitle
                            title={t('offers.detail.projectChapter', { defaultValue: 'PROJECT' })}
                            className="!mb-6 rounded-sm bg-primary-600 px-4 py-3 shadow-sm [&_h2]:text-sm [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:!text-white [&_h2]:sm:text-sm [&_h2]:lg:text-sm [&_p]:mt-1 [&_p]:text-xs [&_p]:text-primary-100"
                        />

                        <Card className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {projectFacts.map((fact) => (
                                    <div key={fact.label} className="rounded-sm border border-gray-100 bg-gray-50 p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
                                                <fact.icon className="h-4.5 w-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{fact.label}</p>
                                                <p className="mt-2 text-sm font-medium leading-relaxed text-textPrimary">{fact.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(buildingDescription || projectDescription) ? (
                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {buildingDescription ? (
                                        <div className="rounded-sm border border-gray-100 bg-gray-50 p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                                {t('offers.detail.buildingDescriptionLabel', { defaultValue: 'Building Description' })}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-textPrimary">{buildingDescription}</p>
                                        </div>
                                    ) : null}
                                    {projectDescription ? (
                                        <div className="rounded-sm border border-gray-100 bg-gray-50 p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                                {t('offers.detail.projectNotesLabel', { defaultValue: 'Project Notes' })}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-textPrimary">{projectDescription}</p>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {/* Post-Offer Color Finish Selection */}
                            <div className="mt-6 rounded-sm border border-slate-200 bg-slate-50/80 p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Palette className="h-4 w-4 text-primary-500" />
                                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-textPrimary">
                                                {t('offers.detail.colorSelectionTitle', { defaultValue: 'Color & Finish Selection' })}
                                            </h4>
                                            <Badge variant={selectedColorId ? "primary" : "neutral"}>
                                                {selectedColorId ? colorLabel : t('offers.detail.colorPendingBadge', { defaultValue: 'Select with client' })}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-textSecondary">
                                            {t('offers.detail.colorSelectionSubtitle', { defaultValue: 'Choose the aesthetic finish together with the client after issuing the offer.' })}
                                        </p>
                                    </div>
                                    {updatingColor && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-primary-600">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>{t('offers.detail.updatingColor', { defaultValue: 'Updating offer finish...' })}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                                    {(Array.isArray(colors) ? colors : []).filter((c) => c?.isVisible !== false).map((col) => {
                                        const isChosen = selectedColorId === col.id;
                                        const hexTone = col.hex || '#64748B';
                                        return (
                                            <button
                                                key={col.id}
                                                type="button"
                                                disabled={updatingColor}
                                                onClick={() => handleSaveColorSelection(col.id)}
                                                className={clsx(
                                                    'flex items-center gap-3 p-2.5 rounded-sm border text-left transition-all duration-200 cursor-pointer hover:shadow-md',
                                                    isChosen
                                                        ? 'border-primary-500 bg-white ring-2 ring-primary-500/20 shadow-sm'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                )}
                                            >
                                                <div
                                                    className="h-6 w-6 rounded-full border border-black/10 shrink-0 flex items-center justify-center shadow-xs"
                                                    style={{ backgroundColor: hexTone }}
                                                >
                                                    {isChosen && (
                                                        <Check className={clsx("h-3.5 w-3.5", (hexTone.toUpperCase() === '#FFFFFF' || hexTone.toUpperCase() === '#F8FAFC') ? 'text-slate-800' : 'text-white')} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate text-slate-800">{col.name}</p>
                                                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">{col.code || hexTone}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8 space-y-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                            {t('offers.detail.projectConfiguration', { defaultValue: 'Project Configuration' })}
                                        </p>
                                        <p className="mt-1 text-sm text-textSecondary">
                                            {t('offers.detail.projectConfigurationHelp', { defaultValue: 'All configured levels, rooms, and in-room smart functions used in this offer.' })}
                                        </p>
                                    </div>
                                    <Badge variant="neutral">{t('offers.detail.rooms', { defaultValue: 'Rooms' })}: {roomsCount}</Badge>
                                </div>

                                {levelSummaries.length ? levelSummaries.map((level) => (
                                    <div key={level.id} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Layers3 className="h-4 w-4 text-primary-300" />
                                            <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-textPrimary">{level.name}</h3>
                                        </div>

                                        {level.rooms.length ? (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {level.rooms.map((room) => (
                                                    <div key={room.id} className="rounded-sm border border-gray-100 bg-white p-5 shadow-sm">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/5 text-primary-300">
                                                                    <Home className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-textPrimary">{room.name}</p>
                                                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{room.typeName}</p>
                                                                </div>
                                                            </div>
                                                            {room.roomCount > 1 ? (
                                                                <Badge variant="primary">x {room.roomCount}</Badge>
                                                            ) : null}
                                                        </div>

                                                        <div className="mt-4">
                                                            {room.functions.length ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {room.functions.map((roomFunction) => (
                                                                        <div key={`${room.id}-${roomFunction.id}`} className="inline-flex items-center gap-2 rounded-full border border-primary-500/18 bg-primary-500/10 px-3 py-1.5 text-xs text-textPrimary">
                                                                            <FunctionIcon iconName={roomFunction.icon} className="h-3.5 w-3.5 text-primary-300" />
                                                                            <span>{roomFunction.name}</span>
                                                                            <span className="rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                                                                x {roomFunction.quantity}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-textSecondary">
                                                                    {t('offers.detail.noRoomFunctions', { defaultValue: 'No smart functions were selected for this room.' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card className="rounded-sm p-6 text-sm text-textSecondary bg-white border border-gray-100 shadow-sm">
                                                {t('offers.detail.noRoomsLevel', { defaultValue: 'No rooms are defined on this level.' })}
                                            </Card>
                                        )}
                                    </div>
                                )) : (
                                    <Card className="rounded-sm p-6 text-sm text-textSecondary bg-white border border-gray-100 shadow-sm">
                                        {t('offers.detail.noLevels', { defaultValue: 'No levels are stored in this offer.' })}
                                    </Card>
                                )}
                            </div>
                        </Card>
                    </section>

                    <section className="space-y-4">
                        <SectionTitle title={t('offers.detail.functionsChapter', { defaultValue: 'FUNCTIONS' })} className="!mb-6 rounded-sm bg-primary-600 px-4 py-3 shadow-sm [&_h2]:text-sm [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:!text-white [&_h2]:sm:text-sm [&_h2]:lg:text-sm [&_p]:mt-1 [&_p]:text-xs [&_p]:text-primary-100" />
                        {usedFunctions.length ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {usedFunctions.map((item) => (
                                    <Card key={item.id || item.name} className="rounded-sm p-4 bg-white border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary-50/50 border border-primary-500/20 text-primary-500">
                                                    <FunctionIcon iconName={item.icon} className="h-4 w-4 text-primary-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-textPrimary">{item.name}</p>
                                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{item.rooms?.length || 0} rooms</p>
                                                </div>
                                            </div>
                                            <Badge variant="primary" className="!rounded-sm !py-1 !px-2">x {item.totalQty || item.quantity}</Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="rounded-sm p-8 text-center bg-white border border-gray-100 shadow-sm"><p className="text-sm text-textSecondary">{t('offers.detail.noFunctions', { defaultValue: 'No smart functions with quantity greater than zero were stored in this offer.' })}</p></Card>
                        )}
                    </section>


                    <section className="space-y-4">
                        <SectionTitle title={t('offers.detail.productsChapter', { defaultValue: 'PRODUCTS' })} className="!mb-6 rounded-sm bg-primary-600 px-4 py-3 shadow-sm [&_h2]:text-sm [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:!text-white [&_h2]:sm:text-sm [&_h2]:lg:text-sm [&_p]:mt-1 [&_p]:text-xs [&_p]:text-primary-100" />
                        <PremiumTableWrapper>
                            <thead><tr className="border-b border-white/8 bg-white/5"><th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.photo', { defaultValue: 'Photo' })}</th><th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.componentSpec')}</th><th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.quantity')}</th><th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.unitNet')}</th><th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.totalNet')}</th></tr></thead>
                            <tbody className="divide-y divide-white/8">
                                {hardwareItems.map((item, idx) => (
                                    <tr key={`${item.code}-${idx}`} className="align-top transition-colors hover:bg-white/5"><td className="px-6 py-5"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-sm border border-white/8 bg-white/5">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-textSecondary" />}</div></td><td className="px-6 py-5"><p className="text-sm font-medium uppercase tracking-[0.02em] text-textPrimary">{item.name}</p>{item.description ? <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-textSecondary">{item.description}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{item.code}</span>{item.rangeName ? <Badge variant="neutral">{item.rangeName}</Badge> : null}{item.colorName ? <Badge variant="primary">{item.colorName}</Badge> : null}</div></td><td className="px-6 py-5 text-center"><span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/8 bg-white/5 text-sm font-medium text-textPrimary">{item.qty}</span></td><td className="px-6 py-5 text-right text-sm font-medium text-textSecondary">{formatCurrency(item.price || 0)}</td><td className="px-6 py-5 text-right"><p className="text-sm font-semibold text-textPrimary">{formatCurrency(item.subtotal || 0)}</p></td></tr>
                                ))}
                                {relatedHardwareItems.length ? <tr><td colSpan="5" className="px-6 py-4"><div className="rounded-md border border-primary-500/12 bg-primary-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-300">{t('offers.detail.relatedProducts', { defaultValue: 'Related Products' })}</div></td></tr> : null}
                                {relatedHardwareItems.map((item, idx) => (
                                    <tr key={`related-${item.code}-${idx}`} className="align-top transition-colors hover:bg-white/5"><td className="px-6 py-5"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-sm border border-white/8 bg-white/5">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-textSecondary" />}</div></td><td className="px-6 py-5"><p className="text-sm font-medium uppercase tracking-[0.02em] text-textPrimary">{item.name}</p>{item.description ? <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-textSecondary">{item.description}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-300">{item.code}</span><Badge variant="primary">{t('offers.detail.autoCalculated', { defaultValue: 'Auto calculated' })}</Badge>{item.rangeName ? <Badge variant="neutral">{item.rangeName}</Badge> : null}{item.colorName ? <Badge variant="primary">{item.colorName}</Badge> : null}</div></td><td className="px-6 py-5 text-center"><span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/8 bg-white/5 text-sm font-medium text-textPrimary">{item.qty}</span></td><td className="px-6 py-5 text-right text-sm font-medium text-textSecondary">{formatCurrency(item.price || 0)}</td><td className="px-6 py-5 text-right"><p className="text-sm font-semibold text-textPrimary">{formatCurrency(item.subtotal || 0)}</p></td></tr>
                                ))}
                                {allHardwareItems.length === 0 ? <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-textSecondary">{t('offers.detail.noHardware', { defaultValue: 'No hardware line items were generated for this offer yet.' })}</td></tr> : null}
                            </tbody>
                        </PremiumTableWrapper>
                    </section>
                    <section className="space-y-4">
                        <SectionTitle
                            title={t('offers.detail.servicesChapter', { defaultValue: 'SERVICES' })}
                            className="!mb-6 rounded-sm bg-primary-600 px-4 py-3 shadow-sm [&_h2]:text-sm [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:!text-white [&_h2]:sm:text-sm [&_h2]:lg:text-sm [&_p]:mt-1 [&_p]:text-xs [&_p]:text-primary-100"
                        />

                        <PremiumTableWrapper>
                            <thead>
                                <tr className="border-b border-white/8 bg-white/5">
                                    <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                        {t('offers.detail.serviceName', { defaultValue: 'Service' })}
                                    </th>
                                    <th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                        {t('offers.detail.quantity')}
                                    </th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                        {t('offers.detail.unitNet')}
                                    </th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                        {t('offers.detail.totalNet')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                                {services.length ? services.map((service) => (
                                    <tr key={service.serviceId || service.id || service.serviceCode} className="align-top transition-colors hover:bg-white/5">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-medium text-textPrimary">{service.serviceName ?? service.name}</p>
                                            {service.description ? (
                                                <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-textSecondary">{service.description}</p>
                                            ) : null}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                {service.serviceCode ? <Badge variant="neutral">{service.serviceCode}</Badge> : null}
                                                {service.pricingMode ? (
                                                    <Badge variant="primary">
                                                        {humanizeValue(service.pricingMode, t('offers.detail.calculatedPricing', { defaultValue: 'Calculated pricing' }))}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/8 bg-white/5 text-sm font-medium text-textPrimary">
                                                {service.calcQty ?? 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-medium text-textSecondary">{formatCurrency(service.unitPrice ?? 0)}</td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-sm font-semibold text-textPrimary">{formatCurrency(service.subtotal ?? 0)}</p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-sm text-textSecondary">
                                            {t('offers.detail.noServices')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </PremiumTableWrapper>
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-5">
                        <div className="space-y-8">
                            <div>
                                <Badge variant="primary" className="mb-4">{t('offers.detail.grandTotalChapter', { defaultValue: 'GRAND TOTAL' })}</Badge>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.productsTotalPerProject', { defaultValue: 'Products Total / Project' })}</span>
                                        <span className="font-medium text-textPrimary">{formatCurrency(snapshotBreakdown.productsSubtotalPerProject ?? (projectMultiplier > 0 ? productsSubtotal / projectMultiplier : productsSubtotal))}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.servicesTotalPerProject', { defaultValue: 'Services Total / Project' })}</span>
                                        <span className="font-medium text-textPrimary">{formatCurrency(snapshotBreakdown.servicesSubtotalPerProject ?? (projectMultiplier > 0 ? servicesSubtotal / projectMultiplier : servicesSubtotal))}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.productsServices')} / {t('offers.detail.perProject', { defaultValue: 'Per Project' })}</span>
                                        <span className="font-medium text-textPrimary">{formatCurrency(totalPerProject)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.quantity')}</span>
                                        <span className="font-medium text-textPrimary">x {projectMultiplier}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-textSecondary">
                                        <span>{t('offers.detail.grossTotal', { defaultValue: 'Gross Total' })}</span>
                                        <span className="font-medium text-textPrimary">{formatCurrency(grossTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-emerald-300">
                                        <span className="inline-flex items-center gap-2">
                                            <TrendingDown className="h-4 w-4" />
                                            {t('offers.detail.discount')} ({Number(discountPercent || 0).toFixed(2)}%)
                                        </span>
                                        <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-sm border border-primary-500/18 bg-primary-500/10 px-5 py-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-200">{t('offers.detail.grandTotal')}</p>
                                <p className="mt-3 font-heading text-5xl font-semibold leading-none text-textPrimary">{formatCurrency(grandTotal)}</p>
                                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.detail.exclVat')}</p>
                            </div>
                            {canAcceptOffer ? (
                                <Button
                                    size="md"
                                    className="w-full gap-2"
                                    onClick={handleAcceptOffer}
                                    disabled={accepting}
                                >
                                    {accepting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : null}
                                    {t('offers.detail.accept')}
                                    <ArrowRight className="h-4.5 w-4.5" />
                                </Button>
                            ) : null}

                            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                                {t('offers.detail.validFor')}
                            </p>
                        </div>
                    </div>

                    <Card className="rounded-sm p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('offers.detail.offerConditionsTitle', { defaultValue: 'OFFER CONDITIONS' })}</h3>
                                <p className="text-sm text-textSecondary">{t('offers.detail.offerConditionsHelp', { defaultValue: 'Commercial terms configured for this offer flow.' })}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {conditions.length ? conditions.map((condition, index) => (
                                <div key={condition.id || index} className="flex items-start gap-3 rounded-sm border border-white/8 bg-white/5 px-4 py-4">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary-500/18 bg-primary-500/12 text-xs font-semibold text-primary-300">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm leading-relaxed text-textPrimary">{condition.text}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-textSecondary">
                                    {t('offers.detail.noOfferConditions', { defaultValue: 'No offer conditions are currently configured.' })}
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card className="rounded-sm border border-amber-500/20 bg-amber-500/10 p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-amber-500/20 bg-amber-500/10 text-amber-300">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('offers.detail.disclaimerTitle', { defaultValue: 'DISCLAIMER' })}</h3>
                                <p className="text-sm text-textSecondary">{t('offers.detail.disclaimerHelp', { defaultValue: 'Important notices entered in master data.' })}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {disclaimers.length ? disclaimers.map((disclaimer, index) => (
                                <div key={disclaimer.id || index} className="rounded-sm border border-amber-500/12 bg-black/10 px-4 py-4">
                                    <p className="text-sm leading-relaxed text-textPrimary">{disclaimer.text}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-textSecondary">
                                    {t('offers.detail.noDisclaimers', { defaultValue: 'No disclaimer text is currently configured.' })}
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card className="rounded-sm p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <MessageSquareText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('offers.detail.customerCommentsTitle', { defaultValue: 'CUSTOMER COMMENTS' })}</h3>
                                <p className="text-sm text-textSecondary">{t('offers.detail.customerCommentsHelp', { defaultValue: 'This field is stored with the offer. Use Edit if you want to change it.' })}</p>
                            </div>
                        </div>

                        <textarea
                            readOnly
                            rows={6}
                            value={customerComments}
                            placeholder={t('offers.detail.customerCommentsPlaceholder', { defaultValue: 'No customer comments were saved for this offer.' })}
                            className="w-full resize-none rounded-sm border border-white/8 bg-white/5 px-5 py-4 text-sm leading-relaxed text-textPrimary placeholder:text-textSecondary focus:outline-none"
                        />
                    </Card>

                    <Card className="rounded-sm p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('offers.detail.lifecycle')}</h3>
                                <p className="text-sm text-textSecondary">{t('offers.detail.autoGeneratedNote')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {follow?.enabled ? (
                                <div className="space-y-4 rounded-sm border border-white/8 bg-white/5 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.detail.nextContact')}</span>
                                        <Badge variant="neutral">{formatDate(follow.nextReminderAt)}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.detail.channel')}</span>
                                        <div className="flex gap-2">
                                            {follow.channels?.email ? (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-primary-300" title={t('offers.detail.emailChannel')}>
                                                    <Mail className="h-3.5 w-3.5" />
                                                </div>
                                            ) : null}
                                            {follow.channels?.sms ? (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-primary-300" title={t('offers.detail.smsChannel')}>
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
            </div>
            {/* Scoped styles */}
            <style>{`
                .db-stat-card {
                    background: #ffffff;
                    border: 1px solid var(--sborder);
                    box-shadow: 0 2px 6px rgba(3,18,13,0.03);
                    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                }
                .db-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px var(--sglow), 0 2px 8px rgba(3,18,13,0.05);
                    border-color: var(--sc) !important;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </AnimatedPageWrapper>
    );
}

