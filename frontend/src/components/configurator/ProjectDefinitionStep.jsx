import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProjectInfo } from '../../features/configurator/configuratorSlice';
import { Building, Home, Briefcase, Store, Hotel, FileText, MapPin, Hash, Layers, Target, Info, PencilLine, Gauge } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, SectionTitle, Input, Badge } from '../common/UIComponents';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { projectInfo } = useSelector((state) => state.configurator);
    const BUILDING_TYPES = useSelector((state) => state.admin.buildingTypes) || [];

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
        <div className="mx-auto max-w-5xl space-y-10 animate-fade-in">
            <SectionTitle
                title={t('configurator.projectDefinition.title')}
                subtitle={t('configurator.projectDefinition.subtitle')}
                badge={t('configurator.projectDefinition.badge')}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="rounded-[2rem] p-7">
                    <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
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
                                'rounded-[1.35rem] border px-4 py-4 text-center text-sm font-semibold transition-all duration-300',
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
                                'rounded-[1.35rem] border px-4 py-4 text-center text-sm font-semibold transition-all duration-300',
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

                <Card className="rounded-[2rem] p-7">
                    <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
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

            <Card className="rounded-[2rem] p-7">
                <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
                        <Target className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-textPrimary">{t('configurator.projectDefinition.buildingType.title')}</h4>
                        <p className="text-sm text-textSecondary">{t('configurator.projectDefinition.buildingType.subtitle')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {BUILDING_TYPES.map((type) => {
                        const slug = String(type.code || type.slug || type.name || '').trim().toLowerCase();
                        const Icon = BUILDING_ICONS[slug] || Building;
                        const isSelected = projectInfo.buildingType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => handleTypeSelect(type.id)}
                                className={clsx(
                                    'relative overflow-hidden rounded-[1.75rem] border px-5 py-6 text-left transition-all duration-300',
                                    isSelected
                                        ? 'border-primary-200 bg-primary-50 text-textPrimary shadow-soft'
                                        : 'border-[#D1D5DB] bg-[#EDEFE8] text-textSecondary hover:border-primary-300 hover:bg-white hover:text-textPrimary',
                                    (validationErrors.buildingType || validationErrors.buildingTypeId) && !projectInfo.buildingType && 'border-amber-500/30',
                                )}
                            >
                                <div className={clsx(
                                    'mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border',
                                    isSelected ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-[#D1D5DB] bg-[#EDEFE8] text-textSecondary',
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="block text-sm font-semibold">{type.name}</span>
                                {isSelected ? <div className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-primary-700" /> : null}
                            </button>
                        );
                    })}
                </div>

                {(validationErrors.buildingType || validationErrors.buildingTypeId) && !projectInfo.buildingType ? (
                    <div className="rounded-[1.5rem] border border-amber-500/18 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                        <div className="flex items-center gap-3">
                            <Info className="h-4.5 w-4.5" />
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
                    <Card key={item.title} className="rounded-[1.85rem] p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
                                <item.icon className="h-4.5 w-4.5" />
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
