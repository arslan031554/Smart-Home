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
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                    {t('adminPages.permissions.badge', { defaultValue: 'Route Access' })}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                                {t('adminPages.permissions.title', { defaultValue: 'Employee Permissions' })}
                            </h1>
                            <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                                {t('adminPages.permissions.subtitle', { defaultValue: 'Assign backend-enforced permissions for the employee modules and routes already present in the system.' })}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                {
                                    icon: UserCheck,
                                    label: t('adminPages.permissions.employeeAccounts', { defaultValue: 'Employee Accounts' }),
                                    value: employees.length,
                                    color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)'
                                },
                                {
                                    icon: Shield,
                                    label: t('adminPages.permissions.auditTitle', { defaultValue: 'Permission Summary' }),
                                    value: draftPermissions.length,
                                    color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.22)'
                                },
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
                        <Button size="md" onClick={handleSave} className="!rounded-sm justify-center h-10 px-6 text-[11px] font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto flex-1 sm:flex-none">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSaving ? t('common.saving', { defaultValue: 'Saving...' }) : t('adminPages.permissions.save', { defaultValue: 'Save Permissions' })}
                        </Button>
                    </div>
                </div>
            </div>

            {saveError ? <Alert variant="error" className="mb-6">{saveError}</Alert> : null}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.4fr]">
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{t('adminPages.permissions.employeeAccounts', { defaultValue: 'Employee Accounts' })}</h3>
                                    <p className="text-sm font-medium text-gray-500">{t('adminPages.permissions.mappingSubtitle', { defaultValue: 'Choose which modules and actions are allowed for this employee.' })}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {employees.map((employee) => (
                                    <button
                                        key={employee.id}
                                        onClick={() => setSelectedEmployeeId(employee.id)}
                                        className={clsx(
                                            'w-full rounded-sm border px-4 py-4 text-left transition-all shadow-sm hover:shadow-md',
                                            selectedEmployeeId === employee.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 bg-white hover:border-primary-500/30 hover:bg-gray-50',
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{employee.name}</p>
                                                <p className="mt-1 text-xs font-medium text-gray-500">{employee.role}</p>
                                            </div>
                                            {selectedEmployeeId === employee.id ? <Check className="h-4 w-4 text-primary-600" /> : null}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-6">
                        <div className="space-y-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{t('adminPages.permissions.auditTitle', { defaultValue: 'Permission Summary' })}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                    {t('adminPages.permissions.auditBody', {
                                        defaultValue: '{{name}} currently has access to {{count}} permission entries.',
                                        name: selectedEmployee?.name || '',
                                        count: draftPermissions.length,
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex gap-3 text-amber-800 shadow-sm">
                        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
                        <div className="space-y-1">
                            <p className="font-bold">{t('adminPages.permissions.noteTitle', { defaultValue: 'Backend Enforcement' })}</p>
                            <p className="text-sm font-medium">{t('adminPages.permissions.noteBody', { defaultValue: 'Permission updates are saved through the backend and applied again after refresh or re-login.' })}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-0 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {t('adminPages.permissions.mappingTitle', { defaultValue: '{{name}} Permission Mapping', name: selectedEmployee?.name || '' })}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                    {t('adminPages.permissions.mappingSubtitle', { defaultValue: 'Choose which modules and actions are allowed for this employee.' })}
                                </p>
                            </div>
                            <Badge variant="neutral" className="!rounded-sm bg-white border-gray-200 text-gray-700 shadow-sm">
                                {t('adminPages.permissions.roleBadge', { defaultValue: 'Role: {{role}}', role: selectedEmployee?.role || '-' })}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        {ADMIN_PERMISSION_GROUPS.map((group) => (
                            <div key={group.name} className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                                        <Fingerprint className="h-4.5 w-4.5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{groupLabels[group.name] || group.name}</h4>
                                </div>

                                <div className="space-y-3">
                                    {group.permissions.map((permission) => {
                                        const isActive = draftPermissions.includes(permission.id);
                                        return (
                                            <button
                                                key={permission.id}
                                                onClick={() => togglePermission(permission.id)}
                                                className={clsx(
                                                    'flex w-full items-center justify-between rounded-sm border px-4 py-4 text-left transition-all shadow-sm hover:shadow-md',
                                                    isActive
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-gray-200 bg-white hover:border-primary-500/30 hover:bg-gray-50',
                                                )}
                                            >
                                                <span className={clsx('text-sm font-bold', isActive ? 'text-primary-700' : 'text-gray-600')}>
                                                    {permissionLabels[permission.id] || permission.label}
                                                </span>
                                                <div className={clsx(
                                                    'flex h-6 w-11 items-center rounded-full border px-1 transition-all',
                                                    isActive ? 'border-primary-600 bg-primary-500' : 'border-gray-300 bg-gray-200',
                                                )}>
                                                    <div className={clsx(
                                                        'h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
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
                </div>
            </div>
        </AnimatedPageWrapper>
    );
}

