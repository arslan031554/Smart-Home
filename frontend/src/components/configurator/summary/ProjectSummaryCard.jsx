import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { Building, MapPin, Hash, Layers, FileText, Tag, User, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getActiveConfiguratorLanguage, getConfiguratorText } from '../../../utils/configuratorText';

const Row = ({ icon: Icon, label, value }) => {
    if (value === undefined || value === null || value === '') return null;

    return (
        <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-100 last:border-0 sm:gap-3 sm:py-3">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center text-primary-700 flex-shrink-0 mt-0.5 border border-primary-100/60 shadow-xs sm:w-8 sm:h-8">
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-[11px] sm:text-xs font-semibold text-textSecondary sm:w-44 flex-shrink-0">{label}</span>
                <span className="text-xs sm:text-sm font-bold text-textPrimary">{value}</span>
            </div>
        </div>
    );
};

export default function ProjectSummaryCard({ projectInfo, levelsCount }) {
    const { t, i18n } = useTranslation();
    const language = getActiveConfiguratorLanguage(i18n);
    const admin = useSelector((state) => state.admin);
    if (!projectInfo) return null;

    const {
        buildingType,
        area,
        projectMultiplicationIndex,
        clientType,
        companyName,
    } = projectInfo;
    const name = getConfiguratorText(projectInfo, 'name', language, projectInfo.name || '');
    const description = getConfiguratorText(projectInfo, 'description', language, projectInfo.description || '');

    const selectedBuildingType = admin.buildingTypes?.find((item) => item.id === buildingType) || null;
    const buildingTypeName = selectedBuildingType?.name || buildingType;
    const buildingTypeDescription = selectedBuildingType?.description || '';
    const normalizedBuildingTypeName = buildingTypeName
        ? buildingTypeName.charAt(0).toUpperCase() + buildingTypeName.slice(1).replaceAll('_', ' ')
        : '—';

    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                    <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.project', { defaultValue: 'Project' })}</h3>
            </div>

            <div className="divide-y divide-slate-100">
                <Row icon={Tag} label={t('offers.detail.projectNameLabel', { defaultValue: 'Project Name' })} value={name || '—'} />
                {clientType === 'company' && <Row icon={Briefcase} label={t('offers.detail.companyNameLabel', { defaultValue: 'Company Name' })} value={companyName || '—'} />}
                <Row icon={User} label={t('offers.detail.clientTypeLabel', { defaultValue: 'Client Type' })} value={clientType === 'company' ? t('offers.detail.companyClient', { defaultValue: 'Business / Company' }) : t('offers.detail.privateClient', { defaultValue: 'Private Individual' })} />
                <Row icon={Building} label={t('offers.detail.buildingTypeLabel', { defaultValue: 'Building Type' })} value={normalizedBuildingTypeName} />
                <Row icon={Layers} label={t('offers.detail.levelsLabel', { defaultValue: 'Levels' })} value={levelsCount ? `${levelsCount}` : '—'} />
                <Row icon={MapPin} label={t('offers.detail.areaLabel', { defaultValue: 'Built-up Area' })} value={area ? `${area} m²` : '—'} />
                <Row icon={Hash} label={t('offers.detail.multiplierLabel', { defaultValue: 'Multiplication Index' })} value={projectMultiplicationIndex || 1} />
            </div>

            {buildingTypeDescription && (
                <div className="mt-4 p-3.5 bg-[#f9faf6] rounded-xl border border-slate-200/80">
                    <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1">{t('offers.detail.buildingDescriptionLabel', { defaultValue: 'Building Description' })}</p>
                    <p className="text-xs sm:text-sm text-textPrimary leading-relaxed">{buildingTypeDescription}</p>
                </div>
            )}

            {description && (
                <div className="mt-4 p-3.5 bg-[#f9faf6] rounded-xl border border-slate-200/80">
                    <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1">{t('offers.detail.projectNotesLabel', { defaultValue: 'Project Notes' })}</p>
                    <p className="text-xs sm:text-sm text-textPrimary leading-relaxed">{description}</p>
                </div>
            )}
        </Card>
    );
}
