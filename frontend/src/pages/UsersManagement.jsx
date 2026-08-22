import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Search, Mail, Phone, Shield, Loader2, Pencil, Trash2, Save, ShieldAlert } from 'lucide-react';
import { AnimatedPageWrapper, Badge, Button, Input, Modal, Select, Switch, Alert } from '@/components/common/UIComponents';
import { deleteUser, fetchUsers, updateUser } from '@/features/admin/adminSlice';
import { useTranslation } from 'react-i18next';

function formatRole(role) {
    const normalized = String(role || '').toLowerCase();
    if (normalized === 'admin') return 'Admin';
    if (normalized === 'employee') return 'Employee';
    return 'Customer';
}

export default function UsersManagement() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { users = [], loading } = useSelector((state) => state.admin);
    const currentUser = useSelector((state) => state.auth.user);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        role: 'customer',
        employeeRole: '',
        isActive: true,
        isVerified: false,
        password: '',
    });

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const locale = i18n.language?.startsWith('ro') ? 'ro-RO' : 'en-GB';
    const filteredUsers = useMemo(() => {
        const term = String(search || '').trim().toLowerCase();
        if (!term) return users;
        return users.filter((user) => (
            String(user.fullName || '').toLowerCase().includes(term) ||
            String(user.email || '').toLowerCase().includes(term) ||
            String(user.phone || '').toLowerCase().includes(term) ||
            String(user.role || '').toLowerCase().includes(term)
        ));
    }, [search, users]);

    const openEdit = (user) => {
        setActionError('');
        setEditingUser(user);
        setForm({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            companyName: user.companyName || '',
            role: user.role || 'customer',
            employeeRole: user.employeeRole || '',
            isActive: user.isActive !== false,
            isVerified: user.isVerified === true,
            password: '',
        });
    };

    const closeEdit = () => {
        if (saving) return;
        setEditingUser(null);
        setActionError('');
    };

    const handleSave = async () => {
        if (!editingUser || saving) return;
        if (!form.email.trim()) {
            setActionError(t('adminPages.users.emailRequired', { defaultValue: 'Email is required.' }));
            return;
        }

        setSaving(true);
        setActionError('');
        try {
            const payload = {
                id: editingUser.id,
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || null,
                companyName: form.companyName.trim() || null,
                role: form.role,
                employeeRole: form.role === 'employee' ? (form.employeeRole.trim() || 'Engineer') : null,
                isActive: form.isActive,
                isVerified: form.isVerified,
            };
            if (form.password) payload.password = form.password;
            await dispatch(updateUser(payload)).unwrap();
            setEditingUser(null);
        } catch (error) {
            setActionError(error?.message || t('adminPages.users.updateError', { defaultValue: 'Failed to update user.' }));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || saving) return;
        setSaving(true);
        setActionError('');
        try {
            await dispatch(deleteUser(deleteTarget.id)).unwrap();
            setDeleteTarget(null);
        } catch (error) {
            setActionError(error?.message || t('adminPages.users.deleteError', { defaultValue: 'Failed to delete user.' }));
        } finally {
            setSaving(false);
        }
    };

    if (loading && !users.length) {
        return (
            <AnimatedPageWrapper className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary-300" />
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-textSecondary">
                    {t('adminPages.users.loading', { defaultValue: 'Loading users...' })}
                </p>
            </AnimatedPageWrapper>
        );
    }

    return (
        <AnimatedPageWrapper className="space-y-8 pb-20">
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                    {t('adminPages.users.badge', { defaultValue: 'Admin Access' })}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                                {t('adminPages.users.title', { defaultValue: 'Users Directory' })}
                            </h1>
                            <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                                {t('adminPages.users.subtitle', { defaultValue: 'Admins can view all registered user accounts, including customers and internal staff.' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 mb-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-[32rem]">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('adminPages.users.search', { defaultValue: 'Search by name, email, phone, or role...' })}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200 shadow-sm"
                        />
                    </div>
                    <Badge variant="neutral" className="!rounded-sm bg-gray-100 border-gray-200 text-gray-700 shadow-sm">
                        {t('adminPages.users.count', { count: filteredUsers.length, defaultValue: '{{count}} users' })}
                    </Badge>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-sm mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.user', { defaultValue: 'User' })}
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.contact', { defaultValue: 'Contact' })}
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.role', { defaultValue: 'Role' })}
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.status', { defaultValue: 'Status' })}
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.createdAt', { defaultValue: 'Created' })}
                                </th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.actions', { defaultValue: 'Actions' })}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="transition-colors hover:bg-gray-50">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                                                <Users className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {user.fullName || t('adminPages.users.unknownName', { defaultValue: 'Unnamed user' })}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 font-mono tracking-wider">{user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1.5 text-sm text-gray-600 font-medium">
                                            <p className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-primary-500" />
                                                {user.email || '-'}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-primary-500" />
                                                {user.phone || '-'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="neutral" className="gap-1.5 !rounded-sm bg-gray-100 border-gray-200 text-gray-700 shadow-sm">
                                            <Shield className="h-3.5 w-3.5" />
                                            {formatRole(user.role)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={user.isActive ? 'success' : 'error'} className="!rounded-sm shadow-sm">
                                                {user.isActive
                                                    ? t('adminPages.users.active', { defaultValue: 'Active' })
                                                    : t('adminPages.users.inactive', { defaultValue: 'Inactive' })}
                                            </Badge>
                                            <Badge variant={user.isVerified ? 'info' : 'warning'} className="!rounded-sm shadow-sm">
                                                {user.isVerified
                                                    ? t('adminPages.users.verified', { defaultValue: 'Verified' })
                                                    : t('adminPages.users.unverified', { defaultValue: 'Unverified' })}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale) : '-'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(user)}
                                                className="flex h-9 w-9 items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-primary-500/40 hover:text-primary-600"
                                                aria-label={t('adminPages.users.edit', { defaultValue: 'Edit user' })}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActionError('');
                                                    setDeleteTarget(user);
                                                }}
                                                disabled={user.id === currentUser?.id}
                                                className="flex h-9 w-9 items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-red-500/40 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label={t('adminPages.users.delete', { defaultValue: 'Delete user' })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!filteredUsers.length ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-textSecondary">
                                        {t('adminPages.users.empty', { defaultValue: 'No users match this search.' })}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={Boolean(editingUser)}
                onClose={closeEdit}
                title={t('adminPages.users.editTitle', { defaultValue: 'Edit User Account' })}
                maxWidth="max-w-2xl"
                footer={(
                    <div className="flex w-full justify-end gap-3">
                        <Button variant="ghost" onClick={closeEdit} disabled={saving}>
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {t('common.save', { defaultValue: 'Save Changes' })}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-6">
                    {actionError ? <Alert variant="error">{actionError}</Alert> : null}
                    <div className="grid gap-5 md:grid-cols-2">
                        <Input
                            label={t('adminPages.users.fields.fullName', { defaultValue: 'Full Name' })}
                            value={form.fullName}
                            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                        />
                        <Input
                            label={t('adminPages.users.fields.email', { defaultValue: 'Email' })}
                            type="email"
                            required
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                        />
                        <Input
                            label={t('adminPages.users.fields.phone', { defaultValue: 'Phone' })}
                            value={form.phone}
                            onChange={(event) => setForm({ ...form, phone: event.target.value })}
                        />
                        <Input
                            label={t('adminPages.users.fields.companyName', { defaultValue: 'Company' })}
                            value={form.companyName}
                            onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                        />
                        <Select
                            label={t('adminPages.users.fields.role', { defaultValue: 'Platform Role' })}
                            value={form.role}
                            disabled={editingUser?.id === currentUser?.id}
                            onChange={(event) => setForm({ ...form, role: event.target.value })}
                        >
                            <option value="customer">{t('adminPages.users.roles.customer', { defaultValue: 'Customer' })}</option>
                            <option value="employee">{t('adminPages.users.roles.employee', { defaultValue: 'Employee' })}</option>
                            <option value="admin">{t('adminPages.users.roles.admin', { defaultValue: 'Admin' })}</option>
                        </Select>
                        {form.role === 'employee' ? (
                            <Input
                                label={t('adminPages.users.fields.employeeRole', { defaultValue: 'Employee Role' })}
                                value={form.employeeRole}
                                placeholder="Engineer"
                                onChange={(event) => setForm({ ...form, employeeRole: event.target.value })}
                            />
                        ) : null}
                        <Input
                            label={t('adminPages.users.fields.password', { defaultValue: 'Reset Password (optional)' })}
                            type="password"
                            value={form.password}
                            placeholder={t('adminPages.users.passwordPlaceholder', { defaultValue: 'Leave blank to keep current password' })}
                            onChange={(event) => setForm({ ...form, password: event.target.value })}
                        />
                    </div>

                    <div className="grid gap-4 rounded-sm border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                        <Switch
                            label={t('adminPages.users.fields.active', { defaultValue: 'Account active' })}
                            checked={form.isActive}
                            disabled={editingUser?.id === currentUser?.id}
                            onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                        />
                        <Switch
                            label={t('adminPages.users.fields.verified', { defaultValue: 'Email verified' })}
                            checked={form.isVerified}
                            onChange={(event) => setForm({ ...form, isVerified: event.target.checked })}
                        />
                    </div>
                    {editingUser?.id === currentUser?.id ? (
                        <p className="text-xs text-textSecondary">
                            {t('adminPages.users.selfProtection', { defaultValue: 'Your own admin role and active status are protected.' })}
                        </p>
                    ) : null}
                </div>
            </Modal>

            <Modal
                isOpen={Boolean(deleteTarget)}
                onClose={() => {
                    if (!saving) {
                        setDeleteTarget(null);
                        setActionError('');
                    }
                }}
                title={t('adminPages.users.deleteTitle', { defaultValue: 'Delete User Account' })}
                maxWidth="max-w-md"
                footer={(
                    <div className="flex w-full justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={saving}>
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button variant="danger" onClick={handleDelete} disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {t('adminPages.users.deleteAction', { defaultValue: 'Delete User' })}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-5 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-50 text-red-600">
                        <ShieldAlert className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-textPrimary">{deleteTarget?.fullName || deleteTarget?.email}</p>
                        <p className="text-sm leading-relaxed text-textSecondary">
                            {t('adminPages.users.deleteWarning', { defaultValue: 'This permanently deletes the account and its owned projects, offers, drafts, and generated files. This action cannot be undone.' })}
                        </p>
                    </div>
                    {actionError ? <Alert variant="error">{actionError}</Alert> : null}
                </div>
            </Modal>
        </AnimatedPageWrapper>
    );
}

