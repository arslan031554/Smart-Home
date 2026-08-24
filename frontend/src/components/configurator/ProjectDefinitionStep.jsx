import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProjectInfo } from '../../features/configurator/configuratorSlice';
import { Building, Home, Briefcase, Store, Hotel, FileText, MapPin, Hash, Layers, Target, Info, PencilLine, ShieldCheck, UserPlus, LogIn, Check, Warehouse, Factory, Building2, Landmark } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, SectionTitle, Input, Badge, Button } from '../common/UIComponents';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LocalInput = React.memo(({ name, value, onChange, ...props }) => {
    const [localVal, setLocalVal] = React.useState(value ?? '');
    React.useEffect(() => setLocalVal(value ?? ''), [value]);
    const handleBlur = () => {
        if (localVal !== value) onChange({ target: { name, value: localVal } });
    };
    return (
        <Input
            name={name}
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            {...props}
        />
    );
});
LocalInput.displayName = 'LocalInput';

const getBuildingIcon = (type) => {
    const slug = String(type?.code || type?.slug || type?.name || '').trim().toLowerCase();
    if (slug.includes('apart') || slug.includes('flat')) return Home;
    if (slug.includes('house') || slug.includes('villa') || slug.includes('single') || slug.includes('resid')) return Home;
    if (slug.includes('office') || slug.includes('work') || slug.includes('corp')) return Briefcase;
    if (slug.includes('commercial') || slug.includes('store') || slug.includes('shop') || slug.includes('retail') || slug.includes('mall')) return Store;
    if (slug.includes('hotel') || slug.includes('motel') || slug.includes('resort') || slug.includes('horeca')) return Hotel;
    if (slug.includes('ware') || slug.includes('depot') || slug.includes('logist')) return Warehouse;
    if (slug.includes('fact') || slug.includes('plant') || slug.includes('industr')) return Factory;
    if (slug.includes('hosp') || slug.includes('clinic') || slug.includes('care')) return Building2;
    if (slug.includes('public') || slug.includes('gov') || slug.includes('school')) return Landmark;
    return Building;
};

