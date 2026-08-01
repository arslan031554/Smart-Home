import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, Loader2, Mail, Search, UserRound } from 'lucide-react';
import { AnimatedPageWrapper, Badge, Card, EmptyState, SectionTitle } from '@/components/common/UIComponents';
import api from '@/utils/api';
import { useTranslation } from 'react-i18next';

function buildProjectsFromOffers(offers = []) {
    const projects = new Map();
    offers.forEach((offer) => {
        const projectId = offer.projectId || offer.projectName || offer.id;
        if (!projectId || projects.has(projectId)) return;
        projects.set(projectId, {
            id: projectId,
            name: offer.projectName || 'Project',
            buildingType: offer.buildingType || '',
            updatedAt: offer.updatedAt,
            customer: {
                fullName: offer.customerName || '',
                email: offer.customerEmail || '',
            },
            offersCount: offers.filter((item) => (item.projectId || item.projectName || item.id) === projectId).length,
        });
    });
    return Array.from(projects.values());
}
async function fetchAllAdminOfferItems() {
    const limit = 100;
    let page = 1;
    let totalPages = 1;
    const offers = [];

    do {
        const response = await api.get('/admin/offers', { params: { limit, page } });
        const data = response.data?.data || {};
        offers.push(...(Array.isArray(data.items) ? data.items : []));
        totalPages = Number(data.totalPages || 1);
        page += 1;
    } while (page <= totalPages);

    return offers;
}
export default function AdminProjectsMonitor() {
    const { t, i18n } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get('/admin/projects')
            .then((res) => {
                if (!cancelled) setProjects(Array.isArray(res.data?.data) ? res.data.data : []);
            })
            .catch(async (err) => {
                if (err.response?.status === 404) {
                    try {
                        const items = await fetchAllAdminOfferItems();
                        if (!cancelled) setProjects(buildProjectsFromOffers(items));
                        return;
                    } catch (fallbackErr) {
                        if (!cancelled) setError(fallbackErr.response?.data?.message || t('adminProjects.loadError', { defaultValue: 'Failed to load projects.' }));
                        return;
                    }
                }
                if (!cancelled) setError(err.response?.data?.message || t('adminProjects.loadError', { defaultValue: 'Failed to load projects.' }));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [t]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const filteredProjects = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return projects;
        return projects.filter((project) => [
            project.name,
            project.buildingType,
            project.customer?.fullName,
            project.customer?.email,
        ].some((value) => String(value || '').toLowerCase().includes(term)));
    }, [projects, search]);

    if (loading) {
        return (
            <AnimatedPageWrapper className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-3 text-textSecondary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('adminProjects.loading', { defaultValue: 'Loading projects...' })}
                </div>
            </AnimatedPageWrapper>
        );
    }

    return (
        <AnimatedPageWrapper className="space-y-8 pb-20">
            <div className="hero-frame rounded-[2.2rem] px-6 py-8 sm:px-8">
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionTitle
                        title={t('adminProjects.title', { defaultValue: 'All Customer Projects' })}
                        subtitle={t('adminProjects.subtitle', { defaultValue: 'Admin-only view of every customer project and its linked offer count.' })}
                        badge={t('adminProjects.badge', { defaultValue: 'Admin Projects' })}
                        className="mb-0"
                    />
                    <div className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('adminProjects.search', { defaultValue: 'Search project, client, email...' })}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                        />
                    </div>
                </div>
            </div>

            {error ? <Card className="rounded-[1.5rem] p-5 text-sm text-red-300">{error}</Card> : null}

            {filteredProjects.length === 0 ? (
                <Card className="rounded-[2rem] p-8">
                    <EmptyState
                        icon={Briefcase}
                        title={t('adminProjects.emptyTitle', { defaultValue: 'No projects found' })}
                        description={t('adminProjects.emptyDescription', { defaultValue: 'Projects created by customers will appear here for admin review.' })}
                    />
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} hover className="rounded-[1.7rem] p-5">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-medium text-textPrimary">{project.name || project.id}</h3>
                                            <Badge variant="neutral">{project.buildingType || t('adminProjects.noBuildingType', { defaultValue: 'No building type' })}</Badge>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-textSecondary">
                                            <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4" />{project.customer?.fullName || t('adminProjects.unknownCustomer', { defaultValue: 'Unknown customer' })}</span>
                                            {project.customer?.email ? <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{project.customer.email}</span> : null}
                                            <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(project.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                                    <Badge variant="primary">{t('adminProjects.offersCount', { count: project.offersCount || 0, defaultValue: '{{count}} offers' })}</Badge>
                                    <Link to={`/admin/offers?projectId=${encodeURIComponent(project.id)}&project=${encodeURIComponent(project.name || project.id)}`} className="text-sm font-medium text-primary-300 transition-colors hover:text-primary-200">
                                        {t('adminProjects.viewOffers', { defaultValue: 'View Offers' })}
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </AnimatedPageWrapper>
    );
}