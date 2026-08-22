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
    Zap,
    Hash,
    Gauge,
    Archive,
    FileText,
} from 'lucide-react';
import {
    Button,
    Card,
    AnimatedPageWrapper,
    Badge,
    EmptyState,
    Alert,
} from '@/components/common/UIComponents';
import api from '@/utils/api';
import { resetConfigurator } from '@/features/configurator/configuratorSlice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { dedupeProjectsById, getProjectTitle } from '@/utils/projectUtils';

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
                if (!cancelled) setProjects(dedupeProjectsById(Array.isArray(res.data?.data) ? res.data.data : []));
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

    const formatArea = (value) => {
        const area = Number(value || 0);
        return area > 0 ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(area)} m2` : '-';
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

    const handleStartProject = () => {
        dispatch(resetConfigurator());
        navigate('/configurator', { state: { freshConfigurator: true } });
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

    const activeProjects = projects.filter(p => String(p.status || '').toLowerCase() === 'active').length;
    const archivedProjects = projects.filter(p => String(p.status || '').toLowerCase() === 'archived').length;
    const draftProjects = projects.filter(p => {
        const s = String(p.status || '').toLowerCase();
        return s !== 'active' && s !== 'archived';
    }).length;

    const statCards = [
        {
            name: t('projects.list.stats.total', { defaultValue: 'Total Projects' }),
            value: projects.length,
            icon: Layers3,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.10)',
            border: 'rgba(59,130,246,0.22)',
            glow: 'rgba(59,130,246,0.15)',
        },
        {
            name: t('projects.list.stats.active', { defaultValue: 'Active Projects' }),
            value: activeProjects,
            icon: Briefcase,
            color: '#60b93f',
            bg: 'rgba(96,185,63,0.10)',
            border: 'rgba(96,185,63,0.22)',
            glow: 'rgba(96,185,63,0.18)',
        },
        {
            name: t('projects.list.stats.draft', { defaultValue: 'Draft Projects' }),
            value: draftProjects,
            icon: FileText,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.10)',
            border: 'rgba(245,158,11,0.22)',
            glow: 'rgba(245,158,11,0.15)',
        },
        {
            name: t('projects.list.stats.archived', { defaultValue: 'Archived Projects' }),
            value: archivedProjects,
            icon: Archive,
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.10)',
            border: 'rgba(139,92,246,0.22)',
            glow: 'rgba(139,92,246,0.15)',
        },
    ];

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl pb-12 px-2 sm:px-4 lg:px-6 mt-4">
            <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md relative rounded-sm p-4 sm:p-5 lg:p-6 transition-all duration-700 group/bg space-y-8">
                <div className="bg-primary-600/5 border border-primary-500/10 overflow-hidden rounded-sm px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 min-w-0 z-10">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/12 text-primary-400 shadow-sm">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold leading-tight text-textPrimary sm:text-2xl">
                                {t('projects.list.title', { defaultValue: 'My Projects' })}
                            </h1>
                            <p className="text-xs leading-relaxed text-textSecondary mt-1">
                                {t('projects.list.subtitle', { defaultValue: 'Review every saved smart-home project, reopen active work, and keep your automation pipeline organized.' })}
                            </p>
                        </div>
                    </div>
                    <Button size="md" className="!rounded-sm gap-2 flex-shrink-0 self-start sm:self-center shadow-md relative z-10" onClick={handleStartProject}>
                        <Plus className="h-4 w-4" />
                        {t('projects.list.startNew', { defaultValue: 'Start New Project' })}
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

            {projects.length === 0 ? (
                <Card className="rounded-sm shadow-sm bg-white border border-gray-100">
                    <EmptyState
                        title={t('projects.list.emptyTitle', { defaultValue: 'No projects yet' })}
                        description={t('projects.list.emptyDescription', { defaultValue: 'Start a new smart-home configuration to create your first project workspace.' })}
                        icon={Layers3}
                        action={(
                            <Button onClick={handleStartProject} className="!rounded-sm">
                                <Plus className="h-4 w-4" />
                                {t('projects.list.startNew', { defaultValue: 'Start New Project' })}
                            </Button>
                        )}
                    />
                </Card>
            ) : (
                <div className="grid gap-3">
                    {projects.map((project, idx) => {
                        const projectTitle = getProjectTitle(project);
                        const buildingTypeName = project.buildingTypeName || project.buildingType?.name || null;

                        return (
                            <Link key={project.id} to={`/dashboard/projects/${project.id}`} className="block group">
                                <div
                                    className="db-project-card rounded-sm p-4 sm:p-5"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
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
                                            {t('projects.list.view', { defaultValue: 'View Project' })}
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
            </div>

            {/* Scoped styles */}
            <style>{`
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

                .db-mini-stat {
                    background: #ffffff;
                    border: 1px solid rgba(96,185,63,0.12);
                }
                .db-mini-stat:hover {
                    background: rgba(96,185,63,0.03);
                    border-color: rgba(96,185,63,0.20);
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </AnimatedPageWrapper>
    );
}

