import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Briefcase,
    Building2,
    CheckCircle2,
    ClipboardList,
    FileText,
    Gauge,
    LayoutDashboard,
    Layers3,
    Palette,
    Play,
    Settings2,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/common/UIComponents';
import HeroCarousel from '@/components/home/HeroCarousel';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
    const { t } = useTranslation();

    const workflow = [
        {
            icon: Building2,
            title: t('smartHome.workflow.project.title', { defaultValue: 'Project brief' }),
            description: t('smartHome.workflow.project.desc', { defaultValue: 'Define building type, levels, surface, complexity, and multiplication index.' }),
        },
        {
            icon: Layers3,
            title: t('smartHome.workflow.rooms.title', { defaultValue: 'Rooms and functions' }),
            description: t('smartHome.workflow.rooms.desc', { defaultValue: 'Map rooms, quantities, and the smart functions required for each space.' }),
        },
        {
            icon: Palette,
            title: t('smartHome.workflow.range.title', { defaultValue: 'Products and finishes' }),
            description: t('smartHome.workflow.range.desc', { defaultValue: 'Select product range, device color, and optional professional services.' }),
        },
        {
            icon: FileText,
            title: t('smartHome.workflow.offer.title', { defaultValue: 'Commercial offer' }),
            description: t('smartHome.workflow.offer.desc', { defaultValue: 'Generate a backend-calculated offer with hardware, services, totals, and PDF export.' }),
        },
    ];

    const essentials = [
        {
            icon: ShieldCheck,
            label: t('smartHome.essentials.verified.label', { defaultValue: 'Verified data' }),
            text: t('smartHome.essentials.verified.text', { defaultValue: 'Master-data driven products, services, colors, conditions, and disclaimers.' }),
        },
        {
            icon: Briefcase,
            label: t('smartHome.essentials.projects.label', { defaultValue: 'Saved projects' }),
            text: t('smartHome.essentials.projects.text', { defaultValue: 'Customer projects and offers remain available after login and verification.' }),
        },
        {
            icon: BarChart3,
            label: t('smartHome.essentials.dashboard.label', { defaultValue: 'Dashboard follow-up' }),
            text: t('smartHome.essentials.dashboard.text', { defaultValue: 'Review offers, reopen project details, and export proposal documents.' }),
        },
    ];

    const checkpoints = [
        t('smartHome.checkpoints.draft', { defaultValue: 'Guest draft continuity before account activation' }),
        t('smartHome.checkpoints.auth', { defaultValue: 'Email verification before final offer storage' }),
        t('smartHome.checkpoints.pdf', { defaultValue: 'PDF proposal export from generated offers' }),
        t('smartHome.checkpoints.admin', { defaultValue: 'Admin-managed product mappings and offer conditions' }),
    ];

    return (
        <div className="smart-home-page text-textPrimary">
            <section className="relative overflow-hidden bg-[#020a07] px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8 lg:pb-16">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,7,0.98),rgba(2,10,7,0.88)_48%,rgba(2,10,7,0.72))]" />
                <div className="absolute inset-0 bg-tech-grid bg-[length:56px_56px] opacity-12" />

                <div className="container-custom relative z-10">
                    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1fr)] lg:gap-12">
                        <div className="space-y-7">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="border-emerald/35 bg-emerald/12 text-emerald">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {t('smartHome.hero.badge', { defaultValue: 'Smart Building Configurator' })}
                                </Badge>
                                <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/72">
                                    {t('smartHome.hero.mode', { defaultValue: 'Project to proposal' })}
                                </span>
                            </div>

                            <div className="max-w-3xl space-y-5">
                                <h1 className="font-heading text-4xl font-black uppercase leading-[1.02] text-white sm:text-5xl lg:text-6xl">
                                    {t('smartHome.hero.title', { defaultValue: 'Configure a smart-home project and generate a real offer.' })}
                                </h1>
                                <p className="max-w-2xl text-base leading-relaxed text-white/74 lg:text-lg">
                                    {t('smartHome.hero.subtitle', { defaultValue: 'Build a room-by-room specification, calculate compatible hardware and services, then continue from your dashboard with saved projects and proposal exports.' })}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/configurator" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full gap-2 text-ink sm:w-auto">
                                        <Play className="h-4.5 w-4.5" />
                                        {t('home.hero.ctaPrimary', { defaultValue: 'Launch Configurator' })}
                                    </Button>
                                </Link>
                                <Link to="/dashboard" className="w-full sm:w-auto">
                                    <Button variant="secondary" size="lg" className="w-full border-white/18 bg-white text-ink sm:w-auto">
                                        <LayoutDashboard className="h-4.5 w-4.5" />
                                        {t('nav.dashboard')}
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid gap-3 text-sm text-white/72 sm:grid-cols-2">
                                {checkpoints.map((item) => (
                                    <div key={item} className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-emerald" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <HeroCarousel />
                            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/14 bg-[#020a07]/82 p-4 shadow-2xl backdrop-blur-xl">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Metric label={t('smartHome.metrics.workflow', { defaultValue: 'Workflow' })} value="8" suffix={t('smartHome.metrics.steps', { defaultValue: 'steps' })} />
                                    <Metric label={t('smartHome.metrics.output', { defaultValue: 'Output' })} value="PDF" suffix={t('smartHome.metrics.proposal', { defaultValue: 'proposal' })} />
                                    <Metric label={t('smartHome.metrics.data', { defaultValue: 'Data' })} value={t('smartHome.metrics.live', { defaultValue: 'Live' })} suffix={t('smartHome.metrics.master', { defaultValue: 'master data' })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <div className="container-custom">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {essentials.map((item) => (
                            <Card key={item.label} className="rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-emerald/18 bg-emerald/10 text-emerald">
                                        <item.icon className="h-5.5 w-5.5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black uppercase leading-tight text-textPrimary">{item.label}</h2>
                                        <p className="mt-2 text-sm leading-relaxed text-textSecondary">{item.text}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
                <div className="container-custom">
                    <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                        <div className="space-y-5">
                            <Badge variant="neutral">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                {t('smartHome.workflow.badge', { defaultValue: 'Required workflow' })}
                            </Badge>
                            <h2 className="section-title text-3xl sm:text-4xl">
                                {t('smartHome.workflow.title', { defaultValue: 'Only the steps needed to price and manage an offer.' })}
                            </h2>
                            <p className="max-w-xl text-sm leading-relaxed text-textSecondary sm:text-base">
                                {t('smartHome.workflow.subtitle', { defaultValue: 'Every selection feeds the calculation engine, proposal document, saved project record, and offer follow-up flow.' })}
                            </p>
                            <Link to="/configurator" className="inline-flex">
                                <Button variant="gradient" size="lg" className="gap-2">
                                    {t('smartHome.workflow.start', { defaultValue: 'Start a configuration' })}
                                    <ArrowRight className="h-4.5 w-4.5" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {workflow.map((item, index) => (
                                <Card key={item.title} className="rounded-lg p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald/18 bg-emerald/10 text-emerald">
                                            <item.icon className="h-5.5 w-5.5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-textSecondary">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-xl font-black uppercase leading-tight text-textPrimary">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-textSecondary">{item.description}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-emerald/12 bg-[#f6f8f3] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="container-custom">
                    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                        <div className="hero-frame rounded-lg p-6 sm:p-8">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <PreviewTile icon={ClipboardList} title={t('smartHome.preview.project', { defaultValue: 'Project record' })} text={t('smartHome.preview.projectText', { defaultValue: 'Building type, rooms, functions, services, and customer comments.' })} />
                                <PreviewTile icon={Gauge} title={t('smartHome.preview.calculation', { defaultValue: 'Calculation' })} text={t('smartHome.preview.calculationText', { defaultValue: 'Hardware totals, services, VAT context, discounts, and warnings.' })} />
                                <PreviewTile icon={BadgeCheck} title={t('smartHome.preview.verification', { defaultValue: 'Verification' })} text={t('smartHome.preview.verificationText', { defaultValue: 'Offer storage and final generation after account verification.' })} />
                                <PreviewTile icon={Settings2} title={t('smartHome.preview.admin', { defaultValue: 'Admin control' })} text={t('smartHome.preview.adminText', { defaultValue: 'Mappings, prices, permissions, statuses, and follow-up templates.' })} />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <Badge variant="primary">
                                <FileText className="h-3.5 w-3.5" />
                                {t('smartHome.output.badge', { defaultValue: 'Offer output' })}
                            </Badge>
                            <h2 className="section-title text-3xl sm:text-4xl">
                                {t('smartHome.output.title', { defaultValue: 'A cleaner handoff from configuration to customer offer.' })}
                            </h2>
                            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
                                {t('smartHome.output.subtitle', { defaultValue: 'The configurator keeps the path clear from project definition to verified offer, exportable proposal, and dashboard management.' })}
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/dashboard/offers" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                                        <FileText className="h-4.5 w-4.5" />
                                        {t('nav.offers')}
                                    </Button>
                                </Link>
                                <Link to="/dashboard/projects" className="w-full sm:w-auto">
                                    <Button variant="secondary" size="lg" className="w-full gap-2 sm:w-auto">
                                        <Briefcase className="h-4.5 w-4.5" />
                                        {t('dashboardLayout.projects', { defaultValue: 'Projects' })}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Metric({ label, value, suffix }) {
    return (
        <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/58">{label}</p>
            <p className="mt-1 font-heading text-2xl font-black leading-none text-white">{value}</p>
            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald">{suffix}</p>
        </div>
    );
}

function PreviewTile({ icon: Icon, title, text }) {
    return (
        <div className="rounded-lg border border-emerald/14 bg-white p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald/18 bg-emerald/10 text-emerald">
                    <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.08em] text-textPrimary">{title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-textSecondary">{text}</p>
        </div>
    );
}
