import { motion as Motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import SiteImage from './SiteImage';

export default function PageHero({ title, eyebrow, breadcrumb = [], icon = Home, id, image }) {
  const EyebrowIcon = icon;

  return (
    <section id={id} className="diagonal-bottom relative overflow-hidden bg-ink pb-28 pt-36 text-white">
      <div className="absolute inset-0 opacity-70">
        <SiteImage src={image} alt={title} className="absolute inset-0" />
      </div>
      <div className="absolute inset-0 bg-[rgba(3,18,13,0.76)]" />
      <div className="absolute inset-0 bg-tech-grid bg-[length:54px_54px] opacity-15" />
      <div className="container-px section-shell relative">
        <Motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="max-w-4xl"
        >
          {eyebrow && (
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/85">
              <EyebrowIcon size={15} />
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl font-black uppercase leading-none sm:text-5xl lg:text-7xl">{title}</h1>
          {breadcrumb.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center gap-2 text-sm font-bold text-white/75">
              {breadcrumb.map((item, index) => (
                <span className="flex items-center gap-2" key={item}>
                  {index > 0 && <ChevronRight size={15} className="text-orange" />}
                  {item}
                </span>
              ))}
            </div>
          )}
        </Motion.div>
      </div>
    </section>
  );
}
