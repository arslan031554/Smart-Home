import { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import CookieBanner from '../components/common/CookieBanner';
import { Globe, Shield, Bell, Home, Plus, X, Menu, Zap, Sliders, LogOut, UserRound, Activity, LayoutDashboard } from 'lucide-react';
import { Button, Avatar } from '../components/common/UIComponents';
import { resetConfigurator } from '../features/configurator/configuratorSlice';
import { logout } from '../features/auth/authSlice';
import ScrollToTop from '../components/common/ScrollToTop';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { hasAdminAccess } from '../constants/adminPermissions';
import api from '../utils/api';
import { normalizeApiError } from '../utils/normalizeApiError';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function RootLayout() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const useDarkNavbarSurface = location.pathname === '/' || location.pathname.startsWith('/configurator');

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const closeAllOverlays = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const navigation = useMemo(
    () => [
      {
        name: t('nav.home'),
        href: '/',
        icon: Home,
        requiresAuth: false,
      },
      {
        name: t('nav.configurator'),
        href: '/configurator',
        icon: Sliders,
        requiresAuth: true,
        onClick: () => dispatch(resetConfigurator()),
      },
      {
        name: t('nav.dashboard'),
        href: '/dashboard',
        icon: LayoutDashboard,
        requiresAuth: true,
      },
      {
        name: t('nav.admin'),
        href: '/admin',
        icon: Activity,
        requiresAuth: true,
        requiresAdmin: true,
      },
    ],
    [t, dispatch],
  );

  const handleNavClick = (callback) => {
    closeAllOverlays();
    if (callback) callback();
  };

  const handleLogout = async () => {
    await dispatch(logout());
    closeAllOverlays();
    navigate('/auth/login');
  };

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();

    const email = String(newsletterEmail || '').trim().toLowerCase();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmailValid) {
      setNewsletterState('error');
      setNewsletterMessage(t('auth.errors.invalidEmail', 'Please enter a valid email address.'));
      return;
    }

    setNewsletterState('submitting');
    setNewsletterMessage('');

    try {
      const response = await api.post('/auth/newsletter-subscribe', { email });
      const alreadySubscribed = Boolean(response?.data?.data?.alreadySubscribed);
      setNewsletterState('success');
      setNewsletterMessage(
        response?.data?.message || (alreadySubscribed
          ? t('footer.alreadySubscribed', 'You are already subscribed to updates.')
          : t('footer.subscribeSuccess', 'You are now subscribed to updates.')),
      );
      setNewsletterEmail('');
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      setNewsletterState('error');
      setNewsletterMessage(normalizedError.message || t('errors.requestFailed'));
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-surface text-textPrimary selection:bg-primary-500/20 selection:text-textPrimary">
      <ScrollToTop />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,83,45,0.04),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,168,68,0.08),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />
        <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-primary-500/12 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
      </div>

      <header className={cn('sticky top-0 z-50 transition-all duration-500', scrolled ? 'pt-4 pb-2' : 'py-5')}>
        <div className="container-custom">
          <div
            className={cn(
              'mx-auto flex w-full items-center justify-between gap-4 rounded-[2rem] border px-4 sm:px-6 transition-all duration-500',
              scrolled
                ? useDarkNavbarSurface
                  ? 'border-white/8 bg-[#141414]/90 py-3 backdrop-blur-2xl'
                  : 'premium-panel py-3 border-white/8'
                : useDarkNavbarSurface
                  ? 'border-white/8 bg-[#141414]/90 py-4 backdrop-blur-2xl'
                  : 'border-white/5 bg-white/[0.04] py-4 backdrop-blur-xl',
            )}
          >
            <Link to="/" onClick={closeAllOverlays} className="group flex flex-shrink-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand text-primary-950 shadow-glow transition-transform duration-300 group-hover:-translate-y-0.5">
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-2xl font-semibold text-textPrimary">
                  {t('app.brandName')}
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-300">
                  {t('app.brandProduct')}
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              <div className="flex items-center gap-1 rounded-full border border-white/8 bg-white/5 p-1.5 backdrop-blur-xl">
                {navigation.map((item) => {
                  if (item.requiresAuth && !isAuthenticated) return null;
                  if (item.requiresAdmin && !hasAdminAccess(user)) return null;

                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleNavClick(item.onClick)}
                      className={cn(
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
              </div>

              <div className="ml-2 flex items-center gap-4 border-l border-white/8 pl-5">
                <LanguageSwitcher />

                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-3 rounded-full border border-white/8 bg-white/5 px-2 py-1.5 transition-all duration-300 hover:border-primary-500/20 hover:bg-white/8"
                    >
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold text-textPrimary leading-none">
                          {user?.fullName || user?.name}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-textSecondary">
                          {t('nav.profile')}
                        </p>
                      </div>
                      <Avatar
                        name={user?.fullName || user?.name}
                        size="md"
                        className="border border-primary-500/18"
                      />
                    </button>

                    {isDropdownOpen ? (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                        <div className="premium-panel absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-[1.5rem] border border-white/10">
                          <div className="border-b border-white/8 px-5 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-300">{t('nav.profile')}</p>
                            <p className="mt-2 truncate text-sm font-medium text-textPrimary">{user?.email}</p>
                          </div>

                          <div className="p-2">
                            <Link
                              to="/dashboard/profile"
                              onClick={closeAllOverlays}
                              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-textSecondary transition-all hover:bg-white/6 hover:text-textPrimary"
                            >
                              <UserRound className="h-4 w-4" />
                              {t('nav.profile')}
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
                ) : (
                  <div className="flex items-center gap-3">
                    <Link to="/auth/login" onClick={closeAllOverlays} className="text-sm font-semibold text-textSecondary transition-colors hover:text-textPrimary">
                      {t('nav.login')}
                    </Link>
                    <Link to="/auth/register" onClick={closeAllOverlays}>
                      <Button size="md">{t('nav.getStarted')}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary shadow-soft transition-all hover:border-primary-500/20 hover:text-primary-300 lg:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="container-custom lg:hidden">
            <div
              className={cn(
                'mt-3 overflow-hidden rounded-[2rem] border p-4 animate-slide-up',
                useDarkNavbarSurface
                  ? 'border-white/8 bg-[#141414]/90 backdrop-blur-2xl'
                  : 'premium-panel border-white/10',
              )}
            >
              <div className="pb-3">
                <LanguageSwitcher className="justify-start" />
              </div>
              <div className="space-y-2 border-t border-white/8 pt-4">
                {navigation.map((item) => {
                  if (item.requiresAuth && !isAuthenticated) return null;
                  if (item.requiresAdmin && !hasAdminAccess(user)) return null;

                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleNavClick(item.onClick)}
                      className={cn(
                        'flex items-center gap-4 rounded-2xl px-4 py-3 text-sm transition-all',
                        isActive
                          ? 'bg-primary-500/12 text-primary-200 border border-primary-500/18'
                          : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={closeAllOverlays}>
                      <Button variant="secondary" className="w-full">{t('nav.dashboard')}</Button>
                    </Link>
                    <button onClick={handleLogout} className="rounded-full border border-red-500/18 px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10">
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" onClick={closeAllOverlays}>
                      <Button variant="secondary" className="w-full">{t('nav.login')}</Button>
                    </Link>
                    <Link to="/auth/register" onClick={closeAllOverlays}>
                      <Button className="w-full">{t('nav.getStarted')}</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="relative z-10 flex flex-grow flex-col">
        <div className="flex-grow">
          <Outlet />
        </div>
        <CookieBanner />
      </main>

      <footer className="relative z-10 mt-auto border-t border-white/8 bg-[#141414]/90 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/45 to-transparent" />
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="space-y-6 lg:col-span-4 lg:pr-6">
              <Link to="/" onClick={closeAllOverlays} className="group flex w-fit items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-950 shadow-glow">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-heading text-3xl font-semibold text-textPrimary">{t('app.brandName')}</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-300">{t('app.brandProduct')}</span>
                </div>
              </Link>

              <p className="max-w-sm text-sm leading-relaxed text-textSecondary">{t('footer.tagline')}</p>

              <div className="flex items-center gap-3">
                {[Globe, Shield, Bell].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-textSecondary transition-all hover:border-primary-500/20 hover:text-primary-300"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-300">{t('footer.platform')}</h4>
              <ul className="space-y-3 text-sm text-textSecondary">
                <li>
                  <Link
                    to="/configurator"
                    onClick={() => {
                      dispatch(resetConfigurator());
                      closeAllOverlays();
                    }}
                    className="transition-colors hover:text-textPrimary"
                  >
                    {t('nav.configurator')}
                  </Link>
                </li>
                <li>
                  <Link to="/offers" onClick={closeAllOverlays} className="transition-colors hover:text-textPrimary">
                    {t('nav.offers')}
                  </Link>
                </li>
                <li>
                  <Link to="/admin" onClick={closeAllOverlays} className="transition-colors hover:text-textPrimary">
                    {t('nav.admin')}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" onClick={closeAllOverlays} className="transition-colors hover:text-textPrimary">
                    {t('nav.dashboard')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-300">{t('footer.resources')}</h4>
              <ul className="space-y-3 text-sm text-textSecondary">
                <li>
                  <a href="#" className="transition-colors hover:text-textPrimary">{t('footer.documentation')}</a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-textPrimary">{t('footer.apiAccess')}</a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-textPrimary">{t('footer.support')}</a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <div className="premium-panel relative overflow-hidden rounded-[2rem] border border-white/10 p-8">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="relative z-10 space-y-6">
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-300">{t('footer.stayUpdated')}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-textSecondary">{t('footer.stayUpdatedDesc')}</p>
                  </div>

                  <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                    <input
                      type="email"
                      placeholder={t('footer.emailPlaceholder')}
                      value={newsletterEmail}
                      onChange={(event) => {
                        setNewsletterEmail(event.target.value);
                        if (newsletterState !== 'idle') {
                          setNewsletterState('idle');
                          setNewsletterMessage('');
                        }
                      }}
                      autoComplete="email"
                      disabled={newsletterState === 'submitting'}
                      className="input"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={newsletterState === 'submitting'}
                      className="w-full justify-center gap-2"
                    >
                      {newsletterState === 'submitting'
                        ? t('footer.subscribing', 'Subscribing...')
                        : t('footer.subscribe')}
                      <Plus className="h-4 w-4" />
                    </Button>
                    {newsletterMessage ? (
                      <p
                        className={cn(
                          'text-sm',
                          newsletterState === 'success' ? 'text-emerald-300' : 'text-red-300',
                        )}
                        role="status"
                        aria-live="polite"
                      >
                        {newsletterMessage}
                      </p>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 text-center md:flex-row md:text-left">
            <a href="#" className="transition-colors hover:text-textPrimary">{t('footer.termsOfService')}</a>
            <a href="#" className="transition-colors hover:text-textPrimary">{t('footer.security')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
