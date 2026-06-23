export const OFFER_STATUSES = Object.freeze([
  'draft',
  'in_progress',
  'offer_generated',
  'ordered',
  'cancelled',
]);

export const OFFER_STATUS_LABELS = Object.freeze({
  draft: 'Draft',
  in_progress: 'In Progress',
  offer_generated: 'Offer Generated',
  ordered: 'Ordered',
  cancelled: 'Cancelled',
});

export const LEGACY_OFFER_STATUS_MAP = Object.freeze({
  offer_ready: 'offer_generated',
  waiting: 'offer_generated',
});

export function normalizeOfferStatus(status) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  return LEGACY_OFFER_STATUS_MAP[normalized] || normalized;
}

export function isValidOfferStatus(status) {
  return OFFER_STATUSES.includes(normalizeOfferStatus(status));
}

export function getOfferStatusLabel(status) {
  return OFFER_STATUS_LABELS[normalizeOfferStatus(status)] || String(status || '');
}
