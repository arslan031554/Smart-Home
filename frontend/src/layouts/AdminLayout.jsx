import { createElement, useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    Users,
    Package,
    Layers,
    Palette,
    Zap,
    Briefcase,
    Store,
    Percent,
    FileText,
    AlertCircle,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    ShieldCheck,
    Box,
    Monitor,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    UserRound,
    Home,
    Sliders,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import ScrollToTop from '@/components/common/ScrollToTop';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@/constants/adminPermissions';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

function isPathActive(currentPath, href) {
    if (href === '/admin') return currentPath === href;
    return currentPath === href || currentPath.startsWith(`${href}/`);
}
export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        setIsAccountMenuOpen(false);
        navigate('/auth/login');
    };

    const menuSections = useMemo(() => ([
        {
            key: 'primary',
            items: [
                { name: t('admin.menu.dashboard'), href: '/admin', icon: LayoutDashboard },
                { name: t('admin.menu.offersMonitoring'), href: '/admin/offers', icon: Monitor, permission: 'view_offers' },
                { name: t('admin.menu.projects', { defaultValue: 'Projects' }), href: '/admin/projects', icon: Briefcase, permission: 'view_offers' },
            ],
        },
        {
            key: 'masterData',
            title: t('admin.menu.masterData'),
            items: [
                { name: t('admin.menu.buildingTypes'), href: '/admin/building-types', icon: Store, permission: 'view_master' },
                { name: t('admin.menu.roomTypes'), href: '/admin/room-types', icon: Layers, permission: 'view_master' },
                { name: t('admin.menu.smartFunctions'), href: '/admin/functions', icon: Zap, permission: 'view_master' },
                { name: t('admin.menu.productRanges'), href: '/admin/ranges', icon: Box, permission: 'view_hardware' },
                { name: t('admin.menu.colors'), href: '/admin/colors', icon: Palette, permission: 'view_hardware' },
                { name: t('admin.menu.productsCatalog'), href: '/admin/products', icon: Package, permission: 'view_hardware' },
                { name: t('admin.menu.professionalServices'), href: '/admin/services', icon: Briefcase, permission: 'view_hardware' },
            ],
        },
        {
            key: 'rulesContent',
            title: t('admin.menu.rulesContent'),
            items: [
                { name: t('admin.menu.discountRules'), href: '/admin/discounts', icon: Percent, permission: 'manage_rules' },
                { name: t('admin.menu.offerConditions'), href: '/admin/conditions', icon: FileText, permission: 'manage_rules' },
                { name: t('admin.menu.publicDisclaimers'), href: '/admin/disclaimers', icon: AlertCircle, permission: 'manage_rules' },
                { name: t('admin.menu.followupTemplates'), href: '/admin/followup-templates', icon: Bell, permission: 'manage_rules' },
            ],
        },
        {
            key: 'system',
            title: t('admin.menu.system'),
            items: [
                { name: t('admin.menu.employeeManagement'), href: '/admin/employees', icon: Users, permission: 'manage_employees' },
                { name: t('admin.menu.userDirectory', { defaultValue: 'Users Directory' }), href: '/admin/users', icon: UserRound, permission: 'manage_employees' },
                { name: t('admin.menu.accessPermissions'), href: '/admin/permissions', icon: ShieldCheck, permission: 'manage_employees' },
                { name: t('admin.menu.globalSettings'), href: '/admin/settings', icon: Settings },
            ],
        },
    ]), [t]);

    const topNavigation = useMemo(() => ([
        { name: t('nav.home'), href: '/', icon: Home },
        { name: t('nav.configurator'), href: '/configurator', icon: Sliders },
        { name: t('nav.admin'), href: '/admin', icon: Monitor },
    ]), [t]);

    const visibleSections = useMemo(() => (
        menuSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => !item.permission || hasPermission(user, item.permission)),
            }))
            .filter((section) => section.items.length > 0)
    ), [menuSections, user]);

    const allVisibleItems = visibleSections.flatMap((section) => section.items);
    const activeItem = allVisibleItems.find((item) => isPathActive(location.pathname, item.href));
    const activeLabel = activeItem?.name || t('admin.console');
    const initials = (user?.fullName || user?.email || 'AD')
        .split(/\s|@/)
        .map((part) => part[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const displayRole = user?.role === 'admin' ? 'Platform Admin' : (user?.employeeRole || 'Employee Access');

    return (
        <div className="admin-theme min-h-screen bg-gradient-surface text-textPrimary">
            <ScrollToTop />

            <div className="flex min-h-screen">
                {isSidebarOpen ? (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm md:hidden"
                    />
                ) : null}

                <aside className={clsx(
                    'dark-surface fixed inset-y-0 left-0 z-50 border-r border-white/10 backdrop-blur-2xl transition-all duration-300 md:relative',
                    isSidebarOpen ? 'w-[18rem] translate-x-0' : 'w-[18rem] -translate-x-full md:w-20 md:translate-x-0',
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
                        isSidebarOpen ? 'px-5' : 'px-1',
                    )}>
                        <Link to="/admin" className="group block" title="Admin dashboard">
                            <div className={clsx(
                                'relative pb-4 transition-all duration-300',
                                isSidebarOpen ? 'px-2' : 'px-0',
                            )}>
                                <div className={clsx(
                                    'relative z-10 space-y-3 transition-all duration-300',
                                    !isSidebarOpen && 'flex flex-col items-center space-y-2',
                                )}>
                                    <img
                                        src="/images/green-electric-logo.png"
                                        alt="Green Electric Innovations"
                                        className={clsx(
                                            'w-auto object-contain transition-all duration-300',
                                            isSidebarOpen ? 'h-14 max-w-[220px]' : 'h-8 max-w-12',
                                        )}
                                    />
                                    <p className={clsx(
                                        'text-[10px] font-black uppercase tracking-[0.22em] text-primary-300 transition-all duration-300',
                                        !isSidebarOpen && 'sr-only',
                                    )}>{t('admin.controlCenter', { defaultValue: 'Control Center' })}</p>
                                </div>
                            </div>
                        </Link>

                        <nav className={clsx('mt-6 flex-1 overflow-y-auto', isSidebarOpen ? 'pr-1' : 'pr-0')}>
                            <div className={clsx(isSidebarOpen ? 'space-y-5' : 'space-y-3')}>
                                {visibleSections.map((section) => (
                                    <section key={section.key} className={clsx(isSidebarOpen ? 'space-y-3' : 'space-y-2')}>
                                        {section.title ? (
                                            <div className={clsx('flex items-center gap-3 px-2', !isSidebarOpen && 'justify-center px-0')}>
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary-300">
                                                    {isSidebarOpen ? section.title : ''}
                                                </span>
                                                <div className={clsx(
                                                    'h-px bg-gradient-to-r from-primary-500/20 via-white/8 to-transparent',
                                                    isSidebarOpen ? 'flex-1' : 'w-8',
                                                )} />
                                            </div>
                                        ) : null}

                                        <div className={clsx(
                                            'rounded-[1.55rem] border border-white/6 bg-white/[0.03]',
                                            isSidebarOpen ? 'p-2.5' : 'p-1.5',
                                        )}>
                                            <div className="space-y-1.5">
                                                {section.items.map((item) => {
                                                    const Icon = item.icon;
                                                    const isActive = isPathActive(location.pathname, item.href);

                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            to={item.href}
                                                            onClick={() => {
                                                                if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
                                                            }}
                                                            className={clsx(
                                                                'group/item relative flex items-center overflow-hidden rounded-[1.2rem] border transition-all duration-300',
                                                                isSidebarOpen ? 'gap-3 px-3.5 py-3' : 'justify-center px-2 py-2.5',
                                                                isActive
                                                                    ? 'border-primary-500/24 bg-gradient-to-r from-primary-500/14 via-primary-500/10 to-transparent text-textPrimary shadow-[0_18px_34px_rgba(0,0,0,0.2)]'
                                                                    : 'border-transparent text-textSecondary hover:border-white/8 hover:bg-white/5 hover:text-textPrimary',
                                                            )}
                                                            title={!isSidebarOpen ? item.name : undefined}
                                                        >
                                                            <div className={clsx(
                                                                'absolute inset-y-3 left-0 w-1 rounded-full transition-all',
                                                                isActive ? 'bg-gradient-brand opacity-100' : 'opacity-0',
                                                            )}
                                                            />
                                                            <div className={clsx(
                                                                'relative flex h-9 w-9 items-center justify-center rounded-md border transition-all duration-300',
                                                                isActive
                                                                    ? 'border-primary-500/24 bg-primary-500/12 text-primary-300'
                                                                    : 'border-white/8 bg-[#1b1b1b] text-textSecondary group-hover/item:border-primary-500/18 group-hover/item:text-primary-300',
                                                            )}
                                                            >
                                                                <Icon className="h-4.5 w-4.5" />
                                                            </div>
                                                            <span className={clsx('min-w-0 flex-1 truncate text-sm font-medium', !isSidebarOpen && 'sr-only')}>
                                                                {item.name}
                                                            </span>
                                                            {isSidebarOpen && isActive ? (
                                                                <span className="h-2.5 w-2.5 rounded-full bg-primary-300 shadow-[0_0_16px_rgba(212,168,68,0.45)]" />
                                                            ) : isSidebarOpen ? (
                                                                <ChevronRight className="h-4 w-4 text-transparent transition-colors group-hover/item:text-primary-300/70" />
                                                            ) : null}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </nav>

                        <div className={clsx(
                            'mt-6 rounded-[1.7rem] border border-white/8 bg-white/[0.04]',
                            isSidebarOpen ? 'p-4' : 'p-2',
                        )}>
                            <div className={clsx('flex items-center', isSidebarOpen ? 'gap-3' : 'justify-center')}>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-sm font-semibold text-primary-200">
                                    {initials || 'AD'}
                                </div>
                                <div className={clsx('min-w-0 flex-1', !isSidebarOpen && 'sr-only')}>
                                    <p className="truncate text-sm font-medium text-textPrimary">
                                        {user?.fullName || user?.email || 'Admin User'}
                                    </p>
                                    <Badge variant="info" className="mt-1 px-2 py-0.5 text-[9px]">
                                        {displayRole}
                                    </Badge>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className={clsx(
                                        'rounded-full border border-white/8 p-2 text-textSecondary transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300',
                                        !isSidebarOpen && 'sr-only',
                                    )}
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
                    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#141414]/90 px-4 py-4 backdrop-blur-2xl md:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                                    aria-label={isSidebarOpen ? t('admin.hideSidebar', { defaultValue: 'Hide sidebar' }) : t('admin.showSidebar', { defaultValue: 'Show sidebar' })}
                                    title={isSidebarOpen ? t('admin.hideSidebar', { defaultValue: 'Hide sidebar' }) : t('admin.showSidebar', { defaultValue: 'Show sidebar' })}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-textSecondary transition-all hover:border-primary-500/20 hover:text-primary-300"
                                >
                                    <span className="md:hidden">
                                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                    </span>
                                    <span className="hidden md:block">
                                        {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </span>
                                </button>

                                <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/5 p-1.5 backdrop-blur-xl lg:flex">
                                    {topNavigation.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = item.href === '/admin'
                                            ? location.pathname === '/admin' || location.pathname.startsWith('/admin/')
                                            : location.pathname === item.href;

                                        return (
                                            <Link
                                                key={item.href}
                                                to={item.href}
                                                className={clsx(
                                                    'flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-300',
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

                                <div className="lg:hidden">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-300">{t('admin.backoffice', { defaultValue: 'Backoffice' })}</p>
                                    <h2 className="text-lg font-medium text-textPrimary">{activeLabel}</h2>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                                {createElement(LanguageSwitcher, { variant: 'compact', className: 'sm:hidden' })}
                                {createElement(LanguageSwitcher, { variant: 'inline', className: 'hidden sm:inline-flex' })}
                                <div className="relative hidden w-72 min-[1720px]:block">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-textSecondary" />
                                    <input
                                        type="text"
                                        placeholder={t('admin.searchPlaceholder')}
                                        className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                                    />
                                </div>

                                <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-textSecondary transition-all hover:border-primary-500/20 hover:text-primary-300">
                                    <Bell className="h-4.5 w-4.5" />
                                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary-300" />
                                </button>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                                        className="flex max-w-[18rem] items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 transition-all duration-300 hover:border-primary-500/20 hover:bg-white/8"
                                    >
                                        <div className="hidden min-w-0 text-right sm:block">
                                            <p className="truncate text-sm font-medium leading-tight text-textPrimary">{user?.fullName || 'Master Control'}</p>
                                            <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.18em] text-primary-300">{displayRole}</p>
                                        </div>
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-500/18 bg-primary-500/12 text-[11px] font-semibold text-primary-200">
                                            {initials || 'AD'}
                                        </div>
                                        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-primary-300 transition-transform duration-300', isAccountMenuOpen && 'rotate-180')} />
                                    </button>

                                    {isAccountMenuOpen ? (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsAccountMenuOpen(false)} />
                                            <div className="premium-panel absolute right-0 z-20 mt-3 w-64 overflow-hidden rounded-[1.5rem] border border-white/10">
                                                <div className="border-b border-white/8 px-5 py-4">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-300">{t('auth.account', { defaultValue: 'Account' })}</p>
                                                    <p className="mt-2 truncate text-sm text-textPrimary">{user?.email || user?.fullName || 'Admin User'}</p>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setIsAccountMenuOpen(false)}
                                                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-textSecondary transition-all hover:bg-white/6 hover:text-textPrimary"
                                                    >
                                                        <Monitor className="h-4 w-4" />
                                                        {t('admin.menu.dashboard')}
                                                    </Link>
                                                    <Link
                                                        to="/dashboard/profile"
                                                        onClick={() => setIsAccountMenuOpen(false)}
                                                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-textSecondary transition-all hover:bg-white/6 hover:text-textPrimary"
                                                    >
                                                        <UserRound className="h-4 w-4" />
                                                        {t('nav.profile')}
                                                    </Link>
                                                    <Link
                                                        to="/admin/settings"
                                                        onClick={() => setIsAccountMenuOpen(false)}
                                                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-textSecondary transition-all hover:bg-white/6 hover:text-textPrimary"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        {t('admin.menu.globalSettings')}
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
