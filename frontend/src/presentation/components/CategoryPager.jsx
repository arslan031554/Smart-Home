import { ArrowLeft, ArrowRight, Grid2X2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_CONFIG, getPublicPager } from '../data/publicPageRegistry';

function PagerLink({ item, children, direction }) {
  if (!item) {
    return (
      <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald/10 bg-white/60 px-5 py-3 text-sm font-semibold text-slate-400">
        {children}
      </span>
    );
  }

  return (
    <Link
      className="deck-button border border-emerald/20 bg-white text-graphite shadow-soft hover:border-emerald hover:text-emerald"
      to={item.route}
      aria-label={`${direction}: ${item.navigationTitle || item.title}`}
    >
      {children}
    </Link>
  );
}

export default function CategoryPager({ category, currentSlug, registry, className = '' }) {
  const { t } = useTranslation();
  const config = CATEGORY_CONFIG[category];
  const pager = getPublicPager(category, currentSlug, registry);

  if (!config || pager.index < 0) return null;

  return (
    <nav className={`grid gap-3 sm:grid-cols-3 ${className}`} aria-label={t(`presentation.pager.${category}.label`, { defaultValue: `${config.singularLabel} navigation` })}>
      <PagerLink item={pager.previous} direction={t(`presentation.pager.${category}.previousAria`, { defaultValue: `Previous ${config.singularLabel.toLowerCase()}` })}>
        <ArrowLeft size={17} aria-hidden="true" />
        <span>{t(`presentation.pager.${category}.previous`, { defaultValue: config.previousLabel })}</span>
      </PagerLink>

      <Link className="deck-button bg-ink text-white hover:bg-emerald hover:text-ink" to={pager.overviewRoute}>
        <Grid2X2 size={17} aria-hidden="true" />
        <span>{t(`presentation.pager.${category}.all`, { defaultValue: config.allLabel })}</span>
      </Link>

      <PagerLink item={pager.next} direction={t(`presentation.pager.${category}.nextAria`, { defaultValue: `Next ${config.singularLabel.toLowerCase()}` })}>
        <span>{t(`presentation.pager.${category}.next`, { defaultValue: config.nextLabel })}</span>
        <ArrowRight size={17} aria-hidden="true" />
      </PagerLink>
    </nav>
  );
}
