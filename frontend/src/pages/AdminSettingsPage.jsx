import React, { useState } from 'react';
import {
    Shield,
    Database,
    Globe,
    Save,
    RefreshCw,
    Zap,
    Server,
    Activity,
} from 'lucide-react';
import {
    Button,
    Card,
    SectionTitle,
    AnimatedPageWrapper,
    Alert,
    Badge,
} from '@/components/common/UIComponents';
import { useTranslation } from 'react-i18next';

export default function AdminSettingsPage() {
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);

    const settingsGroups = [
        {
            id: 'engine',
            title: t('adminSettings.groups.engine', { defaultValue: 'Calculation Engine' }),
            icon: Zap,
            settings: [
                { name: t('adminSettings.fields.multiplier', { defaultValue: 'Global Price Multiplier' }), value: '1.00', type: 'number', description: t('adminSettings.fields.multiplierHelp', { defaultValue: 'Base multiplier for all hardware components.' }) },
                { name: t('adminSettings.fields.vat', { defaultValue: 'VAT Rate (%)' }), value: '19', type: 'number', description: t('adminSettings.fields.vatHelp', { defaultValue: 'Standard VAT percentage for proposal calculations.' }) },
                { name: t('adminSettings.fields.currency', { defaultValue: 'Currency Code' }), value: 'EUR', type: 'text', description: t('adminSettings.fields.currencyHelp', { defaultValue: 'Primary currency for all financial transactions.' }) },
            ],
        },
        {
            id: 'platform',
            title: t('adminSettings.groups.branding', { defaultValue: 'Platform Branding' }),
            icon: Globe,
            settings: [
                { name: t('adminSettings.fields.organisation', { defaultValue: 'Organisation Name' }), value: 'Home Solution Configurator', type: 'text', description: t('adminSettings.fields.organisationHelp', { defaultValue: 'Main title used in headers and documents.' }) },
                { name: t('adminSettings.fields.supportEmail', { defaultValue: 'Support Email' }), value: 'support@hsc.com', type: 'email', description: t('adminSettings.fields.supportEmailHelp', { defaultValue: 'Reply-to address for customer notifications.' }) },
                { name: t('adminSettings.fields.expiry', { defaultValue: 'Offer Expiry (Days)' }), value: '30', type: 'number', description: t('adminSettings.fields.expiryHelp', { defaultValue: 'Default validity period for generated PDF offers.' }) },
            ],
        },
        {
            id: 'security',
            title: t('adminSettings.groups.security', { defaultValue: 'System & Security' }),
            icon: Shield,
            settings: [
                { name: t('adminSettings.fields.timeout', { defaultValue: 'Session Timeout (min)' }), value: '120', type: 'number', description: t('adminSettings.fields.timeoutHelp', { defaultValue: 'Automatic log-out period for inactive sessions.' }) },
                { name: t('adminSettings.fields.maintenance', { defaultValue: 'Maintenance Mode' }), value: false, type: 'toggle', description: t('adminSettings.fields.maintenanceHelp', { defaultValue: 'Restrict non-admin access during system updates.' }) },
            ],
        },
    ];

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
        }, 1500);
    };

return (
    <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-10 pb-20">
        <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                            <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                {t('adminSettings.badge', { defaultValue: 'Infrastructure Console' })}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                            {t('adminSettings.title', { defaultValue: 'Global System Settings' })}
                        </h1>
                        <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                            {t('adminSettings.subtitle', { defaultValue: 'Centralized configuration for the calculation engine, platform identity, and security protocols across the smart-home backoffice.' })}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            { icon: Database, label: t('adminSettings.registry', { defaultValue: 'System Registry' }), value: t('adminSettings.live', { defaultValue: 'Live' }), color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)' },
                            { icon: Activity, label: t('adminSettings.updateState', { defaultValue: 'Update State' }), value: t('adminSettings.synced', { defaultValue: 'Synced' }), color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.22)' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white border shadow-sm rounded-sm p-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300" style={{ borderColor: item.border }}>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-lg shadow-sm" style={{ backgroundColor: item.bg, color: item.color }}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-snug">{item.label}</h3>
                                        <span className="text-2xl font-black block mt-0.5 leading-none" style={{ color: item.color }}>{item.value}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full xl:w-auto xl:self-start">
                    <Button size="md" onClick={handleSave} className="!rounded-sm justify-center h-10 px-6 text-[11px] font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto flex-1 sm:flex-none">
                        {isSaving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? t('adminSettings.synchronising', { defaultValue: 'Synchronising Settings' }) : t('adminSettings.synchronise', { defaultValue: 'Synchronise Settings' })}
                    </Button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.35fr]">
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-6">
                    <div className="space-y-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                            <Database className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-heading text-2xl font-bold leading-tight text-gray-800 sm:text-3xl">{t('adminSettings.registry', { defaultValue: 'System Registry' })}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                {t('adminSettings.registryHelp', { defaultValue: 'Changes made here influence hardware pricing, proposal generation logic, branding outputs, and platform-wide security behavior.' })}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 px-4 py-4 shadow-sm">
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{t('adminSettings.engineStatus', { defaultValue: 'Engine Status' })}</span>
                                <Badge variant="success" className="!rounded-sm shadow-sm">{t('adminSettings.operational', { defaultValue: 'Operational' })}</Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 px-4 py-4 shadow-sm">
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{t('adminSettings.lastSync', { defaultValue: 'Last Sync' })}</span>
                                <span className="text-sm font-bold text-gray-800">{t('adminSettings.todayAt', { time: '14:24', defaultValue: 'Today, {{time}}' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 flex gap-3 text-blue-800 shadow-sm">
                    <Server className="h-5 w-5 shrink-0 text-blue-600" />
                    <div className="space-y-1">
                        <p className="font-bold">{t('adminSettings.cloudSync', { defaultValue: 'Cloud Synchronisation' })}</p>
                        <p className="text-sm font-medium">{t('adminSettings.cloudSyncHelp', { defaultValue: 'Master data backups are automatically generated every 24 hours.' })}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {settingsGroups.map((group) => (
                    <div key={group.id} className="bg-white border border-gray-200 shadow-sm rounded-sm p-0 overflow-hidden">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                                    <group.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{group.title}</h3>
                                    <p className="text-sm font-medium text-gray-500">{t('adminSettings.groupSubtitle', { defaultValue: 'Global configuration set' })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {group.settings.map((setting) => (
                                <div key={setting.name} className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors">
                                    <div className="max-w-xl">
                                        <h4 className="text-sm font-bold text-gray-800">{setting.name}</h4>
                                        <p className="mt-1 text-sm leading-relaxed text-gray-600 font-medium">{setting.description}</p>
                                    </div>
                                    <div className="w-full sm:w-56">
                                        {setting.type === 'toggle' ? (
                                            <button className="relative inline-flex h-7 w-12 items-center rounded-full border border-gray-300 bg-gray-200 transition-colors focus:outline-none shadow-inner">
                                                <span className="sr-only">{t('adminSettings.toggle', { defaultValue: 'Toggle setting' })}</span>
                                                <span className="translate-x-1 inline-block h-5 w-5 rounded-full bg-white transition-transform shadow-sm" />
                                            </button>
                                        ) : (
                                            <input
                                                type={setting.type}
                                                defaultValue={setting.value}
                                                className="w-full rounded-sm border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </AnimatedPageWrapper>
);
}
