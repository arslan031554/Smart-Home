import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Plus,
    Calendar,
    ArrowRight,
    Loader2,
    Layers3,
    Home,
} from 'lucide-react';
import {
    Button,
    Card,
    AnimatedPageWrapper,
    SectionTitle,
    Badge,
    EmptyState,
    Alert,
} from '@/components/common/UIComponents';
import api from '@/utils/api';
import { resetConfigurator } from '@/features/configurator/configuratorSlice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function ProjectsListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        api.get('/projects')
            .then((res) => {
                if (!cancelled) setProjects(Array.isArray(res.data?.data) ? res.data.data : []);
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || t('projects.list.loadError', { defaultValue: 'Failed to load projects.' }));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [t]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const formatDate = (iso) => {
        if (!iso) return '-';
        return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleStartProject = () => {
        dispatch(resetConfigurator());
        navigate('/configurator');
    };

    if (loading) {
        return (
            <AnimatedPageWrapper className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-textSecondary">
                    {t('projects.list.loading', { defaultValue: 'Loading projects...' })}
                </p>
            </AnimatedPageWrapper>
        );
    }

    if (error) {
        return (
            <AnimatedPageWrapper className="mx-auto max-w-xl space-y-4">
                <Alert variant="error">{error}</Alert>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    {t('projects.list.retry', { defaultValue: 'Try again' })}
                </Button>
            </AnimatedPageWrapper>
        );
    }

    return (
        <AnimatedPageWrapper className="mx-auto max-w-6xl space-y-10 pb-20">
            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-6">
                        <SectionTitle
                            title={t('projects.list.title', { defaultValue: 'My Projects' })}
                            subtitle={t('projects.list.subtitle', { defaultValue: 'Review every saved smart-home project, reopen active work, and keep your automation pipeline organized.' })}
                            badge={t('dashboardLayout.projects', { defaultValue: 'Projects' })}
                            className="mb-0"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                {
                                    icon: Briefcase,
                                    label: t('projects.list.total', { defaultValue: 'Total Projects' }),
                                    value: projects.length,
                                },
                                {
                                    icon: Home,
                                    label: t('projects.list.active', { defaultValue: 'Configured Homes' }),
                                    value: projects.length,
                                },
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

                    <Button size="lg" className="gap-2" onClick={handleStartProject}>
                        <Plus className="h-4.5 w-4.5" />
                        {t('projects.list.startNew', { defaultValue: 'Start New Project' })}
                    </Button>
                </div>
            </div>

            {projects.length === 0 ? (
                <Card className="rounded-[2rem]">
                    <EmptyState
                        title={t('projects.list.emptyTitle', { defaultValue: 'No projects yet' })}
                        description={t('projects.list.emptyDescription', { defaultValue: 'Start a new smart-home configuration to create your first project workspace.' })}
                        icon={Layers3}
                        action={(
                            <Button onClick={handleStartProject}>
                                <Plus className="h-4.5 w-4.5" />
                                {t('projects.list.startNew', { defaultValue: 'Start New Project' })}
                            </Button>
                        )}
                    />
                </Card>
            ) : (
                <div className="grid gap-4">
                    {projects.map((project) => (
                        <Link key={project.id} to={`/dashboard/projects/${project.id}`} className="block">
                            <Card hover className="rounded-[1.9rem] p-6">
                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-textPrimary">{project.name}</h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <Badge variant="neutral" className="gap-2">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {t('projects.list.updated', { defaultValue: 'Updated' })} {formatDate(project.updatedAt)}
                                                </Badge>
                                                {project.buildingType?.name ? <Badge variant="primary">{project.buildingType.name}</Badge> : null}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-300">
                                        {t('projects.list.view', { defaultValue: 'View Project' })}
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </AnimatedPageWrapper>
    );
}
