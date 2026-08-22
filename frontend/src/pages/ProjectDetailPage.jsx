import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
    Edit3,
    Trash2,
    Save,
} from 'lucide-react';
import {
    Button,
    Card,
    AnimatedPageWrapper,
    Badge,
    Alert,
    EmptyState,
    Input,
    Modal,
    Select,
} from '@/components/common/UIComponents';
import { StatusBadge } from '@/components/offers/StatusBadge';
import api from '@/utils/api';
import { loadProjectWorkspace, resetConfigurator } from '@/features/configurator/configuratorSlice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

function DetailItem({ icon: Icon, label, value }) {
    return (
        <Card className="rounded-sm p-5 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
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

function DashboardSectionHeader({ icon: Icon, title, subtitle, meta }) {
    return (
        <div className="w-full rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-white/20 bg-white/10 text-white">
                        <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold uppercase leading-tight tracking-wide text-white">
                            {title}
                        </h2>
                        {subtitle ? (
                            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/90">
                                {subtitle}
                            </p>
                        ) : null}
                    </div>
                </div>
                {meta ? (
                    <span className="inline-flex flex-shrink-0 items-center justify-center rounded-sm border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
                        {meta}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
export default function ProjectDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [project, setProject] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [launchingConfigurator, setLaunchingConfigurator] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [mutating, setMutating] = useState(false);
    const [mutationError, setMutationError] = useState('');
    const [editForm, setEditForm] = useState({ name: '', description: '', status: 'active' });
    const isAdminProjectRoute = location.pathname.startsWith('/admin/projects/');
    const backRoute = isAdminProjectRoute ? '/admin/projects' : '/dashboard/projects';
    const offerRoute = (offerId) => isAdminProjectRoute ? `/admin/offers/${offerId}` : `/dashboard/offers/${offerId}`;

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        const offersRequest = isAdminProjectRoute
            ? api.get('/admin/offers', { params: { projectId: id, page: 1, limit: 100 } })
            : api.get('/offers', { params: { projectId: id } });

        Promise.all([
            api.get(`/projects/${id}`),
            offersRequest,
        ])
            .then(([projRes, offRes]) => {
                if (!cancelled) {
                    const offersData = offRes.data?.data;
                    setProject(projRes.data?.data ?? null);
                    setOffers(Array.isArray(offersData)
                        ? offersData
                        : (Array.isArray(offersData?.items) ? offersData.items : []));
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || t('projects.detail.loadError', { defaultValue: 'Failed to load project.' }));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [id, isAdminProjectRoute, t]);

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

    const handleStartProject = async () => {
        if (!id) return;
        setLaunchingConfigurator(true);
        dispatch(resetConfigurator());
        const result = await dispatch(loadProjectWorkspace(id));
        setLaunchingConfigurator(false);
        if (loadProjectWorkspace.fulfilled.match(result)) {
            navigate('/configurator', { state: { workspaceLoaded: true } });
        } else {
            setError(result.payload?.message || t('projects.detail.launchError', { defaultValue: 'Failed to open the configurator for this project.' }));
        }
    };

    const openEditProject = () => {
        setMutationError('');
        setEditForm({
            name: project?.name || '',
            description: project?.description || '',
            status: project?.status || 'active',
        });
        setEditOpen(true);
    };

    const handleSaveProject = async () => {
        if (!project || mutating) return;
        if (!editForm.name.trim()) {
            setMutationError(t('projects.detail.nameRequired', { defaultValue: 'Project name is required.' }));
            return;
        }

        setMutating(true);
        setMutationError('');
        try {
            const response = await api.put(`/projects/${id}`, {
                name: editForm.name.trim(),
                description: editForm.description.trim() || null,
                status: editForm.status,
            });
            setProject(response.data?.data || { ...project, ...editForm });
            setEditOpen(false);
        } catch (error) {
            setMutationError(error.response?.data?.message || t('projects.detail.updateError', { defaultValue: 'Failed to update project.' }));
        } finally {
            setMutating(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!project || mutating) return;
        setMutating(true);
        setMutationError('');
        try {
            await api.delete(`/projects/${id}`);
            navigate(backRoute, { replace: true });
        } catch (error) {
            setMutationError(error.response?.data?.message || t('projects.detail.deleteError', { defaultValue: 'Failed to delete project.' }));
        } finally {
            setMutating(false);
        }
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
                <Link to={backRoute}>
                    <Button variant="outline">{t('projects.detail.back', { defaultValue: 'Back to My Projects' })}</Button>
                </Link>
            </AnimatedPageWrapper>
        );
    }

    const buildingTypeName = project.buildingType?.name || null;

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl pb-12 px-2 sm:px-4 lg:px-6 mt-4">
            <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md relative rounded-sm p-4 sm:p-5 lg:p-6 transition-all duration-700 group/bg space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <Link to={backRoute} className="inline-flex items-center gap-2 text-sm font-medium text-textSecondary transition-colors hover:text-primary-300">
                        <ArrowLeft className="h-4 w-4" />
                        {t('projects.detail.back', { defaultValue: 'Back to My Projects' })}
                    </Link>
                </div>

                <div className="bg-primary-600/5 border border-primary-500/10 overflow-hidden rounded-sm px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4 min-w-0 z-10">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-500/12 text-primary-400 shadow-sm">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold leading-tight text-textPrimary sm:text-2xl">
                                {project.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {buildingTypeName ? <Badge variant="neutral" className="!rounded-sm !py-0.5 !px-2 shadow-sm">{buildingTypeName}</Badge> : null}
                                {project.updatedAt ? (
                                    <Badge variant="neutral" className="gap-1.5 !rounded-sm !py-0.5 !px-2 shadow-sm">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(project.updatedAt)}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="md" className="!rounded-sm gap-2 bg-white" onClick={openEditProject}>
                            <Edit3 className="h-4 w-4" />
                            {t('projects.detail.editProject', { defaultValue: 'Edit Project' })}
                        </Button>
                        <Button variant="danger" size="md" className="!rounded-sm gap-2" onClick={() => {
                            setMutationError('');
                            setDeleteOpen(true);
                        }}>
                            <Trash2 className="h-4 w-4" />
                            {t('projects.detail.deleteProject', { defaultValue: 'Delete Project' })}
                        </Button>
                        <Button size="md" className="!rounded-sm gap-2 shadow-md" onClick={handleStartProject} disabled={launchingConfigurator}>
                            {launchingConfigurator ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {offers.length > 0
                                ? t('projects.detail.createAnotherOffer', { defaultValue: 'Create Another Offer' })
                                : t('projects.detail.createOffer', { defaultValue: 'Create Offer via Configurator' })}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="group relative overflow-hidden rounded-sm p-4 cursor-default border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-all">
                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary leading-none">
                                            {item.label}
                                        </p>
                                        <p className="font-heading text-2xl font-black leading-none text-primary-600">
                                            {item.value}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm transition-transform duration-300 group-hover:scale-110 shadow-sm border border-primary-500/20 bg-primary-500/10 text-primary-500">
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            <section className="space-y-4">
                <DashboardSectionHeader
                    icon={Briefcase}
                    title={t('projects.detail.definitionTitle', { defaultValue: 'Project Definition' })}
                    subtitle={t('projects.detail.definitionSubtitle', { defaultValue: 'Core attributes used to estimate scope, pricing, and smart-home complexity.' })}
                    meta={t('projects.detail.definitionBadge', { defaultValue: 'Technical Brief' })}
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
                    <Card className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
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
                    <Card className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
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
                <DashboardSectionHeader
                    icon={FileText}
                    title={t('projects.detail.offersTitle', { defaultValue: 'Offers for This Project' })}
                    subtitle={t('projects.detail.offersSubtitle', { defaultValue: 'This project can host multiple offers that reuse the same building definition while comparing different ranges, colors, and smart-home configurations.' })}
                    meta={t('projects.detail.offersCount', { defaultValue: '{{count}} offers', count: offers.length })}
                />

                {offers.length === 0 ? (
                    <Card className="rounded-sm bg-white border border-gray-100 shadow-sm">
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
                    <div className="grid gap-3">
                        {offers.map((offer) => (
                            <Link key={offer.id} to={offerRoute(offer.id)} className="block group">
                                <Card hover className="rounded-sm p-5 bg-white border border-gray-100 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-500/30">
                                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="text-lg font-medium text-textPrimary">{offer.offerNumber || offer.id}</p>
                                                <StatusBadge status={offer.status || 'draft'} />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {offer.createdAt ? (
                                                    <Badge variant="neutral" className="gap-1.5 !rounded-sm !py-1 !px-2.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(offer.createdAt)}
                                                    </Badge>
                                                ) : null}
                                                {offer.projectName ? <Badge variant="primary" className="!rounded-sm !py-1 !px-2.5">{offer.projectName}</Badge> : null}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-heading text-2xl font-bold leading-none text-primary-600">
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
            </div>

            <Modal
                isOpen={editOpen}
                onClose={() => {
                    if (!mutating) {
                        setEditOpen(false);
                        setMutationError('');
                    }
                }}
                title={t('projects.detail.editProject', { defaultValue: 'Edit Project' })}
                maxWidth="max-w-xl"
                footer={(
                    <div className="flex w-full justify-end gap-3">
                        <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={mutating}>
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button onClick={handleSaveProject} disabled={mutating} className="gap-2">
                            {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {t('common.save', { defaultValue: 'Save Changes' })}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-5">
                    {mutationError ? <Alert variant="error">{mutationError}</Alert> : null}
                    <Input
                        label={t('projects.detail.projectName', { defaultValue: 'Project Name' })}
                        required
                        value={editForm.name}
                        onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                    />
                    <Select
                        label={t('projects.detail.status', { defaultValue: 'Status' })}
                        value={editForm.status}
                        onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}
                    >
                        <option value="draft">{t('projects.statuses.draft', { defaultValue: 'Draft' })}</option>
                        <option value="active">{t('projects.statuses.active', { defaultValue: 'Active' })}</option>
                        <option value="archived">{t('projects.statuses.archived', { defaultValue: 'Archived' })}</option>
                    </Select>
                    <div className="space-y-2">
                        <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                            {t('projects.detail.projectDescription', { defaultValue: 'Project Description' })}
                        </label>
                        <textarea
                            rows={5}
                            value={editForm.description}
                            onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                            className="w-full rounded-lg border border-emerald/18 bg-white/95 px-3.5 py-3 text-sm font-medium text-textPrimary shadow-soft transition-all focus:border-emerald/45 focus:outline-none focus:ring-4 focus:ring-emerald/12"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteOpen}
                onClose={() => {
                    if (!mutating) {
                        setDeleteOpen(false);
                        setMutationError('');
                    }
                }}
                title={t('projects.detail.deleteProject', { defaultValue: 'Delete Project' })}
                maxWidth="max-w-md"
                footer={(
                    <div className="flex w-full justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={mutating}>
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button variant="danger" onClick={handleDeleteProject} disabled={mutating} className="gap-2">
                            {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {t('projects.detail.confirmDelete', { defaultValue: 'Delete Project' })}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-50 text-red-600">
                        <Trash2 className="h-7 w-7" />
                    </div>
                    <p className="font-semibold text-textPrimary">{project.name}</p>
                    <p className="text-sm leading-relaxed text-textSecondary">
                        {t('projects.detail.deleteWarning', { defaultValue: 'Deleting this project also permanently deletes all of its offers and generated documents. This action cannot be undone.' })}
                    </p>
                    {mutationError ? <Alert variant="error">{mutationError}</Alert> : null}
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}
