import { ArrowUpRight, MapPin } from 'lucide-react';
import { memo } from 'react';
import RevealCard from './cards/RevealCard';
import SiteImage from './SiteImage';

function PortfolioCard({ project, index }) {
  const location = project.meta.Location || project.meta.Locatie;

  return (
    <RevealCard
      as="article"
      className="group overflow-hidden rounded-[1.5rem] bg-white shadow-xl shadow-emerald/10"
      index={index}
      delayStep={0.05}
      layout
    >
      <div className="relative h-72 overflow-hidden bg-ink">
        <SiteImage src={project.image} alt={project.title} className="absolute inset-0 transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent transition duration-500 group-hover:bg-[rgba(3,18,13,0.68)]" />
        <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">
          {project.category}
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange text-white transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-white group-hover:text-ink">
            <ArrowUpRight size={22} />
          </span>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm leading-7 text-slate-600">{project.text}</p>
        <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm">
          {Object.entries(project.meta).map(([key, value]) => (
            <div className="flex gap-3" key={key}>
              <dt className="w-28 shrink-0 font-extrabold text-graphite">{key}:</dt>
              <dd className="text-slate-600">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald">
          <MapPin size={16} />
          {location}
        </div>
      </div>
    </RevealCard>
  );
}

export default memo(PortfolioCard);
