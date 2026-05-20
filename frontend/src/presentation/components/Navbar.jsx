import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  ChevronDown,
  Headphones,
  Mail,
  Menu,
  Phone,
  Settings,
  X,
} from 'lucide-react';
import { usePresentationContent } from '../data/usePresentationContent';
import PresentationLanguageSwitcher from './PresentationLanguageSwitcher';

function shouldUseClientNavigation(href) {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
  return href.startsWith('/');
}

function navigateTo(event, href, navigate) {
  if (!shouldUseClientNavigation(href)) return;
  event.preventDefault();
  navigate(href);
}

function PagesDropdown({ items, onClose, navigate, title }) {
  return (
    <Motion.div
      className="absolute left-0 top-full z-50 mt-3 max-h-[70vh] w-[360px] overflow-y-auto rounded-lg border border-emerald/15 bg-white shadow-2xl shadow-emerald/15"
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <div className="sticky top-0 border-b border-emerald/10 bg-fog px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald">{title}</p>
      </div>
      {items.map((item) => (
        <a
          href={item.href}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-graphite/75 transition-all hover:bg-emerald/10 hover:pl-5 hover:text-emerald"
          key={item.label}
          onClick={(event) => {
            navigateTo(event, item.href, navigate);
            onClose();
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange" />
          {item.label}
        </a>
      ))}
    </Motion.div>
  );
}

export default function Navbar({ currentPath = '/' }) {
  const navigate = useNavigate();
  const { contactInfo, nav: labels, pageDropdownItems, siteImages } = usePresentationContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePages, setMobilePages] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isPagesActive = currentPath !== '/' && currentPath !== '/portofoliu' && currentPath !== '/contact';
  const dropdownItems = pageDropdownItems;
  const linkClass = (active) =>
    `rounded-full px-4 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.13em] transition ${
      active
        ? 'bg-emerald/12 text-emerald'
        : isScrolled
          ? 'text-graphite/75 hover:bg-emerald/8 hover:text-emerald'
          : 'text-white/85 hover:bg-white/10 hover:text-white'
    }`;

  const topBarClass =
    'border-b border-white/8 transition duration-300 ' +
    (isScrolled ? 'bg-ink text-white shadow-lg shadow-emerald/10' : 'bg-forest/70 text-white backdrop-blur-md');

  const navClass =
    'transition duration-300 ' +
    (isScrolled
      ? 'border-b border-emerald/10 bg-white/95 shadow-xl shadow-emerald/10 backdrop-blur-xl'
      : 'bg-transparent');

  const closeMobile = () => {
    setMobileOpen(false);
    setMobilePages(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={topBarClass}>
        <div className="container-px mx-auto hidden max-w-7xl items-center justify-between py-2 text-xs font-semibold text-white/65 lg:flex">
          <div className="flex items-center gap-5">
            <a className="transition hover:text-orange" href="https://facebook.com/greenelectriccity" target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>
            <a className="transition hover:text-orange" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">YouTube</a>
            <a className="transition hover:text-orange" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a>
            <span className="flex items-center gap-1.5"><Headphones size={13} />{labels.support}</span>
          </div>
          <div className="flex items-center gap-5">
            <a className="flex items-center gap-1.5 transition hover:text-orange" href={`tel:${contactInfo.phone}`}><Phone size={13} />{contactInfo.phone}</a>
            <a className="flex items-center gap-1.5 transition hover:text-orange" href={`mailto:${contactInfo.email}`}><Mail size={13} />{contactInfo.email}</a>
            <PresentationLanguageSwitcher />
          </div>
        </div>
      </div>

      <nav className={navClass}>
        <div className="container-px mx-auto flex max-w-7xl items-center justify-between py-3">
          <a href="/" className="group flex items-center" onClick={(event) => navigateTo(event, '/', navigate)}>
            <img
              src={siteImages.localLogo}
              alt="Green Electric City smart building solution"
              className="h-12 w-auto max-w-[230px] rounded-md bg-white/90 object-contain p-1.5 shadow-lg shadow-emerald/10 transition group-hover:-translate-y-0.5 sm:h-14"
            />
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            <a href="/" className={linkClass(currentPath === '/')} onClick={(event) => navigateTo(event, '/', navigate)}>{labels.home}</a>

            <div className="relative" onMouseEnter={() => setOpenDropdown('pages')} onMouseLeave={() => setOpenDropdown(null)}>
              <button className={`flex items-center gap-1.5 ${linkClass(isPagesActive)}`}>
                {labels.pages}
                <ChevronDown size={15} className={`transition-transform ${openDropdown === 'pages' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openDropdown === 'pages' && <PagesDropdown items={dropdownItems} onClose={() => setOpenDropdown(null)} navigate={navigate} title={labels.pages} />}
              </AnimatePresence>
            </div>

            <a href="/portofoliu" className={linkClass(currentPath === '/portofoliu')} onClick={(event) => navigateTo(event, '/portofoliu', navigate)}>{labels.portfolio}</a>

            <a
              href="/smart-home"
              onClick={(event) => navigateTo(event, '/smart-home', navigate)}
              className="flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.13em] text-emerald transition hover:-translate-y-0.5 hover:bg-emerald hover:text-white"
            >
              <Settings size={15} />
              {labels.configurator}
            </a>

            <a
              href="/contact"
              onClick={(event) => navigateTo(event, '/contact', navigate)}
              className={`ml-1 rounded-full px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.13em] transition ${
                currentPath === '/contact'
                  ? 'bg-orange text-white shadow-orange'
                  : 'bg-orange text-white shadow-orange hover:-translate-y-0.5 hover:bg-emerald'
              }`}
            >
              {labels.contact}
            </a>
          </div>

          <button
            className={`flex h-11 w-11 items-center justify-center rounded-lg border transition hover:bg-orange hover:text-white lg:hidden ${isScrolled ? 'border-emerald/20 bg-emerald/8 text-graphite' : 'border-white/15 bg-white/10 text-white'}`}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Meniu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            className="fixed inset-x-0 top-0 z-40 max-h-screen overflow-y-auto border-b border-emerald/10 bg-white pb-8 pt-28 shadow-2xl lg:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
          >
            <div className="container-px mx-auto space-y-1">
              <div className="px-5 pb-4">
                <PresentationLanguageSwitcher variant="light" />
              </div>
              <a href="/" className="block rounded-lg px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-graphite transition hover:bg-emerald/10 hover:text-emerald" onClick={(event) => { navigateTo(event, '/', navigate); closeMobile(); }}>{labels.home}</a>
              <button className="flex w-full items-center justify-between rounded-lg px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-graphite transition hover:bg-emerald/10 hover:text-emerald" onClick={() => setMobilePages((open) => !open)}>
                {labels.pages}
                <ChevronDown size={17} className={`transition-transform ${mobilePages ? 'rotate-180 text-emerald' : ''}`} />
              </button>
              <AnimatePresence>
                {mobilePages && (
                  <Motion.div className="ml-4 space-y-1 border-l border-emerald/25 pl-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    {dropdownItems.map((item) => (
                      <a href={item.href} className="block rounded-lg px-4 py-3 text-sm font-semibold text-graphite/70 transition hover:text-emerald" key={item.label} onClick={(event) => { navigateTo(event, item.href, navigate); closeMobile(); }}>
                        {item.label}
                      </a>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>
              <a href="/portofoliu" className="block rounded-lg px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-graphite transition hover:bg-emerald/10 hover:text-emerald" onClick={(event) => { navigateTo(event, '/portofoliu', navigate); closeMobile(); }}>{labels.portfolio}</a>
              <a href="/smart-home" className="flex items-center gap-2 rounded-lg border border-emerald/35 bg-emerald/10 px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-emerald transition hover:bg-emerald hover:text-white" onClick={(event) => { navigateTo(event, '/smart-home', navigate); closeMobile(); }}>
                <Settings size={16} />
                {labels.configurator}
              </a>
              <a href="/contact" className="block rounded-lg bg-orange px-5 py-3.5 text-center text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-orange transition hover:bg-emerald" onClick={(event) => { navigateTo(event, '/contact', navigate); closeMobile(); }}>{labels.contact}</a>
              <div className="border-t border-emerald/10 pt-4">
                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 px-5 py-2 text-sm font-semibold text-graphite/65 transition hover:text-emerald"><Phone size={16} className="text-emerald" />{contactInfo.phone}</a>
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 px-5 py-2 text-sm font-semibold text-graphite/65 transition hover:text-emerald"><Mail size={16} className="text-emerald" />{contactInfo.email}</a>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

