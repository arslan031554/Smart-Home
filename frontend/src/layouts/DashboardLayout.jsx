import { useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, User, Settings, Briefcase, Bell, Search, Menu, X, LogOut, Zap, FileText, Activity, Home, Sliders,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import ScrollToTop from '@/components/common/ScrollToTop';
import { useTranslation } from 'react-i18next';
import { hasAdminAccess } from '../constants/adminPermissions';
import { Badge } from '@/components/common/UIComponents';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { t } = useTranslation();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/auth/login');
    };

    const menuItems = [
        { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('dashboardLayout.projects'), href: '/dashboard/projects', icon: Briefcase },
        { name: t('dashboardLayout.offers'), href: '/dashboard/offers', icon: FileText },
        { name: t('nav.profile'), href: '/dashboard/profile', icon: User },
        { name: t('dashboardLayout.settings'), href: '/dashboard/settings', icon: Settings },
    ];

    const topNavigation = useMemo(() => ([
        { name: t('nav.home'), href: '/', icon: Home },
        { name: t('nav.configurator'), href: '/configurator', icon: Sliders },
        { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    ]), [t]);

    const initials = (user?.fullName || user?.email || 'U')
        .split(/\s|@/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-gradient-surface text-textPrimary">
            <ScrollToTop />

            <div className="flex min-h-screen">
                {isSidebarOpen ? (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm md:hidden"
                    />
                ) : null}

                <aside className={clsx(
                    'dark-surface fixed inset-y-0 left-0 z-50 w-80 border-r border-white/10 backdrop-blur-2xl transition-transform duration-300 md:relative md:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}>
                    <div className="flex h-full flex-col px-5 py-6">
                        <Link to="/" className="group flex items-center gap-3 px-2 pb-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow transition-transform duration-300 group-hover:-translate-y-0.5">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-heading text-3xl font-semibold leading-none text-textPrimary">Smart Home</p>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-300">Configurator</p>
                            </div>
                        </Link>

                        <nav className="space-y-2">
                            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-300">
                                {t('dashboardLayout.menu')}
                            </p>
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={clsx(
                                            'group flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 text-sm transition-all duration-300',
                                            isActive
                                                ? 'border-primary-500/20 bg-primary-500/12 text-primary-200'
                                                : 'border-transparent text-textSecondary hover:border-white/8 hover:bg-white/5 hover:text-textPrimary',
                                        )}
                                    >
                                        <Icon className={clsx('h-4.5 w-4.5', isActive ? 'text-primary-300' : 'text-textSecondary group-hover:text-primary-300')} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}

                            {hasAdminAccess(user) ? (
                                <div className="pt-6">
                                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-300">
                                        {t('nav.admin')}
                                    </p>
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="mt-2 flex items-center gap-3 rounded-[1.25rem] border border-transparent px-4 py-3 text-sm text-textSecondary transition-all hover:border-white/8 hover:bg-white/5 hover:text-textPrimary"
                                    >
                                        <Activity className="h-4.5 w-4.5 text-textSecondary" />
                                        <span className="font-medium">{t('dashboardLayout.admin')}</span>
                                    </Link>
                                </div>
                            ) : null}
                        </nav>

                        <div className="mt-auto space-y-4 border-t border-white/8 pt-6">
                            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-sm font-semibold text-primary-200">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-textPrimary">{user?.fullName || user?.email || t('dashboardLayout.user')}</p>
                                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                            {user?.role === 'admin' || user?.role === 'employee' ? t('nav.admin') : t('dashboardLayout.customer')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/16 px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                            >
                                <LogOut className="h-4 w-4" />
                                {t('nav.logout')}
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
                    <header className="dark-surface sticky top-0 z-30 border-b border-white/10 px-4 py-4 backdrop-blur-2xl md:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-all hover:border-primary-500/20 hover:text-primary-300 md:hidden"
                                >
                                    {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>

                                <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/5 p-1.5 backdrop-blur-xl lg:flex">
                                    {topNavigation.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = item.href === '/dashboard'
                                            ? location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/')
                                            : location.pathname === item.href;

                                        return (
                                            <Link
                                                key={item.href}
                                                to={item.href}
                                                className={clsx(
                                                    'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300',
                                                    isActive
                                                        ? 'bg-primary-500/14 text-primary-200 shadow-soft border border-primary-500/18'
                                                        : 'text-textSecondary hover:bg-white/6 hover:text-textPrimary',
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative hidden w-80 xl:block">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-textSecondary" />
                                    <input
                                        type="text"
                                        placeholder={t('dashboardLayout.searchPlaceholder')}
                                        className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                                    />
                                </div>

                                <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary transition-all hover:border-primary-500/20 hover:text-primary-300">
                                    <Bell className="h-4.5 w-4.5" />
                                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary-300" />
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                                        className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 transition-all hover:border-primary-500/20 hover:bg-white/8"
                                    >
                                        <div className="hidden text-right sm:block">
                                            <p className="text-sm font-medium text-textPrimary">{user?.fullName || user?.email || t('dashboardLayout.user')}</p>
                                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{user?.email}</p>
                                        </div>
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-500/18 bg-primary-500/12 text-sm font-semibold text-primary-200">
                                            {initials}
                                        </div>
                                    </button>

                                    {isDropdownOpen ? (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                            <div className="premium-panel absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-[1.5rem] border border-white/10">
                                                <div className="border-b border-white/8 px-5 py-4">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-300">{t('dashboardLayout.account')}</p>
                                                    <p className="mt-2 truncate text-sm text-textPrimary">{user?.email}</p>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        to="/dashboard/profile"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-textSecondary transition-all hover:bg-white/6 hover:text-textPrimary"
                                                    >
                                                        <User className="h-4 w-4" />
                                                        {t('nav.profile')}
                                                    </Link>
                                                    <Link
                                                        to="/dashboard/settings"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-textSecondary transition-all hover:bg-white/6 hover:text-textPrimary"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        {t('dashboardLayout.settings')}
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-red-300 transition-all hover:bg-red-500/10 hover:text-red-200"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        {t('nav.logout')}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
