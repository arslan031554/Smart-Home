import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProjectInfo } from '../../features/configurator/configuratorSlice';
import { Building, Home, Briefcase, Store, Hotel, FileText, MapPin, Hash, Layers, Target, Info, PencilLine, Gauge, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
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

const BUILDING_ICONS = {
    apartment: Home,
    villa: Building,
    office: Briefcase,
    commercial: Store,
    hotel: Hotel,
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
        dispatch(updateProjectInfo({ [name]: value }));
    };

    const handleTypeSelect = (typeId) => {
        dispatch(updateProjectInfo({ buildingType: typeId }));
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 animate-fade-in sm:space-y-8">
            <SectionTitle
                title={t('configurator.projectDefinition.title')}
                subtitle={t('configurator.projectDefinition.subtitle')}
                badge={t('configurator.projectDefinition.badge')}
            />

            <Card className="rounded-[1.25rem] border border-primary-100/70 bg-[#f7f8f2] p-5 sm:rounded-md sm:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-primary-200 bg-white text-primary-700 shadow-soft">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                <h4 className="text-lg font-semibold text-textPrimary">
                                    {t('configurator.projectDefinition.accountAccess.title', { defaultValue: 'Account & Offer Access' })}
                                </h4>
                                <Badge variant={isAuthenticated ? 'success' : 'info'}>
                                    {isAuthenticated
                                        ? t('configurator.projectDefinition.accountAccess.connected', { defaultValue: 'Account Connected' })
                                        : t('configurator.projectDefinition.accountAccess.guestMode', { defaultValue: 'Guest Start Enabled' })}
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-sm leading-relaxed text-textSecondary">
                                {isAuthenticated
                                    ? t('configurator.projectDefinition.accountAccess.connectedBody', {
                                        defaultValue: 'Your verified customer account stores the final offer, PDFs, reminders, and future edits under {{email}}.',
                                        email: user?.email || t('auth.account', { defaultValue: 'your account' }),
                                    })
                                    : t('configurator.projectDefinition.accountAccess.guestBody', {
                                        defaultValue: 'The project can start without an account. Before the final offer is generated, the customer must create or log into an account, complete the email or SMS verification step, and the saved guest configuration will be attached automatically.',
                                    })}
                            </p>
                        </div>
                    </div>

                    {!isAuthenticated ? (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                size="lg"
                                className="gap-2"
                                onClick={() => navigate('/auth/register', { state: { returnTo: '/configurator', returnStep: 1 } })}
                            >
                                <UserPlus className="h-5 w-5" />
                                {t('auth.createAccount', { defaultValue: 'Create Account' })}
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="gap-2"
                                onClick={() => navigate('/auth/login', { state: { returnTo: '/configurator', returnStep: 1 } })}
                            >
                                <LogIn className="h-5 w-5" />
                                {t('nav.login', { defaultValue: 'Log In' })}
                            </Button>
                        </div>
                    ) : null}
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="rounded-md p-5 sm:rounded-md sm:p-6">
                    <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-textPrimary">{t('configurator.projectDefinition.clientProfile.title')}</h4>
                            <p className="text-sm text-textSecondary">{t('configurator.projectDefinition.clientProfile.subtitle')}</p>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => dispatch(updateProjectInfo({ clientType: 'private', companyName: '' }))}
                            className={clsx(
                                'rounded-md border px-4 py-4 text-center text-sm font-semibold transition-all duration-300',
                                projectInfo.clientType === 'private'
                                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                                    : 'border-[#D1D5DB] bg-[#EDEFE8] text-textSecondary hover:border-primary-300 hover:bg-white hover:text-textPrimary',
                            )}
                        >
                            {t('configurator.projectDefinition.clientProfile.private')}
                        </button>
                        <button
                            onClick={() => dispatch(updateProjectInfo({ clientType: 'company' }))}
                            className={clsx(
                                'rounded-md border px-4 py-4 text-center text-sm font-semibold transition-all duration-300',
                                projectInfo.clientType === 'company'
                                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                                    : 'border-[#D1D5DB] bg-[#EDEFE8] text-textSecondary hover:border-primary-300 hover:bg-white hover:text-textPrimary',
                            )}
                        >
                            {t('configurator.projectDefinition.clientProfile.company')}
                        </button>
                    </div>

                    {projectInfo.clientType === 'company' ? (
                        <div className="animate-fade-in">
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

                <Card className="rounded-[1.25rem] p-5 sm:rounded-md sm:p-6">
                    <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-textPrimary">{t('configurator.projectDefinition.reference.title')}</h4>
                            <p className="text-sm text-textSecondary">{t('configurator.projectDefinition.reference.subtitle')}</p>
                        </div>
                    </div>
                    <LocalInput
                        name="name"
                        value={projectInfo.name}
                        onChange={handleChange}
                        label={t('configurator.projectDefinition.reference.nameLabel')}
                        placeholder={t('configurator.projectDefinition.reference.namePlaceholder')}
                        className="text-base"
                        error={validationErrors.name}
                    />
                </Card>
            </div>

            <Card className="rounded-[1.25rem] p-5 sm:rounded-md sm:p-6">
                <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700">
                        <PencilLine className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-textPrimary">
                            {t('configurator.projectDefinition.description.title')}
                            <span className="ml-2 text-sm text-textSecondary">({t('configurator.projectDefinition.description.optional')})</span>
                        </h4>
                        <p className="text-sm text-textSecondary">{t('configurator.projectDefinition.description.subtitle')}</p>
                    </div>
                </div>
                <textarea
                    name="description"
                    value={projectInfo.description || ''}
                    onChange={(e) => dispatch(updateProjectInfo({ description: e.target.value }))}
                    placeholder={t('configurator.projectDefinition.description.placeholder')}
                    rows={3}
                    className="w-full resize-none rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-sm text-textPrimary placeholder:text-slate-400 transition-all duration-300 focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                />
            </Card>

            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-textPrimary">{t('configurator.projectDefinition.buildingType.title')}</h4>
                        <p className="text-sm text-textSecondary">{t('configurator.projectDefinition.buildingType.subtitle')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {BUILDING_TYPES.map((type) => {
                        const slug = String(type.code || type.slug || type.name || '').trim().toLowerCase();
                        const Icon = BUILDING_ICONS[slug] || Building;
                        const isSelected = projectInfo.buildingType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => handleTypeSelect(type.id)}
                                className={clsx(
                                    'group relative overflow-hidden rounded-md border bg-white p-4 text-left transition-all duration-300 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 sm:p-5',
                                    isSelected
                                        ? 'border-primary-300 bg-primary-50 text-slate-900 shadow-md ring-1 ring-primary-500/15'
                                        : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm',
                                    (validationErrors.buildingType || validationErrors.buildingTypeId) && !projectInfo.buildingType && 'border-amber-500/30',
                                )}
                            >
                                <div className={clsx(
                                    'mb-4 flex h-12 w-12 items-center justify-center rounded-md border transition-colors duration-300',
                                    isSelected ? 'border-primary-300 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-500 group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-700',
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="block text-sm font-semibold leading-snug">{type.name}</span>
                                {isSelected ? (
                                    <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-white shadow-sm">
                                        <span className="text-[11px] font-black">✓</span>
                                    </div>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                {(validationErrors.buildingType || validationErrors.buildingTypeId) && !projectInfo.buildingType ? (
                    <div className="rounded-md border border-amber-500/18 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                        <div className="flex items-center gap-3">
                            <Info className="h-5 w-5" />
                            <p>{validationErrors.buildingType || validationErrors.buildingTypeId}</p>
                        </div>
                    </div>
                ) : null}

                {selectedBuildingType?.description ? (
                    <Card className="rounded-[1.75rem] p-5">
                        <div className="flex items-start gap-3">
                            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" />
                            <div>
                                <Badge variant="info" className="mb-3">{t('configurator.projectDefinition.buildingType.descriptionLabel')}</Badge>
                                <p className="text-sm leading-relaxed text-textSecondary">{selectedBuildingType.description}</p>
                            </div>
                        </div>
                    </Card>
                ) : null}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
                        icon: Gauge,
                        title: t('configurator.projectDefinition.complexity.title'),
                        subtitle: t('configurator.projectDefinition.complexity.subtitle'),
                        field: (
                            <LocalInput name="projectComplexity" value={projectInfo.projectComplexity} onChange={handleChange} label={t('configurator.projectDefinition.complexity.inputLabel')} placeholder={t('configurator.projectDefinition.complexity.placeholder')} error={validationErrors.projectComplexity} />
                        ),
                    },
                    {
                        icon: Hash,
                        title: t('configurator.projectDefinition.multiplication.title'),
                        subtitle: t('configurator.projectDefinition.multiplication.subtitle'),
                        field: (
                            <>
                                <LocalInput type="number" min="1" max="500" name="projectMultiplicationIndex" value={projectInfo.projectMultiplicationIndex} onChange={handleChange} label={t('configurator.projectDefinition.multiplication.inputLabel')} error={validationErrors.projectMultiplicationIndex} />
                                <p className="mt-3 text-xs leading-relaxed text-textSecondary">{t('configurator.projectDefinition.multiplication.helper')}</p>
                            </>
                        ),
                    },
                ].map((item) => (
                    <Card key={item.title} className="rounded-[1.5rem] p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-textPrimary">{item.title}</span>
                                <span className="text-xs text-textSecondary">{item.subtitle}</span>
                            </div>
                        </div>
                        {item.field}
                    </Card>
                ))}
            </div>
        </div>
    );
}
