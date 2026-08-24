export function normalizeConfiguratorLanguage(language) {
    return String(language || '').toLowerCase().startsWith('ro') ? 'ro' : 'en';
}

export function getConfiguratorText(source = {}, field, language = 'en', fallback = '') {
    const lang = normalizeConfiguratorLanguage(language);
    const suffix = lang === 'ro' ? 'Ro' : 'En';
    const fallbackSuffix = lang === 'ro' ? 'En' : 'Ro';
    const translations = source?.translations?.[field] || {};
    const candidates = [
        source?.[field + suffix],
        translations?.[lang],
        lang === 'en' ? source?.[field] : null,
        source?.[field + fallbackSuffix],
        translations?.[lang === 'ro' ? 'en' : 'ro'],
        source?.[field],
        fallback,
    ];

    const value = candidates.find((candidate) => (
        typeof candidate === 'string' && candidate.trim()
    ));
    return value ? value.trim() : '';
}

export function getActiveConfiguratorLanguage(i18n) {
    return normalizeConfiguratorLanguage(i18n?.resolvedLanguage || i18n?.language);
}
