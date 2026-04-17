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

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);

    const settingsGroups = [
        {
            id: 'engine',
            title: 'Calculation Engine',
            icon: Zap,
            settings: [
                { name: 'Global Price Multiplier', value: '1.00', type: 'number', description: 'Base multiplier for all hardware components.' },
                { name: 'VAT Rate (%)', value: '19', type: 'number', description: 'Standard VAT percentage for proposal calculations.' },
                { name: 'Currency Code', value: 'EUR', type: 'text', description: 'Primary currency for all financial transactions.' },
            ],
        },
        {
            id: 'platform',
            title: 'Platform Branding',
            icon: Globe,
            settings: [
                { name: 'Organisation Name', value: 'Home Solution Configurator', type: 'text', description: 'Main title used in headers and documents.' },
                { name: 'Support Email', value: 'support@hsc.com', type: 'email', description: 'Reply-to address for customer notifications.' },
                { name: 'Offer Expiry (Days)', value: '30', type: 'number', description: 'Default validity period for generated PDF offers.' },
            ],
        },
        {
            id: 'security',
            title: 'System & Security',
            icon: Shield,
            settings: [
                { name: 'Session Timeout (min)', value: '120', type: 'number', description: 'Automatic log-out period for inactive sessions.' },
                { name: 'Maintenance Mode', value: false, type: 'toggle', description: 'Restrict non-admin access during system updates.' },
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
            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-6">
                        <SectionTitle
                            title="Global System Settings"
                            subtitle="Centralized configuration for the calculation engine, platform identity, and security protocols across the smart-home backoffice."
                            badge="Infrastructure Console"
                            className="mb-0"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                { icon: Database, label: 'System Registry', value: 'Live' },
                                { icon: Activity, label: 'Update State', value: 'Synced' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 px-5 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
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

                    <Button size="lg" onClick={handleSave} className="gap-2">
                        {isSaving ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
                        {isSaving ? 'Synchronising Settings' : 'Synchronise Settings'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.35fr]">
                <div className="space-y-6">
                    <div className="hero-frame rounded-[2rem] p-8">
                        <div className="space-y-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Database className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-heading text-4xl font-semibold leading-none text-textPrimary">System Registry</h3>
                                <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                                    Changes made here influence hardware pricing, proposal generation logic, branding outputs, and platform-wide security behavior.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/5 px-4 py-4">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">Engine Status</span>
                                    <Badge variant="success">Operational</Badge>
                                </div>
                                <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/5 px-4 py-4">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">Last Sync</span>
                                    <span className="text-sm font-medium text-textPrimary">Today, 14:24</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Alert variant="info" icon={Server}>
                        <div className="space-y-1">
                            <p className="font-medium text-textPrimary">Cloud Synchronisation</p>
                            <p>Master data backups are automatically generated every 24 hours.</p>
                        </div>
                    </Alert>
                </div>

                <div className="space-y-6">
                    {settingsGroups.map((group) => (
                        <Card key={group.id} className="rounded-[2rem] p-0 overflow-hidden">
                            <div className="border-b border-white/8 bg-white/5 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                        <group.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-textPrimary">{group.title}</h3>
                                        <p className="text-sm text-textSecondary">Global configuration set</p>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-white/8">
                                {group.settings.map((setting) => (
                                    <div key={setting.name} className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="max-w-xl">
                                            <h4 className="text-sm font-medium text-textPrimary">{setting.name}</h4>
                                            <p className="mt-1 text-sm leading-relaxed text-textSecondary">{setting.description}</p>
                                        </div>
                                        <div className="w-full sm:w-56">
                                            {setting.type === 'toggle' ? (
                                                <button className="relative inline-flex h-7 w-12 items-center rounded-full border border-primary-500/20 bg-primary-500/15 transition-colors focus:outline-none">
                                                    <span className="sr-only">Toggle setting</span>
                                                    <span className="translate-x-6 inline-block h-5 w-5 rounded-full bg-textPrimary transition-transform" />
                                                </button>
                                            ) : (
                                                <input
                                                    type={setting.type}
                                                    defaultValue={setting.value}
                                                    className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] px-4 py-3 text-sm font-medium text-textPrimary shadow-inner transition-all focus:border-primary-500/40 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </AnimatedPageWrapper>
    );
}
