import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchBuildingTypes, addBuildingType, updateBuildingType, deleteBuildingType,
    fetchRoomTypes, addRoomType, updateRoomType, deleteRoomType,
    fetchSmartFunctions, addSmartFunction, updateSmartFunction, deleteSmartFunction,
    fetchProductRanges, addProductRange, updateProductRange, deleteProductRange,
    fetchColors, addColor, updateColor, deleteColor,
    fetchServices, addService, updateService, deleteService,
    fetchDiscounts, addDiscount, updateDiscount, deleteDiscount,
    fetchConditions, addCondition, updateCondition, deleteCondition,
    fetchDisclaimers, addDisclaimer, updateDisclaimer, deleteDisclaimer,
    fetchFollowupTemplates, addFollowupTemplate, updateFollowupTemplate, deleteFollowupTemplate
} from '@/features/admin/adminSlice';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Layers,
    Save,
    Info,
    Zap,
    AlertCircle,
    AlertTriangle,
    Box,
    Euro,
    Percent,
    Loader2,
    Upload
} from 'lucide-react';
import {
    Button,
    Badge,
    Card,
    Modal,
    Skeleton,
    EmptyState,
    SectionTitle,
    Input,
    AnimatedPageWrapper
} from '@/components/common/UIComponents';
import SelectMenu from '@/components/common/SelectMenu';
import { clsx } from 'clsx';
import { normalizeApiError } from '@/utils/normalizeApiError';
import { useTranslation } from 'react-i18next';
import api from '@/utils/api';

const LOCALIZED_LANGUAGES = [
    { key: 'en', label: 'English' },
    { key: 'ro', label: 'Romanian' }
];

const LOCALIZED_FIELDS_BY_STORE_KEY = {
    buildingTypes: [
        { base: 'name', label: 'Name', type: 'text' },
        { base: 'description', label: 'Description', type: 'textarea' }
    ],
    roomTypes: [
        { base: 'name', label: 'Name', type: 'text' },
        { base: 'description', label: 'Description', type: 'textarea' }
    ],
    smartFunctions: [
        { base: 'name', label: 'Name', type: 'text' },
        { base: 'description', label: 'Description', type: 'textarea' }
    ],
    productRanges: [
        { base: 'name', label: 'Name', type: 'text' },
        { base: 'description', label: 'Description', type: 'textarea' }
    ],
    colors: [
        { base: 'name', label: 'Name', type: 'text' },
        { base: 'description', label: 'Description', type: 'textarea' }
    ],
    services: [
        { base: 'name', label: 'Name', type: 'text' },
        { base: 'description', label: 'Description', type: 'textarea' }
    ],
    conditions: [
        { base: 'text', label: 'Content', type: 'textarea' }
    ],
    disclaimers: [
        { base: 'text', label: 'Content', type: 'textarea' }
    ],
};

