import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { Button, Card, SectionTitle, DashboardStatsCard, AnimatedPageWrapper, Badge } from '@/components/common/UIComponents';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStats } from '@/features/admin/adminSlice';
import { fetchOffers } from '@/features/offers/offersSlice';
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
        dispatch(fetchOffers());
    }, [dispatch]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

    const pendingFollowups = offers.filter((offer) => offer.followUp?.enabled && offer.followUp?.status === 'pending').length;
    const orderedOffers = offers.filter((offer) => normalizeOfferStatus(offer.status) === 'ordered').length;
    const generatedOffers = offers.filter((offer) => isOfferGeneratedStatus(offer.status)).length;

    const dashStats = [
        {
            name: t('adminPages.dashboard.stats.monthlyRevenue'),
            value: formatCurrency(stats.totalRevenue || 0),
            label: t('adminPages.dashboard.stats.monthlyRevenueLabel'),
            icon: TrendingUp,
            trend: 0,
        },
        {
            name: t('adminPages.dashboard.stats.totalOffers'),
            value: stats.totalOffers || 0,
            label: t('adminPages.dashboard.stats.totalOffersLabel'),
            icon: FileText,
            trend: 0,
        },
        {
            name: t('adminPages.dashboard.stats.pendingReview'),
            value: stats.pendingReview || 0,
            label: t('adminPages.dashboard.stats.pendingReviewLabel'),
            icon: AlertTriangle,
            trend: 0,
        },
        {
            name: t('adminPages.dashboard.stats.activeUsers'),
            value: stats.activeEmployees || 0,
            label: t('adminPages.dashboard.stats.activeUsersLabel'),
            icon: Users,
            trend: 0,
        },
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
        <AnimatedPageWrapper className="space-y-10 pb-20">
            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <SectionTitle
                        title={t('adminPages.dashboard.title')}
                        subtitle={t('adminPages.dashboard.subtitle')}
                        badge={t('adminPages.dashboard.badge')}
                        className="mb-0"
                    />
                    <div className="flex flex-wrap gap-3">
                        <Link to="/admin/offers">
                            <Button variant="secondary" size="lg">
                                {t('adminPages.dashboard.recentOffersLink')}
                            </Button>
                        </Link>
                        <Link to="/admin/employees">
                            <Button size="lg">
                                {t('adminPages.dashboard.quickLinks.teamManagement')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashStats.map((stat, idx) => (
                    <DashboardStatsCard
                        key={stat.name}
                        title={stat.name}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                        trendLabel={stat.label}
                        delay={idx * 0.08}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <SectionTitle
                            title={t('adminPages.dashboard.recentOffersTitle')}
                            badge={t('adminPages.dashboard.recentOffersLink')}
                            className="mb-0"
                        />
                        <Link to="/admin/offers" className="inline-flex items-center gap-2 text-sm font-medium text-primary-300 transition-colors hover:text-primary-200">
                            {t('adminPages.dashboard.recentOffersLink')}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Card className="overflow-hidden rounded-[2rem] p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/8 bg-white/5">
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.dashboard.table.idProject')}</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.dashboard.table.status')}</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('adminPages.dashboard.table.valueExclVat')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/8">
                                    {offers.slice(0, 5).map((offer) => (
                                        <tr
                                            key={offer.id}
                                            className="cursor-pointer transition-colors hover:bg-white/5"
                                            onClick={() => navigate(`/admin/offers/${offer.id}`)}
                                        >
                                            <td className="px-6 py-5">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{offer.id}</p>
                                                <p className="mt-2 text-base font-medium text-textPrimary">{offer.projectName}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={offer.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <p className="font-heading text-3xl font-semibold leading-none text-primary-300">{formatCurrency(offer.totalAmount || 0)}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="hero-frame rounded-[2.1rem] p-8">
                        <div className="space-y-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-heading text-4xl font-semibold leading-none text-textPrimary">
                                    {t('adminPages.dashboard.quickLinksTitle')}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                                    Centralize product data, employee access, and offer monitoring from one premium control surface.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: t('adminPages.dashboard.quickLinks.hardwareCatalog'), icon: Package, path: '/admin/products' },
                                    { label: t('adminPages.dashboard.quickLinks.masterData'), icon: Monitor, path: '/admin/building-types' },
                                    { label: t('adminPages.dashboard.quickLinks.teamManagement'), icon: Users, path: '/admin/employees' },
                                ].map((link) => (
                                    <Link key={link.label} to={link.path} className="block">
                                        <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/5 px-4 py-4 transition-all hover:border-primary-500/18 hover:bg-white/8">
                                            <div className="flex items-center gap-3">
                                                <link.icon className="h-4.5 w-4.5 text-primary-300" />
                                                <span className="text-sm font-medium text-textPrimary">{link.label}</span>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-primary-300" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Card className="rounded-[1.7rem] p-5">
                            <div className="flex items-center gap-3">
                                <Clock3 className="h-5 w-5 text-primary-300" />
                                <div>
                                    <p className="text-lg font-medium text-textPrimary">{t('offers.adminMonitor.pendingTasks', { count: pendingFollowups })}</p>
                                    <p className="text-sm text-textSecondary">{t('offers.adminMonitor.followupTitle')}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="rounded-[1.7rem] p-5">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-primary-300" />
                                <div>
                                    <p className="text-lg font-medium text-textPrimary">{generatedOffers}</p>
                                    <p className="text-sm text-textSecondary">{t('offers.statuses.offerGenerated', { defaultValue: 'Offer Generated' })}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="rounded-[1.7rem] p-5">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-primary-300" />
                                <div>
                                    <p className="text-lg font-medium text-textPrimary">{orderedOffers}</p>
                                    <p className="text-sm text-textSecondary">{t('offers.statuses.ordered')}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AnimatedPageWrapper>
    );
}
