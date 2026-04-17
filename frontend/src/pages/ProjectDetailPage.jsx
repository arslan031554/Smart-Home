import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    FileText,
    ArrowLeft,
    Loader2,
    Plus,
    Layers,
    MapPin,
    Hash,
    Gauge,
    Info,
    Calendar,
    ArrowRight,
    Home,
} from 'lucide-react';
import {
    Button,
    Card,
    AnimatedPageWrapper,
    SectionTitle,
    Badge,
    Alert,
    EmptyState,
} from '@/components/common/UIComponents';
import { StatusBadge } from '@/components/offers/StatusBadge';
import api from '@/utils/api';
import { resetConfigurator } from '@/features/configurator/configuratorSlice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

function DetailItem({ icon: Icon, label, value }) {
    return (
        <Card className="rounded-[1.7rem] p-5">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                    <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{label}</p>
                    <p className="mt-2 text-sm font-medium text-textPrimary">{value || '-'}</p>
                </div>
            </div>
        </Card>
    );
}

export default function ProjectDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [project, setProject] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        Promise.all([
            api.get(`/projects/${id}`),
            api.get('/offers', { params: { projectId: id } }),
        ])
            .then(([projRes, offRes]) => {
                if (!cancelled) {
                    setProject(projRes.data?.data ?? null);
                    setOffers(Array.isArray(offRes.data?.data) ? offRes.data.data : []);
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || t('projects.detail.loadError', { defaultValue: 'Failed to load project.' }));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [id, t]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
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

    const handleStartProject = () => {
        dispatch(resetConfigurator());
        navigate('/configurator');
    };

    if (loading) {
        return (
            <AnimatedPageWrapper className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-textSecondary">
                    {t('projects.detail.loading', { defaultValue: 'Loading project...' })}
                </p>
            </AnimatedPageWrapper>
        );
    }

    if (error || !project) {
        return (
            <AnimatedPageWrapper className="mx-auto max-w-xl space-y-4">
                <Alert variant="error">{error || t('projects.detail.notFound', { defaultValue: 'Project not found.' })}</Alert>
                <Link to="/dashboard/projects">
                    <Button variant="outline">{t('projects.detail.back', { defaultValue: 'Back to My Projects' })}</Button>
                </Link>
            </AnimatedPageWrapper>
        );
    }

    const buildingTypeName = project.buildingType?.name || null;

    return (
        <AnimatedPageWrapper className="mx-auto max-w-6xl space-y-10 pb-20">
            <div className="flex items-center justify-between gap-4">
                <Link to="/dashboard/projects" className="inline-flex items-center gap-2 text-sm font-medium text-textSecondary transition-colors hover:text-primary-300">
                    <ArrowLeft className="h-4 w-4" />
                    {t('projects.detail.back', { defaultValue: 'Back to My Projects' })}
                </Link>
            </div>

            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="primary" className="gap-2">
                                <Briefcase className="h-3.5 w-3.5" />
                                {t('dashboardLayout.projects', { defaultValue: 'Projects' })}
                            </Badge>
                            {buildingTypeName ? <Badge variant="neutral">{buildingTypeName}</Badge> : null}
                            {project.updatedAt ? (
                                <Badge variant="neutral" className="gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(project.updatedAt)}
                                </Badge>
                            ) : null}
                        </div>

                        <SectionTitle
                            title={project.name}
                            subtitle={t('projects.detail.subtitle', { defaultValue: 'Project definition, building details, and generated offers for this smart-home workspace.' })}
                            badge={t('projects.detail.reference', { defaultValue: 'Project Reference' })}
                            className="mb-0"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                {
                                    icon: Home,
                                    label: t('projects.detail.buildingType', { defaultValue: 'Building Type' }),
                                    value: buildingTypeName || '-',
                                },
                                {
                                    icon: FileText,
                                    label: t('projects.detail.offers', { defaultValue: 'Offers' }),
                                    value: offers.length,
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
                        {t('projects.detail.createOffer', { defaultValue: 'Create Offer via Configurator' })}
                    </Button>
                </div>
            </div>

            <section className="space-y-4">
                <SectionTitle
                    title={t('projects.detail.definitionTitle', { defaultValue: 'Project Definition' })}
                    subtitle={t('projects.detail.definitionSubtitle', { defaultValue: 'Core attributes used to estimate scope, pricing, and smart-home complexity.' })}
                    badge={t('projects.detail.definitionBadge', { defaultValue: 'Technical Brief' })}
                    className="mb-0"
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DetailItem icon={Briefcase} label={t('projects.detail.buildingType', { defaultValue: 'Building Type' })} value={project.buildingType?.name} />
                    <DetailItem icon={Layers} label={t('projects.detail.levels', { defaultValue: 'Levels' })} value={project.levelsCount ? `${project.levelsCount}` : null} />
                    <DetailItem icon={MapPin} label={t('projects.detail.builtUpArea', { defaultValue: 'Built-up Area' })} value={project.builtUpArea ? `${project.builtUpArea} m²` : null} />
                    <DetailItem icon={Hash} label={t('projects.detail.multiplier', { defaultValue: 'Multiplication Index' })} value={project.multiplicationIndex ? `x ${project.multiplicationIndex}` : null} />
                    <DetailItem icon={Gauge} label={t('projects.detail.complexity', { defaultValue: 'Project Complexity' })} value={project.projectComplexity} />
                    <DetailItem icon={Calendar} label={t('projects.detail.updated', { defaultValue: 'Last Updated' })} value={formatDate(project.updatedAt || project.createdAt)} />
                </div>

                {project.buildingType?.description ? (
                    <Card className="rounded-[1.8rem] p-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Info className="h-5 w-5 text-primary-300" />
                                <h3 className="text-lg font-medium text-textPrimary">{t('projects.detail.buildingDescription', { defaultValue: 'Building Description' })}</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-textSecondary">{project.buildingType.description}</p>
                        </div>
                    </Card>
                ) : null}

                {project.description ? (
                    <Card className="rounded-[1.8rem] p-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary-300" />
                                <h3 className="text-lg font-medium text-textPrimary">{t('projects.detail.projectDescription', { defaultValue: 'Project Description' })}</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-textSecondary">{project.description}</p>
                        </div>
                    </Card>
                ) : null}
            </section>

            <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <SectionTitle
                        title={t('projects.detail.offersTitle', { defaultValue: 'Offers for This Project' })}
                        subtitle={t('projects.detail.offersSubtitle', { defaultValue: 'Generated offers linked to this project workspace.' })}
                        badge={t('projects.detail.offers', { defaultValue: 'Offers' })}
                        className="mb-0"
                    />
                    <Badge variant="neutral">{t('projects.detail.offersCount', { defaultValue: '{{count}} offers', count: offers.length })}</Badge>
                </div>

                {offers.length === 0 ? (
                    <Card className="rounded-[2rem]">
                        <EmptyState
                            title={t('projects.detail.emptyOffersTitle', { defaultValue: 'No offers yet for this project' })}
                            description={t('projects.detail.emptyOffersDescription', { defaultValue: 'Open the configurator to generate the first commercial offer for this smart-home setup.' })}
                            icon={FileText}
                            action={(
                                <Button onClick={handleStartProject}>
                                    <Plus className="h-4.5 w-4.5" />
                                    {t('projects.detail.createOffer', { defaultValue: 'Create Offer via Configurator' })}
                                </Button>
                            )}
                        />
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {offers.map((offer) => (
                            <Link key={offer.id} to={`/dashboard/offers/${offer.id}`} className="block">
                                <Card hover className="rounded-[1.9rem] p-6">
                                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="text-lg font-medium text-textPrimary">{offer.offerNumber || offer.id}</p>
                                                <StatusBadge status={offer.status || 'draft'} />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                {offer.createdAt ? (
                                                    <Badge variant="neutral" className="gap-2">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatDate(offer.createdAt)}
                                                    </Badge>
                                                ) : null}
                                                {offer.projectName ? <Badge variant="primary">{offer.projectName}</Badge> : null}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-heading text-3xl font-semibold leading-none text-primary-300">
                                                    {formatCurrency(offer.grandTotal ?? offer.totalAmount ?? 0)}
                                                </p>
                                                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                                    {t('offers.exclVat')}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4.5 w-4.5 text-primary-300" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </AnimatedPageWrapper>
    );
}
