import { Instagram, Mail, MapPin, Phone, Settings, Youtube } from 'lucide-react';
import { deckNavigation } from '../data/deckContent';
import { usePresentationContent } from '../data/usePresentationContent';

const socials = [
  { label: 'Facebook', href: 'https://facebook.com/greenelectriccity', text: 'f' },
  { label: 'YouTube', href: 'https://youtube.com/@KNX-guru', icon: Youtube },
  { label: 'Instagram', href: 'https://instagram.com/green_electric_shop', icon: Instagram },
];

export default function Footer() {
  const { companyDescription, contactInfo, footer, nav, pages, services, siteImages } = usePresentationContent();

  const footerNavItems = [
    { label: nav.home, href: '/', children: [] },
    ...deckNavigation.map((group) => ({
      label: group.label,
      href: group.items?.[0]?.route ?? '/',
      children: (group.items || []).map((item) => ({
        label: item.menuLabel,
        href: item.route,
      })),
    })),
    { label: pages.portfolio.title, href: '/portfolio', children: [] },
    { label: pages.about.title, href: '/despre', children: [] },
    { label: pages.contact.title, href: '/contact', children: [] },
    { label: footer.configurator, href: '/configurator', children: [] },
  ];

  return (
    <footer className="bg-ink text-white">
      <div className="h-1 w-full bg-gradient-to-r from-emerald via-orange to-emerald" />
      <div className="section-shell container-px grid gap-8 py-16 md:grid-cols-2 lg:grid-cols-[1.15fr_0.95fr_0.85fr_0.95fr]">
        <div>
          <a href="/" className="flex items-center">
            <img
              src={siteImages.localLogo}
              alt="Green Electric Innovations smart building solution"
              className="h-16 w-auto max-w-[260px] rounded-md p-2 object-contain"
            />
          </a>
          <p className="mt-5 text-sm leading-7 text-white/62">{companyDescription}</p>
          <div className="mt-5 flex gap-2">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a key={social.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-orange hover:bg-orange hover:text-white" href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                  {Icon ? <Icon size={16} /> : <span className="text-sm font-black">{social.text}</span>}
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.26em] text-orange">{footer.menu}</h3>
          <ul className="mt-5 space-y-2.5">
            {footerNavItems.map((link) => (
              <li key={link.label} className="group">
                <a className="flex items-center justify-between text-sm font-semibold text-white/60 transition hover:text-orange" href={link.href}>
                  <span>{link.label}</span>
                  {link.children.length > 0 ? <span className="text-[10px] uppercase tracking-[0.2em] text-orange/80">▼</span> : null}
                </a>
                {link.children.length > 0 ? (
                  <div className="mt-2 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-[22rem] group-hover:overflow-y-auto group-hover:opacity-100">
                    <ul className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-2.5">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <a className="block rounded-md px-2 py-1.5 text-sm text-white/70 transition hover:bg-orange/10 hover:text-orange" href={child.href}>
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
            <li>
              <a className="flex items-center gap-1.5 text-sm font-semibold text-emerald transition hover:text-orange" href="/configurator">
                <Settings size={12} />
                {footer.configurator}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.26em] text-orange">{footer.services}</h3>
          <ul className="mt-5 space-y-3">
            {services.map((service) => (
              <li key={service.slug}>
                <a className="text-sm font-semibold leading-6 text-white/60 transition hover:text-orange" href={`/servicii/${service.slug}`}>
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.26em] text-orange">{footer.contact}</h3>
          <ul className="mt-5 space-y-4 text-sm font-semibold text-white/62">
            <li className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-emerald" size={17} /><span>{contactInfo.shortAddress}</span></li>
            <li><a className="flex gap-3 transition hover:text-orange" href={`tel:${contactInfo.phone}`}><Phone className="shrink-0 text-emerald" size={17} />{contactInfo.phone}</a></li>
            <li><a className="flex gap-3 transition hover:text-orange" href={`mailto:${contactInfo.email}`}><Mail className="shrink-0 text-emerald" size={17} />{contactInfo.email}</a></li>
          </ul>
          <a href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-orange transition hover:bg-orange hover:text-white">
            {footer.offer}
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-px section-shell mx-auto flex flex-col items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/42 sm:flex-row">
          <p>Copyright {new Date().getFullYear()} Green Electric Innovations. {footer.copyright}</p>
          <p>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