export default function ProjectDefinitionStep({ validationErrors = {} }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { projectInfo } = useSelector((state) => state.configurator);
    const buildingTypesFromStore = useSelector((state) => state.admin.buildingTypes);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const BUILDING_TYPES = React.useMemo(
        () => (Array.isArray(buildingTypesFromStore) ? buildingTypesFromStore : []),
        [buildingTypesFromStore]
    );

    const selectedBuildingType = React.useMemo(
        () => BUILDING_TYPES.find((type) => type.id === projectInfo.buildingType) || null,
        [BUILDING_TYPES, projectInfo.buildingType],
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'nameEn') {
            dispatch(updateProjectInfo({ name: value, nameEn: value }));
            return;
        }
        dispatch(updateProjectInfo({ [name]: value }));
    };

    const handleTypeSelect = (typeId) => {
        dispatch(updateProjectInfo({ buildingType: typeId }));
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-5 animate-fade-in sm:space-y-6">
            <SectionTitle
                title={t('configurator.projectDefinition.title')}
                subtitle={t('configurator.projectDefinition.subtitle')}
                badge={t('configurator.projectDefinition.badge')}
                className="mb-4 sm:mb-6"
            />

            {/* Account Status / Guest Mode Banner */}
            <Card className="rounded-2xl border border-primary-200/80 bg-white p-4 shadow-soft sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-200 bg-primary-50 text-primary-700 shadow-xs">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-textPrimary sm:text-base">
                                    {t('configurator.projectDefinition.accountAccess.title', { defaultValue: 'Account & Offer Access' })}
                                </h4>
                                <Badge variant={isAuthenticated ? 'success' : 'info'} className="text-[10px] font-bold px-2 py-0.5">
                                    {isAuthenticated
                                        ? t('configurator.projectDefinition.accountAccess.connected', { defaultValue: 'Connected' })
                                        : t('configurator.projectDefinition.accountAccess.guestMode', { defaultValue: 'Guest Mode' })}
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-xs leading-relaxed text-textSecondary">
                                {isAuthenticated
                                    ? t('configurator.projectDefinition.accountAccess.connectedBody', {
                                        defaultValue: 'Your verified customer account stores the final offer, PDFs, reminders, and future edits under {{email}}.',
                                        email: user?.email || t('auth.account', { defaultValue: 'your account' }),
                                    })
                                    : t('configurator.projectDefinition.accountAccess.guestBody', {
                                        defaultValue: 'Start without an account. Your configuration is automatically drafted and attached when signing in.',
                                    })}
                            </p>
                        </div>
                    </div>

                    {!isAuthenticated ? (
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                            <Button
                                size="sm"
                                className="gap-1.5 rounded-xl text-xs font-bold"
                                onClick={() => navigate('/auth/register', { state: { returnTo: '/configurator', returnStep: 1 } })}
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                {t('auth.createAccount', { defaultValue: 'Sign Up' })}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1.5 rounded-xl text-xs font-semibold"
                                onClick={() => navigate('/auth/login', { state: { returnTo: '/configurator', returnStep: 1 } })}
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                {t('nav.login', { defaultValue: 'Log In' })}
                            </Button>
                        </div>
                    ) : null}
                </div>
            </Card>

            {/* Profile and Project Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Client Profile Card */}
                <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                            <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-textPrimary">{t('configurator.projectDefinition.clientProfile.title')}</h4>
                            <p className="text-xs text-textSecondary">{t('configurator.projectDefinition.clientProfile.subtitle')}</p>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => dispatch(updateProjectInfo({ clientType: 'private', companyName: '' }))}
                            className={clsx(
                                'rounded-xl border py-2.5 px-3 text-center text-xs font-bold transition-all duration-200',
                                projectInfo.clientType === 'private'
                                    ? 'border-primary-500 bg-primary-50/80 text-primary-800 shadow-xs'
                                    : 'border-slate-200 bg-slate-50/60 text-textSecondary hover:border-slate-300 hover:bg-white hover:text-textPrimary',
                            )}
                        >
                            {t('configurator.projectDefinition.clientProfile.private')}
                        </button>
                        <button
                            type="button"
                            onClick={() => dispatch(updateProjectInfo({ clientType: 'company' }))}
                            className={clsx(
                                'rounded-xl border py-2.5 px-3 text-center text-xs font-bold transition-all duration-200',
                                projectInfo.clientType === 'company'
                                    ? 'border-primary-500 bg-primary-50/80 text-primary-800 shadow-xs'
                                    : 'border-slate-200 bg-slate-50/60 text-textSecondary hover:border-slate-300 hover:bg-white hover:text-textPrimary',
                            )}
                        >
                            {t('configurator.projectDefinition.clientProfile.company')}
                        </button>
                    </div>

                    {projectInfo.clientType === 'company' ? (
                        <div className="animate-fade-in pt-1">
                            <LocalInput
                                name="companyName"
                                value={projectInfo.companyName}
                                onChange={handleChange}
                                label={t('configurator.projectDefinition.clientProfile.companyNameLabel')}
                                placeholder={t('configurator.projectDefinition.clientProfile.companyNamePlaceholder')}
                            />
                        </div>
                    ) : null}
                </Card>

                {/* Project Reference Name Card */}
                <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                            <FileText className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-textPrimary">{t('configurator.projectDefinition.reference.title')}</h4>
                            <p className="text-xs text-textSecondary">{t('configurator.projectDefinition.reference.subtitle')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <LocalInput
                            name="nameEn"
                            value={projectInfo.nameEn ?? projectInfo.name}
                            onChange={handleChange}
                            label={t('configurator.projectDefinition.reference.nameLanguageLabel', {
                                language: t('language.en'),
                                defaultValue: 'Project Name ({{language}})',
                            })}
                            placeholder={t('configurator.projectDefinition.reference.namePlaceholder')}
                            error={validationErrors.name}
                            required
                        />
                        <LocalInput
                            name="nameRo"
                            value={projectInfo.nameRo || ''}
                            onChange={handleChange}
                            label={t('configurator.projectDefinition.reference.nameLanguageLabel', {
                                language: t('language.ro'),
                                defaultValue: 'Project Name ({{language}})',
                            })}
                            placeholder={t('configurator.projectDefinition.reference.nameRomanianPlaceholder', {
                                defaultValue: 'e.g. Ansamblu rezidențial inteligent - Corp A',
                            })}
                        />
                    </div>
                </Card>
            </div>

            {/* Optional Notes */}
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-5">
                <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                        <PencilLine className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-textPrimary">
                            {t('configurator.projectDefinition.description.title')}
                            <span className="ml-1.5 text-xs font-normal text-textSecondary">({t('configurator.projectDefinition.description.optional')})</span>
                        </h4>
                        <p className="text-xs text-textSecondary">{t('configurator.projectDefinition.description.subtitle')}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                            {t('configurator.projectDefinition.description.languageLabel', {
                                language: t('language.en'),
                                defaultValue: 'Description ({{language}})',
                            })}
                        </span>
                        <textarea
                            name="descriptionEn"
                            value={projectInfo.descriptionEn ?? projectInfo.description ?? ''}
                            onChange={(e) => dispatch(updateProjectInfo({ description: e.target.value, descriptionEn: e.target.value }))}
                            placeholder={t('configurator.projectDefinition.description.placeholder')}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-textPrimary placeholder:text-slate-400 transition-all focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/10 shadow-xs"
                        />
                    </label>
                    <label className="space-y-1.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                            {t('configurator.projectDefinition.description.languageLabel', {
                                language: t('language.ro'),
                                defaultValue: 'Description ({{language}})',
                            })}
                        </span>
                        <textarea
                            name="descriptionRo"
                            value={projectInfo.descriptionRo || ''}
                            onChange={(e) => dispatch(updateProjectInfo({ descriptionRo: e.target.value }))}
                            placeholder={t('configurator.projectDefinition.description.romanianPlaceholder', {
                                defaultValue: 'Descrierea proiectului în limba română...',
                            })}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-textPrimary placeholder:text-slate-400 transition-all focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/10 shadow-xs"
                        />
                    </label>
                </div>
            </Card>

            {/* Building Type Selection Grid */}
            <div className="space-y-4 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                            <Target className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-textPrimary">{t('configurator.projectDefinition.buildingType.title')}</h4>
                            <p className="text-xs text-textSecondary">{t('configurator.projectDefinition.buildingType.subtitle')}</p>
                        </div>
                    </div>

                    {BUILDING_TYPES.length > 8 ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[10px] font-bold text-primary-800 shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-600 animate-pulse" />
                            <span>{BUILDING_TYPES.length} {t('configurator.projectDefinition.buildingType.available', { defaultValue: 'Destinations' })} • {t('configurator.projectDefinition.buildingType.scrollForMore', { defaultValue: 'Scroll for more' })}</span>
                        </div>
                    ) : null}
                </div>

                {/* 2-Row Scrollable Container */}
                <div className="max-h-[238px] sm:max-h-[246px] overflow-y-auto custom-scrollbar p-1.5 -m-1.5 rounded-2xl">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3.5">
                        {BUILDING_TYPES.map((type) => {
                            const Icon = getBuildingIcon(type);
                            const isSelected = projectInfo.buildingType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleTypeSelect(type.id)}
                                    className={clsx(
                                        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 shadow-soft outline-none min-h-[106px] sm:min-h-[114px]',
                                        isSelected
                                            ? 'border-primary-500 bg-gradient-to-br from-primary-50/90 via-white to-primary-50/40 shadow-card-hover ring-2 ring-primary-500/20'
                                            : 'border-slate-200/90 bg-white hover:border-primary-300 hover:shadow-card-hover hover:-translate-y-0.5',
                                        (validationErrors.buildingType || validationErrors.buildingTypeId) && !projectInfo.buildingType && 'border-amber-500/40 bg-amber-50/20',
                                    )}
                                >
                                    {/* Top Active Bar */}
                                    <div className={clsx(
                                        'absolute top-0 left-0 right-0 h-1 transition-all duration-200',
                                        isSelected ? 'bg-primary-500' : 'bg-transparent group-hover:bg-primary-200'
                                    )} />

                                    <div className="flex items-start justify-between gap-2">
                                        <div className={clsx(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 shadow-xs',
                                            isSelected
                                                ? 'border-primary-400 bg-primary-600 text-white shadow-md shadow-primary-600/30'
                                                : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-700',
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {isSelected ? (
                                            <span className="flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                                                <Check className="h-3 w-3" />
                                                <span className="hidden sm:inline">Active</span>
                                            </span>
                                        ) : (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] text-slate-300 group-hover:border-primary-300 group-hover:text-primary-600 transition-colors">
                                                •
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2.5 space-y-0.5">
                                        <h5 className={clsx(
                                            'text-xs sm:text-sm font-bold tracking-tight line-clamp-1 transition-colors',
                                            isSelected ? 'text-primary-950 font-black' : 'text-textPrimary group-hover:text-primary-900'
                                        )}>
                                            {type.name}
                                        </h5>
                                        <span className="block text-[10px] font-semibold text-textSecondary uppercase tracking-wider truncate">
                                            {type.code || t('configurator.projectDefinition.buildingType.destination', { defaultValue: 'Destination' })}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {(validationErrors.buildingType || validationErrors.buildingTypeId) && !projectInfo.buildingType ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-800">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 shrink-0 text-amber-600" />
                            <p>{validationErrors.buildingType || validationErrors.buildingTypeId}</p>
                        </div>
                    </div>
                ) : null}

                {/* Building Description Card with Clear Spacing */}
                {selectedBuildingType?.description ? (
                    <div className="pt-1.5">
                        <Card className="rounded-2xl border border-primary-200/80 bg-primary-50/40 p-4 shadow-soft">
                            <div className="flex items-start gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100/80 text-primary-800 border border-primary-200">
                                    <Info className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <Badge variant="info" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                                        {t('configurator.projectDefinition.buildingType.descriptionLabel', { defaultValue: 'Building Description' })}
                                    </Badge>
                                    <p className="text-xs sm:text-sm leading-relaxed text-textSecondary">{selectedBuildingType.description}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : null}
            </div>

            {/* Project Parameters (Levels, Area, Multiplier) with generous breathing room */}
            <div className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
                    {[
                        {
                            icon: Layers,
                            title: t('configurator.projectDefinition.levels.title'),
                            subtitle: t('configurator.projectDefinition.levels.subtitle'),
                            field: (
                                <LocalInput type="number" min="1" max="20" name="levelsCount" value={projectInfo.levelsCount} onChange={handleChange} label={t('configurator.projectDefinition.levels.inputLabel')} error={validationErrors.levelsCount} />
                            ),
                        },
                        {
                            icon: MapPin,
                            title: t('configurator.projectDefinition.area.title'),
                            subtitle: t('configurator.projectDefinition.area.subtitle'),
                            field: (
                                <LocalInput type="number" min="1" name="area" value={projectInfo.area} onChange={handleChange} label={t('configurator.projectDefinition.area.inputLabel')} placeholder={t('configurator.projectDefinition.area.placeholder')} error={validationErrors.area} />
                            ),
                        },
                        {
                            icon: Hash,
                            title: t('configurator.projectDefinition.multiplication.title'),
                            subtitle: t('configurator.projectDefinition.multiplication.subtitle'),
                            field: (
                                <>
                                    <LocalInput type="number" min="1" max="500" name="projectMultiplicationIndex" value={projectInfo.projectMultiplicationIndex} onChange={handleChange} label={t('configurator.projectDefinition.multiplication.inputLabel')} error={validationErrors.projectMultiplicationIndex} />
                                    <p className="mt-2 text-[10px] leading-relaxed text-textSecondary">{t('configurator.projectDefinition.multiplication.helper')}</p>
                                </>
                            ),
                        },
                    ].map((item) => (
                        <Card key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:p-5">
                            <div className="mb-3.5 flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="block text-xs sm:text-sm font-bold text-textPrimary">{item.title}</span>
                                    <span className="text-[11px] text-textSecondary">{item.subtitle}</span>
                                </div>
                            </div>
                            {item.field}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
