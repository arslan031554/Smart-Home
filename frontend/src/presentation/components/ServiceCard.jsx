import { ArrowRight } from 'lucide-react';
import { memo } from 'react';
import RevealCard from './cards/RevealCard';
import SiteImage from './SiteImage';

function ServiceCard({ learnMoreLabel, service, index }) {
  const Icon = service.icon;

  return (
    <RevealCard
      as="article"
      className="group relative min-h-[380px] overflow-hidden rounded-[1.5rem] border border-emerald/10 bg-white p-7 shadow-xl shadow-emerald/10 transition hover:-translate-y-2 hover:border-emerald/35 hover:shadow-2xl hover:shadow-emerald/15"
      index={index}
      delayStep={0.07}
      scale={0.98}
      y={32}
    >
      <div className="absolute inset-x-0 top-0 h-32 overflow-hidden">
        <SiteImage src={service.image} alt={service.title} className="absolute inset-0 transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-emerald/20 to-white" />
      </div>
      <span className="absolute right-5 top-5 text-5xl font-black text-white transition group-hover:text-emerald/15">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="relative mb-8 mt-14 flex h-16 w-16 items-center justify-center rounded-full bg-emerald text-white shadow-glow transition duration-300 group-hover:scale-110 group-hover:bg-orange">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h3 className="relative min-h-16 text-xl font-semibold leading-snug text-graphite">{service.title}</h3>
      <p className="relative mt-3 line-clamp-4 text-sm leading-7 text-slate-600">{service.text}</p>
      <div className="relative mt-5 flex flex-wrap gap-2">
        {service.chips.slice(0, 2).map((chip) => (
          <span key={chip} className="rounded-full bg-fog px-3 py-1 text-[11px] font-bold text-emerald">
            {chip}
          </span>
        ))}
      </div>
      <a
        href={`/servicii/${service.slug}`}
        className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:gap-3 hover:text-emerald"
      >
        {learnMoreLabel}
        <ArrowRight size={16} />
      </a>
    </RevealCard>
  );
}

export default memo(ServiceCard);
