import { motion as Motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowRight, ChevronRight, Home, ShieldCheck, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import PresentationImage from './PresentationImage';
import { useTranslation } from 'react-i18next';

export default function PageHero({ title, eyebrow, breadcrumb = [], icon = Home, id, image }) {
  const { t } = useTranslation();
  const EyebrowIcon = icon;
  const reduceMotion = useReducedMotion();

  return (
    <section id={id} className="relative isolate min-h-[620px] overflow-hidden bg-ink pb-16 pt-28 text-white lg:flex lg:items-center">
      <div className="absolute inset-0 bg-tech-grid bg-[length:54px_54px] opacity-[0.08]" />
      <div className="home-orb home-orb-one" />
      <div className="section-shell container-px relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0"
        >
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald/25 bg-emerald/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald backdrop-blur">
              <EyebrowIcon size={15} />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-6 max-w-4xl text-[clamp(2.8rem,5vw,4.9rem)] font-extrabold leading-[0.94] tracking-[-0.045em]">{title}</h1>
          {breadcrumb.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center gap-2 text-sm font-bold text-white/60">
              {breadcrumb.map((item, index) => (
                <span className="flex items-center gap-2" key={`${item}-${index}`}>
                  {index > 0 && <ChevronRight size={15} className="text-emerald" />}
                  {item}
                </span>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="deck-button deck-button-primary group" to="/configurator">
              {t('presentation.configureProject', { defaultValue: 'Configure a project' })}
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
            </Link>
            <a className="deck-button deck-button-secondary" href="#page-content">{t('presentation.explorePage', { defaultValue: 'Explore page' })}</a>
          </div>
        </Motion.div>

        <Motion.div
          className="relative"
          initial={reduceMotion ? false : { opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="home-hero-frame relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-2xl sm:p-3">
            <div className="relative overflow-hidden rounded-[1.55rem]">
              <PresentationImage
                src={image}
                alt={title}
                className="aspect-[4/3] w-full object-cover"
                sizes="(min-width: 1024px) 54vw, 92vw"
                eager
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
            </div>
            <div className="absolute inset-x-6 bottom-6 grid grid-cols-2 gap-2 sm:inset-x-8 sm:bottom-8">
              <div className="home-control-chip flex items-center gap-3 rounded-2xl border border-white/15 bg-ink/75 p-3 backdrop-blur-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15 text-emerald"><Wifi size={18} /></span>
                <span><small className="block font-bold uppercase tracking-[0.14em] text-white/45">{t('presentation.system', { defaultValue: 'System' })}</small><strong className="text-sm">{t('presentation.connected', { defaultValue: 'Connected' })}</strong></span>
              </div>
              <div className="home-control-chip flex items-center gap-3 rounded-2xl border border-white/15 bg-ink/75 p-3 backdrop-blur-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15 text-emerald"><ShieldCheck size={18} /></span>
                <span><small className="block font-bold uppercase tracking-[0.14em] text-white/45">{t('presentation.status', { defaultValue: 'Status' })}</small><strong className="text-sm">{t('presentation.protected', { defaultValue: 'Protected' })}</strong></span>
              </div>
            </div>
          </div>
          <Motion.div
            className="absolute -right-3 top-8 hidden items-center gap-3 rounded-2xl bg-white p-4 text-ink shadow-2xl md:flex"
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Activity className="text-emerald" size={21} />
            <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{t('presentation.liveBuilding', { defaultValue: 'Live building' })}</p><p className="text-sm font-black">{t('presentation.everythingSynced', { defaultValue: 'Everything in sync' })}</p></div>
          </Motion.div>
        </Motion.div>
      </div>
    </section>
  );
}
