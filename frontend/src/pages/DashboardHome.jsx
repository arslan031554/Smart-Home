import { useEffect, useMemo } from 'react';
import {
    LayoutDashboard, Briefcase, Bell, ArrowRight, Plus, Calendar, FileText, Zap,
    Loader2, Home, Layers3, Gauge, Hash, TrendingUp, Clock, CheckCircle,
} from 'lucide-react';
import { Button, Badge, Alert, AnimatedPageWrapper } from '@/components/common/UIComponents';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetConfigurator } from '@/features/configurator/configuratorSlice';
import { fetchDashboard } from '@/features/dashboard/dashboardSlice';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/components/offers/StatusBadge';
import { dedupeProjectsById, getProjectTitle } from '@/utils/projectUtils';

export default function DashboardHome() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { user: authUser } = useSelector((state) => state.auth);
    const dashboard = useSelector((state) => state.dashboard);
    const {
        loading, error, stats = {}, recentProjects = [], recentOffers = [], reminders = [], user: dashboardUser,
    } = dashboard;

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const displayName = dashboardUser?.fullName || authUser?.fullName || authUser?.email || t('dashboardLayout.user', { defaultValue: 'User' });
    const pendingOffersCount = stats.offerGeneratedOffers ?? stats.offerReady ?? 0;
    const uniqueRecentProjects = useMemo(() => dedupeProjectsById(recentProjects), [recentProjects]);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    const handleNewConfig = () => {
        dispatch(resetConfigurator());
        navigate('/configurator', { state: { freshConfigurator: true } });
    };

    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    const formatNumber = (value) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(value || 0));

    const formatArea = (value) => {
        const area = Number(value || 0);
        return area > 0 ? `${formatNumber(area)} m2` : '-';
    };

    const formatMultiplier = (value) => {
        const multiplier = Number(value || 0);
        return multiplier > 0 ? `x ${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(multiplier)}` : '-';
    };

    const getProjectStatusVariant = (status) => {
        const normalized = String(status || '').toLowerCase();
        if (normalized === 'active') return 'success';
        if (normalized === 'archived') return 'neutral';
        return 'warning';
    };
    // Each stat card gets a unique accent color
    const statCards = [
        {
            name: t('dashboardHome.stats.activeProjects', { defaultValue: 'Active Projects' }),
            value: stats.activeProjects || 0,
            icon: Briefcase,
            color: '#60b93f',
            bg: 'rgba(96,185,63,0.10)',
            border: 'rgba(96,185,63,0.22)',
            glow: 'rgba(96,185,63,0.18)',
        },
        {
            name: t('dashboardHome.stats.pendingOffers', { defaultValue: 'Pending Offers' }),
            value: pendingOffersCount,
            icon: Bell,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.10)',
            border: 'rgba(245,158,11,0.22)',
            glow: 'rgba(245,158,11,0.15)',
        },
        {
            name: t('dashboardHome.stats.offerReady', { defaultValue: 'Offers Ready' }),
            value: stats.offerReady || 0,
            icon: CheckCircle,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.10)',
            border: 'rgba(59,130,246,0.22)',
            glow: 'rgba(59,130,246,0.15)',
        },
        {
            name: t('dashboardHome.stats.draftOffers', { defaultValue: 'Draft Offers' }),
            value: stats.draftOffers || 0,
            icon: FileText,
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.10)',
            border: 'rgba(139,92,246,0.22)',
            glow: 'rgba(139,92,246,0.15)',
        },
    ];

    if (loading) {
        return (
            <AnimatedPageWrapper className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-textSecondary">
                    {t('dashboardHome.loading', { defaultValue: 'Loading dashboard...' })}
                </p>
            </AnimatedPageWrapper>
        );
    }

    if (error) {
        return (
            <AnimatedPageWrapper className="mx-auto max-w-2xl space-y-6">
                <Alert variant="error">{error}</Alert>
                <Button onClick={() => dispatch(fetchDashboard())} variant="outline" size="md">
                    {t('dashboardHome.retry', { defaultValue: 'Try again' })}
                </Button>
            </AnimatedPageWrapper>
        );
    }

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl pb-12 px-2 sm:px-4 lg:px-6 mt-4">
            <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md relative rounded-sm p-4 sm:p-5 lg:p-6 transition-all duration-700 group/bg space-y-8">
                {/* ── Hero Header ─────────────────────────────────────────── */}
                <div className="bg-primary-600/5 border border-primary-500/10 overflow-hidden rounded-sm px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 min-w-0 z-10">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/12 text-primary-400 shadow-sm">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold leading-tight text-textPrimary sm:text-2xl">
                                {t('dashboardHome.greeting', { defaultValue: 'Welcome back,' })}&nbsp;
                                <span className="text-primary-400">{displayName}</span>
                            </h1>
                            <p className="text-xs leading-relaxed text-textSecondary mt-1">
                                {t('dashboardHome.subgreeting', {
                                    defaultValue: 'You have {{count}} offers awaiting a decision.',
                                    count: pendingOffersCount,
                                })}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleNewConfig} size="md" className="!rounded-sm gap-2 flex-shrink-0 self-start sm:self-center shadow-md relative z-10">
                        <Plus className="h-4 w-4" />
                        {t('dashboardHome.startProject', { defaultValue: 'Start New Project' })}
                    </Button>
                </div>

                {/* ── Stats Row ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                        <div
                            key={stat.name}
                            className="db-stat-card group relative overflow-hidden rounded-sm p-4 cursor-default"
                            style={{
                                '--sc': stat.color,
                                '--sb': stat.bg,
                                '--sborder': stat.border,
                                '--sglow': stat.glow,
                                animationDelay: `${idx * 80}ms`,
                            }}
                        >
                            <div className="relative z-10 flex items-start justify-between gap-3">
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary leading-none">
                                        {stat.name}
                                    </p>
                                    <p className="font-heading text-4xl font-black leading-none" style={{ color: stat.color }}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm transition-transform duration-300 group-hover:scale-110 shadow-sm"
                                    style={{ background: stat.bg, border: `1px solid ${stat.border}`, color: stat.color }}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>

                {/* ── Main Content ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_260px]">

                    {/* Left column */}
                    <div className="space-y-6 min-w-0">

                        {/* Recent Projects */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary-600 rounded-sm shadow-sm text-white">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-4.5 w-4.5 opacity-90" />
                                    <h2 className="text-sm font-bold uppercase tracking-wide leading-none">
                                        {t('dashboardHome.recentProjects', { defaultValue: 'Recent Projects' })}
                                    </h2>
                                </div>
                                <Link
                                    to="/dashboard/projects"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest hover:text-primary-100 transition-colors"
                                >
                                    {t('dashboardHome.viewProjects', { defaultValue: 'All Projects' })}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            {uniqueRecentProjects.length === 0 ? (
                                <div className="rounded-sm border border-dashed border-primary-500/20 bg-primary-500/4 p-8 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-primary-500/12 border border-primary-500/20 text-primary-400 shadow-sm">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <p className="text-base font-semibold text-textPrimary">
                                        {t('dashboardHome.noProjectsTitle', { defaultValue: 'No projects yet' })}
                                    </p>
                                    <p className="mt-2 text-sm text-textSecondary max-w-sm mx-auto leading-relaxed">
                                        {t('dashboardHome.noProjectsDesc', { defaultValue: 'Start a new smart home configuration to see your saved projects here.' })}
                                    </p>
                                    <Button onClick={handleNewConfig} size="md" className="!rounded-sm mt-6 gap-2 shadow-sm">
                                        <Plus className="h-4 w-4" />
                                        {t('dashboardHome.startProject', { defaultValue: 'Start New Project' })}
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {uniqueRecentProjects.map((project, idx) => {
                                        const projectTitle = getProjectTitle(project);
                                        const buildingTypeName = project.buildingTypeName || project.buildingType?.name || null;

                                        return (
                                            <Link key={project.id} to={`/dashboard/projects/${project.id}`} className="block group">
                                                <div
                                                    className="db-project-card rounded-sm p-4 sm:p-5"
                                                    style={{ animationDelay: `${idx * 60}ms` }}
                                                >
                                                    {/* Top: icon + title + badges */}
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                                                        <div className="flex items-start gap-3 min-w-0">
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/10 text-primary-400 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                                                                <Briefcase className="h-4.5 w-4.5" />
                                                            </div>
                                                            <div className="min-w-0 flex flex-col justify-center min-h-[40px]">
                                                                <h3 className="text-sm font-bold text-textPrimary truncate leading-tight group-hover:text-primary-400 transition-colors">
                                                                    {projectTitle}
                                                                </h3>
                                                                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-textSecondary font-medium">
                                                                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(project.updatedAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-13 sm:ml-0 flex-shrink-0">
                                                            {buildingTypeName && (
                                                                <Badge variant="neutral" className="!rounded-sm gap-1.5 !text-[10px] !py-1 !px-2.5 shadow-sm">
                                                                    <Home className="h-3 w-3" />
                                                                    {buildingTypeName}
                                                                </Badge>
                                                            )}
                                                            <Badge variant={getProjectStatusVariant(project.status)} className="!rounded-sm !text-[10px] !py-1 !px-3 shadow-sm">
                                                                {t(`projects.statuses.${project.status || 'draft'}`, { defaultValue: project.status || 'draft' })}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Stats 4-column mini grid */}
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                        {[
                                                            { icon: Layers3, label: t('projects.detail.levels', { defaultValue: 'Levels' }), value: project.levelsCount || '-' },
                                                            { icon: Gauge, label: t('projects.detail.builtUpArea', { defaultValue: 'Area' }), value: formatArea(project.builtUpArea) },
                                                            { icon: Hash, label: t('projects.detail.multiplier', { defaultValue: 'Multiplier' }), value: formatMultiplier(project.multiplicationIndex) },
                                                            { icon: Zap, label: t('projects.detail.complexity', { defaultValue: 'Complexity' }), value: project.projectComplexity || '-' },
                                                        ].map(({ icon: Icon, label, value }) => (
                                                            <div key={label} className="db-mini-stat rounded-sm p-2 transition-all duration-200">
                                                                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-textSecondary mb-1.5">
                                                                    <Icon className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
                                                                    {label}
                                                                </p>
                                                                <p className="text-sm font-semibold text-textPrimary truncate">{value}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between border-t border-primary-500/10 pt-3">
                                                        {project.description ? (
                                                            <p className="text-xs leading-relaxed text-textSecondary line-clamp-1 max-w-[70%]">
                                                                {project.description}
                                                            </p>
                                                        ) : <div />}
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap">
                                                            {t('dashboardHome.open', { defaultValue: 'Open' })}
                                                            <ArrowRight className="h-4 w-4" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Recent Offers */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary-600 rounded-sm shadow-sm text-white">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4.5 w-4.5 opacity-90" />
                                    <h2 className="text-sm font-bold uppercase tracking-wide leading-none">
                                        {t('dashboardHome.recentOffers', { defaultValue: 'Recent Offers' })}
                                    </h2>
                                </div>
                                <Link
                                    to="/dashboard/offers"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest hover:text-amber-100 transition-colors"
                                >
                                    {t('dashboardHome.viewOffers', { defaultValue: 'All Offers' })}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            {recentOffers.length === 0 ? (
                                <div className="rounded-sm border border-dashed border-amber-500/20 p-8 text-center" style={{ background: 'rgba(245,158,11,0.04)' }}>
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-amber-500/12 border border-amber-500/20 text-amber-500 shadow-sm">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <p className="text-base font-semibold text-textPrimary">
                                        {t('dashboardHome.noOffersTitle', { defaultValue: 'No offers yet' })}
                                    </p>
                                    <p className="mt-2 text-sm text-textSecondary max-w-sm mx-auto leading-relaxed">
                                        {t('dashboardHome.noOffersDesc', { defaultValue: 'Generate an offer from a project to see it here.' })}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {recentOffers.map((offer, idx) => (
                                        <Link key={offer.id} to={`/dashboard/offers/${offer.id}`} className="block group">
                                            <div
                                                className="db-offer-card rounded-sm p-4 sm:p-5"
                                                style={{ animationDelay: `${idx * 60}ms` }}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-textPrimary truncate group-hover:text-amber-500 transition-colors">
                                                            {offer.offerNumber}{offer.projectName ? ` — ${offer.projectName}` : ''}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap items-center gap-3">
                                                            <span className="flex items-center gap-1.5 text-[11px] text-textSecondary font-medium">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {formatDate(offer.updatedAt)}
                                                            </span>
                                                            <div className="[&>div]:!rounded-sm">
                                                                <StatusBadge status={offer.status} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 text-left sm:text-right">
                                                        <p className="font-heading text-2xl font-black leading-none text-primary-400">
                                                            {formatCurrency(offer.grandTotal ?? 0)}
                                                        </p>
                                                        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-textSecondary">
                                                            {t('offers.exclVat')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right sidebar */}
                    <aside className="space-y-5">

                        {/* Configurator CTA */}
                        <div className="db-cta-card overflow-hidden rounded-sm p-5 relative">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/30 bg-primary-500/15 text-primary-400 shadow-sm">
                                        <Zap className="h-4.5 w-4.5" />
                                    </div>
                                    <h3 className="text-base font-bold leading-tight text-textPrimary">
                                        {t('dashboardHome.configuratorTitle', { defaultValue: 'Plan Your Smart Home' })}
                                    </h3>
                                </div>
                                <p className="text-xs leading-relaxed text-textSecondary px-1">
                                    {t('dashboardHome.configuratorDesc', { defaultValue: 'Use the configurator to define rooms, smart functions, and create a saved offer.' })}
                                </p>
                                <Button onClick={handleNewConfig} size="md" className="!rounded-sm w-full gap-2 justify-center shadow-md">
                                    {t('nav.configurator')}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Reminders */}
                        <div className="db-sidebar-card rounded-sm overflow-hidden">
                            <div className="bg-primary-600 px-4 py-3 flex items-center justify-between text-white shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <Bell className="h-4 w-4 opacity-90" />
                                    <h3 className="text-sm font-bold leading-none">
                                        {t('dashboardHome.remindersTitle', { defaultValue: 'Reminders' })}
                                    </h3>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                {reminders.length === 0 ? (
                                    <div className="flex items-center gap-2.5 rounded-sm border border-dashed border-blue-500/15 px-3 py-3" style={{ background: 'rgba(59,130,246,0.04)' }}>
                                        <Clock className="h-4 w-4 flex-shrink-0 text-textSecondary" />
                                        <p className="text-[11px] text-textSecondary">
                                            {t('dashboardHome.noReminders', { defaultValue: 'No reminders at the moment.' })}
                                        </p>
                                    </div>
                                ) : (
                                    reminders.slice(0, 5).map((reminder) => (
                                        <Link key={reminder.id} to={`/dashboard/offers/${reminder.offerId}`} className="block group">
                                            <div className="rounded-sm border border-primary-500/10 p-3 transition-all duration-200 hover:border-primary-500/25 group-hover:-translate-y-0.5 shadow-sm hover:shadow-md" style={{ background: 'rgba(96,185,63,0.04)' }}>
                                                <p className="text-sm font-semibold text-textPrimary">{reminder.offerNumber}</p>
                                                <p className="mt-1 text-[10px] text-textSecondary font-medium">
                                                    {formatDate(reminder.nextReminderAt)} — {t(`offers.followupReasons.${reminder.reason === 'unfinished_configuration' ? 'unfinishedConfiguration' : 'offerNotOrdered'}`, { defaultValue: reminder.reason || '' })}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Activity Summary with Chart */}
                        <div className="db-sidebar-card rounded-sm overflow-hidden flex flex-col">
                            <div className="bg-primary-600 px-4 py-3 flex items-center justify-between text-white shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <TrendingUp className="h-4 w-4 opacity-90" />
                                    <h3 className="text-sm font-bold leading-none">Activity</h3>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="space-y-3">
                                    {statCards.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-2.5 w-2.5 rounded-sm flex-shrink-0 shadow-sm" style={{ background: s.color }} />
                                                <span className="text-xs text-textSecondary font-medium truncate max-w-[120px]" title={s.name}>{s.name}</span>
                                            </div>
                                            <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Scoped styles */}
            <style>{`
                .dashboard-main-bg {
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }
                .dashboard-main-bg:hover {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                }

                .db-hero {
                    background: #ffffff;
                    border: 1px solid rgba(96,185,63,0.20);
                    box-shadow: 0 2px 8px rgba(3,18,13,0.04);
                }

                .db-stat-card {
                    background: #ffffff;
                    border: 1px solid var(--sborder);
                    box-shadow: 0 2px 6px rgba(3,18,13,0.03);
                    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                }
                .db-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px var(--sglow), 0 2px 8px rgba(3,18,13,0.05);
                    border-color: var(--sc) !important;
                }

                .db-project-card {
                    background: #ffffff;
                    border: 1px solid rgba(96,185,63,0.15);
                    box-shadow: 0 2px 6px rgba(3,18,13,0.03);
                    animation: slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                }
                .db-project-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(96,185,63,0.35) !important;
                    box-shadow: 0 6px 16px rgba(96,185,63,0.08), 0 2px 8px rgba(3,18,13,0.04);
                }

                .db-offer-card {
                    background: #ffffff;
                    border: 1px solid rgba(245,158,11,0.15);
                    box-shadow: 0 2px 6px rgba(3,18,13,0.03);
                    animation: slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                }
                .db-offer-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(245,158,11,0.35) !important;
                    box-shadow: 0 6px 16px rgba(245,158,11,0.08), 0 2px 8px rgba(3,18,13,0.04);
                }

                .db-mini-stat {
                    background: #ffffff;
                    border: 1px solid rgba(96,185,63,0.12);
                }
                .db-mini-stat:hover {
                    background: rgba(96,185,63,0.03);
                    border-color: rgba(96,185,63,0.20);
                }

                .db-cta-card {
                    background: #ffffff;
                    border: 1px solid rgba(96,185,63,0.20);
                    box-shadow: 0 2px 10px rgba(96,185,63,0.05);
                }

                .db-sidebar-card {
                    background: #ffffff;
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
            `}</style>
        </AnimatedPageWrapper>
    );
}

