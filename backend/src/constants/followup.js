export const DEFAULT_FOLLOWUP_PATTERN = '7,14,30';
export const OFFER_REMINDER_ELIGIBLE_STATUSES = ['offer_generated'];
export const FOLLOWUP_CONTEXTS = Object.freeze({
    OFFER_NOT_ORDERED: 'offer_not_ordered',
    UNFINISHED_CONFIGURATION: 'unfinished_configuration',
});

function parseBooleanEnv(value, fallback = false) {
    if (value == null || value === '') return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

export function getConfiguredFollowupPattern() {
    const raw = String(process.env.FOLLOWUP_CADENCE_DAYS || process.env.FOLLOWUP_PATTERN || '').trim();
    return raw || DEFAULT_FOLLOWUP_PATTERN;
}

export function getConfiguredFollowupCadenceDays(pattern = null) {
    const raw = String(pattern || getConfiguredFollowupPattern()).trim();
    const days = raw
        .split(',')
        .map((value) => parseInt(String(value).trim(), 10))
        .filter((value) => Number.isFinite(value) && value > 0)
        .slice(0, 10);
    const uniq = Array.from(new Set(days)).sort((a, b) => a - b);
    return uniq.length ? uniq : [7, 14, 30];
}

export function isSmsFollowupEnabled() {
    return parseBooleanEnv(
        process.env.FOLLOWUP_SMS_ENABLED ?? process.env.SMS_FOLLOWUP_ENABLED,
        false,
    );
}
