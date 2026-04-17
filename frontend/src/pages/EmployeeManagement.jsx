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
            <div className="hero-frame overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-6">
                        <SectionTitle
                            title={t('adminPages.employees.title', { defaultValue: 'Employee Accounts' })}
                            subtitle={t('adminPages.employees.subtitle', { defaultValue: 'Create and maintain internal backoffice accounts, passwords, and activation state for staff members.' })}
                            badge={t('adminPages.employees.badge', { defaultValue: 'Backoffice Access' })}
                            className="mb-0"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                { icon: Users, label: t('adminPages.employees.count', { count: employees.length, defaultValue: '{{count}} employees' }), value: employees.length },
                                { icon: Activity, label: t('adminPages.employees.activeBadge', { defaultValue: 'Active account' }), value: employees.filter((employee) => employee.isActive !== false).length },
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

                    <Button size="lg" onClick={() => handleOpenForm()} className="gap-2">
                        <UserPlus className="h-4.5 w-4.5" />
                        {t('adminPages.employees.create', { defaultValue: 'Create Employee' })}
                    </Button>
                </div>
            </div>

            {apiError ? <Alert variant="error">{apiError}</Alert> : null}

            <Card className="rounded-[1.9rem] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-96">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                        <input
                            type="text"
                            placeholder={t('adminPages.employees.searchPlaceholder', { defaultValue: 'Search by employee name or email...' })}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                        />
                    </div>
                    <Badge variant="neutral">
                        {t('adminPages.employees.count', { count: filteredEmployees.length, defaultValue: '{{count}} employees' })}
                    </Badge>
                </div>
            </Card>

            {filteredEmployees.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredEmployees.map((employee) => (
                        <Card key={employee.id} className="rounded-[2rem] p-6">
                            <div className="space-y-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-primary-500/18 bg-primary-500/12 text-lg font-semibold uppercase text-primary-300">
                                        {employee.name?.split(' ').map((name) => name[0]).join('').slice(0, 2) || '??'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenForm(employee)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-primary-500/18 hover:text-primary-300">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setDeleteModal({ isOpen: true, employeeId: employee.id })} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-colors hover:border-red-500/25 hover:text-red-300">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-medium text-textPrimary">{employee.name}</h3>
                                    <p className="mt-2 flex items-center gap-2 text-sm text-textSecondary">
                                        <Mail className="h-4 w-4 text-primary-300" />
                                        {employee.email}
                                    </p>
                                </div>

                                <div className="space-y-3 rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-2 text-sm text-textSecondary">
                                            <Briefcase className="h-4 w-4 text-primary-300" />
                                            {roleLabels[employee.role] || employee.role}
                                        </span>
                                        <Badge variant={employee.isActive !== false ? 'success' : 'warning'}>
                                            {employee.isActive !== false
                                                ? t('adminPages.employees.active', { defaultValue: 'Active' })
                                                : t('adminPages.employees.suspended', { defaultValue: 'Suspended' })}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-2 text-sm text-textSecondary">
                                            <ShieldCheck className="h-4 w-4 text-primary-300" />
                                            {t('adminPages.employees.permissionsCount', { count: (employee.permissions || []).length, defaultValue: '{{count}} permissions' })}
                                        </span>
                                        <Fingerprint className="h-4 w-4 text-primary-300" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[2rem]">
                    <EmptyState
                        title={t('adminPages.employees.emptyTitle', { defaultValue: 'No employee accounts yet' })}
                        description={t('adminPages.employees.emptyDesc', { defaultValue: 'Create employee accounts before assigning permissions and using the internal backoffice.' })}
                        icon={Users}
                        action={(
                            <Button onClick={() => handleOpenForm()}>
                                {t('adminPages.employees.create', { defaultValue: 'Create Employee' })}
                            </Button>
                        )}
                    />
                </Card>
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
                                        'mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border',
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
                    <div className="flex w-full justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeleteModal({ isOpen: false, employeeId: null })}>
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            {t('adminPages.employees.deleteAction', { defaultValue: 'Delete Employee' })}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-5 py-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-red-500/18 bg-red-500/10 text-red-300">
                        <UserMinus className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-medium text-textPrimary">
                            {t('adminPages.employees.deleteHeading', { defaultValue: 'Remove employee access' })}
                        </h4>
                        <p className="text-sm leading-relaxed text-textSecondary">
                            {t('adminPages.employees.deleteDescription', { defaultValue: 'Deleting this account immediately removes internal backoffice access. Existing platform records remain unchanged.' })}
                        </p>
                    </div>
                    <Badge variant="error">{t('adminPages.employees.deleteBadge', { defaultValue: 'Access Revocation' })}</Badge>
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}
