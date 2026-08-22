import { createElement, useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, User, Settings, Briefcase, Bell, Search, Menu, X, LogOut, FileText, Activity, Home, Sliders, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import ScrollToTop from '@/components/common/ScrollToTop';
import { useTranslation } from 'react-i18next';
import { hasAdminAccess } from '../constants/adminPermissions';
import { Badge } from '@/components/common/UIComponents';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

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
        <div className="dashboard-theme min-h-screen bg-gray-50 text-textPrimary">
            <ScrollToTop />

            <div className="flex min-h-screen">
                {isSidebarOpen ? (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm md:hidden"
                    />
                ) : null}

                <aside className={clsx(
                    'dark-surface fixed inset-y-0 left-0 z-50 border-r border-white/10 backdrop-blur-2xl transition-all duration-300 md:relative bg-[#0a180b]',
                    isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0',
                )}>
                    <button
                        type="button"
                        aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                        title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="absolute -right-4 top-24 z-[60] hidden h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-[#102b12] text-primary-200 shadow-premium transition-all hover:border-primary-300/35 hover:bg-primary-500 hover:text-white md:flex"
                    >
                        <ChevronLeft className={clsx('h-4 w-4 transition-transform duration-300', !isSidebarOpen && 'rotate-180')} />
                    </button>

                    <div className={clsx(
                        'flex h-full flex-col py-6 transition-all duration-300',
                        isSidebarOpen ? 'px-5' : 'px-3',
                    )}>
                        <Link to="/" className={clsx('group flex items-center pb-8', isSidebarOpen ? 'gap-3 px-2' : 'justify-center px-0')} title="Home">
                            <img
                                src="/images/green-electric-logo.png"
                                alt="Green Electric Innovations"
                                className={clsx(
                                    'w-auto object-contain shadow-lg shadow-emerald/10 transition-all duration-300 group-hover:-translate-y-0.5',
                                    isSidebarOpen ? 'h-14 max-w-[230px]' : 'h-8 max-w-12',
                                )}
                            />
                        </Link>

                        <nav className={clsx('space-y-2', !isSidebarOpen && 'flex flex-col items-center')}>
                            <p className={clsx('px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-300', !isSidebarOpen && 'sr-only')}>
                                {t('dashboardLayout.menu')}
                            </p>
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => {
                                            if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
                                        }}
                                        className={clsx(
                                            'group flex min-h-10 items-center rounded-sm border text-sm transition-all duration-300',
                                            isSidebarOpen ? 'w-full gap-3 px-4 py-2.5' : 'w-11 justify-center px-2 py-2.5',
                                            isActive
                                                ? 'border-primary-500/20 bg-primary-500/12 text-primary-200'
                                                : 'border-transparent text-textSecondary hover:border-white/8 hover:bg-white/5 hover:text-textPrimary',
                                        )}
                                        title={!isSidebarOpen ? item.name : undefined}
                                    >
                                        <Icon className={clsx('h-4.5 w-4.5', isActive ? 'text-primary-300' : 'text-textSecondary group-hover:text-primary-300')} />
                                        <span className={clsx('font-medium', !isSidebarOpen && 'sr-only')}>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {hasAdminAccess(user) ? (
                                <div className={clsx('pt-6', !isSidebarOpen && 'w-full')}>
                                    <p className={clsx('px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-300', !isSidebarOpen && 'sr-only')}>
                                        {t('nav.admin')}
                                    </p>
                                    <Link
                                        to="/admin"
                                        onClick={() => {
                                            if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
                                        }}
                                        className={clsx(
                                            'mt-2 flex min-h-10 items-center rounded-sm border border-transparent text-sm text-textSecondary transition-all hover:border-white/8 hover:bg-white/5 hover:text-textPrimary',
                                            isSidebarOpen ? 'w-full gap-3 px-4 py-2.5' : 'mx-auto w-11 justify-center px-2 py-2.5',
                                        )}
                                        title={!isSidebarOpen ? t('dashboardLayout.admin') : undefined}
                                    >
                                        <Activity className="h-4.5 w-4.5 text-textSecondary" />
                                        <span className={clsx('font-medium', !isSidebarOpen && 'sr-only')}>{t('dashboardLayout.admin')}</span>
                                    </Link>
                                </div>
                            ) : null}
                        </nav>

                        <div className={clsx('mt-auto space-y-4 border-t border-white/8 pt-6', !isSidebarOpen && 'space-y-3')}>
                            <div className={clsx('rounded-sm border border-white/8 bg-white/5', isSidebarOpen ? 'p-4' : 'p-2')}>
                                <div className={clsx('flex items-center', isSidebarOpen ? 'gap-3' : 'justify-center')}>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary-500/18 bg-primary-500/12 text-sm font-semibold text-primary-200">
                                        {initials}
                                    </div>
                                    <div className={clsx('min-w-0', !isSidebarOpen && 'sr-only')}>
                                        <p className="truncate text-sm font-medium text-textPrimary">{user?.fullName || user?.email || t('dashboardLayout.user')}</p>
                                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                            {user?.role === 'admin' ? t('nav.admin') : t('dashboardLayout.customer')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className={clsx(
                                    'flex w-full items-center justify-center gap-2 rounded-sm border border-red-500/16 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200',
                                    isSidebarOpen ? 'px-4 py-3' : 'h-10 px-2 py-2',
                                )}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className={clsx(!isSidebarOpen && 'sr-only')}>{t('nav.logout')}</span>
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
                                    aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                                    title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-textSecondary transition-all hover:border-primary-500/20 hover:text-primary-300"
                                >
                                    <span className="md:hidden">
                                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                    </span>
                                    <span className="hidden md:block">
                                        {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </span>
                                </button>

                                <nav className="hidden items-center gap-1 rounded-sm border border-white/8 bg-white/5 p-1.5 backdrop-blur-xl lg:flex">
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
                                                    'flex items-center gap-2 rounded-sm px-3.5 py-2 text-xs font-semibold transition-all duration-300',
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

                            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                                {createElement(LanguageSwitcher, { variant: 'compact', className: 'sm:hidden' })}
                                {createElement(LanguageSwitcher, { variant: 'inline', className: 'hidden sm:inline-flex' })}
                                <div className="relative hidden w-72 min-[1720px]:block">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-textSecondary" />
                                    <input
                                        type="text"
                                        placeholder={t('dashboardLayout.searchPlaceholder')}
                                        className="w-full rounded-sm border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                                    />
                                </div>

                                <button className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 bg-white/5 text-textSecondary transition-all hover:border-primary-500/20 hover:text-primary-300">
                                    <Bell className="h-4.5 w-4.5" />
                                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary-300" />
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                                        className="flex max-w-[18rem] items-center gap-2.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 transition-all hover:border-primary-500/20 hover:bg-white/8"
                                    >
                                        {/* <div className="hidden min-w-0 text-right sm:block">
                                            <p className="truncate text-sm font-medium text-textPrimary">{user?.fullName || user?.email || t('dashboardLayout.user')}</p>
                                            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{user?.email}</p>
                                        </div> */}
                                        <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary-500/18 bg-primary-500/12 text-[11px] font-semibold text-primary-200">
                                            {initials}
                                        </div>
                                    </button>

                                    {isDropdownOpen ? (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                            <div className="premium-panel absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-sm border border-white/10 bg-[#161616]">
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
