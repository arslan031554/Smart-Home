import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { ChevronDown, Mail, Menu, Phone, Settings, X } from 'lucide-react';
import { deckNavigation } from '../data/deckContent';
import { usePresentationContent } from '../data/usePresentationContent';
import PresentationLanguageSwitcher from './PresentationLanguageSwitcher';
import { useTranslation } from 'react-i18next';

function isActivePath(currentPath, href) {
  return currentPath === href || (href !== '/' && currentPath.startsWith(`${href}/`));
}

function DesktopDropdown({ group, open, onToggle, onClose, buttonRef }) {
  const panelId = `${group.key}-desktop-menu`;
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={`nav-pill flex items-center gap-1.5 ${open ? 'nav-pill-active' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        onMouseEnter={() => { if (!open) onToggle(); }}
      >
        {group.label}
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <Motion.div
            id={panelId}
            className="absolute left-0 top-full z-50 mt-3 max-h-[72vh] w-[520px] overflow-y-auto rounded-lg border border-emerald/15 bg-white p-3 shadow-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onMouseLeave={onClose}
          >
            <p className="px-3 pb-3 pt-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald">{group.label}</p>
            <div className="grid grid-cols-2 gap-1">
              {group.items.map((item) => (
                <Link
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-bold leading-5 text-graphite/75 hover:bg-emerald/10 hover:text-emerald focus-visible:bg-emerald/10"
                  to={item.route}
                  onClick={onClose}
                  key={item.route}
                >
                  {item.menuLabel}
                </Link>
              ))}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ currentPath = '/' }) {
  const { contactInfo, pages, siteImages, nav } = usePresentationContent();
  const { t } = useTranslation();
  const localizedNavigation = deckNavigation.map((group) => ({
    ...group,
    label: t(`presentation.navigation.${group.key}`, { defaultValue: group.label }),
    items: group.items.map((item) => ({
      ...item,
      menuLabel: t(`presentation.navigation.items.${item.slug}`, { defaultValue: item.menuLabel }),
    })),
  }));
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const headerRef = useRef(null);
  const triggerRefs = useRef({});

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpenDropdown(null);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      const active = openDropdown;
      setOpenDropdown(null);
      setMobileOpen(false);
      triggerRefs.current[active]?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openDropdown]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileSection(null);
  };

  const toggleDesktop = (key) => setOpenDropdown((current) => current === key ? null : key);
  const navClass = isScrolled
    ? 'border-b border-emerald/15 bg-[#020a07]/96 shadow-xl backdrop-blur-xl'
    : 'bg-[#020a07]/82 backdrop-blur-xl';

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      <nav className={`transition duration-300 ${navClass}`} aria-label={t('presentation.navigation.primary', { defaultValue: 'Primary navigation' })}>
        <div className="container-px mx-auto flex max-w-[1480px] items-center justify-between gap-4 py-4">
          <Link to="/" className="shrink-0" aria-label={t('presentation.navigation.logoHome', { defaultValue: 'Green Electric home' })}>
            <img src={siteImages.localLogo} alt="Green Electric" className="h-16 w-auto max-w-[240px] object-contain sm:h-14" />
          </Link>

          <div className="hidden min-w-0 items-center gap-0.5 xl:flex">
            <Link className={`nav-pill ${currentPath === '/' ? 'nav-pill-active' : ''}`} to="/">{nav.home}</Link>
            {localizedNavigation.map((group) => (
              <DesktopDropdown
                group={group}
                open={openDropdown === group.key}
                onToggle={() => toggleDesktop(group.key)}
                onClose={() => setOpenDropdown(null)}
                buttonRef={(element) => { triggerRefs.current[group.key] = element; }}
                key={group.key}
              />
            ))}
            <Link className={`nav-pill ${isActivePath(currentPath, '/portfolio') ? 'nav-pill-active' : ''}`} to="/portfolio">{nav.portfolio}</Link>
            <Link className={`nav-pill ${isActivePath(currentPath, '/despre') ? 'nav-pill-active' : ''}`} to="/despre">{pages.about.title}</Link>
            <PresentationLanguageSwitcher className="ml-1" />
            <Link className="ml-1 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-emerald px-4 py-2.5 text-xs font-semibold text-ink shadow-glow hover:bg-white" to="/configurator">
              <Settings size={15} />
              {t('presentation.configureProject', { defaultValue: 'Configure a project' })}
            </Link>
          </div>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white xl:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? t('presentation.navigation.closeMenu', { defaultValue: 'Close menu' }) : t('presentation.navigation.openMenu', { defaultValue: 'Open menu' })}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            id="mobile-navigation"
            className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-white pb-8 shadow-2xl xl:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="container-px mx-auto max-w-3xl py-5">
              <PresentationLanguageSwitcher variant="light" />
              <Link className="block border-b border-emerald/10 py-4 text-sm font-semibold text-graphite" to="/" onClick={closeMobile}>{nav.home}</Link>
              {localizedNavigation.map((group) => (
                <div className="border-b border-emerald/10" key={group.key}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-graphite"
                    aria-expanded={mobileSection === group.key}
                    onClick={() => setMobileSection((current) => current === group.key ? null : group.key)}
                  >
                    {group.label}
                    <ChevronDown size={17} className={`transition ${mobileSection === group.key ? 'rotate-180 text-emerald' : ''}`} />
                  </button>
                  {mobileSection === group.key && (
                    <div className="grid gap-1 pb-4 sm:grid-cols-2">
                      {group.items.map((item) => (
                        <Link className="rounded-md bg-fog px-4 py-3 text-sm font-semibold text-graphite/75 hover:text-emerald" to={item.route} onClick={closeMobile} key={item.route}>
                          {item.menuLabel}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link className="block border-b border-emerald/10 py-4 text-sm font-semibold text-graphite" to="/portfolio" onClick={closeMobile}>{nav.portfolio}</Link>
              <Link className="block border-b border-emerald/10 py-4 text-sm font-semibold text-graphite" to="/despre" onClick={closeMobile}>{pages.about.title}</Link>

              <Link className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-emerald px-5 py-4 text-sm font-semibold text-ink" to="/configurator" onClick={closeMobile}>
                <Settings size={17} />
                {t('presentation.configureProject', { defaultValue: 'Configure a project' })}
              </Link>
              <div className="mt-5 border-t border-emerald/10 pt-4">
                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 py-2 text-sm font-semibold text-graphite/70"><Phone size={16} className="text-emerald" />{contactInfo.phone}</a>
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 py-2 text-sm font-semibold text-graphite/70"><Mail size={16} className="text-emerald" />{contactInfo.email}</a>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
