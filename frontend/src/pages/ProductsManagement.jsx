import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    addProduct, deleteProduct, updateProduct, 
    fetchProducts, fetchSmartFunctions, fetchProductRanges, fetchColors 
} from '@/features/admin/adminSlice';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Package,
    Tag,
    Layers,
    Palette,
    Save,
    AlertCircle,
    Box,
    Upload,
    Euro,
    Info,
    ChevronDown,
    Activity,
    ShieldCheck,
    Cpu,
    Loader2
} from 'lucide-react';
import { StatusBadge } from '@/components/offers/StatusBadge';
import { clsx } from 'clsx';
import {
    Button,
    Badge,
    Card,
    Modal,
    Skeleton,
    EmptyState,
    SectionTitle,
    Input,
    AnimatedPageWrapper,
} from '@/components/common/UIComponents';
import SelectMenu from '@/components/common/SelectMenu';
import { normalizeApiError } from '@/utils/normalizeApiError';
import api from '@/utils/api';
import { useTranslation } from 'react-i18next';

function getProductImageValue(product) {
    return product?.imageUrl
        || product?.imageURL
        || product?.image_url
        || product?.image
        || product?.dataValues?.imageUrl
        || '';
}

function resolveProductImageSrc(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^(blob:|data:|https?:\/\/)/i.test(raw)) return raw;

    const uploadPath = raw.startsWith('uploads/') ? `/${raw}` : raw;
    if (uploadPath.startsWith('/uploads/')) {
        try {
            const apiBaseUrl = new URL(api.defaults.baseURL || '/api', window.location.origin);
            return `${apiBaseUrl.origin}${uploadPath}`;
        } catch {
            return uploadPath;
        }
    }

    return raw;
}

