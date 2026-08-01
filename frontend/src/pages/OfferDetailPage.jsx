import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import { fetchOfferById, duplicateOffer, deleteOffer, updateOfferStatus } from '@/features/offers/offersSlice';
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
    const [exporting, setExporting] = useState(null);
    const [accepting, setAccepting] = useState(false);
    const [sendingReminder, setSendingReminder] = useState(false);

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
    const buildingTypeName = snapshotProjectInfo.buildingTypeName ?? offer.project?.buildingType?.name ?? offer.buildingType ?? t('offers.detail.unknownBuildingType');
    const productRanges = Array.isArray(adminState.productRanges) && adminState.productRanges.length > 0
        ? adminState.productRanges
        : (adminState.publicProductRanges || []);
    const colors = Array.isArray(adminState.colors) && adminState.colors.length > 0
        ? adminState.colors
        : (adminState.publicColors || []);
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
    const isDashboardOfferRoute = location.pathname.startsWith('/dashboard/offers/');
    const isAdminOfferRoute = location.pathname.startsWith('/admin/offers/');
    const canAcceptOffer = isDashboardOfferRoute && normalizedStatus === 'offer_generated';
    const canUseEmailShortcut = isAdminOfferRoute && isAdminUser && Boolean(customerEmail);
    const canSendReminderEmail = isAdminOfferRoute && isAdminUser && normalizedStatus === 'offer_generated' && Boolean(customerEmail);

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
                                    {rangeLabel}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                                    <ClipboardList className="h-4 w-4 text-primary-300" />
                                    {offer.offerNumber}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 p-1.5">
                                <Button variant="ghost" className="h-9 w-9 rounded-full p-0" title={t('offers.detail.print')} onClick={handlePrint}>
                                    <Printer className="h-4 w-4" />
                                </Button>
                                {canUseEmailShortcut ? (
                                    <Button variant="ghost" className="h-9 w-9 rounded-full p-0" title={t('offers.detail.email')} onClick={handleEmail}>
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                ) : null}
                            </div>
                            <Button variant="secondary" size="md" className="gap-2" onClick={handleEditOffer}>
                                <Edit3 className="h-4.5 w-4.5" />
                                {t('offers.detail.edit')}
                            </Button>
                            <Button variant="outline" size="md" className="gap-2" onClick={handleDuplicateOffer}>
                                <Copy className="h-4.5 w-4.5" />
                                {t('offers.detail.duplicate')}
                            </Button>
                            <Button variant="secondary" size="md" className="gap-2 border-red-500/20 text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={handleDeleteOffer}>
                                <Trash2 className="h-4.5 w-4.5" />
                                {t('offers.detail.delete')}
                            </Button>
                            <Button size="md" className="gap-2" onClick={() => handleExport('pdf')} disabled={!!exporting}>
                                {exporting === 'pdf' ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
                                {t('offers.detail.exportPdf')}
                            </Button>
                            {isAdminUser ? (
                                <Button variant="outline" size="md" className="gap-2" onClick={() => handleExport('excel')} disabled={!!exporting}>
                                    {exporting === 'excel' ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
                                    {t('offers.detail.exportExcel', { defaultValue: 'Export Excel' })}
                                </Button>
                            ) : null}
                            {canSendReminderEmail ? (
                                <Button variant="outline" size="md" className="gap-2" onClick={handleSendReminderEmail} disabled={sendingReminder}>
                                    {sendingReminder ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Bell className="h-4.5 w-4.5" />}
                                    {t('offers.detail.sendReminderEmail', { defaultValue: 'Send Reminder Email' })}
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
                                label: t('offers.detail.lineItems', { count: allHardwareItems.length }),
                                value: allHardwareItems.length,
                            },
                            {
                                icon: Wrench,
                                label: t('offers.detail.servicesTitle'),
                                value: services.length,
                            },
                        ].map((item) => (
                            <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 px-5 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
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
                        <SectionTitle
                            title={t('offers.detail.projectChapter', { defaultValue: 'PROJECT' })}
                            badge={t('offers.detail.projectChapterBadge', { defaultValue: 'Chapter 1 / 4' })}
                            className="mb-0"
                        />

                        <Card className="rounded-[2rem] p-8">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {projectFacts.map((fact) => (
                                    <div key={fact.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                                <fact.icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{fact.label}</p>
                                                <p className="mt-2 text-base font-medium leading-relaxed text-textPrimary">{fact.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(buildingDescription || projectDescription) ? (
                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {buildingDescription ? (
                                        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                                {t('offers.detail.buildingDescriptionLabel', { defaultValue: 'Building Description' })}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-textPrimary">{buildingDescription}</p>
                                        </div>
                                    ) : null}
                                    {projectDescription ? (
                                        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                                {t('offers.detail.projectNotesLabel', { defaultValue: 'Project Notes' })}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-textPrimary">{projectDescription}</p>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

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
                                                    <div key={room.id} className="rounded-[1.6rem] border border-white/8 bg-white/5 p-5">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary-300">
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
                                            <Card className="rounded-[1.5rem] p-6 text-sm text-textSecondary">
                                                {t('offers.detail.noRoomsLevel', { defaultValue: 'No rooms are defined on this level.' })}
                                            </Card>
                                        )}
                                    </div>
                                )) : (
                                    <Card className="rounded-[1.5rem] p-6 text-sm text-textSecondary">
                                        {t('offers.detail.noLevels', { defaultValue: 'No levels are stored in this offer.' })}
                                    </Card>
                                )}
                            </div>
                        </Card>
                    </section>                    <section className="space-y-4">
                        <SectionTitle title={t('offers.detail.functionsChapter', { defaultValue: 'FUNCTIONS' })} badge={t('offers.detail.functionsChapterBadge', { defaultValue: 'Chapter 2 / 4' })} className="mb-0" />
                        {usedFunctions.length ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {usedFunctions.map((item) => (
                                    <Card key={item.id || item.name} className="rounded-[1.5rem] p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <FunctionIcon iconName={item.icon} className="h-5 w-5 text-primary-300" />
                                                <div>
                                                    <p className="text-sm font-medium text-textPrimary">{item.name}</p>
                                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{item.rooms?.length || 0} rooms</p>
                                                </div>
                                            </div>
                                            <Badge variant="primary">x {item.totalQty}</Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="rounded-[2rem] p-8 text-center"><p className="text-sm text-textSecondary">{t('offers.detail.noFunctions', { defaultValue: 'No smart functions with quantity greater than zero were stored in this offer.' })}</p></Card>
                        )}
                    </section>


                    <section className="space-y-4">
                        <SectionTitle title={t('offers.detail.productsChapter', { defaultValue: 'PRODUCTS' })} badge={t('offers.detail.productsChapterBadge', { defaultValue: 'Chapter 3 / 4' })} className="mb-0" />
                        <PremiumTableWrapper>
                            <thead><tr className="border-b border-white/8 bg-white/5"><th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.photo', { defaultValue: 'Photo' })}</th><th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.componentSpec')}</th><th className="px-6 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.quantity')}</th><th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.unitNet')}</th><th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('offers.detail.totalNet')}</th></tr></thead>
                            <tbody className="divide-y divide-white/8">
                                {hardwareItems.map((item, idx) => (
                                    <tr key={`${item.code}-${idx}`} className="align-top transition-colors hover:bg-white/5"><td className="px-6 py-5"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-white/5">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-textSecondary" />}</div></td><td className="px-6 py-5"><p className="text-sm font-medium uppercase tracking-[0.02em] text-textPrimary">{item.name}</p>{item.description ? <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-textSecondary">{item.description}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{item.code}</span>{item.rangeName ? <Badge variant="neutral">{item.rangeName}</Badge> : null}{item.colorName ? <Badge variant="primary">{item.colorName}</Badge> : null}</div></td><td className="px-6 py-5 text-center"><span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-sm font-medium text-textPrimary">{item.qty}</span></td><td className="px-6 py-5 text-right text-sm font-medium text-textSecondary">{formatCurrency(item.price || 0)}</td><td className="px-6 py-5 text-right"><p className="text-sm font-semibold text-textPrimary">{formatCurrency(item.subtotal || 0)}</p></td></tr>
                                ))}
                                {relatedHardwareItems.length ? <tr><td colSpan="5" className="px-6 py-4"><div className="rounded-md border border-primary-500/12 bg-primary-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-300">{t('offers.detail.relatedProducts', { defaultValue: 'Related Products' })}</div></td></tr> : null}
                                {relatedHardwareItems.map((item, idx) => (
                                    <tr key={`related-${item.code}-${idx}`} className="align-top transition-colors hover:bg-white/5"><td className="px-6 py-5"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-white/5">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-textSecondary" />}</div></td><td className="px-6 py-5"><p className="text-sm font-medium uppercase tracking-[0.02em] text-textPrimary">{item.name}</p>{item.description ? <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-textSecondary">{item.description}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-300">{item.code}</span><Badge variant="primary">{t('offers.detail.autoCalculated', { defaultValue: 'Auto calculated' })}</Badge>{item.rangeName ? <Badge variant="neutral">{item.rangeName}</Badge> : null}{item.colorName ? <Badge variant="primary">{item.colorName}</Badge> : null}</div></td><td className="px-6 py-5 text-center"><span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-sm font-medium text-textPrimary">{item.qty}</span></td><td className="px-6 py-5 text-right text-sm font-medium text-textSecondary">{formatCurrency(item.price || 0)}</td><td className="px-6 py-5 text-right"><p className="text-sm font-semibold text-textPrimary">{formatCurrency(item.subtotal || 0)}</p></td></tr>
                                ))}
                                {allHardwareItems.length === 0 ? <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-textSecondary">{t('offers.detail.noHardware', { defaultValue: 'No hardware line items were generated for this offer yet.' })}</td></tr> : null}
                            </tbody>
                        </PremiumTableWrapper>
                    </section>
                    <section className="space-y-4">
                        <SectionTitle
                            title={t('offers.detail.servicesChapter', { defaultValue: 'SERVICES' })}
                            badge={t('offers.detail.servicesChapterBadge', { defaultValue: 'Chapter 4 / 4' })}
                            className="mb-0"
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
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-sm font-medium text-textPrimary">
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
                    <div className="hero-frame rounded-[2.2rem] p-8">
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

                            <div className="rounded-[1.8rem] border border-primary-500/18 bg-primary-500/10 px-5 py-5">
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

                    <Card className="rounded-[2rem] p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('offers.detail.offerConditionsTitle', { defaultValue: 'OFFER CONDITIONS' })}</h3>
                                <p className="text-sm text-textSecondary">{t('offers.detail.offerConditionsHelp', { defaultValue: 'Commercial terms configured for this offer flow.' })}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {conditions.length ? conditions.map((condition, index) => (
                                <div key={condition.id || index} className="flex items-start gap-3 rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-4">
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

                    <Card className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('offers.detail.disclaimerTitle', { defaultValue: 'DISCLAIMER' })}</h3>
                                <p className="text-sm text-textSecondary">{t('offers.detail.disclaimerHelp', { defaultValue: 'Important notices entered in master data.' })}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {disclaimers.length ? disclaimers.map((disclaimer, index) => (
                                <div key={disclaimer.id || index} className="rounded-[1.3rem] border border-amber-500/12 bg-black/10 px-4 py-4">
                                    <p className="text-sm leading-relaxed text-textPrimary">{disclaimer.text}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-textSecondary">
                                    {t('offers.detail.noDisclaimers', { defaultValue: 'No disclaimer text is currently configured.' })}
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
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
                            className="w-full resize-none rounded-[1.5rem] border border-white/8 bg-white/5 px-5 py-4 text-sm leading-relaxed text-textPrimary placeholder:text-textSecondary focus:outline-none"
                        />
                    </Card>

                    <Card className="rounded-[2rem] p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
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
        </AnimatedPageWrapper>
    );
}

