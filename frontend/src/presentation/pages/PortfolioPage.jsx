import { useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import LongFormDisclosure from '../components/LongFormDisclosure';
import PresentationImage from '../components/PresentationImage';
import SeoHead from '../components/SeoHead';
import { greenElectricDeck, stripDeckCtaArrow } from '../data/deckContent';
import { siteImages } from '../data/siteData';
import { useTranslation } from 'react-i18next';
import { localizePortfolioRo } from '../data/roDeckPortfolio';

const projectCategories = {
  'Residential home': 'Home',
  'Office building': 'Offices',
  'Hotel 4*': 'Hotel',
  Hospital: 'Hospital',
  Factory: 'Factory',
  Warehouse: 'Warehouse',
  'Locuință rezidențială': 'Locuințe',
  'Clădire de birouri': 'Birouri',
  'Fabrică': 'Fabrică',
  'Spital': 'Spital',
  'Depozit': 'Depozit',
};

const projectImages = [
  siteImages.casaBuhnici,
  siteImages.euromaster,
  siteImages.pergola,
  siteImages.mioveni,
  siteImages.research,
  siteImages.anasped,
  siteImages.dumbrava,
  siteImages.apartament,
];

export default function PortfolioPage() {
  const { t, i18n } = useTranslation();
  const portfolio = i18n.language?.startsWith('ro')
    ? localizePortfolioRo(greenElectricDeck.portfolio)
    : greenElectricDeck.portfolio;
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState('All');
  const filteredProjects = useMemo(
    () => filter === 'All' || filter === 'Toate'
      ? portfolio.projects
      : portfolio.projects.filter((project) => projectCategories[project.type] === filter),
    [filter, portfolio.projects],
  );

  return (
    <>
      <SeoHead title={portfolio.seoTitle} description={portfolio.seoDescription} image={siteImages.euromaster} />

      <section className="relative isolate min-h-[640px] overflow-hidden bg-ink pb-16 pt-28 text-white lg:flex lg:items-center">
        <div className="absolute inset-0 bg-tech-grid bg-[length:52px_52px] opacity-[0.08]" />
        <div className="home-orb home-orb-one" />
        <div className="section-shell container-px relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Motion.div initial={reduceMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-kicker">{t('presentation.portfolio.kicker', { defaultValue: 'Portfolio' })}</p>
            <h1 className="mt-4 max-w-5xl text-[clamp(2.8rem,5.2vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.045em]">{portfolio.title}</h1>
            <h2 className="mt-6 max-w-3xl text-2xl font-bold">{portfolio.supportingHeadline}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">{portfolio.heroDescription}</p>
          </Motion.div>

          <Motion.div
            className="home-hero-frame relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-2xl sm:p-3"
            initial={reduceMotion ? false : { opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.12 }}
          >
            <div className="relative overflow-hidden rounded-[1.55rem]">
              <PresentationImage src={siteImages.euromaster} alt="Green Electric smart building portfolio" className="aspect-[4/3] w-full object-cover" sizes="(min-width: 1024px) 54vw, 92vw" eager />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-ink/70 p-4 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-auto sm:min-w-64">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald">{t('presentation.portfolio.proven', { defaultValue: 'Proven integration' })}</p>
                <p className="mt-1 text-xl font-black">{t('presentation.portfolio.featured', { count: portfolio.projects.length, defaultValue: '{{count}}+ featured projects' })}</p>
              </div>
            </div>
          </Motion.div>
        </div>
      </section>

      <section id="page-content" className="bg-fog py-20 sm:py-28">
        <div className="section-shell container-px">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('presentation.portfolio.filterLabel', { defaultValue: 'Filter portfolio projects' })}>
            {portfolio.filters.map((label) => (
              <button
                type="button"
                aria-pressed={filter === label}
                className={`rounded-full px-5 py-2.5 text-sm font-extrabold ${
                  filter === label ? 'bg-ink text-white shadow-glow' : 'border border-emerald/15 bg-white text-slate-600 hover:border-emerald hover:text-emerald'
                }`}
                onClick={() => setFilter(label)}
                key={label}
              >
                {label}
              </button>
            ))}
          </div>

          <Motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => {
                const originalIndex = portfolio.projects.findIndex((item) => item.title === project.title);
                return (
                  <Motion.article
                    layout
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="group overflow-hidden rounded-[1.5rem] border border-emerald/15 bg-white shadow-soft transition-shadow hover:shadow-card"
                    key={project.title}
                  >
                    <div className="relative overflow-hidden">
                      <PresentationImage
                        src={projectImages[originalIndex % projectImages.length]}
                        alt={`${project.title} smart building project in ${project.location}`}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 92vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald">{project.type}</p>
                      <h3 className="mt-3 text-2xl font-black text-graphite">{project.title}</h3>
                      <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600"><MapPin size={16} className="text-emerald" />{project.location}</p>
                      <p className="mt-5 border-t border-emerald/10 pt-5 text-lg font-extrabold text-graphite">{project.result}</p>
                    </div>
                  </Motion.article>
                );
              })}
            </AnimatePresence>
          </Motion.div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="section-shell container-px grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="section-kicker">{t('presentation.portfolio.resultsKicker', { defaultValue: 'Delivered results' })}</p>
            <h2 className="section-title">{t('presentation.portfolio.resultsTitle', { defaultValue: 'Smart building experience across sectors.' })}</h2>
          </div>
          <LongFormDisclosure
            paragraphs={portfolio.longForm}
            title={t('presentation.portfolio.readComplete', { defaultValue: 'Read the complete portfolio information' })}
            className="self-start"
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-emerald py-14 text-ink sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-ink/5" />
        <div className="section-shell container-px relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{portfolio.closingTitle}</h2>
            <p className="mt-2 text-base text-ink/70">{portfolio.closingDescription}</p>
          </div>
          <Link className="deck-button bg-ink text-white hover:bg-white hover:text-ink" to="/configurator">
            {stripDeckCtaArrow(portfolio.closingCta)}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
