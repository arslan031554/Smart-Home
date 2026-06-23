import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  ChevronDown,
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
    `rounded-full px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.08em] transition ${
      active
        ? 'bg-emerald/15 text-emerald'
        : 'text-white/82 hover:bg-white/10 hover:text-white'
    }`;

  const navClass =
    'transition duration-300 ' +
    (isScrolled
      ? 'border-b border-emerald/15 bg-[#020a07]/95 shadow-xl shadow-black/20 backdrop-blur-xl'
      : 'bg-[#020a07]/76 backdrop-blur-xl');

  const closeMobile = () => {
    setMobileOpen(false);
    setMobilePages(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className={navClass}>
        <div className="container-px mx-auto flex max-w-7xl items-center justify-between py-3">
          <a href="/" className="group flex items-center" onClick={(event) => navigateTo(event, '/', navigate)}>
            <img
              src={siteImages.localLogo}
              alt="Green Electric City smart building solution"
              className="h-11 w-auto max-w-[210px] rounded-md bg-white object-contain p-1.5 shadow-lg shadow-emerald/10 transition group-hover:-translate-y-0.5 sm:h-12"
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
              className="flex items-center gap-2 rounded-full border border-emerald/30 bg-white/8 px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.08em] text-emerald transition hover:-translate-y-0.5 hover:bg-emerald hover:text-ink"
            >
              <Settings size={15} />
              {labels.configurator}
            </a>

            <PresentationLanguageSwitcher className="ml-2" />

            <a
              href="/contact"
              onClick={(event) => navigateTo(event, '/contact', navigate)}
              className={`ml-1 rounded-full px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] transition ${
                currentPath === '/contact'
                  ? 'bg-emerald text-ink shadow-glow'
                  : 'bg-emerald text-ink shadow-glow hover:-translate-y-0.5 hover:bg-white'
              }`}
            >
              {labels.contact}
            </a>
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-emerald hover:text-ink lg:hidden"
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

