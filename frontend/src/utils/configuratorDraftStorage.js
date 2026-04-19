const CONFIGURATOR_DRAFT_STORAGE_KEY = 'configurator_draft';
const CONFIGURATOR_GUEST_SESSION_KEY = 'configurator_guest_session_id';
const PENDING_CONFIGURATOR_OFFER_KEY = 'pending_configurator_offer';

function normalizeStep(value) {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.min(parsed, 9));
}

function normalizeLanguage(value) {
    return String(value || '').toLowerCase().startsWith('ro') ? 'ro' : 'en';
}

function generateGuestSessionId() {
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    return `guest-${seed}`;
}

export function getOrCreateGuestSessionId() {
    try {
        let value = localStorage.getItem(CONFIGURATOR_GUEST_SESSION_KEY);
        if (!value) {
            value = generateGuestSessionId();
            localStorage.setItem(CONFIGURATOR_GUEST_SESSION_KEY, value);
        }
        return value;
    } catch {
        return generateGuestSessionId();
    }
}

export function clearGuestSessionId() {
    try {
        localStorage.removeItem(CONFIGURATOR_GUEST_SESSION_KEY);
    } catch {
        // Ignore storage cleanup failures.
    }
}

function normalizeStoredSnapshot(snapshot = {}) {
    return {
        currentProjectId: snapshot.currentProjectId || null,
        projectInfo: snapshot.projectInfo || {},
        levels: Array.isArray(snapshot.levels) ? snapshot.levels : [],
        services: Array.isArray(snapshot.services) ? snapshot.services : [],
        range: snapshot.range ?? null,
        color: snapshot.color ?? null,
        customerComments: snapshot.customerComments || '',
        currentOfferId: snapshot.currentOfferId || null,
        currentStep: normalizeStep(snapshot.currentStep),
        language: normalizeLanguage(snapshot.language),
        guestSessionId: snapshot.guestSessionId || getOrCreateGuestSessionId(),
    };
}

export function buildStoredConfiguratorSnapshot(configuratorState = {}) {
    return {
        ...normalizeStoredSnapshot(configuratorState),
        savedAt: new Date().toISOString(),
    };
}

export function loadStoredConfiguratorSnapshot() {
    try {
        const raw = localStorage.getItem(CONFIGURATOR_DRAFT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return {
            ...normalizeStoredSnapshot(parsed),
            savedAt: parsed.savedAt || null,
        };
    } catch {
        return null;
    }
}

export function saveStoredConfiguratorSnapshot(snapshot) {
    try {
        const normalized = {
            ...normalizeStoredSnapshot(snapshot),
            savedAt: snapshot?.savedAt || new Date().toISOString(),
        };
        localStorage.setItem(CONFIGURATOR_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
        if (normalized.guestSessionId) {
            localStorage.setItem(CONFIGURATOR_GUEST_SESSION_KEY, normalized.guestSessionId);
        }
    } catch {
        // Ignore storage write failures.
    }
}

export function setPendingConfiguratorOffer(payload) {
    try {
        localStorage.setItem(PENDING_CONFIGURATOR_OFFER_KEY, JSON.stringify(payload || {}));
    } catch {
        // Ignore storage failures.
    }
}

export function loadPendingConfiguratorOffer() {
    try {
        const raw = localStorage.getItem(PENDING_CONFIGURATOR_OFFER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearStoredConfiguratorSnapshot({ keepGuestSession = false } = {}) {
    try {
        localStorage.removeItem(CONFIGURATOR_DRAFT_STORAGE_KEY);
        localStorage.removeItem(PENDING_CONFIGURATOR_OFFER_KEY);
        if (!keepGuestSession) {
            localStorage.removeItem(CONFIGURATOR_GUEST_SESSION_KEY);
        }
    } catch {
        // Ignore storage cleanup failures.
    }
}
