import { useEffect, useMemo } from 'react';
import {
    LayoutDashboard, Briefcase, Bell, ArrowRight, Plus, Calendar, FileText, Zap, Loader2, Home, Layers3, Gauge, Hash,
} from 'lucide-react';
import { Button, Badge, Alert, Card, AnimatedPageWrapper, SectionTitle } from '@/components/common/UIComponents';
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
    const statCards = [
        { name: t('dashboardHome.stats.activeProjects', { defaultValue: 'Active Projects' }), value: stats.activeProjects || 0, icon: Briefcase },
        { name: t('dashboardHome.stats.pendingOffers', { defaultValue: 'Pending Offers' }), value: pendingOffersCount, icon: Bell },
        { name: t('dashboardHome.stats.offerReady', { defaultValue: 'Offers Ready' }), value: stats.offerReady || 0, icon: FileText },
        { name: t('dashboardHome.stats.draftOffers', { defaultValue: 'Draft Offers' }), value: stats.draftOffers || 0, icon: LayoutDashboard },
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
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-10 pb-20">
            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-20 top-0 h-60 w-60 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                        <Badge variant="info" className="gap-2">
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            {t('nav.dashboard')}
                        </Badge>
                        <div className="space-y-3">
                            <h1 className="font-heading text-5xl font-semibold leading-none text-textPrimary sm:text-6xl">
                                {displayName}
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base">
                                {t('dashboardHome.welcome', {
                                    defaultValue: 'Welcome back, {{name}}. You currently have {{count}} offers waiting for a decision.',
                                    name: displayName,
                                    count: pendingOffersCount,
                                })}
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleNewConfig} size="md" className="gap-2">
                        <Plus className="h-4.5 w-4.5" />
                        {t('dashboardHome.startProject', { defaultValue: 'Start New Project' })}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.name} className="h-full rounded-[1.8rem] p-6">
                        <div className="flex h-full items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{stat.name}</p>
                                <p className="mt-3 font-heading text-5xl font-semibold leading-none text-textPrimary">{stat.value}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <SectionTitle
                                title={t('dashboardHome.recentProjects', { defaultValue: 'Recent Projects' })}
                                badge={t('dashboardLayout.projects')}
                                className="mb-0"
                            />
                            <Link to="/dashboard/projects" className="text-sm font-medium text-primary-300 transition-colors hover:text-primary-200">
                                {t('dashboardHome.viewProjects', { defaultValue: 'All Projects' })}
                            </Link>
                        </div>

                        {uniqueRecentProjects.length === 0 ? (
                            <Card className="rounded-[2rem] p-8 text-center">
                                <p className="text-lg font-medium text-textPrimary">{t('dashboardHome.noProjectsTitle', { defaultValue: 'No projects yet' })}</p>
                                <p className="mt-2 text-sm text-textSecondary">{t('dashboardHome.noProjectsDesc', { defaultValue: 'Start a new smart home configuration to see your saved projects here.' })}</p>
                                <Button onClick={handleNewConfig} size="md" className="mt-6">
                                    {t('dashboardHome.startProject', { defaultValue: 'Start New Project' })}
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {uniqueRecentProjects.map((project) => {
                                    const projectTitle = getProjectTitle(project);
                                    const buildingTypeName = project.buildingTypeName || project.buildingType?.name || null;

                                    return (
                                        <Link key={project.id} to={`/dashboard/projects/${project.id}`} className="block">
                                            <Card hover className="rounded-[1.9rem] p-6">
                                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="min-w-0 flex-1 space-y-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                                                <Briefcase className="h-5 w-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="truncate text-lg font-medium text-textPrimary">{projectTitle}</h3>
                                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                    <Badge variant="neutral" className="gap-2">
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                        {formatDate(project.updatedAt)}
                                                                    </Badge>
                                                                    {buildingTypeName ? <Badge variant="primary" className="gap-2"><Home className="h-3.5 w-3.5" />{buildingTypeName}</Badge> : null}
                                                                    <Badge variant={getProjectStatusVariant(project.status)}>
                                                                        {t(`projects.statuses.${project.status || 'draft'}`, { defaultValue: project.status || 'draft' })}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                                                                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-textSecondary"><Layers3 className="h-3.5 w-3.5" />{t('projects.detail.levels', { defaultValue: 'Levels' })}</p>
                                                                <p className="mt-1 text-sm font-medium text-textPrimary">{project.levelsCount || '-'}</p>
                                                            </div>
                                                            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                                                                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-textSecondary"><Gauge className="h-3.5 w-3.5" />{t('projects.detail.builtUpArea', { defaultValue: 'Built-up Area' })}</p>
                                                                <p className="mt-1 text-sm font-medium text-textPrimary">{formatArea(project.builtUpArea)}</p>
                                                            </div>
                                                            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                                                                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-textSecondary"><Hash className="h-3.5 w-3.5" />{t('projects.detail.multiplier', { defaultValue: 'Multiplier' })}</p>
                                                                <p className="mt-1 text-sm font-medium text-textPrimary">{formatMultiplier(project.multiplicationIndex)}</p>
                                                            </div>
                                                            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                                                                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-textSecondary"><Zap className="h-3.5 w-3.5" />{t('projects.detail.complexity', { defaultValue: 'Complexity' })}</p>
                                                                <p className="mt-1 truncate text-sm font-medium text-textPrimary">{project.projectComplexity || '-'}</p>
                                                            </div>
                                                        </div>

                                                        {project.description ? (
                                                            <p className="text-sm leading-relaxed text-textSecondary">{project.description}</p>
                                                        ) : null}
                                                    </div>
                                                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-primary-300">
                                                        {t('dashboardHome.open', { defaultValue: 'Open' })}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </span>
                                                </div>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <SectionTitle
                                title={t('dashboardHome.recentOffers', { defaultValue: 'Recent Offers' })}
                                badge={t('dashboardLayout.offers')}
                                className="mb-0"
                            />
                            <Link to="/dashboard/offers" className="text-sm font-medium text-primary-300 transition-colors hover:text-primary-200">
                                {t('dashboardHome.viewOffers', { defaultValue: 'All Offers' })}
                            </Link>
                        </div>

                        {recentOffers.length === 0 ? (
                            <Card className="rounded-[2rem] p-8 text-center">
                                <p className="text-lg font-medium text-textPrimary">{t('dashboardHome.noOffersTitle', { defaultValue: 'No offers yet' })}</p>
                                <p className="mt-2 text-sm text-textSecondary">{t('dashboardHome.noOffersDesc', { defaultValue: 'Generate an offer from a project to see it here.' })}</p>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {recentOffers.map((offer) => (
                                    <Link key={offer.id} to={`/dashboard/offers/${offer.id}`} className="block">
                                        <Card hover className="rounded-[1.9rem] p-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-textPrimary">
                                                        {offer.offerNumber} {offer.projectName ? `- ${offer.projectName}` : ''}
                                                    </h3>
                                                    <div className="mt-2 flex flex-wrap items-center gap-3">
                                                        <span className="flex items-center gap-2 text-sm text-textSecondary">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(offer.updatedAt)}
                                                        </span>
                                                        <StatusBadge status={offer.status} />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-heading text-4xl font-semibold leading-none text-primary-300">{formatCurrency(offer.grandTotal ?? 0)}</p>
                                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{t('offers.exclVat')}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="hero-frame p-8">
                        <div className="space-y-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-heading text-2xl font-semibold leading-tight text-textPrimary sm:text-3xl">
                                    {t('dashboardHome.configuratorTitle', { defaultValue: 'Plan Your Smart Home' })}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                                    {t('dashboardHome.configuratorDesc', { defaultValue: 'Use the configurator to define rooms, smart functions, and create a saved offer.' })}
                                </p>
                            </div>
                            <Button onClick={handleNewConfig} size="md" className="w-full gap-2">
                                {t('nav.configurator')}
                                <ArrowRight className="h-4.5 w-4.5" />
                            </Button>
                        </div>
                    </div>

                    <Card className="rounded-[2rem] p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('dashboardHome.remindersTitle', { defaultValue: 'Follow-up Reminders' })}</h3>
                                <p className="text-sm text-textSecondary">{t('dashboardHome.viewOffers', { defaultValue: 'All Offers' })}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {reminders.length === 0 ? (
                                <p className="text-sm text-textSecondary">{t('dashboardHome.noReminders', { defaultValue: 'No reminders at the moment.' })}</p>
                            ) : (
                                reminders.slice(0, 5).map((reminder) => (
                                    <Link key={reminder.id} to={`/dashboard/offers/${reminder.offerId}`} className="block">
                                        <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4 transition-all hover:border-primary-500/18 hover:bg-white/8">
                                            <p className="text-sm font-medium text-textPrimary">{reminder.offerNumber}</p>
                                            <p className="mt-2 text-sm text-textSecondary">
                                                {formatDate(reminder.nextReminderAt)} - {t(`offers.followupReasons.${reminder.reason === 'unfinished_configuration' ? 'unfinishedConfiguration' : 'offerNotOrdered'}`, { defaultValue: reminder.reason || '' })}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </Card>
                </aside>
            </div>
        </AnimatedPageWrapper>
    );
}