export default function ProductsManagement() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { products, smartFunctions, productRanges, colors, loading: adminLoading } = useSelector((state) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
    const [formErrors, setFormErrors] = useState({});
    const [apiError, setApiError] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        price: '',
        description: '',
        nameEn: '',
        nameRo: '',
        descriptionEn: '',
        descriptionRo: '',
        image: '',
        imageFile: null,
        imagePreview: '',
        productType: 'STANDARD',
        status: 'Active',
        allowedRanges: [],
        allowedColors: [],
        dependencies: [],
        mappings: []
    });

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchSmartFunctions());
        dispatch(fetchProductRanges());
        dispatch(fetchColors());
    }, [dispatch]);

    const formatCurrency = (value) => new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    const filteredProducts = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const previewImageSrc = resolveProductImageSrc(formData.imagePreview || formData.image);
    const storedImageValue = String(formData.image || '');
    const isUsingStoredUpload = storedImageValue.startsWith('/uploads/') || storedImageValue.startsWith('uploads/');
    const imageSourceLabel = formData.imageFile || isUsingStoredUpload
        ? t('adminPages.products.modal.usingUploadedImage', { defaultValue: 'Using an uploaded image' })
        : formData.image
            ? t('adminPages.products.modal.usingExternalUrl', { defaultValue: 'Using an external URL' })
            : t('adminPages.products.modal.noImage', { defaultValue: 'No image selected' });
    const standardProductOptions = products
        .filter((product) => product.id !== editingId && product.productType !== 'RELATED' && product.isActive !== false)
        .map((product) => ({ value: product.id, label: [product.code, product.name].filter(Boolean).join(' ') }));

    const handleOpenForm = (product = null) => {
        setFormErrors({});
        setApiError(null);
        if (product) {
            setFormData({
                // Core product fields
                code: product.code || '',
                name: product.name || '',
                description: product.description || '',
                // Map model field unitPriceEurExVat to form field price
                price: product.unitPriceEurExVat != null ? product.unitPriceEurExVat : '',
                // Keep the saved product image for the edit preview.
                image: getProductImageValue(product),
                imageFile: null,
                imagePreview: '',
                productType: product.productType || 'STANDARD',
                // Map model field isActive to form field status (backward compatibility)
                status: product.isActive !== false ? 'Active' : 'Inactive',
                // Localized translations
                nameEn: product.translations?.name?.en || '',
                nameRo: product.translations?.name?.ro || '',
                descriptionEn: product.translations?.description?.en || '',
                descriptionRo: product.translations?.description?.ro || '',
                // Complex relationships - ensure arrays are preserved
                allowedRanges: Array.isArray(product.allowedRanges) ? product.allowedRanges : (product.productRanges ? product.productRanges.map(r => r.id) : []),
                allowedColors: Array.isArray(product.allowedColors) ? product.allowedColors : (product.colors ? product.colors.map(c => c.id) : []),
                dependencies: Array.isArray(product.dependencies) ? product.dependencies.map((dependency) => ({
                    mainProductId: dependency.mainProductId || dependency.productId || '',
                    quantityPerMainProduct: dependency.quantityPerMainProduct || 1,
                })) : [],
                // Nested mappings - ensure structure is preserved
                mappings: Array.isArray(product.mappings) ? product.mappings.map(m => ({
                    functionId: m.smartFunctionId || m.functionId || '',
                    channelType: m.channelType || 'GENERAL',
                    capacity: m.capacity || 1,
                    priority: m.priority || 0,
                    calculationScope: m.calculationScope || 'room'
                })) : []
            });
            setEditingId(product.id);
        } else {
            setFormData({
                code: '', name: '', price: '', description: '', nameEn: '', nameRo: '', descriptionEn: '', descriptionRo: '', image: '', imageFile: null, imagePreview: '', productType: 'STANDARD', status: 'Active',
                allowedRanges: [], allowedColors: [], dependencies: [], mappings: []
            });
            setEditingId(null);
        }
        setIsFormOpen(true);
    };

    const validatePrice = (raw) => {
        if (raw === null || raw === undefined || String(raw).trim() === '') return t('adminPages.products.errors.priceRequired');
        const n = Number(raw);
        if (!Number.isFinite(n)) return t('adminPages.products.errors.priceNumber');
        if (n <= 0) return t('adminPages.products.errors.pricePositive');
        return null;
    };

    const validateForm = (data) => {
        const errs = {};
        const priceErr = validatePrice(data.price);
        if (priceErr) errs.price = priceErr;
        if (!String(data.code || '').trim()) errs.code = t('adminPages.products.errors.codeRequired');
        if (!String(data.name || '').trim()) errs.name = t('adminPages.products.errors.nameRequired');
        return errs;
    };

    const handleImageFileChange = (file) => {
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, imageFile: file, imagePreview: previewUrl }));
    };

    const handleAddDependency = () => {
        setFormData((prev) => ({
            ...prev,
            dependencies: [...(prev.dependencies || []), { mainProductId: '', quantityPerMainProduct: 1 }]
        }));
    };

    const handleUpdateDependency = (index, field, value) => {
        setFormData((prev) => {
            const dependencies = [...(prev.dependencies || [])];
            dependencies[index] = { ...dependencies[index], [field]: value };
            return { ...prev, dependencies };
        });
    };

    const handleRemoveDependency = (index) => {
        setFormData((prev) => ({
            ...prev,
            dependencies: (prev.dependencies || []).filter((_, idx) => idx !== index)
        }));
    };

    const handleAddMapping = () => {
        setFormData({
            ...formData,
            mappings: [...formData.mappings, { functionId: '', channelType: 'IN', capacity: 1, priority: 1, calculationScope: 'room' }]
        });
    };

    const handleRemoveMapping = (index) => {
        const newMappings = [...formData.mappings];
        newMappings.splice(index, 1);
        setFormData({ ...formData, mappings: newMappings });
    };

    const handleUpdateMapping = (index, field, value) => {
        const newMappings = [...formData.mappings];
        newMappings[index] = { ...newMappings[index], [field]: value };
        setFormData({ ...formData, mappings: newMappings });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        const errs = validateForm(formData);
        setFormErrors(errs);
        if (Object.keys(errs).length) return;

        // De-dup exact duplicate mappings client-side (backend remains authoritative)
        const rawMappings = Array.isArray(formData.mappings) ? formData.mappings : [];
        const seen = new Set();
        const mappings = rawMappings.filter((m) => {
            if (!m) return false;
            const functionId = m.smartFunctionId || m.functionId;
            if (!functionId) return false;
            const key = [
                functionId,
                String(m.channelType || 'GENERAL').toUpperCase(),
                String(m.calculationScope || 'room'),
                parseInt(m.capacity, 10) || 1,
                parseInt(m.priority, 10) || 0
            ].join('|');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const allowedRanges = Array.from(
            new Set((Array.isArray(formData.allowedRanges) ? formData.allowedRanges : []).filter(Boolean))
        );
        const allowedColors = Array.from(
            new Set((Array.isArray(formData.allowedColors) ? formData.allowedColors : []).filter(Boolean))
        );

        const dependencies = Array.from(new Map((Array.isArray(formData.dependencies) ? formData.dependencies : [])
            .filter((item) => item?.mainProductId)
            .map((item) => [item.mainProductId, {
                mainProductId: item.mainProductId,
                quantityPerMainProduct: Number(item.quantityPerMainProduct) || 1,
            }])).values());
        const normalizedMappings = formData.productType === 'RELATED' ? [] : mappings;
        const basePayload = {
            ...formData,
            allowedRanges,
            allowedColors,
            dependencies: formData.productType === 'RELATED' ? dependencies : [],
            mappings: normalizedMappings,
            price: Number(formData.price),
            nameEn: formData.name,
            nameRo: formData.name,
            descriptionEn: formData.description,
            descriptionRo: formData.description,
        };
        delete basePayload.imageFile;
        delete basePayload.imagePreview;

        const payload = formData.imageFile ? new FormData() : basePayload;
        if (formData.imageFile) {
            Object.entries(basePayload).forEach(([key, value]) => {
                if (Array.isArray(value) || (value && typeof value === 'object')) {
                    payload.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    payload.append(key, value);
                }
            });
            payload.append('imageFile', formData.imageFile);
        }
        try {
            if (editingId) {
                await dispatch(updateProduct({ id: editingId, data: payload })).unwrap();
            } else {
                await dispatch(addProduct(payload)).unwrap();
            }
            await dispatch(fetchProducts()).unwrap();
            setIsFormOpen(false);
        } catch (err) {
            const ne = normalizeApiError(err);
            setApiError(ne.message);
            if (ne.errors) setFormErrors((p) => ({ ...p, ...ne.errors }));
        }
    };

    const confirmDelete = () => {
        if (deleteModal.productId) {
            dispatch(deleteProduct(deleteModal.productId));
            setDeleteModal({ isOpen: false, productId: null });
        }
    };

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-10 pb-20 font-sans">
            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-6">
                        <SectionTitle
                            title={t('adminPages.products.title')}
                            subtitle={t('adminPages.products.subtitle')}
                            badge={t('adminPages.products.badge')}
                            className="mb-0"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                { icon: Package, label: t('adminPages.products.count', { count: products.length }), value: products.length },
                                { icon: ShieldCheck, label: t('adminPages.products.modal.features'), value: products.filter((product) => Array.isArray(product.mappings) && product.mappings.length).length },
                            ].map((item) => (
                                <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 px-5 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{item.label}</p>
                                            <p className="mt-1 font-heading text-3xl font-semibold leading-none text-textPrimary">{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button size="md" onClick={() => handleOpenForm()} className="gap-2">
                        <Plus className="h-4.5 w-4.5" />
                        {t('adminPages.products.addNew')}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="rounded-[1.9rem] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-[32rem]">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                    <input
                        type="text"
                        placeholder={t('adminPages.products.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                    />
                    </div>

                    <Badge variant="neutral">
                        {t('adminPages.products.count', { count: filteredProducts.length })}
                    </Badge>
                </div>
            </Card>

            {/* Product Table */}
            <Card className="overflow-hidden rounded-[2rem] p-0">
                {adminLoading && !products.length ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                        <Loader2 className="w-12 h-12 text-primary-300 animate-spin" />
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-textSecondary">{t('adminPages.products.syncing')}</p>
                        <div className="p-10 space-y-6 w-full opacity-50">
                            <Skeleton className="h-20 w-full rounded-2xl" repeat={3} />
                        </div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/8 bg-white/5">
                                    <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.code')}</th>
                                    <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.productName')}</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.ranges')}</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.price')}</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.status')}</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="transition-colors hover:bg-white/5 group">
                                        <td className="px-8 py-6">
                                            <div className="text-[10px] font-semibold text-textSecondary tracking-[0.2em] font-mono group-hover:text-primary-300 transition-colors">#{p.code}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-medium text-textPrimary tracking-tight uppercase">{p.name}</div>
                                            <div className="mt-1.5 line-clamp-1 text-[10px] font-medium italic text-textSecondary">{p.description}</div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-wrap justify-center gap-1 max-w-[120px] mx-auto">
                                                {p.allowedRanges?.map(rId => (
                                                    <Badge key={rId} variant="neutral" className="px-2 py-0.5 text-[8px]">
                                                        {productRanges.find(r => r.id === rId)?.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-heading text-3xl font-semibold text-primary-300 tabular-nums">
                                            {Number.isFinite(Number(p.price)) ? formatCurrency(p.price) : '-'}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Badge variant={p.status === 'Active' ? 'success' : 'neutral'} className="text-[9px] px-4 py-1">
                                                {p.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleOpenForm(p)} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300">
                                                    <Edit className="w-4.5 h-4.5" />
                                                </button>
                                                <button onClick={() => setDeleteModal({ isOpen: true, productId: p.id })} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-red-500/25 hover:text-red-300">
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title={t('adminPages.products.noProductsTitle')}
                        description={t('adminPages.products.noProductsDesc')}
                        icon={Box}
                        action={<Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>{t('adminPages.products.reset')}</Button>}
                    />
                )}
            </Card>

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingId ? t('adminPages.products.modal.editTitle') : t('adminPages.products.modal.addTitle')}
                maxWidth="max-w-5xl"
                footer={
                        <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                            <ShieldCheck className="w-4 h-4 text-primary-300" />
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-textSecondary">{t('adminPages.products.modal.autoSave')}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-[10px] font-semibold uppercase tracking-widest">{t('adminPages.products.modal.cancel')}</Button>
                            <Button size="md" className="gap-3" onClick={handleSubmit}>
                                <Save className="w-5 h-5" /> {t('adminPages.products.modal.save')}
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-6">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <Input
                            label={t('adminPages.products.modal.code')}
                            icon={Tag}
                            placeholder="e.g. CORE-LOGIC-GENX"
                            value={formData.code}
                            onChange={(e) => {
                                const v = e.target.value;
                                setFormData({ ...formData, code: v });
                                if (formErrors.code) setFormErrors({ ...formErrors, code: v.trim() ? null : 'Code is required' });
                            }}
                            className="uppercase font-black tracking-widest"
                        />
                        <Input
                            label={t('adminPages.products.modal.name')}
                            icon={Package}
                            placeholder="e.g. Smart Hub Pro"
                            value={formData.name}
                            onChange={(e) => {
                                const v = e.target.value;
                                setFormData({ ...formData, name: v });
                                if (formErrors.name) setFormErrors({ ...formErrors, name: v.trim() ? null : 'Name is required' });
                            }}
                        />
                        <div className="space-y-2">
                            <Input
                                label={t('adminPages.products.modal.price')}
                                icon={Euro}
                                type="number"
                                value={formData.price ?? ''}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, price: v });
                                    const msg = validatePrice(v);
                                    setFormErrors({ ...formErrors, price: msg });
                                }}
                            />
                            {formErrors.price ? (
                                <p className="text-xs font-bold text-red-600 px-2">{formErrors.price}</p>
                            ) : null}
                        </div>
                        <div className="space-y-3">
                            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.modal.description')}</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] px-5 py-4 text-sm font-medium text-textPrimary transition-all placeholder:text-textSecondary focus:border-primary-500/45 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.modal.productType', { defaultValue: 'Product Type' })}</label>
                            <SelectMenu
                                value={formData.productType}
                                onChange={(nextValue) => setFormData((prev) => ({
                                    ...prev,
                                    productType: nextValue,
                                    mappings: nextValue === 'RELATED' ? [] : prev.mappings,
                                    dependencies: nextValue === 'STANDARD' ? [] : prev.dependencies,
                                }))}
                                options={[
                                    { value: 'STANDARD', label: t('adminPages.products.modal.standardProduct', { defaultValue: 'Standard Product' }) },
                                    { value: 'RELATED', label: t('adminPages.products.modal.relatedProduct', { defaultValue: 'Related Product' }) },
                                ]}
                                ariaLabel={t('adminPages.products.modal.productType', { defaultValue: 'Product Type' })}
                                size="field"
                                fullWidth
                            />
                        </div>

                    </div>

                    {/* Image & Status */}
                    <div className="space-y-6">

                        <div className="space-y-3 rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminPages.products.modal.uploadImage', { defaultValue: 'Upload Product Image' })}</p>
                                    <p className="mt-1 text-xs text-textSecondary">{imageSourceLabel}</p>
                                </div>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-textSecondary transition-colors hover:border-primary-500/25 hover:text-primary-300">
                                    <Upload className="h-4 w-4" />
                                    {t('adminPages.products.modal.replaceImage', { defaultValue: 'Replace Image' })}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(event) => {
                                            handleImageFileChange(event.target.files?.[0]);
                                            event.target.value = '';
                                        }}
                                    />
                                </label>
                            </div>
                            {previewImageSrc ? (
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c] p-2">
                                    <img src={previewImageSrc} alt={formData.name || 'Product'} className="h-40 w-full rounded-xl object-contain" />
                                </div>
                            ) : null}
                        </div>
                        <div className="space-y-3">
                            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.modal.ranges')}</label>
                            <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                                {productRanges.map(r => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                            const curr = formData.allowedRanges || [];
                                            setFormData({ ...formData, allowedRanges: curr.includes(r.id) ? curr.filter(x => x !== r.id) : [...curr, r.id] });
                                        }}
                                        className={clsx(
                                            'rounded-xl border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] transition-all',
                                            formData.allowedRanges.includes(r.id)
                                                ? 'border-primary-500 bg-primary-500 text-primary-950'
                                                : 'border-white/10 bg-[#1c1c1c] text-textSecondary hover:border-primary-500/18 hover:text-primary-300',
                                        )}
                                    >
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.modal.colors')}</label>
                            <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                                {colors.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            const curr = formData.allowedColors || [];
                                            setFormData({ ...formData, allowedColors: curr.includes(c.id) ? curr.filter(x => x !== c.id) : [...curr, c.id] });
                                        }}
                                        className={clsx("w-10 h-10 rounded-xl border-4 transition-all", formData.allowedColors.includes(c.id) ? "border-primary-600" : "border-white")}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {apiError ? (
                        <div className="md:col-span-2">
                            <div className="rounded-2xl border border-red-500/18 bg-red-500/10 p-4 text-sm font-medium text-red-300">
                                {apiError}
                            </div>
                        </div>
                    ) : null}

                    {formData.productType === 'RELATED' ? (
                        <div className="md:col-span-2 border-t border-white/8 pt-10">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Layers className="h-5 w-5 text-primary-300" />
                                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.modal.mainProducts', { defaultValue: 'Main Products' })}</h4>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddDependency} className="text-[9px] uppercase tracking-[0.18em]">
                                    <Plus className="mr-2 h-4 w-4" /> {t('adminPages.products.modal.addMainProduct', { defaultValue: 'Add Main Product' })}
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {(formData.dependencies || []).map((dependency, idx) => (
                                    <div key={idx} className="grid grid-cols-1 gap-4 rounded-[1.5rem] border border-white/8 bg-white/5 p-5 md:grid-cols-[1fr_12rem_3rem]">
                                        <SelectMenu
                                            value={dependency.mainProductId}
                                            onChange={(nextValue) => handleUpdateDependency(idx, 'mainProductId', nextValue)}
                                            options={standardProductOptions}
                                            placeholder={t('adminPages.products.modal.selectMainProduct', { defaultValue: 'Select main product' })}
                                            ariaLabel={t('adminPages.products.modal.mainProducts', { defaultValue: 'Main Products' })}
                                            size="fieldDense"
                                            fullWidth
                                        />
                                        <input
                                            type="number"
                                            min="0.000001"
                                            step="0.01"
                                            value={dependency.quantityPerMainProduct}
                                            onChange={(event) => handleUpdateDependency(idx, 'quantityPerMainProduct', event.target.value)}
                                            className="h-11 w-full rounded-xl border border-white/10 bg-[#1f1f1f] px-4 text-[11px] font-semibold text-textPrimary focus:border-primary-500/45 focus:outline-none"
                                            aria-label={t('adminPages.products.modal.quantityPerMain', { defaultValue: 'Quantity per main product' })}
                                        />
                                        <button type="button" onClick={() => handleRemoveDependency(idx)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c1c] text-textSecondary transition-colors hover:border-red-500/25 hover:text-red-300">
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </button>
                                    </div>
                                ))}
                                {(formData.dependencies || []).length === 0 ? (
                                    <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-8 text-center">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary italic">{t('adminPages.products.modal.noMainProducts', { defaultValue: 'Add at least one main product to auto-calculate this related product.' })}</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                    {/* Mappings */}
                    {formData.productType !== 'RELATED' ? (
                    <div className="md:col-span-2 border-t border-white/8 pt-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-primary-300" />
                                <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.products.modal.features')}</h4>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddMapping} className="text-[9px] uppercase tracking-[0.18em]">
                                <Plus className="w-4 h-4 mr-2" /> {t('adminPages.products.modal.addMapping')}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.mappings.map((m, idx) => (
                                <div key={idx} className="relative grid grid-cols-1 gap-4 rounded-[1.5rem] border border-white/8 bg-white/5 p-6 animate-fade-in md:grid-cols-6">
                                    <div className="col-span-2">
                                        <label className="ml-1 mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminPages.products.modal.function')}</label>
                                        <SelectMenu
                                            value={m.functionId}
                                            onChange={(nextValue) => handleUpdateMapping(idx, 'functionId', nextValue)}
                                            options={smartFunctions.map((func) => ({ value: func.id, label: func.name }))}
                                            placeholder={t('adminPages.products.modal.selectFunction')}
                                            ariaLabel={t('adminPages.products.modal.function')}
                                            size="fieldDense"
                                            fullWidth
                                        />
                                    </div>
                                    <div>
                                        <label className="ml-1 mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminPages.products.modal.channel')}</label>
                                        <SelectMenu
                                            value={m.channelType}
                                            onChange={(nextValue) => handleUpdateMapping(idx, 'channelType', nextValue)}
                                            options={[
                                                { value: 'IN', label: 'IN (Room)' },
                                                { value: 'OUT', label: 'OUT (Level)' },
                                                { value: 'GENERAL', label: 'GENERAL' },
                                            ]}
                                            ariaLabel={t('adminPages.products.modal.channel')}
                                            size="fieldDense"
                                            fullWidth
                                        />
                                    </div>
                                    <div>
                                        <label className="ml-1 mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminPages.products.modal.capacity')}</label>
                                        <input
                                            type="number"
                                            value={m.capacity}
                                            onChange={(e) => handleUpdateMapping(idx, 'capacity', parseInt(e.target.value) || 1)}
                                            className="h-11 w-full rounded-xl border border-white/10 bg-[#1f1f1f] px-4 text-[11px] font-semibold text-textPrimary focus:border-primary-500/45 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="ml-1 mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminPages.products.modal.priority')}</label>
                                        <input
                                            type="number"
                                            value={m.priority}
                                            onChange={(e) => handleUpdateMapping(idx, 'priority', parseInt(e.target.value) || 1)}
                                            className="h-11 w-full rounded-xl border border-white/10 bg-[#1f1f1f] px-4 text-[11px] font-semibold text-textPrimary focus:border-primary-500/45 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2 text-right">
                                        <div className="flex-1">
                                            <label className="ml-1 mb-1.5 block text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminPages.products.modal.scope')}</label>
                                            <SelectMenu
                                                value={m.calculationScope}
                                                onChange={(nextValue) => handleUpdateMapping(idx, 'calculationScope', nextValue)}
                                                options={[
                                                    { value: 'room', label: t('adminPages.products.modal.scopeRoom') },
                                                    { value: 'level', label: t('adminPages.products.modal.scopeLevel') },
                                                    { value: 'project', label: t('adminPages.products.modal.scopeProject') },
                                                ]}
                                                ariaLabel={t('adminPages.products.modal.scope')}
                                                size="fieldDense"
                                                fullWidth
                                            />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveMapping(idx)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c1c] text-textSecondary transition-colors hover:border-red-500/25 hover:text-red-300">
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formData.mappings.length === 0 && (
                                <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary italic">{t('adminPages.products.modal.noFeatures')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    ) : null}
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, productId: null })}
                title={t('adminPages.products.modal.deleteTitle')}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-4 justify-end w-full">
                        <Button variant="ghost" onClick={() => setDeleteModal({ isOpen: false, productId: null })}>{t('adminPages.products.modal.cancel')}</Button>
                        <Button variant="danger" className="h-12 bg-red-600 text-white font-black px-8 rounded-xl" onClick={confirmDelete}>{t('adminPages.products.modal.delete')}</Button>
                    </div>
                }
            >
                <div className="space-y-6 text-center py-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/18 bg-red-500/10 text-red-300">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="px-4 text-sm font-medium text-textSecondary">{t('adminPages.products.modal.deleteDesc')}</p>
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}











