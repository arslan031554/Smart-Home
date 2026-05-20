import { Instagram, Mail, MapPin, Phone, Settings, Youtube } from 'lucide-react';
import { usePresentationContent } from '../data/usePresentationContent';

const socials = [
  { label: 'Facebook', href: 'https://facebook.com/greenelectriccity', text: 'f' },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
];

export default function Footer() {
  const { companyDescription, contactInfo, footer, nav, pageDropdownItems, services, siteImages } = usePresentationContent();

  return (
    <footer className="bg-ink text-white">
      <div className="h-1 w-full bg-gradient-to-r from-emerald via-orange to-emerald" />
      <div className="section-shell container-px grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr_1fr]">
        <div>
          <a href="/" className="flex items-center">
            <img
              src={siteImages.localLogo}
              alt="Green Electric City smart building solution"
              className="h-16 w-auto max-w-[260px] rounded-md bg-white p-2 object-contain"
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
          <ul className="mt-5 space-y-3">
            <li><a className="text-sm font-semibold text-white/60 transition hover:text-orange" href="/">{nav.home}</a></li>
            {pageDropdownItems.map((link) => (
              <li key={link.label}><a className="text-sm font-semibold text-white/60 transition hover:text-orange" href={link.href}>{link.label}</a></li>
            ))}
            <li>
              <a className="flex items-center gap-1.5 text-sm font-semibold text-emerald transition hover:text-orange" href="/smart-home">
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
          <p>Copyright {new Date().getFullYear()} Green Electric City. {footer.copyright}</p>
          <p>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
