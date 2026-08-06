import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CategoryPager from './CategoryPager';
import PresentationImage from './PresentationImage';
import {
  DEFAULT_TAB_ID,
  getAdjacentTabId,
  getAccordionState,
  resolveTabId,
} from '../data/publicPageHelpers';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}

function DetailVisual({ image, imageAlt, tags = [] }) {
  if (!image) return null;

  return (
    <figure className="relative overflow-hidden rounded-[1.35rem] border-[7px] border-ink bg-ink shadow-[0_18px_35px_rgba(3,18,13,0.18)]">
      <PresentationImage
        src={image}
        alt={imageAlt}
        className="aspect-[16/10] w-full object-cover"
        sizes="(min-width: 1024px) 34vw, 88vw"
      />
      <div className="absolute right-3 top-3 rounded-full bg-ink/82 px-3 py-1 text-[9px] font-bold text-white">
        System online
      </div>
      {tags.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-ink/88 p-3">
          {tags.map((tag) => (
            <span className="rounded-full bg-emerald/16 px-3 py-2 text-[10px] font-bold text-white" key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </figure>
  );
}

function DetailPanel({ tab, image, imageAlt, tags = [] }) {
  return (
    <div className="grid min-w-0 gap-7 lg:grid-cols-[1fr_0.92fr] lg:items-center">
      <div className="min-w-0">
        {tab.title && <h3 className="max-w-[22rem] text-[1.55rem] font-bold leading-[1.08] text-graphite sm:text-3xl md:text-2xl lg:text-3xl">{tab.title}</h3>}
        {tab.body && <p className="mt-3 max-w-[38ch] text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{tab.body}</p>}

        {tab.steps?.length > 0 && (
          <ol className="mt-7 grid gap-4">
            {tab.steps.map((step, index) => (
              <li className="grid min-w-0 grid-cols-[auto_1fr] gap-4" key={step.title + '-' + index}>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#78c84f] text-sm font-black text-white">
                  {step.number || index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black leading-5 text-graphite">{step.title}</span>
                  <span className="mt-1 block max-w-[34ch] text-xs leading-5 text-slate-600">{step.description}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        {tab.bullets?.length > 0 && (
          <ul className="mt-6 grid gap-3">
            {tab.bullets.map((bullet) => (
              <li className="flex min-w-0 items-start gap-3 rounded-lg border border-emerald/14 bg-emerald/10 p-3 text-sm leading-6 text-slate-600" key={bullet}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
                <span className="min-w-0">{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DetailVisual image={image} imageAlt={imageAlt} tags={tags} />
    </div>
  );
}

function DesktopTabs({ tabs, activeTabId, onChange, image, imageAlt, tags }) {
  const { t } = useTranslation();
  const baseId = useId();
  const tabRefs = useRef({});
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  const activateTab = (tabId, shouldFocus = false) => {
    onChange(tabId);
    if (shouldFocus) requestAnimationFrame(() => tabRefs.current[tabId]?.focus());
  };

  const handleKeyDown = (event, tabId) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateTab(tabId);
      }
      return;
    }

    event.preventDefault();
    const nextId = event.key === 'Home'
      ? tabs[0].id
      : event.key === 'End'
        ? tabs[tabs.length - 1].id
        : getAdjacentTabId(tabId, event.key === 'ArrowLeft' ? 'previous' : 'next');
    activateTab(nextId, true);
  };

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:max-w-[64rem]" role="tablist" aria-label={t('presentation.detail.tablistLabel', { defaultValue: 'Detail sections' })}>
        {tabs.map((tab) => {
          const selected = tab.id === activeTab.id;
          const className = [
            'min-h-11 rounded-xl border px-5 py-2 text-sm font-black transition',
            selected ? 'border-emerald/25 bg-emerald/18 text-emerald' : 'border-emerald/20 bg-white text-graphite hover:border-emerald hover:text-emerald',
          ].join(' ');

          return (
            <button
              ref={(element) => { tabRefs.current[tab.id] = element; }}
              className={className}
              id={baseId + '-' + tab.id + '-tab'}
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={baseId + '-' + tab.id + '-panel'}
              tabIndex={selected ? 0 : -1}
              onClick={() => activateTab(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, tab.id)}
            >
              {t('presentation.detail.tabs.' + tab.id, { defaultValue: tab.label })}
            </button>
          );
        })}
      </div>

      <div
        className="mt-6 rounded-[1.35rem] border border-emerald/14 bg-white p-6 shadow-[0_18px_42px_rgba(3,18,13,0.10)] sm:p-8 lg:p-10"
        id={baseId + '-' + activeTab.id + '-panel'}
        role="tabpanel"
        aria-labelledby={baseId + '-' + activeTab.id + '-tab'}
      >
        <DetailPanel tab={activeTab} image={image} imageAlt={imageAlt} tags={tags} />
      </div>
    </div>
  );
}

function MobileAccordion({ tabs, openTabId, onChange, image, imageAlt, tags }) {
  const { t } = useTranslation();
  const baseId = useId();

  return (
    <div className="grid gap-3">
      {tabs.map((tab) => {
        const open = tab.id === openTabId;
        return (
          <section className="overflow-hidden rounded-xl border border-emerald/12 bg-white shadow-soft" key={tab.id}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-graphite"
              type="button"
              aria-expanded={open}
              aria-controls={baseId + '-' + tab.id + '-accordion-panel'}
              onClick={() => onChange(getAccordionState(openTabId, tab.id))}
            >
              <span>{t('presentation.detail.tabs.' + tab.id, { defaultValue: tab.label })}</span>
              <ChevronDown className={'h-5 w-5 shrink-0 text-emerald transition ' + (open ? 'rotate-180' : '')} aria-hidden="true" />
            </button>
            {open && (
              <div className="border-t border-emerald/10 px-5 py-5" id={baseId + '-' + tab.id + '-accordion-panel'}>
                <DetailPanel tab={tab} image={image} imageAlt={imageAlt} tags={tags} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default function PublicDetailSection({ detailPage, image, registry }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const tabs = detailPage.tabs || [];
  const defaultTabId = resolveTabId(tabs[0]?.id || DEFAULT_TAB_ID);
  const [tabState, setTabState] = useState(() => ({ slug: detailPage.slug, activeTabId: defaultTabId }));
  const currentTabState = tabState.slug === detailPage.slug ? tabState : { slug: detailPage.slug, activeTabId: defaultTabId };
  const setActiveTabId = (activeTabId) => setTabState({ slug: detailPage.slug, activeTabId });
  const activeTab = isMobile ? currentTabState.activeTabId : resolveTabId(currentTabState.activeTabId);
  const panelImage = detailPage.image?.src || image;
  const panelImageAlt = detailPage.image?.alt || detailPage.title;

  return (
    <section className="overflow-hidden bg-fog py-14 sm:py-18">
      <div className="section-shell container-px">
        <div className="mx-auto max-w-6xl">
          <div className="min-w-0">
            <p className="inline-flex rounded-full border border-emerald/20 bg-emerald/12 px-5 py-2 text-[11px] font-black uppercase tracking-normal text-emerald">
              {t('presentation.detail.moreDetail', { defaultValue: 'MORE DETAIL' })}
            </p>
            <h2 className="mt-6 max-w-[40rem] text-3xl font-black leading-[1.04] text-graphite sm:text-4xl lg:text-5xl">{detailPage.detailHeading}</h2>
            <p className="mt-4 max-w-[28rem] text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{detailPage.introduction}</p>
          </div>

          <div className="mt-5 min-w-0">
            {isMobile ? (
              <MobileAccordion tabs={tabs} openTabId={activeTab} onChange={setActiveTabId} image={panelImage} imageAlt={panelImageAlt} tags={detailPage.tags} />
            ) : (
              <DesktopTabs tabs={tabs} activeTabId={activeTab} onChange={(tabId) => setActiveTabId(resolveTabId(tabId))} image={panelImage} imageAlt={panelImageAlt} tags={detailPage.tags} />
            )}
          </div>

          {!detailPage.hideCta && (
            <div className="mt-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <Link className="deck-button deck-button-primary justify-center sm:min-w-[16rem]" to={detailPage.cta.href}>
                {detailPage.cta.label}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="deck-button border border-emerald/35 bg-white text-ink hover:border-emerald hover:bg-emerald/10" to="/contact">
                {t('presentation.detail.talkToUs', { defaultValue: 'Talk to us' })}
              </Link>
            </div>
          )}
        </div>

        <CategoryPager category={detailPage.category} currentSlug={detailPage.slug} registry={registry} className="mx-auto mt-8 max-w-6xl rounded-2xl border border-emerald/14 bg-emerald/10 p-4" />
      </div>
    </section>
  );
}
