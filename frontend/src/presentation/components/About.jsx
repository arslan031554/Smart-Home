import { motion as Motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Home, SunMedium } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import InfoCard from './cards/InfoCard';
import SectionTitle from './SectionTitle';
import SiteImage from './SiteImage';
import { usePresentationContent } from '../data/usePresentationContent';

export default function About() {
  const { about, aboutFeatures, companyDescription, siteImages } = usePresentationContent();

  return (
    <AnimatedSection id="despre" className="relative overflow-hidden bg-fog py-24">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-white" />
      <div className="section-shell container-px relative grid items-center gap-16 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <SectionTitle
            kicker={about.kicker}
            title={about.title}
            copy={companyDescription}
          />
          <p className="mt-5 text-base leading-8 text-slate-600">
            {about.extra}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {aboutFeatures.map((feature, index) => {
              return (
                <InfoCard
                  className="rounded-lg bg-white p-5 shadow-xl shadow-emerald/10"
                  icon={feature.icon}
                  iconClassName="text-emerald"
                  iconWrapClassName="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10"
                  index={index}
                  key={feature.title}
                  title={feature.title}
                  titleClassName="text-sm font-black uppercase text-graphite"
                  text={feature.text}
                  textClassName="mt-2 text-sm leading-6 text-slate-500"
                />
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {about.pills.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-graphite">
                <CheckCircle size={14} className="text-emerald" />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href="/servicii" className="inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-orange transition hover:-translate-y-1 hover:bg-emerald">
              {about.servicesButton}
              <ArrowRight size={17} />
            </a>
            <a href="/contact" className="inline-flex items-center gap-2 rounded-full border border-emerald/25 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-ink transition hover:border-orange hover:text-orange">
              {about.contactButton}
            </a>
          </div>
        </div>

        <Motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.96, y: 28 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative min-h-[540px] overflow-hidden rounded-lg bg-ink shadow-2xl shadow-emerald/15">
            <SiteImage src={siteImages.about} alt={about.imageAlt} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          </div>
          <div className="absolute inset-6 rounded-lg border border-white/30 bg-white/12 backdrop-blur-sm" />
          <Motion.div
            className="absolute -left-5 top-14 rounded-lg bg-white p-5 shadow-2xl shadow-emerald/15"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Home className="text-emerald" size={26} />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{about.smartHome}</p>
            <p className="text-2xl font-black text-graphite">{about.controlTotal}</p>
          </Motion.div>
          <Motion.div
            className="absolute -right-5 bottom-14 rounded-lg bg-ink p-5 text-white shadow-2xl shadow-emerald/20"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SunMedium className="text-orange" size={26} />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-white/45">{about.energy}</p>
            <p className="text-2xl font-black">8 kWp</p>
          </Motion.div>
        </Motion.div>
      </div>
    </AnimatedSection>
  );
}
