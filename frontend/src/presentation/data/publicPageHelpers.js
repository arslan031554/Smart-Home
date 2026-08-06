export const TAB_IDS = ['how-it-works', 'what-is-included', 'key-benefits', 'project-applications'];
export const DEFAULT_TAB_ID = TAB_IDS[0];

export const CATEGORY_CONFIG = {
  technology: {
    collectionKey: 'technology',
    overviewRoute: '/technology',
    singularLabel: 'Technology',
    allLabel: 'All Technologies',
    previousLabel: 'Previous Technology',
    nextLabel: 'Next Technology',
  },
  buildings: {
    collectionKey: 'buildings',
    overviewRoute: '/buildings',
    singularLabel: 'Building Type',
    allLabel: 'All Building Types',
    previousLabel: 'Previous Building Type',
    nextLabel: 'Next Building Type',
  },
  solutions: {
    collectionKey: 'solutions',
    overviewRoute: '/solutions',
    singularLabel: 'Solution',
    allLabel: 'All Solutions',
    previousLabel: 'Previous Solution',
    nextLabel: 'Next Solution',
  },
};

export function clampWords(text = '', maxWords = 125) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ').replace(/[,.!?;:]*$/, '')}.`;
}

export function getCollectionByCategory(registry, category) {
  if (!registry || !CATEGORY_CONFIG[category]) return [];
  return registry[CATEGORY_CONFIG[category].collectionKey] || [];
}

export function getPagerState(items, currentSlug, overviewRoute) {
  const index = items.findIndex((item) => item.slug === currentSlug || item.id === currentSlug);
  if (index < 0) {
    return { previous: null, next: null, overviewRoute, index: -1, total: items.length };
  }

  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
    overviewRoute,
    index,
    total: items.length,
  };
}

export function resolveTabId(currentId, fallback = DEFAULT_TAB_ID) {
  return TAB_IDS.includes(currentId) ? currentId : fallback;
}

export function getAdjacentTabId(currentId, direction) {
  const currentIndex = TAB_IDS.indexOf(resolveTabId(currentId));
  const delta = direction === 'previous' ? -1 : 1;
  const nextIndex = (currentIndex + delta + TAB_IDS.length) % TAB_IDS.length;
  return TAB_IDS[nextIndex];
}

export function getAccordionState(openId, requestedId) {
  const safeRequestedId = resolveTabId(requestedId);
  return openId === safeRequestedId ? null : safeRequestedId;
}

export const CONTACT_SERVICE_PREFILLS = {
  design: 'I am interested in Green Electric design services.',
  maintenance: 'I am interested in Green Electric maintenance services.',
  implementation: 'I am interested in Green Electric implementation services.',
};

export function normalizeServiceParam(service) {
  const normalized = String(service || '').trim().toLowerCase();
  return Object.hasOwn(CONTACT_SERVICE_PREFILLS, normalized) ? normalized : null;
}

export function getContactPrefill(service, copy = {}) {
  const normalized = normalizeServiceParam(service);
  if (!normalized) return null;

  return {
    service: normalized,
    message: copy?.[normalized] || CONTACT_SERVICE_PREFILLS[normalized],
  };
}
