import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Shield,
    Save,
    Check,
    UserCheck,
    ShieldAlert,
    Lock,
    Fingerprint,
    Loader2,
} from 'lucide-react';
import {
    Button,
    Card,
    SectionTitle,
    Badge,
    EmptyState,
    AnimatedPageWrapper,
    Alert,
} from '@/components/common/UIComponents';
import { clsx } from 'clsx';
import { fetchEmployees, updateEmployee } from '@/features/admin/adminSlice';
import { ADMIN_PERMISSION_GROUPS } from '@/constants/adminPermissions';
import { useTranslation } from 'react-i18next';

export default function PermissionsManagement() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { employees = [], loading } = useSelector((state) => state.admin);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [draftPermissions, setDraftPermissions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        dispatch(fetchEmployees());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedEmployeeId && employees?.length) {
            setSelectedEmployeeId(employees[0].id);
        }
    }, [employees, selectedEmployeeId]);

    const selectedEmployee = useMemo(
        () => (employees || []).find((employee) => employee.id === selectedEmployeeId) || null,
        [employees, selectedEmployeeId],
    );

    useEffect(() => {
        setDraftPermissions(selectedEmployee?.permissions || []);
    }, [selectedEmployeeId, selectedEmployee]);

    const togglePermission = (permId) => {
        setDraftPermissions((prev) => (prev.includes(permId)
            ? prev.filter((permission) => permission !== permId)
            : [...prev, permId]
        ));
    };

    const handleSave = async () => {
        if (!selectedEmployee) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            await dispatch(updateEmployee({
                id: selectedEmployee.id,
                permissions: draftPermissions,
            })).unwrap();
        } catch (error) {
            setSaveError(error?.message || t('adminPages.permissions.saveError', { defaultValue: 'Unable to save permission assignments.' }));
        } finally {
            setIsSaving(false);
        }
    };

    const groupLabels = {
        'Core System Logic': t('adminPages.permissions.groups.core', { defaultValue: 'Core System Logic' }),
        'Commercial Operations': t('adminPages.permissions.groups.offers', { defaultValue: 'Commercial Operations' }),
        'Hardware Ecosystem': t('adminPages.permissions.groups.hardware', { defaultValue: 'Hardware Ecosystem' }),
        'Governance & Personnel': t('adminPages.permissions.groups.governance', { defaultValue: 'Governance & Personnel' }),
    };

    const permissionLabels = {
        view_master: t('adminPages.permissions.labels.view_master', { defaultValue: 'View master data' }),
        edit_master: t('adminPages.permissions.labels.edit_master', { defaultValue: 'Edit master data' }),
        delete_master: t('adminPages.permissions.labels.delete_master', { defaultValue: 'Delete master data' }),
        view_offers: t('adminPages.permissions.labels.view_offers', { defaultValue: 'View offers' }),
        edit_offers: t('adminPages.permissions.labels.edit_offers', { defaultValue: 'Edit offers' }),
        delete_offers: t('adminPages.permissions.labels.delete_offers', { defaultValue: 'Delete offers' }),
        view_hardware: t('adminPages.permissions.labels.view_hardware', { defaultValue: 'View products and services' }),
        edit_hardware: t('adminPages.permissions.labels.edit_hardware', { defaultValue: 'Edit products and services' }),
        edit_pricing: t('adminPages.permissions.labels.edit_pricing', { defaultValue: 'Edit pricing' }),
        manage_employees: t('adminPages.permissions.labels.manage_employees', { defaultValue: 'Manage employees and permissions' }),
        manage_rules: t('adminPages.permissions.labels.manage_rules', { defaultValue: 'Manage discount, content, and follow-up rules' }),
    };

    if (loading && !employees.length) {
        return (
            <AnimatedPageWrapper className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-9 w-9 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-textSecondary">
                    {t('adminPages.permissions.loading', { defaultValue: 'Loading permission assignments...' })}
                </p>
            </AnimatedPageWrapper>
        );
    }

    if (!employees.length) {
        return (
            <AnimatedPageWrapper className="mx-auto max-w-4xl">
                <Card className="rounded-[2rem]">
                    <EmptyState
                        title={t('adminPages.permissions.emptyTitle', { defaultValue: 'No employee accounts available' })}
                        description={t('adminPages.permissions.emptyDesc', { defaultValue: 'Create an employee account first, then assign the backoffice permissions needed for that person.' })}
                        icon={UserCheck}
                    />
                </Card>
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
                            title={t('adminPages.permissions.title', { defaultValue: 'Employee Permissions' })}
                            subtitle={t('adminPages.permissions.subtitle', { defaultValue: 'Assign backend-enforced permissions for the employee modules and routes already present in the system.' })}
                            badge={t('adminPages.permissions.badge', { defaultValue: 'Route Access' })}
                            className="mb-0"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                {
                                    icon: UserCheck,
                                    label: t('adminPages.permissions.employeeAccounts', { defaultValue: 'Employee Accounts' }),
                                    value: employees.length,
                                },
                                {
                                    icon: Shield,
                                    label: t('adminPages.permissions.auditTitle', { defaultValue: 'Permission Summary' }),
                                    value: draftPermissions.length,
                                },
                            ].map((item) => (
                                <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 px-5 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
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

                    <Button size="md" onClick={handleSave} className="gap-2">
                        {isSaving ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
                        {isSaving ? t('common.saving', { defaultValue: 'Saving...' }) : t('adminPages.permissions.save', { defaultValue: 'Save Permissions' })}
                    </Button>
                </div>
            </div>

            {saveError ? <Alert variant="error">{saveError}</Alert> : null}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.4fr]">
                <div className="space-y-6">
                    <Card className="rounded-[2rem] p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-textPrimary">{t('adminPages.permissions.employeeAccounts', { defaultValue: 'Employee Accounts' })}</h3>
                                    <p className="text-sm text-textSecondary">{t('adminPages.permissions.mappingSubtitle', { defaultValue: 'Choose which modules and actions are allowed for this employee.' })}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {employees.map((employee) => (
                                    <button
                                        key={employee.id}
                                        onClick={() => setSelectedEmployeeId(employee.id)}
                                        className={clsx(
                                            'w-full rounded-[1.4rem] border px-4 py-4 text-left transition-all',
                                            selectedEmployeeId === employee.id
                                                ? 'border-primary-500/25 bg-primary-500/10'
                                                : 'border-white/8 bg-white/5 hover:border-primary-500/18 hover:bg-white/8',
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-textPrimary">{employee.name}</p>
                                                <p className="mt-1 text-xs text-textSecondary">{employee.role}</p>
                                            </div>
                                            {selectedEmployeeId === employee.id ? <Check className="h-4 w-4 text-primary-300" /> : null}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <div className="hero-frame rounded-[2rem] p-6">
                        <div className="space-y-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-textPrimary">{t('adminPages.permissions.auditTitle', { defaultValue: 'Permission Summary' })}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-textSecondary">
                                    {t('adminPages.permissions.auditBody', {
                                        defaultValue: '{{name}} currently has access to {{count}} permission entries.',
                                        name: selectedEmployee?.name || '',
                                        count: draftPermissions.length,
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Alert variant="warning" icon={ShieldAlert}>
                        <div className="space-y-1">
                            <p className="font-medium text-textPrimary">{t('adminPages.permissions.noteTitle', { defaultValue: 'Backend Enforcement' })}</p>
                            <p>{t('adminPages.permissions.noteBody', { defaultValue: 'Permission updates are saved through the backend and applied again after refresh or re-login.' })}</p>
                        </div>
                    </Alert>
                </div>

                <Card className="rounded-[2rem] p-0 overflow-hidden">
                    <div className="border-b border-white/8 bg-white/5 px-6 py-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-medium text-textPrimary">
                                    {t('adminPages.permissions.mappingTitle', { defaultValue: '{{name}} Permission Mapping', name: selectedEmployee?.name || '' })}
                                </h3>
                                <p className="mt-1 text-sm text-textSecondary">
                                    {t('adminPages.permissions.mappingSubtitle', { defaultValue: 'Choose which modules and actions are allowed for this employee.' })}
                                </p>
                            </div>
                            <Badge variant="neutral">
                                {t('adminPages.permissions.roleBadge', { defaultValue: 'Role: {{role}}', role: selectedEmployee?.role || '-' })}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        {ADMIN_PERMISSION_GROUPS.map((group) => (
                            <div key={group.name} className="rounded-[1.6rem] border border-white/8 bg-white/5 p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                        <Fingerprint className="h-4.5 w-4.5" />
                                    </div>
                                    <h4 className="text-sm font-medium text-textPrimary">{groupLabels[group.name] || group.name}</h4>
                                </div>

                                <div className="space-y-3">
                                    {group.permissions.map((permission) => {
                                        const isActive = draftPermissions.includes(permission.id);
                                        return (
                                            <button
                                                key={permission.id}
                                                onClick={() => togglePermission(permission.id)}
                                                className={clsx(
                                                    'flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-4 text-left transition-all',
                                                    isActive
                                                        ? 'border-primary-500/25 bg-primary-500/10'
                                                        : 'border-white/8 bg-[#1c1c1c] hover:border-primary-500/18 hover:bg-white/5',
                                                )}
                                            >
                                                <span className={clsx('text-sm font-medium', isActive ? 'text-textPrimary' : 'text-textSecondary')}>
                                                    {permissionLabels[permission.id] || permission.label}
                                                </span>
                                                <div className={clsx(
                                                    'flex h-6 w-11 items-center rounded-full border px-1 transition-all',
                                                    isActive ? 'border-primary-500/30 bg-primary-500/25' : 'border-white/10 bg-white/8',
                                                )}>
                                                    <div className={clsx(
                                                        'h-4 w-4 rounded-full bg-textPrimary transition-transform',
                                                        isActive ? 'translate-x-5' : 'translate-x-0',
                                                    )}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AnimatedPageWrapper>
    );
}

