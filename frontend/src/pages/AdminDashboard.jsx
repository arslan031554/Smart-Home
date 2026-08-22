import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Users,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    Monitor,
    FileText,
    ShieldCheck,
    Package,
    ChevronRight,
    Loader2,
    Bell,
    CheckCircle,
    Clock3,
    LayoutDashboard,
    Briefcase,
} from 'lucide-react';
import { Button, AnimatedPageWrapper } from '@/components/common/UIComponents';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStats } from '@/features/admin/adminSlice';
import { fetchAdminOffers } from '@/features/offers/offersSlice';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/components/offers/StatusBadge';
import { isOfferGeneratedStatus, normalizeOfferStatus } from '@/constants/offerStatuses';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { stats = {}, loading: adminLoading } = useSelector((state) => state.admin);
    const { offersList: offers = [], loading: offersLoading } = useSelector((state) => state.offers);

    useEffect(() => {
        dispatch(fetchStats());
        dispatch(fetchAdminOffers({ limit: 5 }));
    }, [dispatch]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const pendingFollowups = stats.pendingFollowups
        ?? offers.filter((offer) => offer.followUp?.enabled && offer.followUp?.status === 'pending').length;
    const orderedOffers = stats.offersByStatus?.ordered
        ?? offers.filter((offer) => normalizeOfferStatus(offer.status) === 'ordered').length;
    const generatedOffers = stats.offersByStatus?.offer_generated
        ?? offers.filter((offer) => isOfferGeneratedStatus(offer.status)).length;

    const dashStats = [
        {
            name: t('adminPages.dashboard.stats.monthlyRevenue', { defaultValue: 'Monthly Revenue' }),
            value: formatCurrency(stats.totalRevenue || 0),
            label: t('adminPages.dashboard.stats.monthlyRevenueLabel', { defaultValue: 'Current reporting window' }),
            icon: TrendingUp,
            color: '#60b93f',
            bg: 'rgba(96,185,63,0.10)',
            border: 'rgba(96,185,63,0.22)',
            glow: 'rgba(96,185,63,0.18)',
        },
        {
            name: t('adminPages.dashboard.stats.totalOffers', { defaultValue: 'Total Offers' }),
            value: stats.totalOffers || 0,
            label: t('adminPages.dashboard.stats.totalOffersLabel', { defaultValue: 'All tracked proposals' }),
            icon: FileText,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.10)',
            border: 'rgba(59,130,246,0.22)',
            glow: 'rgba(59,130,246,0.15)',
        },
        {
            name: t('adminPages.dashboard.stats.totalProjects', { defaultValue: 'Total Projects' }),
            value: stats.totalProjects || 0,
            label: t('adminPages.dashboard.stats.totalProjectsLabel', { defaultValue: 'Across all customers' }),
            icon: Briefcase,
            color: '#0ea5e9',
            bg: 'rgba(14,165,233,0.10)',
            border: 'rgba(14,165,233,0.22)',
            glow: 'rgba(14,165,233,0.15)',
        },
        {
            name: t('adminPages.dashboard.stats.pendingReview', { defaultValue: 'Pending Review' }),
            value: stats.pendingReview || 0,
            label: t('adminPages.dashboard.stats.pendingReviewLabel', { defaultValue: 'Needs admin attention' }),
            icon: AlertTriangle,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.10)',
            border: 'rgba(245,158,11,0.22)',
            glow: 'rgba(245,158,11,0.15)',
        },
        {
            name: t('adminPages.dashboard.stats.activeUsers', { defaultValue: 'Active Users' }),
            value: stats.activeEmployees || 0,
            label: t('adminPages.dashboard.stats.activeUsersLabel', { defaultValue: 'Employee access' }),
            icon: Users,
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.10)',
            border: 'rgba(139,92,246,0.22)',
            glow: 'rgba(139,92,246,0.15)',
        },
    ];

    const quickLinks = [
        { label: t('adminPages.dashboard.quickLinks.projects', { defaultValue: 'All Customer Projects' }), icon: Briefcase, path: '/admin/projects' },
        { label: t('adminPages.dashboard.quickLinks.hardwareCatalog', { defaultValue: 'Hardware Catalog' }), icon: Package, path: '/admin/products' },
        { label: t('adminPages.dashboard.quickLinks.masterData', { defaultValue: 'Master Data' }), icon: Monitor, path: '/admin/building-types' },
        { label: t('adminPages.dashboard.quickLinks.teamManagement', { defaultValue: 'Team Management' }), icon: Users, path: '/admin/employees' },
    ];

    const activityStats = [
        { label: t('offers.adminMonitor.pendingTasks', { count: pendingFollowups, defaultValue: '{{count}} pending follow-ups' }), value: pendingFollowups, icon: Clock3, color: '#f59e0b' },
        { label: t('offers.statuses.offerGenerated', { defaultValue: 'Offer Generated' }), value: generatedOffers, icon: Bell, color: '#3b82f6' },
        { label: t('offers.statuses.ordered', { defaultValue: 'Ordered' }), value: orderedOffers, icon: CheckCircle, color: '#60b93f' },
    ];

    if ((adminLoading || offersLoading) && !offers.length && !stats.totalOffers) {
        return (
            <AnimatedPageWrapper className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-textSecondary">
                    {t('adminPages.dashboard.loading', { defaultValue: 'Loading backoffice overview...' })}
                </p>
            </AnimatedPageWrapper>
        );
    }

    return (
        <AnimatedPageWrapper className="mx-auto mt-4 max-w-7xl px-2 pb-12 sm:px-4 lg:px-6">
            <div className="relative space-y-8">
                <div className="flex flex-col gap-4 overflow-hidden rounded-sm border border-primary-500/16 bg-primary-600/5 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/10 text-primary-400 shadow-sm">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-extrabold leading-tight text-textPrimary sm:text-2xl">
                                {t('adminPages.dashboard.title', { defaultValue: 'Admin Dashboard' })}
                            </h1>
                            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-textSecondary">
                                {t('adminPages.dashboard.subtitle', { defaultValue: 'Monitor offers, teams, product data, and smart-home operations from one workspace.' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Link to="/admin/offers">
                            <Button variant="secondary" size="md" className="!rounded-sm gap-2 shadow-sm">
                                <FileText className="h-4 w-4" />
                                {t('adminPages.dashboard.recentOffersLink', { defaultValue: 'Recent Offers' })}
                            </Button>
                        </Link>
                        <Link to="/admin/employees">
                            <Button size="md" className="!rounded-sm gap-2 shadow-sm">
                                <Users className="h-4 w-4" />
                                {t('adminPages.dashboard.quickLinks.teamManagement', { defaultValue: 'Team Management' })}
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {dashStats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.name}
                                className="admin-stat-card group relative overflow-hidden rounded-sm p-4"
                                style={{
                                    '--sc': stat.color,
                                    '--sb': stat.bg,
                                    '--sborder': stat.border,
                                    '--sglow': stat.glow,
                                    animationDelay: `${idx * 80}ms`,
                                }}
                            >
                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary leading-none">
                                            {stat.name}
                                        </p>
                                        <p className="break-words font-heading text-3xl font-black leading-none sm:text-4xl" style={{ color: stat.color }}>
                                            {stat.value}
                                        </p>
                                        <p className="text-[11px] font-medium leading-snug text-textSecondary">{stat.label}</p>
                                    </div>
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm shadow-sm transition-transform duration-300 group-hover:scale-105"
                                        style={{ background: stat.bg, border: `1px solid ${stat.border}`, color: stat.color }}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_280px]">
                    <section className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3 rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <FileText className="h-4.5 w-4.5 opacity-90" />
                                <h2 className="text-sm font-bold uppercase tracking-wide leading-none">
                                    {t('adminPages.dashboard.recentOffersTitle', { defaultValue: 'Recent Offers' })}
                                </h2>
                            </div>
                            <Link to="/admin/offers" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-primary-100">
                                {t('adminPages.dashboard.recentOffersLink', { defaultValue: 'All Offers' })}
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="admin-table-card overflow-hidden rounded-sm">
                            {offers.length === 0 ? (
                                <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-6 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/12 text-primary-400 shadow-sm">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-textPrimary">{t('adminPages.dashboard.noOffers', { defaultValue: 'No offers to review yet' })}</p>
                                        <p className="mt-2 text-sm text-textSecondary">{t('adminPages.dashboard.noOffersDesc', { defaultValue: 'Generated customer offers will appear here for admin monitoring.' })}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-[#f6f8f3]">
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">{t('adminPages.dashboard.table.idProject', { defaultValue: 'Offer / Project' })}</th>
                                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">{t('adminPages.dashboard.table.status', { defaultValue: 'Status' })}</th>
                                                <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">{t('adminPages.dashboard.table.valueExclVat', { defaultValue: 'Value Excl. VAT' })}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {offers.slice(0, 5).map((offer) => (
                                                <tr
                                                    key={offer.id}
                                                    className="cursor-pointer transition-colors hover:bg-primary-500/5"
                                                    onClick={() => navigate(`/admin/offers/${offer.id}`)}
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-textSecondary">{offer.offerNumber || offer.id}</p>
                                                        <p className="mt-1 text-sm font-semibold text-textPrimary">{offer.projectName || t('adminPages.dashboard.untitledProject', { defaultValue: 'Untitled project' })}</p>
                                                        <p className="mt-1 text-xs text-textSecondary">{formatDate(offer.updatedAt || offer.createdAt)}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="[&>div]:!rounded-sm">
                                                            <StatusBadge status={offer.status} />
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <p className="font-heading text-2xl font-black leading-none text-primary-400">
                                                            {formatCurrency(offer.totalAmount ?? offer.grandTotal ?? 0)}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-5">
                        <div className="admin-sidebar-card overflow-hidden rounded-sm">
                            <div className="flex items-center gap-2.5 bg-primary-600 px-4 py-3 text-white shadow-sm">
                                <ShieldCheck className="h-4 w-4 opacity-90" />
                                <h3 className="text-sm font-bold leading-none">
                                    {t('adminPages.dashboard.quickLinksTitle', { defaultValue: 'Quick Links' })}
                                </h3>
                            </div>
                            <div className="space-y-2 p-4">
                                {quickLinks.map((link) => (
                                    <Link key={link.label} to={link.path} className="block group">
                                        <div className="flex items-center justify-between rounded-sm border border-primary-500/10 bg-primary-500/5 px-3 py-3 transition-all duration-200 hover:border-primary-500/25 hover:bg-primary-500/10">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <link.icon className="h-4 w-4 shrink-0 text-primary-400" />
                                                <span className="truncate text-xs font-semibold text-textPrimary">{link.label}</span>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 shrink-0 text-primary-400" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="admin-sidebar-card overflow-hidden rounded-sm">
                            <div className="flex items-center gap-2.5 bg-primary-600 px-4 py-3 text-white shadow-sm">
                                <TrendingUp className="h-4 w-4 opacity-90" />
                                <h3 className="text-sm font-bold leading-none">{t('adminPages.dashboard.activityTitle', { defaultValue: 'Activity' })}</h3>
                            </div>
                            <div className="space-y-3 p-4">
                                {activityStats.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="flex items-center justify-between gap-3 rounded-sm border border-gray-100 bg-white px-3 py-3 shadow-sm">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <Icon className="h-4 w-4 shrink-0" style={{ color: item.color }} />
                                                <span className="truncate text-xs font-medium text-textSecondary">{item.label}</span>
                                            </div>
                                            <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                .admin-stat-card {
                    background: #ffffff;
                    border: 1px solid var(--sborder);
                    box-shadow: 0 2px 6px rgba(3,18,13,0.03);
                    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                }
                .admin-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px var(--sglow), 0 2px 8px rgba(3,18,13,0.05);
                    border-color: var(--sc) !important;
                }
                .admin-table-card,
                .admin-sidebar-card {
                    background: #ffffff;
                    border: 1px solid rgba(17,24,21,0.10);
                    box-shadow: 0 2px 8px rgba(3,18,13,0.03);
                }
            `}</style>
        </AnimatedPageWrapper>
    );
}
