import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addEmployee, deleteEmployee, updateEmployee, fetchEmployees } from '@/features/admin/adminSlice';
import {
    Search,
    Edit,
    Trash2,
    Users,
    ShieldCheck,
    Mail,
    Save,
    Briefcase,
    UserPlus,
    UserMinus,
    Fingerprint,
    Activity,
    Lock,
    Loader2,
    KeyRound,
    AlertCircle,
} from 'lucide-react';
import {
    Button,
    Badge,
    Card,
    Modal,
    Skeleton,
    EmptyState,
    SectionTitle,
    Input,
    AnimatedPageWrapper,
    Alert,
} from '@/components/common/UIComponents';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const EMPTY_FORM = {
    name: '',
    email: '',
    password: '',
    role: 'Engineer',
    isActive: true,
};

export default function EmployeeManagement() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { employees = [], loading: adminLoading } = useSelector((state) => state.admin);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, employeeId: null });
    const [editingId, setEditingId] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const roles = ['Administrator', 'Engineer', 'Technical Sales', 'Maintenance Lead'];
    const roleLabels = {
        Administrator: t('adminPages.employees.roles.administrator', { defaultValue: 'Administrator' }),
        Engineer: t('adminPages.employees.roles.engineer', { defaultValue: 'Engineer' }),
        'Technical Sales': t('adminPages.employees.roles.technicalSales', { defaultValue: 'Technical Sales' }),
        'Maintenance Lead': t('adminPages.employees.roles.maintenanceLead', { defaultValue: 'Maintenance Lead' }),
    };

    useEffect(() => {
        dispatch(fetchEmployees());
    }, [dispatch]);

    const handleOpenForm = (employee = null) => {
        setApiError(null);
        if (employee) {
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                password: '',
                role: employee.role || 'Engineer',
                isActive: employee.isActive !== false,
            });
            setEditingId(employee.id);
        } else {
            setFormData(EMPTY_FORM);
            setEditingId(null);
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setApiError(null);
        try {
            if (editingId) {
                const payload = { id: editingId, ...formData };
                if (!payload.password) delete payload.password;
                await dispatch(updateEmployee(payload)).unwrap();
            } else {
                await dispatch(addEmployee(formData)).unwrap();
            }
            setIsFormOpen(false);
        } catch (error) {
            setApiError(error?.message || t('adminPages.employees.saveError', { defaultValue: 'Unable to save employee account.' }));
        }
    };

    const confirmDelete = async () => {
        if (deleteModal.employeeId) {
            try {
                await dispatch(deleteEmployee(deleteModal.employeeId)).unwrap();
                setDeleteModal({ isOpen: false, employeeId: null });
            } catch (error) {
                setApiError(error?.message || t('adminPages.employees.deleteError', { defaultValue: 'Unable to delete employee account.' }));
                setDeleteModal({ isOpen: false, employeeId: null });
            }
        }
    };

    const filteredEmployees = employees.filter((employee) =>
        (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        || (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (adminLoading && !employees.length) {
        return (
            <AnimatedPageWrapper className="flex min-h-[400px] flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-textSecondary">
                    {t('adminPages.employees.loading', { defaultValue: 'Loading employee accounts...' })}
                </p>
                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-72 w-full rounded-[2rem]" repeat={3} />
                </div>
            </AnimatedPageWrapper>
        );
    }

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-10 pb-20">
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                    {t('adminPages.employees.badge', { defaultValue: 'Backoffice Access' })}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                                {t('adminPages.employees.title', { defaultValue: 'Employee Accounts' })}
                            </h1>
                            <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                                {t('adminPages.employees.subtitle', { defaultValue: 'Create and maintain internal backoffice accounts, passwords, and activation state for staff members.' })}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                { icon: Users, label: t('adminPages.employees.count', { count: employees.length, defaultValue: '{{count}} employees' }), value: employees.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)' },
                                { icon: Activity, label: t('adminPages.employees.activeBadge', { defaultValue: 'Active account' }), value: employees.filter((employee) => employee.isActive !== false).length, color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.22)' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white border shadow-sm rounded-sm p-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300" style={{ borderColor: item.border }}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-lg shadow-sm" style={{ backgroundColor: item.bg, color: item.color }}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-snug">{item.label}</h3>
                                            <span className="text-2xl font-black block mt-0.5 leading-none" style={{ color: item.color }}>{item.value}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full xl:w-auto xl:self-start">
                        <Button size="md" onClick={() => handleOpenForm()} className="!rounded-sm justify-center h-10 px-6 text-[11px] font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto flex-1 sm:flex-none">
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t('adminPages.employees.create', { defaultValue: 'Create Employee' })}
                        </Button>
                    </div>
                </div>
            </div>

            {apiError ? <Alert variant="error" className="mb-6">{apiError}</Alert> : null}

            <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 mb-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-96">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('adminPages.employees.searchPlaceholder', { defaultValue: 'Search by employee name or email...' })}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200 shadow-sm"
                        />
                    </div>
                    <Badge variant="neutral" className="!rounded-sm bg-gray-100 border-gray-200 text-gray-700 shadow-sm">
                        {t('adminPages.employees.count', { count: filteredEmployees.length, defaultValue: '{{count}} employees' })}
                    </Badge>
                </div>
            </div>

            {filteredEmployees.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary-500/30 transition-all duration-300 rounded-sm p-6 group flex flex-col">
                            <div className="space-y-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-lg font-bold uppercase text-primary-600 shadow-sm">
                                        {employee.name?.split(' ').map((name) => name[0]).join('').slice(0, 2) || '??'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenForm(employee)} className="flex h-9 w-9 items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-400 transition-colors hover:border-primary-500/30 hover:text-primary-600 shadow-sm hover:shadow-md">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setDeleteModal({ isOpen: true, employeeId: employee.id })} className="flex h-9 w-9 items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-400 transition-colors hover:border-red-500/30 hover:text-red-600 shadow-sm hover:shadow-md">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">{employee.name}</h3>
                                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <Mail className="h-4 w-4 text-primary-500" />
                                        {employee.email}
                                    </p>
                                </div>

                                <div className="space-y-3 rounded-sm border border-gray-200 bg-gray-50 p-4 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <Briefcase className="h-4 w-4 text-primary-500" />
                                            {roleLabels[employee.role] || employee.role}
                                        </span>
                                        <Badge variant={employee.isActive !== false ? 'success' : 'warning'} className="!rounded-sm shadow-sm text-[10px]">
                                            {employee.isActive !== false
                                                ? t('adminPages.employees.active', { defaultValue: 'Active' })
                                                : t('adminPages.employees.suspended', { defaultValue: 'Suspended' })}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <ShieldCheck className="h-4 w-4 text-primary-500" />
                                            {t('adminPages.employees.permissionsCount', { count: (employee.permissions || []).length, defaultValue: '{{count}} permissions' })}
                                        </span>
                                        <Fingerprint className="h-4 w-4 text-primary-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-8">
                    <EmptyState
                        title={t('adminPages.employees.emptyTitle', { defaultValue: 'No employee accounts yet' })}
                        description={t('adminPages.employees.emptyDesc', { defaultValue: 'Create employee accounts before assigning permissions and using the internal backoffice.' })}
                        icon={Users}
                        action={(
                            <Button onClick={() => handleOpenForm()} className="!rounded-sm">
                                {t('adminPages.employees.create', { defaultValue: 'Create Employee' })}
                            </Button>
                        )}
                    />
                </div>
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingId
                    ? t('adminPages.employees.editTitle', { defaultValue: 'Edit Employee Account' })
                    : t('adminPages.employees.createTitle', { defaultValue: 'Create Employee Account' })}
                maxWidth="max-w-3xl"
                footer={(
                    <div className="flex w-full items-center justify-between gap-4">
                        <div className="hidden items-center gap-3 rounded-full border border-white/8 bg-white/5 px-4 py-2 lg:flex">
                            <Fingerprint className="h-4 w-4 text-primary-300" />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                {t('adminPages.employees.securityNote', { defaultValue: 'Employee credentials are handled through the secured backend flow.' })}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
                                {t('common.cancel', { defaultValue: 'Cancel' })}
                            </Button>
                            <Button onClick={handleSubmit} className="gap-2">
                                <Save className="h-4.5 w-4.5" />
                                {t('adminPages.employees.save', { defaultValue: 'Save Employee' })}
                            </Button>
                        </div>
                    </div>
                )}
            >
                <div className="space-y-8 py-4">
                    {apiError ? <Alert variant="error">{apiError}</Alert> : null}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Input
                            label={t('adminPages.employees.fields.name', { defaultValue: 'Employee Name' })}
                            icon={Users}
                            placeholder={t('adminPages.employees.placeholders.name', { defaultValue: 'e.g. Alex Ionescu' })}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label={t('adminPages.employees.fields.email', { defaultValue: 'Employee Email' })}
                            icon={Mail}
                            type="email"
                            placeholder={t('adminPages.employees.placeholders.email', { defaultValue: 'employee@company.com' })}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label={editingId
                                ? t('adminPages.employees.fields.passwordOptional', { defaultValue: 'Reset Password (optional)' })
                                : t('adminPages.employees.fields.password', { defaultValue: 'Initial Password' })}
                            icon={KeyRound}
                            type="password"
                            placeholder={t('adminPages.employees.placeholders.password', { defaultValue: 'Minimum 8 characters' })}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <div className="space-y-2">
                            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                {t('adminPages.employees.fields.status', { defaultValue: 'Account Status' })}
                            </label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={clsx(
                                    'flex h-[56px] w-full items-center justify-center rounded-2xl border text-sm font-medium transition-all',
                                    formData.isActive
                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                        : 'border-white/10 bg-white/5 text-textSecondary',
                                )}
                            >
                                {formData.isActive
                                    ? t('adminPages.employees.active', { defaultValue: 'Active' })
                                    : t('adminPages.employees.suspended', { defaultValue: 'Suspended' })}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-5 border-t border-white/8 pt-6">
                        <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-primary-300" />
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">
                                {t('adminPages.employees.roleTitle', { defaultValue: 'Role Assignment' })}
                            </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {roles.map((roleName) => (
                                <button
                                    key={roleName}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: roleName })}
                                    className={clsx(
                                        'rounded-[1.5rem] border px-4 py-5 text-center transition-all',
                                        formData.role === roleName
                                            ? 'border-primary-500/25 bg-primary-500/10'
                                            : 'border-white/8 bg-white/5 hover:border-primary-500/18 hover:bg-white/8',
                                    )}
                                >
                                    <div className={clsx(
                                        'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border',
                                        formData.role === roleName
                                            ? 'border-primary-500/20 bg-primary-500/12 text-primary-300'
                                            : 'border-white/10 bg-[#1c1c1c] text-textSecondary',
                                    )}
                                    >
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textPrimary">
                                        {roleLabels[roleName] || roleName}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, employeeId: null })}
                title={t('adminPages.employees.deleteTitle', { defaultValue: 'Delete Employee Account' })}
                maxWidth="max-w-md"
                footer={(
                    <div className="grid w-full grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full justify-center !rounded-xl !min-h-11 border-gray-200 bg-white font-bold text-textPrimary shadow-sm hover:bg-gray-50 active:scale-[0.98]"
                            onClick={() => setDeleteModal({ isOpen: false, employeeId: null })}
                        >
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            className="w-full justify-center !rounded-xl !min-h-11 bg-red-600 font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 active:scale-[0.98]"
                            onClick={confirmDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            {t('adminPages.employees.deleteAction', { defaultValue: 'Delete Employee' })}
                        </Button>
                    </div>
                )}
            >
                <div className="mx-auto flex max-w-sm flex-col items-center gap-5 px-2 py-4 text-center sm:px-4 sm:py-6">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/15 to-red-500/5 text-red-500 shadow-sm ring-8 ring-red-500/5">
                        <UserMinus className="h-8 w-8 stroke-[2.2]" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-heading font-black tracking-tight text-textPrimary">
                            {t('adminPages.employees.deleteHeading', { defaultValue: 'Remove employee access' })}
                        </h4>
                        <p className="text-sm font-medium leading-relaxed text-textSecondary">
                            {t('adminPages.employees.deleteDescription', { defaultValue: 'Deleting this account immediately removes internal backoffice access. Existing platform records remain unchanged.' })}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>{t('adminPages.employees.deleteBadge', { defaultValue: 'Access Revocation' })}</span>
                    </div>
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}

