import {
  Activity,
  AirVent,
  AppWindow,
  ArrowRight,
  AudioLines,
  BatteryCharging,
  Building2,
  CalendarClock,
  Camera,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleGauge,
  CloudSun,
  DoorOpen,
  Droplets,
  Eye,
  Film,
  Fingerprint,
  Gauge,
  KeyRound,
  Leaf,
  Lightbulb,
  LockKeyhole,
  MapPin,
  Music,
  PanelsTopLeft,
  Radio,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SunMedium,
  ThermometerSun,
  Users,
  Volume2,
  Waves,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PresentationImage from './PresentationImage';
import PublicDetailSection from './PublicDetailSection';
import SeoHead from './SeoHead';
import { getPageImage, stripDeckCtaArrow } from '../data/deckContent';
import { siteImages } from '../data/siteData';

const featureIcons = [
  [/(light|scene|ambience)/i, Lightbulb],
  [/(climate|temperature|heating|cooling|thermal)/i, ThermometerSun],
  [/(security|safe|alarm|intrusion|protection)/i, ShieldCheck],
  [/(access|credential|permission|entry|door)/i, KeyRound],
  [/(energy|load|electric|solar|storage|battery)/i, BatteryCharging],
  [/(water|irrigation|soil|leak)/i, Droplets],
  [/(air|ventilation|fresh|humidity)/i, AirVent],
  [/(audio|music|speaker|volume|sound)/i, AudioLines],
  [/(camera|cctv|video|surveillance)/i, Camera],
  [/(app|mobile|remote|control)/i, Smartphone],
  [/(schedule|time|routine)/i, CalendarClock],
  [/(meter|report|monitor|data|consumption|audit)/i, ChartNoAxesCombined],
  [/(shade|blind|shutter|curtain|sun)/i, PanelsTopLeft],
  [/(presence|occupancy|people|guest|staff|user)/i, Users],
  [/(cinema|movie|projector)/i, Film],
  [/(zone|group|multi)/i, Building2],
  [/(voice|notification|communication)/i, Radio],
  [/(weather|daylight)/i, CloudSun],
  [/(efficiency|saving|cost|billing)/i, Gauge],
  [/(integration|system|automation|central)/i, Settings2],
];

function getIcon(feature, index) {
  const content = `${feature.title} ${feature.description}`;
  return featureIcons.find(([pattern]) => pattern.test(content))?.[1]
    || [Sparkles, Zap, Leaf, CheckCircle2, CircleGauge, Wifi][index % 6];
}

function secondaryHref(page) {
  if (/portfolio/i.test(page.secondaryCta)) return '/portfolio';
  if (/technolog/i.test(page.secondaryCta) && page.section !== 'technology') return '/technology/lighting';
  return '#features';
}

const onlineImages = {
  technology: [siteImages.smartPanel, siteImages.heroControl, siteImages.smartInterior, siteImages.heroEnergy],
  buildings: [siteImages.heroHome, siteImages.euromaster, siteImages.pergola, siteImages.mioveni, siteImages.anasped],
  solutions: [siteImages.research, siteImages.heroEnergy, siteImages.smartInterior, siteImages.heroControl],
};

export default function DeckPageTemplate({ page, detailPage, registry, pageIndex = 0 }) {
  const reduceMotion = useReducedMotion();
  const image = onlineImages[page.section]?.[pageIndex % onlineImages[page.section].length]
    || getPageImage(page, pageIndex);
  const revealProps = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 } };

  return (
    <>
      <SeoHead title={page.seoTitle} description={page.seoDescription} image={image} />

      <section className="deck-hero relative isolate min-h-[650px] overflow-hidden bg-ink pb-16 pt-28 text-white lg:flex lg:items-center">
        <div className="absolute inset-0 bg-tech-grid bg-[length:52px_52px] opacity-[0.08]" />
        <div className="home-orb home-orb-one" />
        <div className="section-shell container-px relative grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald/25 bg-emerald/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald">
              <Activity size={15} />
              {page.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.75rem,5vw,4.9rem)] font-black leading-[0.94] tracking-[-0.045em]">
              {page.title}
            </h1>
            <h2 className="mt-6 max-w-2xl text-xl font-bold leading-8 text-white/90 sm:text-2xl">{page.supportingHeadline}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">{page.heroDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="deck-button deck-button-primary" to="/configurator">
                {stripDeckCtaArrow(page.primaryCta)}
                <ArrowRight size={18} />
              </Link>
              <a className="deck-button deck-button-secondary" href={secondaryHref(page)}>
                {page.secondaryCta}
              </a>
            </div>
          </div>

          <Motion.figure
            className="home-hero-frame relative min-w-0 overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-2xl sm:p-3"
            initial={reduceMotion ? false : { opacity: 0, x: 42, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-[1.55rem]">
            <PresentationImage
              src={image}
              alt={page.imageDirection}
              className="aspect-[4/3] h-full w-full object-cover"
              sizes="(min-width: 1024px) 54vw, 92vw"
              eager
            />
            </div>
          </Motion.figure>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden bg-fog py-20 sm:py-28">
        <div className="absolute -right-28 top-12 h-80 w-80 rounded-full bg-emerald/10 blur-3xl" />
        <div className="section-shell container-px">
          <Motion.div {...revealProps} transition={{ duration: 0.6 }} className="relative max-w-3xl">
            <div>
              <p className="section-kicker">{page.eyebrow}</p>
              <h2 className="section-title">{page.sectionHeading}</h2>
              <p className="section-copy mt-5">{page.heroDescription}</p>
            </div>
          </Motion.div>
          <div className="relative mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.features.map((feature, index) => {
              const Icon = getIcon(feature, index);
              return (
                <Motion.article
                  {...revealProps}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                  className="deck-feature-card group relative flex h-full flex-col overflow-hidden"
                  key={feature.title}
                >
                  <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-emerald transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="flex items-start justify-between">
                    <span className="deck-icon transition duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true"><Icon size={24} /></span>
                  </div>
                  <h3 className="mt-7 text-xl font-black text-graphite">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                </Motion.article>
              );
            })}
          </div>
          {page.resultLine && (
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald/20 bg-white px-6 py-5 font-extrabold text-emerald shadow-soft">
              <Activity size={20} aria-hidden="true" />
              {page.resultLine}
            </div>
          )}
        </div>
      </section>
      {detailPage && <PublicDetailSection detailPage={detailPage} image={image} registry={registry} />}
    </>
  );
}
