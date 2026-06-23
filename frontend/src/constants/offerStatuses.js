export const OFFER_STATUSES = Object.freeze([
    'draft',
    'in_progress',
    'offer_generated',
    'ordered',
    'cancelled',
]);

export const LEGACY_OFFER_STATUS_MAP = Object.freeze({
    offer_ready: 'offer_generated',
    waiting: 'offer_generated',
});

export const OFFER_STATUS_TRANSLATION_KEYS = Object.freeze({
    draft: 'offers.statuses.draft',
    in_progress: 'offers.statuses.inProgress',
    offer_generated: 'offers.statuses.offerGenerated',
    ordered: 'offers.statuses.ordered',
    cancelled: 'offers.statuses.cancelled',
});

export function normalizeOfferStatus(status) {
    const normalized = String(status || 'draft')
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_');

    return LEGACY_OFFER_STATUS_MAP[normalized] || normalized;
}

export function isOfferGeneratedStatus(status) {
    return normalizeOfferStatus(status) === 'offer_generated';
}
