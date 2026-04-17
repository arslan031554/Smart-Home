import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Search, Mail, Phone, Shield, Loader2 } from 'lucide-react';
import { AnimatedPageWrapper, Card, SectionTitle, Badge } from '@/components/common/UIComponents';
import { fetchUsers } from '@/features/admin/adminSlice';
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
    const [search, setSearch] = useState('');

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
            <div className="hero-frame rounded-[2.2rem] px-6 py-8 sm:px-8">
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionTitle
                        title={t('adminPages.users.title', { defaultValue: 'Users Directory' })}
                        subtitle={t('adminPages.users.subtitle', { defaultValue: 'Admins can view all registered user accounts, including customers and internal staff.' })}
                        badge={t('adminPages.users.badge', { defaultValue: 'Admin Access' })}
                        className="mb-0"
                    />
                    <Badge variant="neutral">
                        {t('adminPages.users.count', { count: filteredUsers.length, defaultValue: '{{count}} users' })}
                    </Badge>
                </div>
            </div>

            <Card className="rounded-[1.9rem] p-4">
                <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('adminPages.users.search', { defaultValue: 'Search by name, email, phone, or role...' })}
                        className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                    />
                </div>
            </Card>

            <Card className="overflow-hidden rounded-[2rem] p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/8 bg-white/5">
                                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.user', { defaultValue: 'User' })}
                                </th>
                                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.contact', { defaultValue: 'Contact' })}
                                </th>
                                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.role', { defaultValue: 'Role' })}
                                </th>
                                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.status', { defaultValue: 'Status' })}
                                </th>
                                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                    {t('adminPages.users.columns.createdAt', { defaultValue: 'Created' })}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/8">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="transition-colors hover:bg-white/5">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                                                <Users className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-textPrimary">
                                                    {user.fullName || t('adminPages.users.unknownName', { defaultValue: 'Unnamed user' })}
                                                </p>
                                                <p className="mt-1 text-xs text-textSecondary">{user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1.5 text-sm text-textSecondary">
                                            <p className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-primary-300" />
                                                {user.email || '-'}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-primary-300" />
                                                {user.phone || '-'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="neutral" className="gap-1.5">
                                            <Shield className="h-3.5 w-3.5" />
                                            {formatRole(user.role)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={user.isActive ? 'success' : 'error'}>
                                                {user.isActive
                                                    ? t('adminPages.users.active', { defaultValue: 'Active' })
                                                    : t('adminPages.users.inactive', { defaultValue: 'Inactive' })}
                                            </Badge>
                                            <Badge variant={user.isVerified ? 'info' : 'warning'}>
                                                {user.isVerified
                                                    ? t('adminPages.users.verified', { defaultValue: 'Verified' })
                                                    : t('adminPages.users.unverified', { defaultValue: 'Unverified' })}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-textSecondary">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AnimatedPageWrapper>
    );
}

