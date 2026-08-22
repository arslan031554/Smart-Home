import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminPortfolioProjects, addPortfolioProject, updatePortfolioProject, deletePortfolioProject } from '../features/portfolio/portfolioSlice';
import { Plus, Search, Edit, Trash2, Save, X, Image as ImageIcon, Briefcase, Loader2, Upload } from 'lucide-react';
import { Button, Badge, Card, Modal, EmptyState, SectionTitle, Input, AnimatedPageWrapper, Skeleton } from '../components/common/UIComponents';
import api from '../utils/api';
import { clsx } from 'clsx';
import { normalizeApiError } from '../utils/normalizeApiError';
import { useTranslation } from 'react-i18next';

const defaultFormState = {
    title: '',
    type: 'Residential home',
    location: '',
    result: '',
    description: '',
    images: [],
    isActive: true,
    displayOrder: 0
};

const PROJECT_TYPES = [
    'Residential home', 'Office building', 'Hotel 4*', 'Hospital', 'Factory', 'Warehouse'
];

export default function AdminPortfolioManagement() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { adminProjects: projects, loading } = useSelector((state) => state.portfolio);

    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(defaultFormState);
    const [editingId, setEditingId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminPortfolioProjects());
    }, [dispatch]);

    const handleOpenForm = (item = null) => {
        setFormErrors({});
        setApiError(null);
        if (item) {
            setFormData({ ...defaultFormState, ...item, images: item.images || [] });
            setEditingId(item.id);
        } else {
            setFormData(defaultFormState);
            setEditingId(null);
        }
        setIsFormOpen(true);
    };

    const validate = (data) => {
        const errors = {};
        if (!data.title?.trim()) errors.title = 'Title is required';
        if (!data.type?.trim()) errors.type = 'Type is required';
        return errors;
    };

    const handleImagesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        setApiError(null);
        try {
            const formDataPayload = new FormData();
            files.forEach(file => formDataPayload.append('images', file));

            const response = await api.post('/admin/portfolio-projects/upload-images', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newImageUrls = response.data.data.imageUrls || [];
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
        } catch (error) {
            const ne = normalizeApiError(error);
            setApiError(ne.message || 'Image upload failed');
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSubmit = async () => {
        const errors = validate(formData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setApiError(null);

        try {
            if (editingId) {
                await dispatch(updatePortfolioProject({ id: editingId, ...formData })).unwrap();
            } else {
                await dispatch(addPortfolioProject(formData)).unwrap();
            }
            setIsFormOpen(false);
        } catch (error) {
            const ne = normalizeApiError(error);
            setApiError(ne.message || 'Failed to save project');
            if (ne.errors) setFormErrors(ne.errors);
        }
    };

    const confirmDelete = async () => {
        if (deleteModal.itemId) {
            try {
                await dispatch(deletePortfolioProject(deleteModal.itemId)).unwrap();
                setDeleteModal({ isOpen: false, itemId: null });
            } catch (error) {
                setApiError('Failed to delete project');
                setDeleteModal({ isOpen: false, itemId: null });
            }
        }
    };

    const filteredProjects = projects.filter(p => 
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatedPageWrapper className="space-y-6 pb-20 max-w-7xl mx-auto">
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                    Presentation
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                                Portfolio Projects
                            </h1>
                            <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                                Manage public portfolio showcase projects
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-lg">
                            <div className="bg-white border shadow-sm rounded-sm p-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-primary-200">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-lg shadow-sm bg-primary-50 text-primary-600">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-snug">Total Projects</h3>
                                        <span className="text-2xl font-black block mt-0.5 leading-none text-primary-600">{projects.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full xl:w-auto xl:self-start">
                        <Button size="md" onClick={() => handleOpenForm()} className="!rounded-sm justify-center h-10 px-6 text-[11px] font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto flex-1 sm:flex-none gap-2">
                            <Plus className="h-4.5 w-4.5" /> New Project
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 mb-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-[32rem]">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200 shadow-sm"
                        />
                    </div>
                    <Badge variant="neutral" className="!rounded-sm bg-gray-100 border-gray-200 text-gray-700 shadow-sm">
                        Showing {filteredProjects.length}
                    </Badge>
                </div>
            </div>

            {loading && !projects.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 opacity-50">
                    <Skeleton className="h-64 w-full rounded-[2rem]" repeat={3} />
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white border border-gray-200 shadow-sm overflow-hidden group flex flex-col h-full rounded-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                            <div className="relative h-48 w-full bg-gray-100 border-b border-gray-200 overflow-hidden">
                                {project.images && project.images.length > 0 ? (
                                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => handleOpenForm(project)} className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/90 backdrop-blur shadow-sm border border-gray-200 text-gray-700 transition-colors hover:border-primary-500 hover:text-primary-600">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteModal({ isOpen: true, itemId: project.id })} className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/90 backdrop-blur shadow-sm border border-gray-200 text-gray-700 transition-colors hover:border-red-500 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 flex-grow flex flex-col gap-2">
                                <div>
                                    <Badge variant={project.isActive ? "success" : "neutral"} className="!rounded-sm shadow-sm text-[9px] uppercase font-bold px-2 py-0.5 mb-3 inline-flex">
                                        {project.isActive ? 'Active' : 'Hidden'}
                                    </Badge>
                                    <h4 className="text-lg font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{project.title}</h4>
                                    <p className="text-xs font-bold text-primary-600">{project.type} • {project.location}</p>
                                </div>
                                {project.result && (
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed font-medium line-clamp-3">
                                        <strong className="text-gray-800">Result:</strong> {project.result}
                                    </p>
                                )}
                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                    <span className="text-xs font-bold text-gray-500">{project.images?.length || 0} images</span>
                                    <span className="text-xs font-bold text-gray-500">Order: {project.displayOrder}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No Portfolio Projects"
                    description="Get started by adding your first showcase project."
                    icon={Briefcase}
                    action={<Button size="sm" onClick={() => handleOpenForm()}>Add Project</Button>}
                />
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingId ? 'Edit Project' : 'New Project'}
                maxWidth="max-w-4xl"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        <Button size="md" className="px-8" onClick={handleSubmit}>
                            <Save className="w-5 h-5 mr-2" /> Save Project
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6 py-4">
                    {apiError && (
                        <div className="rounded-xl border border-red-500/18 bg-red-500/10 p-3 text-sm font-medium text-red-300">
                            {apiError}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Project Title *"
                            value={formData.title}
                            onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setFormErrors(p => ({ ...p, title: null })) }}
                            error={formErrors.title}
                            placeholder="e.g. Modern Villa Project"
                        />
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700">Project Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => { setFormData({ ...formData, type: e.target.value }); setFormErrors(p => ({ ...p, type: null })) }}
                                className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                            >
                                <option value="" disabled>Select a type...</option>
                                {PROJECT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {formErrors.type && <p className="text-[11px] font-bold text-red-600 px-1">{formErrors.type}</p>}
                        </div>
                        <Input
                            label="Location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Bucharest, Romania"
                        />
                        <Input
                            label="Result (Short)"
                            value={formData.result}
                            onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                            placeholder="e.g. 40% Energy Savings"
                        />
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-gray-700">Detailed Description</label>
                            <textarea
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the challenges, solutions, and technologies used..."
                                className="w-full rounded-sm border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-relaxed text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-gray-700">Project Images (Carousel)</label>
                                <label className={clsx("cursor-pointer flex items-center rounded-sm bg-white shadow-sm border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors", uploading && "opacity-50 pointer-events-none")}>
                                    <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImagesUpload} className="hidden" />
                                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Upload Images
                                </label>
                            </div>
                            
                            {formData.images.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {formData.images.map((url, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-ink">
                                            <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 flex w-7 h-7 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-sm border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500 shadow-sm">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                                    <p className="text-sm font-bold text-gray-700">No images uploaded yet.</p>
                                    <p className="text-xs mt-1">Upload multiple images for the project's photo carousel.</p>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 shadow-sm">
                                <span className="text-xs font-bold text-gray-700">Visible to Public</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={clsx("relative h-5 w-10 rounded-full transition-colors", formData.isActive ? "bg-primary-500" : "bg-gray-300")}
                                >
                                    <div className={clsx("w-3 h-3 rounded-full bg-white absolute top-1 transition-transform shadow-sm", formData.isActive ? "translate-x-6" : "translate-x-1")} />
                                </button>
                            </div>
                            <Input
                                type="number"
                                label="Display Order (lowest first)"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
                title="Delete Portfolio Project"
                maxWidth="max-w-md"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="ghost" onClick={() => setDeleteModal({ isOpen: false, itemId: null })}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete Project</Button>
                    </div>
                }
            >
                <p className="text-sm text-textSecondary py-4">
                    Are you sure you want to delete this portfolio project? This action cannot be undone and will remove it from the public presentation site.
                </p>
            </Modal>
        </AnimatedPageWrapper>
    );
}
