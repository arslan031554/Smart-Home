export const OFFER_STATUSES = Object.freeze([
  'draft',
  'in_progress',
  'offer_ready',
  'waiting',
  'ordered',
  'cancelled',
]);

export function normalizeOfferStatus(status) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (normalized === 'offer_generated') return 'offer_ready';
  return normalized;
}

export function isValidOfferStatus(status) {
  return OFFER_STATUSES.includes(normalizeOfferStatus(status));
}
