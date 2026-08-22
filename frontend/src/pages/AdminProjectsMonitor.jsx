import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, Loader2, Mail, Search, UserRound, Settings2 } from 'lucide-react';
import { AnimatedPageWrapper, Badge, Card, EmptyState, SectionTitle } from '@/components/common/UIComponents';
import api from '@/utils/api';
import { useTranslation } from 'react-i18next';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeProjectId(value) {
    const projectId = String(value || '').trim();
    return UUID_PATTERN.test(projectId) ? projectId : '';
}

function buildProjectsFromOffers(offers = []) {
    const projects = new Map();
    offers.forEach((offer) => {
        const projectId = normalizeProjectId(offer.projectId);
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
            offersCount: offers.filter((item) => normalizeProjectId(item.projectId) === projectId).length,
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
                    <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                    <span className="font-bold uppercase tracking-widest text-[11px]">{t('adminProjects.loading', { defaultValue: 'Loading projects...' })}</span>
                </div>
            </AnimatedPageWrapper>
        );
    }

    return (
        <AnimatedPageWrapper className="space-y-8 pb-20">
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                            <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                {t('adminProjects.badge', { defaultValue: 'Admin Projects' })}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                            {t('adminProjects.title', { defaultValue: 'All Customer Projects' })}
                        </h1>
                        <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                            {t('adminProjects.subtitle', { defaultValue: 'Admin-only view of every customer project and its linked offer count.' })}
                        </p>
                    </div>

                    <div className="relative w-full lg:max-w-xs self-end lg:self-start">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('adminProjects.search', { defaultValue: 'Search project, client, email...' })}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {error ? <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-5 mb-6 text-sm text-red-600 font-medium">{error}</div> : null}

            {filteredProjects.length === 0 ? (
                <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-8">
                    <EmptyState
                        icon={Briefcase}
                        title={t('adminProjects.emptyTitle', { defaultValue: 'No projects found' })}
                        description={t('adminProjects.emptyDescription', { defaultValue: 'Projects created by customers will appear here for admin review.' })}
                    />
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-500/30 hover:-translate-y-1 transition-all duration-300 rounded-sm p-6 group">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-800">{project.name || project.id}</h3>
                                            <Badge variant="neutral" className="!rounded-sm bg-gray-100 border-gray-200 text-gray-700 shadow-sm">{project.buildingType || t('adminProjects.noBuildingType', { defaultValue: 'No building type' })}</Badge>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium">
                                            <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4 text-primary-400" />{project.customer?.fullName || t('adminProjects.unknownCustomer', { defaultValue: 'Unknown customer' })}</span>
                                            {project.customer?.email ? <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary-400" />{project.customer.email}</span> : null}
                                            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary-400" />{formatDate(project.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                                    <Badge variant="primary" className="!rounded-sm shadow-sm">{t('adminProjects.offersCount', { count: project.offersCount || 0, defaultValue: '{{count}} offers' })}</Badge>
                                    {normalizeProjectId(project.id) ? (
                                        <>
                                            <Link to={`/admin/projects/${normalizeProjectId(project.id)}`} className="text-[11px] font-bold uppercase tracking-wider text-primary-600 transition-colors hover:text-primary-700 hover:underline flex items-center gap-1">
                                                <Settings2 className="h-3.5 w-3.5" />
                                                {t('adminProjects.manage', { defaultValue: 'Manage Project' })}
                                            </Link>
                                            <Link to={`/admin/offers?projectId=${encodeURIComponent(normalizeProjectId(project.id))}&project=${encodeURIComponent(project.name || project.id)}`} className="text-[11px] font-bold uppercase tracking-wider text-primary-600 transition-colors hover:text-primary-700 hover:underline flex items-center gap-1">
                                                {t('adminProjects.viewOffers', { defaultValue: 'View Offers' })}
                                            </Link>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AnimatedPageWrapper>
    );
}
