import { ArrowRight, Layers3 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PresentationImage from '../components/PresentationImage';
import SeoHead from '../components/SeoHead';
import {
  buildingPages,
  getPageImage,
  solutionPages,
  technologyPages,
} from '../data/deckContent';
import { createPublicRegistry, getPublicItems } from '../data/publicPageRegistry';
import { localizeDeckPageRo } from '../data/roDeckPages';
import { siteImages } from '../data/siteData';

const overviewCopy = {
  technology: {
    title: 'Technology',
    eyebrow: 'Green Electric technology',
    copy: 'Explore the automation functions that can be integrated into one coordinated smart building system.',
    seoTitle: 'Technology | Green Electric',
    seoDescription: 'Smart lighting, climate, shading, access, energy management and other Green Electric technologies.',
  },
  buildings: {
    title: 'Buildings & Destinations',
    eyebrow: 'Smart building applications',
    copy: 'See how Green Electric systems adapt to homes, offices, hospitality, healthcare, industrial and public spaces.',
    seoTitle: 'Building types | Green Electric',
    seoDescription: 'Smart building solutions for homes, apartments, offices, hotels, hospitals, factories and more.',
  },
  solutions: {
    title: 'Solutions',
    eyebrow: 'Project services',
    copy: 'Design, implementation and maintenance services for reliable smart building projects.',
    seoTitle: 'Solutions | Green Electric',
    seoDescription: 'Green Electric design, implementation and maintenance services for smart building systems.',
  },
};

const pageCollections = {
  technology: technologyPages,
  buildings: buildingPages,
  solutions: solutionPages,
};

function localizeCollection(collection, language) {
  return language?.startsWith('ro') ? collection.map(localizeDeckPageRo) : collection;
}

export default function DeckOverviewPage({ section }) {
  const { i18n, t } = useTranslation();
  const copy = overviewCopy[section];
  const collection = pageCollections[section];

  const registry = useMemo(() => createPublicRegistry({
    technology: localizeCollection(technologyPages, i18n.language),
    buildings: localizeCollection(buildingPages, i18n.language),
    solutions: localizeCollection(solutionPages, i18n.language),
  }), [i18n.language]);

  if (!copy || !collection) return <Navigate to="/" replace />;

  const items = getPublicItems(section, registry);
  const heroImage = section === 'technology'
    ? siteImages.heroControl
    : section === 'buildings'
      ? siteImages.heroHome
      : siteImages.research;

  return (
    <>
      <SeoHead title={t(`presentation.overview.${section}.seoTitle`, { defaultValue: copy.seoTitle })} description={t(`presentation.overview.${section}.seoDescription`, { defaultValue: copy.seoDescription })} image={heroImage} />

      <section className="relative isolate overflow-hidden bg-ink pb-16 pt-32 text-white">
        <div className="absolute inset-0 bg-tech-grid bg-[length:54px_54px] opacity-[0.08]" />
        <div className="section-shell container-px relative grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald/25 bg-emerald/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald">
              <Layers3 size={15} aria-hidden="true" />
              {t(`presentation.overview.${section}.eyebrow`, { defaultValue: copy.eyebrow })}
            </p>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.75rem,5vw,4.9rem)] font-bold leading-[0.96] tracking-normal">
              {t(`presentation.overview.${section}.title`, { defaultValue: copy.title })}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              {t(`presentation.overview.${section}.copy`, { defaultValue: copy.copy })}
            </p>
          </div>
          <div className="home-hero-frame overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 p-2 shadow-2xl sm:p-3">
            <PresentationImage src={heroImage} alt="" className="aspect-[4/3] w-full rounded-[1.55rem] object-cover" sizes="(min-width: 1024px) 54vw, 92vw" eager />
          </div>
        </div>
      </section>

      <section id="page-content" className="bg-fog py-16 sm:py-20">
        <div className="section-shell container-px">
          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Link
                className="deck-feature-card group flex h-full flex-col"
                to={item.route}
                key={item.slug}
              >
                <PresentationImage
                  src={getPageImage(collection[index], index)}
                  alt={item.image?.alt || item.title}
                  className="aspect-[16/10] w-full rounded-lg object-cover"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                />
                <span className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald">{item.label}</span>
                <h2 className="mt-2 text-xl font-bold leading-tight text-graphite">{item.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{item.overviewDescription}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald">
                  {t('presentation.overview.openPage', { defaultValue: 'Open page' })}
                  <ArrowRight size={16} aria-hidden="true" className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
