import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { Building, MapPin, Hash, Layers, FileText, Tag, User, Briefcase, Gauge } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Row = ({ icon: Icon, label, value }) => {
    if (value === undefined || value === null || value === '') return null;

    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-400 w-44 flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-sm font-bold text-slate-900">{value}</span>
        </div>
    );
};

export default function ProjectSummaryCard({ projectInfo, levelsCount }) {
    const { t } = useTranslation();
    const admin = useSelector((state) => state.admin);
    if (!projectInfo) return null;

    const {
        name,
        buildingType,
        area,
        projectMultiplicationIndex,
        description,
        clientType,
        companyName,
        projectComplexity,
    } = projectInfo;

    const selectedBuildingType = admin.buildingTypes?.find((item) => item.id === buildingType) || null;
    const buildingTypeName = selectedBuildingType?.name || buildingType;
    const buildingTypeDescription = selectedBuildingType?.description || '';
    const normalizedBuildingTypeName = buildingTypeName
        ? buildingTypeName.charAt(0).toUpperCase() + buildingTypeName.slice(1).replaceAll('_', ' ')
        : '—';

    return (
        <Card className="p-5 border-none shadow-premium-sm rounded-[1.25rem] sm:p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('configurator.summary.project')}</h3>
            </div>

            <div>
                <Row icon={Tag} label={t('offers.detail.projectNameLabel')} value={name || '—'} />
                {clientType === 'company' && <Row icon={Briefcase} label={t('offers.detail.companyNameLabel')} value={companyName || '—'} />}
                <Row icon={User} label={t('offers.detail.clientTypeLabel')} value={clientType === 'company' ? t('offers.detail.companyClient') : t('offers.detail.privateClient')} />
                <Row icon={Building} label={t('offers.detail.buildingTypeLabel')} value={normalizedBuildingTypeName} />
                <Row icon={Layers} label={t('offers.detail.levelsLabel')} value={levelsCount ? `${levelsCount}` : '—'} />
                <Row icon={MapPin} label={t('offers.detail.areaLabel')} value={area ? `${area} m²` : '—'} />
                <Row icon={Gauge} label={t('offers.detail.complexityLabel')} value={projectComplexity || '—'} />
                <Row icon={Hash} label={t('offers.detail.multiplierLabel')} value={projectMultiplicationIndex || 1} />
            </div>

            {buildingTypeDescription && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('offers.detail.buildingDescriptionLabel')}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{buildingTypeDescription}</p>
                </div>
            )}

            {description && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('offers.detail.projectNotesLabel')}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                </div>
            )}
        </Card>
    );
}
