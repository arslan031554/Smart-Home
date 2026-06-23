import {
    OFFER_STATUSES,
    getOfferStatusLabel,
    isValidOfferStatus,
    normalizeOfferStatus,
} from '../constants/offerStatus.js';

export function resolveOfferStatusTransition(currentStatus, requestedStatus) {
    const from = normalizeOfferStatus(currentStatus || 'draft');
    const to = normalizeOfferStatus(requestedStatus);

    if (!isValidOfferStatus(to)) {
        const error = new Error('Invalid status');
        error.statusCode = 400;
        throw error;
    }

    return {
        from,
        to,
        changed: from !== to,
        label: getOfferStatusLabel(to),
    };
}

export function getCanonicalOfferStatuses() {
    return [...OFFER_STATUSES];
}