function getLocalizedFieldConfig(storeKey) {
    return LOCALIZED_FIELDS_BY_STORE_KEY[storeKey] || [];
}
function buildLocalizedFormState(localizedFields = [], translations = {}) {
    return localizedFields.reduce((acc, field) => {
        LOCALIZED_LANGUAGES.forEach(({ key }) => {
            const formKey = `${field.base}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            acc[formKey] = translations?.[field.base]?.[key] || '';
        });
        return acc;
    }, {});
}
const ENTITY_CONFIG = {
    buildingTypes: { fetch: fetchBuildingTypes, add: addBuildingType, update: updateBuildingType, delete: deleteBuildingType },
    roomTypes: { fetch: fetchRoomTypes, add: addRoomType, update: updateRoomType, delete: deleteRoomType },
    smartFunctions: { fetch: fetchSmartFunctions, add: addSmartFunction, update: updateSmartFunction, delete: deleteSmartFunction },
    productRanges: { fetch: fetchProductRanges, add: addProductRange, update: updateProductRange, delete: deleteProductRange },
    colors: { fetch: fetchColors, add: addColor, update: updateColor, delete: deleteColor },
    services: { fetch: fetchServices, add: addService, update: updateService, delete: deleteService },
    discounts: { fetch: fetchDiscounts, add: addDiscount, update: updateDiscount, delete: deleteDiscount },
    conditions: { fetch: fetchConditions, add: addCondition, update: updateCondition, delete: deleteCondition },
    disclaimers: { fetch: fetchDisclaimers, add: addDisclaimer, update: updateDisclaimer, delete: deleteDisclaimer },
    followupTemplates: { fetch: fetchFollowupTemplates, add: addFollowupTemplate, update: updateFollowupTemplate, delete: deleteFollowupTemplate },
};

const RELATION_DETAIL_KEYS = {
    buildingTypes: 'buildingTypeDetails',
    roomTypes: 'roomTypeDetails',
    smartFunctions: 'smartFunctionDetails',
    productRanges: 'productRangeDetails',
};

function getRelationshipLabels(item, fieldName) {
    const detailKey = RELATION_DETAIL_KEYS[fieldName];
    const detailedRelations = detailKey && Array.isArray(item?.[detailKey]) ? item[detailKey] : [];

    if (detailedRelations.length > 0) {
        return detailedRelations
            .map((relation) => relation?.name || relation?.code || relation?.id || null)
            .filter(Boolean);
    }

    const rawRelations = Array.isArray(item?.[fieldName]) ? item[fieldName] : [];
    return rawRelations
        .map((relation) => {
            if (typeof relation === 'object') {
                return relation?.name || relation?.code || relation?.id || null;
            }
            return relation || null;
        })
        .filter(Boolean);
}

export default function MasterDataManagement({
    title,
    entityName,
    storeKey,
    icon: Icon,
    extraFields = [],
    formFields = null
}) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const fullAdminState = useSelector(state => state.admin);
    const items = fullAdminState[storeKey] || [];
    const { loading } = fullAdminState;

    const config = ENTITY_CONFIG[storeKey];
    const localizedTitle = t(`adminPages.masterData.entities.${storeKey}.title`, { defaultValue: title });
    const localizedEntity = t(`adminPages.masterData.entities.${storeKey}.single`, { defaultValue: entityName });
    const fieldLabel = (field) => t(`adminPages.masterData.fields.${field.name}`, { defaultValue: field.label });
    const optionLabel = (field, option) => t(
        `adminPages.masterData.options.${field.name}.${typeof option === 'object' ? option.id : option}`,
        { defaultValue: typeof option === 'object' ? option.name : option },
    );

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null });

    const resolvedFields = Array.isArray(formFields) ? formFields : null;
    const localizedFieldConfig = getLocalizedFieldConfig(storeKey);
    const defaultCoreState = resolvedFields
        ? resolvedFields.reduce((acc, field) => {
            if (field.type === 'toggle') return { ...acc, [field.name]: field.default !== undefined ? field.default : false };
            if (field.type === 'multiselect' || field.type === 'ranges') return { ...acc, [field.name]: [] };
            return { ...acc, [field.name]: '' };
        }, {})
        : { name: '', code: '', description: '' };

    const defaultFormState = {
        ...defaultCoreState,
        ...buildLocalizedFormState(localizedFieldConfig),
        ...extraFields.reduce((acc, field) => {
            if (field.type === 'toggle') return { ...acc, [field.name]: field.default !== undefined ? field.default : false };
            if (field.type === 'multiselect' || field.type === 'ranges') return { ...acc, [field.name]: [] };
            return { ...acc, [field.name]: '' };
        }, {})
    };

    const [formData, setFormData] = useState(defaultFormState);
    const [editingId, setEditingId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [imageUploadingField, setImageUploadingField] = useState(null);

    // Excel template and import state
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState(null);
    const [importSuccess, setImportSuccess] = useState(null);

    const IMPORT_TYPE_MAP = {
        buildingTypes: 'buildings',
        roomTypes: 'rooms',
        smartFunctions: 'functions'
    };

    const handleDownloadTemplate = async () => {
        const importType = IMPORT_TYPE_MAP[storeKey];
        if (!importType) return;
        try {
            const response = await api.get(`/admin/import/templates/${importType}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${importType}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Failed to download template:', err);
            setApiError('Failed to download template file');
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const importType = IMPORT_TYPE_MAP[storeKey];
        if (!importType) return;

        setImporting(true);
        setImportError(null);
        setImportSuccess(null);

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await api.post(`/admin/import/${importType}`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setImportSuccess({
                created: response.data?.data?.createdCount || 0,
                updated: response.data?.data?.updatedCount || 0
            });

            if (config?.fetch) {
                dispatch(config.fetch());
            }
        } catch (err) {
            console.error('Failed to import Excel:', err);
            const ne = normalizeApiError(err);
            setImportError(ne.message || 'Failed to import Excel file. Please check formatting.');
        } finally {
            setImporting(false);
            e.target.value = null;
        }
    };

    useEffect(() => {
        if (config?.fetch) {
            dispatch(config.fetch());
        }
    }, [dispatch, config]);

    useEffect(() => {
        setImportSuccess(null);
        setImportError(null);
        setImporting(false);
    }, [storeKey]);

    useEffect(() => {
        extraFields.forEach((field) => {
            if (!field?.sourceKey) return;
            const dependencyConfig = ENTITY_CONFIG[field.sourceKey];
            if (dependencyConfig?.fetch) {
                dispatch(dependencyConfig.fetch());
            }
        });
    }, [dispatch, extraFields]);

    const handleOpenForm = (item = null) => {
        setFormErrors({});
        setApiError(null);
        if (item) {
            // Start with defaults to ensure all fields have values
            const normalized = { ...defaultFormState, ...item };

            // Override with localized translation fields extracted from translations object
            const localizedFields = buildLocalizedFormState(localizedFieldConfig, item.translations || {});
            Object.assign(normalized, localizedFields);

            // Handle relationship/multiselect fields - convert objects to IDs
            if (storeKey === 'smartFunctions' && (item.roomTypes || []).length) {
                normalized.roomTypes = (item.roomTypes || []).map((r) => (typeof r === 'object' && r?.id ? r.id : r));
            }
            if (storeKey === 'roomTypes' && (item.buildingTypes || []).length) {
                normalized.buildingTypes = (item.buildingTypes || []).map((b) => (typeof b === 'object' && b?.id ? b.id : b));
            }

            // Map all extraFields with proper handling for different types
            extraFields.forEach((field) => {
                if (field.type === 'multiselect' && item[field.name]) {
                    // If multiselect from item is array of objects, extract IDs
                    normalized[field.name] = (item[field.name] || []).map((obj) =>
                        typeof obj === 'object' && obj?.id ? obj.id : obj
                    );
                } else if (field.type === 'toggle' && Object.prototype.hasOwnProperty.call(item, field.name)) {
                    // Preserve boolean toggles
                    normalized[field.name] = item[field.name];
                } else if (field.type === 'select' && Object.prototype.hasOwnProperty.call(item, field.name)) {
                    // Preserve selects
                    normalized[field.name] = item[field.name] || field.default || '';
                } else if (Object.prototype.hasOwnProperty.call(item, field.name)) {
                    // For text, number, etc. - preserve the value
                    normalized[field.name] = item[field.name];
                }
            });

            setFormData(normalized);
            setEditingId(item.id);
        } else {
            setFormData(defaultFormState);
            setEditingId(null);
        }
        setIsFormOpen(true);
    };

    const withMirroredLocalizedValues = (payload) => {
        const next = { ...payload };
        localizedFieldConfig.forEach((field) => {
            const value = next[field.base] ?? '';
            LOCALIZED_LANGUAGES.forEach(({ key }) => {
                next[`${field.base}${key.charAt(0).toUpperCase()}${key.slice(1)}`] = value;
            });
        });
        return next;
    };

    const pickPayload = (data) => {
        if (!resolvedFields) return withMirroredLocalizedValues(data);
        const allowed = new Set(resolvedFields.map(f => f.name));
        localizedFieldConfig.forEach((field) => {
            LOCALIZED_LANGUAGES.forEach(({ key }) => {
                allowed.add(`${field.base}${key.charAt(0).toUpperCase()}${key.slice(1)}`);
            });
        });
        const payload = {};
        for (const k of Object.keys(data || {})) {
            if (allowed.has(k)) payload[k] = data[k];
        }
        return withMirroredLocalizedValues(payload);
    };

    const validate = (data) => {
        if (!resolvedFields) return {};
        const errs = {};
        for (const f of resolvedFields) {
            if (f.required) {
                const v = data?.[f.name];
                if (f.type === 'richtext' || f.type === 'text') {
                    if (v == null || String(v).trim() === '') errs[f.name] = `${f.label || f.name} is required`;
                } else if (v === null || v === undefined || v === '') {
                    errs[f.name] = `${f.label || f.name} is required`;
                }
            }
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!config) return;

        const errs = validate(formData);
        setFormErrors(errs);
        setApiError(null);
        if (Object.keys(errs).length) return;

        const payload = pickPayload(formData);
        try {
            if (editingId) {
                await dispatch(config.update({ id: editingId, ...payload })).unwrap();
            } else {
                await dispatch(config.add(payload)).unwrap();
            }
            setIsFormOpen(false);
        } catch (e2) {
            const ne = normalizeApiError(e2);
            setApiError(ne.message);
            if (ne.errors) setFormErrors((prev) => ({ ...prev, ...ne.errors }));
        }
    };

    const handleUploadFieldImage = async (field, file) => {
        if (!file || !field?.name) return;
        const uploadEndpoint = field.uploadEndpoint || '/admin/uploads/range-image';
        setImageUploadingField(field.name);
        setApiError(null);

        try {
            const formPayload = new FormData();
            formPayload.append('image', file);
            const response = await api.post(uploadEndpoint, formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const uploadedUrl = response?.data?.data?.imageUrl;
            if (!uploadedUrl) {
                throw new Error('Image upload failed. Please try again.');
            }

            setFormData((prev) => ({ ...prev, [field.name]: uploadedUrl }));
            setFormErrors((prev) => ({ ...prev, [field.name]: null }));
        } catch (e2) {
            const ne = normalizeApiError(e2);
            setApiError(ne.message || 'Image upload failed');
            if (ne.errors) setFormErrors((prev) => ({ ...prev, ...ne.errors }));
        } finally {
            setImageUploadingField(null);
        }
    };

    const confirmDelete = async () => {
        if (deleteModal.itemId && config?.delete) {
            try {
                await dispatch(config.delete(deleteModal.itemId)).unwrap();
                setDeleteModal({ isOpen: false, itemId: null });
            } catch (e2) {
                const ne = normalizeApiError(e2);
                setDeleteModal({ isOpen: false, itemId: null });
                setApiError(ne.message);
            }
        }
    };

    const filteredItems = items.filter((item) => {
        const haystack = [
            item?.name,
            item?.code,
            item?.text,
            item?.subject,
            item?.body,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
    });

    return (
        <AnimatedPageWrapper className="space-y-10 pb-20">
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest">{t('adminPages.masterData.badge')}</Badge>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">{localizedTitle}</h1>
                            <p className="text-sm leading-relaxed text-textSecondary mt-1.5">{t('adminPages.masterData.subtitle', { entity: localizedEntity })}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-lg">
                            {[
                                { icon: Icon || Layers, label: t('adminPages.masterData.registered', { count: items.length }), value: items.length, color: '#60b93f', bg: 'rgba(96,185,63,0.10)', border: 'rgba(96,185,63,0.22)' },
                                { icon: Zap, label: t('adminPages.masterData.syncing'), value: filteredItems.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)' },
                            ].map((item) => (
                                <div key={item.label} className="bg-white border shadow-sm rounded-sm p-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300" style={{ borderColor: item.border }}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-sm" style={{ backgroundColor: item.bg, color: item.color, border: `1px solid ${item.border}` }}>
                                            <item.icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary leading-none mb-1.5">{item.label}</p>
                                            <p className="font-heading text-2xl font-black leading-none" style={{ color: item.color }}>{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full xl:w-auto xl:self-start">
                        {IMPORT_TYPE_MAP[storeKey] && (
                            <>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleDownloadTemplate}
                                    className="!rounded-sm flex-1 sm:flex-none justify-center h-10 px-5 text-[11px] font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-500/40 bg-white hover:bg-primary-50/50"
                                >
                                    <Layers className="mr-2 h-4 w-4" />
                                    {t('adminPages.masterData.bulkImport.downloadTemplate', { defaultValue: 'Download Template' })}
                                </Button>

                                <label className="inline-block flex-1 sm:flex-none w-full sm:w-auto">
                                    <input
                                        type="file"
                                        accept=".xlsx"
                                        onChange={handleImportExcel}
                                        className="hidden"
                                        disabled={importing}
                                    />
                                    <span className={clsx(
                                        "flex w-full items-center justify-center rounded-sm border border-primary-500/30 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:border-primary-500/50 px-5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer select-none h-10 shadow-sm hover:shadow-md duration-300",
                                        importing && "opacity-50 pointer-events-none"
                                    )}>
                                        {importing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('adminPages.masterData.bulkImport.importing', { defaultValue: 'Importing...' })}
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4 text-primary-500" />
                                                {t('adminPages.masterData.bulkImport.uploadExcel', { defaultValue: 'Import Excel' })}
                                            </>
                                        )}
                                    </span>
                                </label>
                            </>
                        )}
                        <Button size="md" onClick={() => handleOpenForm()} className="!rounded-sm flex-1 sm:flex-none justify-center h-10 px-6 text-[11px] font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('adminPages.masterData.newEntity', { entity: localizedEntity })}
                        </Button>
                    </div>
                </div>
            </div>

            {importError && (
                <Card className="rounded-[1.9rem] p-4 border border-red-500/18 bg-red-500/10 text-xs font-medium text-red-300">
                    {importError}
                </Card>
            )}

            {importSuccess && (
                <Card className="rounded-[1.9rem] p-4 border border-green-500/18 bg-green-500/10 text-xs font-medium text-green-300 flex items-center justify-between">
                    <span>
                        {t('adminPages.masterData.bulkImport.success', {
                            defaultValue: `Successfully processed file: created ${importSuccess.created} new records and updated ${importSuccess.updated} existing records.`
                        })}
                    </span>
                    <button
                        onClick={() => setImportSuccess(null)}
                        className="text-[10px] uppercase font-bold text-green-400 hover:text-green-300 ml-4 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </Card>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 mb-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-96">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('adminPages.masterData.searchPlaceholder', { entity: localizedEntity.toLowerCase() })}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
                        />
                    </div>
                    <Badge variant="neutral" className="!rounded-sm !px-3 !py-1.5 shadow-sm">
                        {t('adminPages.masterData.registered', { count: filteredItems.length })}
                    </Badge>
                </div>
            </div>

            {/* Grid */}
            {loading && !items.length ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">{t('adminPages.masterData.syncing')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full opacity-50">
                        <Skeleton className="h-64 w-full rounded-[2rem]" repeat={3} />
                    </div>
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-500/30 hover:-translate-y-1 group relative overflow-hidden flex flex-col h-full rounded-sm p-6 transition-all duration-300">
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/10 text-primary-500 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                                    {Icon ? <Icon className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button onClick={() => handleOpenForm(item)} className="flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-500 transition-all hover:border-primary-500/30 hover:bg-primary-50 hover:text-primary-600 shadow-sm">
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteModal({ isOpen: true, itemId: item.id })} className="flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-500 transition-all hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 shadow-sm">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10 flex-grow space-y-4">
                                <div>
                                    <h4 className="text-lg font-medium text-textPrimary leading-tight mb-1">{item.name ?? (item.text != null ? String(item.text).slice(0, 60) + (String(item.text).length > 60 ? '...' : '') : '-')}</h4>
                                    <div className="text-[10px] font-mono text-textSecondary font-semibold uppercase tracking-widest">{item.code ?? (storeKey === 'conditions' || storeKey === 'disclaimers' ? '' : 'SYS-' + item.id.toString().slice(-4).toUpperCase())}</div>
                                </div>

                                {item.description && (
                                    <p className="text-xs text-textSecondary leading-relaxed font-medium line-clamp-3">
                                        {item.description}
                                    </p>
                                )}

                                {storeKey === 'smartFunctions' && (
                                    <div className="pt-4 border-t border-white/8 space-y-1">
                                        <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">Attached Room Types: {getRelationshipLabels(item, 'roomTypes').length}</p>
                                        {getRelationshipLabels(item, 'roomTypes').length > 0 ? (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {getRelationshipLabels(item, 'roomTypes').map((roomTypeName) => (
                                                    <Badge key={`${item.id}-${roomTypeName}`} variant="neutral" className="text-[9px] uppercase font-bold px-2.5 py-1">
                                                        {roomTypeName}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs font-medium text-textSecondary italic">{t('common.none', { defaultValue: 'None' })}</p>
                                        )}
                                    </div>
                                )}
                                {extraFields.length > 0 && (
                                    <div className="pt-4 border-t border-white/8 flex flex-wrap gap-2">
                                        {extraFields.map(field => {
                                            if (field.type === 'toggle') {
                                                return item[field.name] ? (
                                                    <Badge key={field.name} variant="success" className="text-[9px] uppercase font-bold px-2.5 py-1">
                                                        {t('adminPages.masterData.fieldEnabled', { field: fieldLabel(field), defaultValue: '{{field}} Enabled' })}
                                                    </Badge>
                                                ) : null;
                                            }
                                            if (field.type === 'multiselect') {
                                                const vals = item[field.name] || [];
                                                if (storeKey === 'smartFunctions' && field.name === 'roomTypes') return null;
                                                return vals.length > 0 ? (
                                                    <Badge key={field.name} variant="neutral" className="text-[9px] uppercase font-bold px-2.5 py-1">
                                                        {fieldLabel(field)}: {vals.length}
                                                    </Badge>
                                                ) : null;
                                            }
                                            if (field.type === 'image') {
                                                return item[field.name] ? (
                                                    <Badge key={field.name} variant="neutral" className="text-[9px] uppercase font-bold px-2.5 py-1">
                                                        {t('adminPages.masterData.fieldAdded', { field: fieldLabel(field), defaultValue: '{{field}}: Added' })}
                                                    </Badge>
                                                ) : null;
                                            }
                                            return (
                                                <Badge key={field.name} variant="neutral" className="text-[9px] uppercase font-bold px-2.5 py-1">
                                                    {fieldLabel(field)}: {item[field.name]}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={t('adminPages.masterData.noRecordsTitle')}
                    description={t('adminPages.masterData.noRecordsDesc', { entity: localizedEntity.toLowerCase() })}
                    icon={Box}
                    action={<Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>{t('adminPages.masterData.clearFilters')}</Button>}
                />
            )}

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingId ? t('adminPages.masterData.modal.updateTitle', { entity: localizedEntity }) : t('adminPages.masterData.modal.defineTitle', { entity: localizedEntity })}
                maxWidth="max-w-3xl"
                footer={
                    <div className="flex justify-between items-center w-full">
                        <p className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary italic leading-none">{t('adminPages.masterData.modal.syncActive')}</p>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>{t('adminPages.masterData.modal.cancel')}</Button>
                            <Button size="md" className="px-10" onClick={handleSubmit}>
                                <Save className="w-5 h-5 mr-3" /> {t('adminPages.masterData.modal.save')}
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-6 py-4">
                    {apiError ? (
                        <div className="rounded-xl border border-red-500/18 bg-red-500/10 p-3 text-sm font-medium text-red-300">
                            {apiError}
                        </div>
                    ) : null}
                    {!resolvedFields ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label={t('adminPages.masterData.modal.displayName')}
                                icon={Info}
                                placeholder={t('adminPages.masterData.entityExample', { entity: localizedEntity, defaultValue: 'e.g. Premium {{entity}}' })}
                                value={formData.name}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, name: v });
                                    if (formErrors.name) setFormErrors((p) => ({ ...p, name: null }));
                                }}
                                error={formErrors.name}
                            />
                            <Input
                                label={t('adminPages.masterData.modal.uniqueCode')}
                                icon={Zap}
                                placeholder="e.g. TYPE-01"
                                value={formData.code}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, code: v });
                                    if (formErrors.code) setFormErrors((p) => ({ ...p, code: null }));
                                }}
                                error={formErrors.code}
                                className="uppercase font-mono"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {resolvedFields.map((field) => {
                                if (field.type === 'toggle') {
                                    return (
                                        <div key={field.name} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 p-4">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-semibold text-textPrimary">{fieldLabel(field)}</span>
                                                {formErrors[field.name] ? <p className="text-[11px] font-bold text-red-600">{formErrors[field.name]}</p> : null}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, [field.name]: !formData[field.name] })}
                                                className={clsx("relative h-5 w-10 rounded-full transition-colors", formData[field.name] ? "bg-primary-500" : "bg-white/10")}
                                            >
                                                <div className={clsx("w-3 h-3 rounded-full bg-white absolute top-1 transition-transform", formData[field.name] ? "translate-x-6" : "translate-x-1")} />
                                            </button>
                                        </div>
                                    );
                                }
                                if (field.type === 'richtext') {
                                    return (
                                        <div key={field.name} className="md:col-span-2 space-y-2">
                                            <label className="ml-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                                {fieldLabel(field)}{field.required ? ' *' : ''}
                                            </label>
                                            <textarea
                                                rows={8}
                                                value={formData[field.name] ?? ''}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setFormData({ ...formData, [field.name]: v });
                                                    if (formErrors[field.name]) setFormErrors((p) => ({ ...p, [field.name]: null }));
                                                }}
                                                placeholder={field.placeholder}
                                                className={clsx(
                                                    "w-full rounded-2xl border bg-[#1f1f1f] px-5 py-4 text-sm font-medium leading-relaxed text-textPrimary transition-all placeholder:text-textSecondary focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                                                    formErrors[field.name] ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-primary-500/45"
                                                )}
                                            />
                                            {formErrors[field.name] ? <p className="text-[11px] font-bold text-red-600 px-2">{formErrors[field.name]}</p> : null}
                                        </div>
                                    );
                                }
                                let IconField = Info;
                                if (field.type === 'number') IconField = Info;
                                return (
                                    <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                                        <Input
                                            label={`${fieldLabel(field)}${field.required ? ' *' : ''}`}
                                            icon={IconField}
                                            type={field.type || 'text'}
                                            value={formData[field.name] ?? ''}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setFormData({ ...formData, [field.name]: v });
                                                if (formErrors[field.name]) setFormErrors((p) => ({ ...p, [field.name]: null }));
                                            }}
                                            error={formErrors[field.name]}
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {extraFields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/8">
                            {extraFields.map(field => {
                                if (field.type === 'toggle') {
                                    return (
                                        <div key={field.name} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 p-4">
                                            <span className="text-xs font-semibold text-textPrimary">{fieldLabel(field)}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, [field.name]: !formData[field.name] })}
                                                className={clsx("relative h-5 w-10 rounded-full transition-colors", formData[field.name] ? "bg-primary-500" : "bg-white/10")}
                                            >
                                                <div className={clsx("w-3 h-3 rounded-full bg-white absolute top-1 transition-transform", formData[field.name] ? "translate-x-6" : "translate-x-1")} />
                                            </button>
                                        </div>
                                    )
                                }
                                if (field.type === 'select') {
                                    const options = field.sourceKey ? fullAdminState[field.sourceKey] : field.options;
                                    return (
                                        <div key={field.name} className="space-y-2">
                                            <label className="ml-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{fieldLabel(field)}</label>
                                            <SelectMenu
                                                value={formData[field.name] || ''}
                                                onChange={(v) => {
                                                    setFormData({ ...formData, [field.name]: v });
                                                    if (formErrors[field.name]) setFormErrors((p) => ({ ...p, [field.name]: null }));
                                                }}
                                                options={(options || []).map((opt) => ({
                                                    value: typeof opt === 'object' ? opt.id : opt,
                                                    label: optionLabel(field, opt),
                                                }))}
                                                placeholder={t('adminPages.masterData.selectField', { field: fieldLabel(field), defaultValue: 'Select {{field}}...' })}
                                                ariaLabel={fieldLabel(field)}
                                                size="field"
                                                fullWidth
                                                error={Boolean(formErrors[field.name])}
                                            />
                                            {formErrors[field.name] ? <p className="ml-2 text-[11px] font-bold text-red-300">{formErrors[field.name]}</p> : null}
                                        </div>
                                    )
                                }
                                if (field.type === 'multiselect') {
                                    return (
                                        <div key={field.name} className="md:col-span-2 space-y-2">
                                            <label className="ml-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{fieldLabel(field)}</label>
                                            <div className="flex flex-wrap gap-2 rounded-xl border border-white/8 bg-white/5 p-4">
                                                {((field.sourceKey ? fullAdminState[field.sourceKey] : field.options) || []).map(opt => {
                                                    const isSel = (formData[field.name] || []).includes(opt.id);
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const curr = formData[field.name] || [];
                                                                setFormData({ ...formData, [field.name]: isSel ? curr.filter(x => x !== opt.id) : [...curr, opt.id] });
                                                            }}
                                                            className={clsx("rounded-lg border px-3 py-1.5 text-[9px] font-semibold uppercase transition-all", isSel ? "border-primary-500 bg-primary-500 text-primary-950" : "border-white/10 bg-[#1c1c1c] text-textSecondary")}
                                                        >
                                                            {opt.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                }
                                if (field.type === 'richtext') {
                                    return (
                                        <div key={field.name} className="md:col-span-2 space-y-2">
                                            <label className="ml-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{fieldLabel(field)}</label>
                                            <textarea
                                                rows={6}
                                                value={formData[field.name] ?? ''}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setFormData({ ...formData, [field.name]: v });
                                                    if (formErrors[field.name]) setFormErrors((p) => ({ ...p, [field.name]: null }));
                                                }}
                                                placeholder={field.placeholder}
                                                className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] px-5 py-4 text-sm font-medium leading-relaxed text-textPrimary transition-all placeholder:text-textSecondary focus:border-primary-500/45 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                                            />
                                            {formErrors[field.name] ? <p className="text-[11px] font-bold text-red-600 px-2 pt-1">{formErrors[field.name]}</p> : null}
                                        </div>
                                    );
                                }
                                if (field.type === 'image') {
                                    const imageValue = String(formData[field.name] || '').trim();
                                    return (
                                        <div key={field.name} className="md:col-span-2 space-y-3">
                                            <label className="ml-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{fieldLabel(field)}</label>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <label className={clsx(
                                                    'inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
                                                    imageUploadingField === field.name
                                                        ? 'border-primary-500/25 bg-primary-500/10 text-primary-300'
                                                        : 'border-white/10 bg-white/5 text-textSecondary hover:border-primary-500/25 hover:text-primary-300',
                                                )}>
                                                    {imageUploadingField === field.name ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                    {imageUploadingField === field.name ? 'Uploading...' : 'Upload Picture'}
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const selectedFile = e.target.files?.[0];
                                                            handleUploadFieldImage(field, selectedFile);
                                                            e.target.value = '';
                                                        }}
                                                        disabled={imageUploadingField === field.name}
                                                    />
                                                </label>

                                                {imageValue ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData((prev) => ({ ...prev, [field.name]: '' }))}
                                                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-textSecondary transition-colors hover:border-red-500/25 hover:text-red-300"
                                                    >
                                                        Remove Image
                                                    </button>
                                                ) : null}
                                            </div>

                                            {imageValue ? (
                                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2">
                                                    <img
                                                        src={imageValue}
                                                        alt={t('adminPages.masterData.fieldPreview', { field: fieldLabel(field), defaultValue: '{{field}} preview' })}
                                                        className="h-44 w-full rounded-xl object-cover"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                }
                                let IconField = Info;
                                if (field.type === 'number') {
                                    if (field.name.includes('price') || field.name.includes('amount')) IconField = Euro;
                                    if (field.name.includes('percent') || field.name.includes('discount')) IconField = Percent;
                                }
                                return (
                                    <Input
                                        key={field.name}
                                        label={fieldLabel(field)}
                                        icon={IconField}
                                        type={field.type === 'image' ? 'text' : (field.type || 'text')}
                                        value={formData[field.name]}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setFormData({ ...formData, [field.name]: v });
                                            if (formErrors[field.name]) setFormErrors((p) => ({ ...p, [field.name]: null }));
                                        }}
                                        error={formErrors[field.name]}
                                        placeholder={field.placeholder}
                                    />
                                )
                            })}
                        </div>
                    )}

                    {!resolvedFields ? (
                        <div className="space-y-2 pt-6 border-t border-white/8">
                            <label className="ml-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('adminPages.masterData.modal.technicalDescription')}</label>
                            <textarea
                                rows="4"
                                value={formData.description ?? ''}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, description: v });
                                    if (formErrors.description) setFormErrors((p) => ({ ...p, description: null }));
                                }}
                                placeholder={t('adminPages.masterData.modal.technicalPlaceholder')}
                                className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] px-5 py-4 text-sm font-medium leading-relaxed text-textPrimary transition-all placeholder:text-textSecondary focus:border-primary-500/45 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                            />
                        </div>
                    ) : null}
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
                title={t('adminPages.masterData.modal.deleteTitle')}
                maxWidth="max-w-md"
                footer={
                    <div className="grid w-full grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full justify-center !rounded-xl !min-h-11 border-gray-200 bg-white font-bold text-textPrimary shadow-sm hover:bg-gray-50 active:scale-[0.98]"
                            onClick={() => setDeleteModal({ isOpen: false, itemId: null })}
                        >
                            {t('adminPages.masterData.modal.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            className="w-full justify-center !rounded-xl !min-h-11 bg-red-600 font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 active:scale-[0.98]"
                            onClick={confirmDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            {t('adminPages.masterData.modal.terminate')}
                        </Button>
                    </div>
                }
            >
                <div className="mx-auto flex max-w-sm flex-col items-center gap-5 px-2 py-4 text-center sm:px-4 sm:py-6">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/15 to-red-500/5 text-red-500 shadow-sm ring-8 ring-red-500/5">
                        <AlertTriangle className="h-8 w-8 stroke-[2.2]" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-heading font-black tracking-tight text-textPrimary">
                            {t('adminPages.masterData.modal.areYouSure')}
                        </h4>
                        <p className="text-sm font-medium leading-relaxed text-textSecondary">
                            {t('adminPages.masterData.modal.deleteDesc')}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>{t('adminPages.masterData.modal.irreversible')}</span>
                    </div>
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}











