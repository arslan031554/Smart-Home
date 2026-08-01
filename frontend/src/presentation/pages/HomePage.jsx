import { motion as Motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Gauge,
  Leaf,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HomeImageCarousel from '../components/HomeImageCarousel';
import LongFormDisclosure from '../components/LongFormDisclosure';
import PresentationImage from '../components/PresentationImage';
import SeoHead from '../components/SeoHead';
import {
  greenElectricDeck,
  homeBuildingRoutes,
  stripDeckCtaArrow,
} from '../data/deckContent';
import { siteImages } from '../data/siteData';
import { roDeckHome } from '../data/roDeckHome';
import { useTranslation } from 'react-i18next';

const featureIcons = [Sparkles, Zap, ShieldCheck, Smartphone, CheckCircle2, Leaf];
const statIcons = [Gauge, Building2, Lightbulb, CheckCircle2];

const buildingImages = {
  Home: siteImages.heroHome,
  Offices: siteImages.euromaster,
  'Hotel & Horeca': siteImages.pergola,
  Hospital: siteImages.mioveni,
  Factory: siteImages.research,
  Warehouse: siteImages.anasped,
  Parking: siteImages.heroEnergy,
};

const getHeroSlides = (t) => [
  {
    src: siteImages.heroHome,
    alt: t('presentation.home.slides.homeAlt', { defaultValue: 'Modern connected home with intelligent lighting and climate control' }),
    kicker: t('presentation.home.slides.homeKicker', { defaultValue: 'Smart living' }),
    title: t('presentation.home.slides.homeTitle', { defaultValue: 'A home that responds naturally.' }),
    copy: t('presentation.home.slides.homeCopy', { defaultValue: 'Lighting, climate, shading and security working as one system.' }),
  },
  {
    src: siteImages.smartInterior,
    alt: t('presentation.home.slides.interiorAlt', { defaultValue: 'Modern interior prepared for integrated smart automation' }),
    kicker: t('presentation.home.slides.interiorKicker', { defaultValue: 'Quiet automation' }),
    title: t('presentation.home.slides.interiorTitle', { defaultValue: 'Technology designed into the space.' }),
    copy: t('presentation.home.slides.interiorCopy', { defaultValue: 'Discreet automation that supports daily life without adding complexity.' }),
  },
  {
    src: siteImages.heroEnergy,
    alt: t('presentation.home.slides.energyAlt', { defaultValue: 'Renewable energy system supporting an efficient smart building' }),
    kicker: t('presentation.home.slides.energyKicker', { defaultValue: 'Energy intelligence' }),
    title: t('presentation.home.slides.energyTitle', { defaultValue: 'Measure, optimize and use less.' }),
    copy: t('presentation.home.slides.energyCopy', { defaultValue: 'Connected monitoring helps the building reduce waste automatically.' }),
  },
];

const getProcessSteps = (t) => [
  {
    number: '01',
    title: t('presentation.home.process.firstTitle', { defaultValue: 'Tell us about the building' }),
    copy: t('presentation.home.process.firstCopy', { defaultValue: 'Choose the rooms, systems and level of automation you need.' }),
  },
  {
    number: '02',
    title: t('presentation.home.process.secondTitle', { defaultValue: 'See the right system' }),
    copy: t('presentation.home.process.secondCopy', { defaultValue: 'We shape a compatible, scalable solution around your priorities.' }),
  },
  {
    number: '03',
    title: t('presentation.home.process.thirdTitle', { defaultValue: 'Build with one partner' }),
    copy: t('presentation.home.process.thirdCopy', { defaultValue: 'Design, integration, commissioning and support stay connected.' }),
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.07,
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const home = i18n.language?.startsWith('ro') ? { ...greenElectricDeck.home, ...roDeckHome } : greenElectricDeck.home;
  const heroSlides = getHeroSlides(t);
  const processSteps = getProcessSteps(t);
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.16 } };

  return (
    <>
      <SeoHead title={home.seoTitle} description={home.seoDescription} image={siteImages.heroHome} />

      <section className="deck-home-hero relative isolate min-h-[700px] overflow-hidden bg-ink pb-16 pt-28 text-white lg:flex lg:min-h-[760px] lg:items-center">
        <div className="absolute inset-0 bg-tech-grid bg-[length:54px_54px] opacity-[0.08]" />
        <div className="home-orb home-orb-one" />
        <div className="home-orb home-orb-two" />

        <div className="section-shell container-px relative grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] xl:gap-16">
          <Motion.div
            className="min-w-0"
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            <Motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-emerald/25 bg-emerald/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald backdrop-blur">
              <Activity size={15} />
              Green Electric · Smart buildings
            </Motion.div>

            <h1 className="mt-7 text-[clamp(3.25rem,6.2vw,5.8rem)] font-extrabold leading-[0.9] tracking-[-0.055em]">
              {home.titleLines.map((line, index) => (
                <Motion.span
                  className={index === 2 ? 'block text-emerald' : 'block'}
                  variants={reveal}
                  custom={index}
                  key={line}
                >
                  {line}
                </Motion.span>
              ))}
            </h1>

            <Motion.p variants={reveal} className="mt-8 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">
              {home.heroDescription}
            </Motion.p>

            <Motion.div variants={reveal} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="deck-button deck-button-primary group" to="/configurator">
                {stripDeckCtaArrow(home.primaryCta)}
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
              </Link>
              <Link className="deck-button deck-button-secondary" to="/technology/lighting">
                {home.secondaryCta}
              </Link>
            </Motion.div>

            <Motion.div variants={reveal} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/55">
              {['One connected system', 'Designed to scale', 'Remote control'].map((label) => (
                <span className="flex items-center gap-2" key={label}>
                  <CheckCircle2 className="text-emerald" size={16} />
                  {label}
                </span>
              ))}
            </Motion.div>
          </Motion.div>

          <Motion.div
            className="relative mx-auto w-full max-w-3xl lg:max-w-none"
            initial={reduceMotion ? false : { opacity: 0, x: 44, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <HomeImageCarousel slides={heroSlides} />
          </Motion.div>
        </div>
      </section>

      <section className="relative z-10 border-b border-emerald/10 bg-white">
        <div className="section-shell container-px grid sm:grid-cols-2 lg:grid-cols-4">
          {home.stats.map((stat, index) => {
            const Icon = statIcons[index];
            return (
              <Motion.div
                {...motionProps}
                variants={reveal}
                custom={index}
                className="group flex items-center gap-4 border-emerald/10 py-7 sm:px-6 sm:first:pl-0 lg:border-r lg:last:border-r-0"
                key={stat.label}
              >
                <span className="deck-icon shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden="true"><Icon size={22} /></span>
                <div>
                  <strong className="block text-3xl font-black tracking-[-0.04em] text-graphite">{stat.value}</strong>
                  <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                </div>
              </Motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-fog py-20 sm:py-28">
        <div className="absolute -right-28 top-12 h-80 w-80 rounded-full bg-emerald/10 blur-3xl" />
        <div className="section-shell container-px relative">
          <Motion.div {...motionProps} variants={reveal} className="max-w-3xl">
            <div>
              <p className="section-kicker">{home.sectionHeading}</p>
              <h2 className="section-title">{home.sectionDescription}</h2>
              <p className="section-copy mt-5">
                Lighting, climate, shading, security, energy and control work together as one coordinated system.
              </p>
            </div>
          </Motion.div>

          <div className="mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {home.features.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <Motion.article
                  {...motionProps}
                  variants={reveal}
                  custom={index}
                  className="deck-feature-card group relative flex h-full flex-col overflow-hidden"
                  key={feature.title}
                >
                  <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-emerald transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="flex items-start justify-between gap-5">
                    <span className="deck-icon transition duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true"><Icon size={24} /></span>
                  </div>
                  <h3 className="mt-7 text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                </Motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-20 sm:py-28">
        <div className="section-shell container-px grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <Motion.div {...motionProps} variants={reveal} className="relative">
            <div className="grid grid-cols-[1.15fr_0.85fr] gap-3 sm:gap-5">
              <div className="overflow-hidden rounded-[2rem]">
                <PresentationImage
                  src={siteImages.pergola}
                  alt="Smart building wall control panel"
                  className="h-full min-h-[420px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 30vw, 55vw"
                />
              </div>
              <div className="grid gap-3 sm:gap-5">
                <div className="overflow-hidden rounded-[2rem]">
                  <PresentationImage
                    src={siteImages.heroControl}
                    alt="Modern interior managed by a connected control system"
                    className="h-full min-h-[198px] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 20vw, 36vw"
                  />
                </div>
                <div className="flex min-h-[198px] flex-col justify-between rounded-[2rem] bg-ink p-6 text-white sm:p-7">
                  <Activity className="text-emerald" size={28} />
                  <div>
                    <p className="text-4xl font-black tracking-[-0.05em]">24/7</p>
                    <p className="mt-2 text-sm leading-6 text-white/60">{t('presentation.home.visibility', { defaultValue: 'Visibility over comfort, safety and consumption.' })}</p>
                  </div>
                </div>
              </div>
            </div>
            <a
              className="mt-4 inline-flex text-xs font-bold text-slate-500 hover:text-emerald"
              href="https://unsplash.com/?utm_source=green_electric&utm_medium=referral"
              target="_blank"
              rel="noreferrer"
            >
            </a>
          </Motion.div>

          <Motion.div {...motionProps} variants={reveal}>
            <p className="section-kicker">{t('presentation.home.realLifeKicker', { defaultValue: 'Built around real life' })}</p>
            <h2 className="section-title">{t('presentation.home.realLifeTitle', { defaultValue: 'Technology that quietly does the work.' })}</h2>
            <p className="section-copy mt-6">
              {t('presentation.home.realLifeCopy', { defaultValue: 'Lighting, climate, shading, security and energy stop competing for attention. They share context, react together and stay simple to control.' })}
            </p>
            <div className="mt-9 space-y-3">
              {[
                [t('presentation.home.benefits.scenesTitle', { defaultValue: 'Automatic scenes' }), t('presentation.home.benefits.scenesCopy', { defaultValue: 'The building adjusts to time, occupancy and routine.' })],
                [t('presentation.home.benefits.interfaceTitle', { defaultValue: 'One clear interface' }), t('presentation.home.benefits.interfaceCopy', { defaultValue: 'Control every connected system locally or remotely.' })],
                [t('presentation.home.benefits.energyTitle', { defaultValue: 'Useful energy data' }), t('presentation.home.benefits.energyCopy', { defaultValue: 'See consumption clearly and reduce waste intelligently.' })],
              ].map(([title, copy], index) => (
                <Motion.div
                  {...motionProps}
                  variants={reveal}
                  custom={index}
                  className="flex gap-4 rounded-2xl border border-emerald/10 bg-fog p-5"
                  key={title}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald text-sm font-black text-ink">{index + 1}</span>
                  <div>
                    <h3 className="font-black text-graphite">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                  </div>
                </Motion.div>
              ))}
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="bg-ink py-20 text-white sm:py-28">
        <div className="section-shell container-px">
          <Motion.div {...motionProps} variants={reveal} className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald">{home.buildingsHeading}</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">{t('presentation.home.buildingsTitle', { defaultValue: 'Smart solutions shaped around every kind of space.' })}</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-white/60">{t('presentation.home.buildingsCopy', { defaultValue: 'One flexible foundation, adapted to the way each space is used.' })}</p>
          </Motion.div>

          <div className="mt-12 grid auto-rows-[minmax(16rem,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.buildingLinks.map((label, index) => (
              <Motion.div
                {...motionProps}
                variants={reveal}
                custom={index}
                className={index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}
                key={label}
              >
                <Link
                  className="home-building-card group relative flex h-full min-h-64 overflow-hidden rounded-[1.5rem] border border-white/10 p-6 text-white"
                  to={homeBuildingRoutes[label]}
                >
                  <PresentationImage
                    src={buildingImages[label]}
                    alt={`${label} smart building solution`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={index === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent transition-colors duration-500 group-hover:from-ink/90" />
                  <div className="relative mt-auto flex w-full items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald">{t('presentation.home.exploreSolution', { defaultValue: 'Explore solution' })}</span>
                      <h3 className="mt-2 text-2xl font-black">{t(`presentation.buildings.${label.toLowerCase().replace(/[^a-z]+/g, '_')}`, { defaultValue: label })}</h3>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition duration-300 group-hover:translate-x-1 group-hover:bg-emerald group-hover:text-ink">
                      <ArrowRight size={19} />
                    </span>
                  </div>
                </Link>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-fog py-20 sm:py-28">
        <div className="section-shell container-px">
          <Motion.div {...motionProps} variants={reveal} className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">{t('presentation.home.processKicker', { defaultValue: 'From idea to operation' })}</p>
            <h2 className="section-title">{t('presentation.home.processTitle', { defaultValue: 'A clear path to a smarter building.' })}</h2>
          </Motion.div>
          <div className="relative mt-12 grid gap-5 lg:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-8 hidden h-px bg-emerald/20 lg:block" />
            {processSteps.map((step, index) => (
              <Motion.article
                {...motionProps}
                variants={reveal}
                custom={index}
                className="relative rounded-[1.5rem] border border-emerald/10 bg-white p-7 shadow-soft"
                key={step.number}
              >
                <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-sm font-black text-emerald shadow-glow">{step.number}</span>
                <h3 className="mt-7 text-xl font-black text-graphite">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{step.copy}</p>
              </Motion.article>
            ))}
          </div>

          <Motion.div {...motionProps} variants={reveal} className="mx-auto mt-8 max-w-5xl">
            <LongFormDisclosure
              paragraphs={home.longForm}
              title="Explore Green Electric’s complete integrated approach"
            />
          </Motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-emerald py-14 text-ink sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-ink/5 pointer-events-none" />
        <div className="section-shell container-px">
          <Motion.div {...motionProps} variants={reveal} className="flex flex-col gap-6 lg:gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">{home.closingTitle}</h2>
              <p className="mt-4 text-base text-ink/70 max-w-2xl">{home.closingDescription}</p>
            </div>
            <Link className="deck-button group bg-ink text-white hover:bg-white hover:text-ink lg:min-w-64 shrink-0" to="/configurator">
              {stripDeckCtaArrow(home.closingCta)}
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
            </Link>
          </Motion.div>
        </div>
      </section>
    </>
  );
}
