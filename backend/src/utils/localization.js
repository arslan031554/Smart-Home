export const SUPPORTED_BUSINESS_LANGUAGES = ['en', 'ro'];

export function normalizeBusinessLanguage(language) {
    if (typeof language !== 'string') return 'en';
    const normalized = language.trim().toLowerCase().slice(0, 2);
    return SUPPORTED_BUSINESS_LANGUAGES.includes(normalized) ? normalized : 'en';
}

export function normalizeTranslations(rawTranslations) {
    if (!rawTranslations || typeof rawTranslations !== 'object' || Array.isArray(rawTranslations)) {
        return {};
    }

    const normalized = {};
    for (const [field, value] of Object.entries(rawTranslations)) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
        const nextValue = {};
        for (const [language, text] of Object.entries(value)) {
            const lang = normalizeBusinessLanguage(language);
            const normalizedText = typeof text === 'string' ? text.trim() : '';
            if (normalizedText) nextValue[lang] = normalizedText;
        }
        if (Object.keys(nextValue).length > 0) {
            normalized[field] = nextValue;
        }
    }

    return normalized;
}

export function getLocalizedValue(source, field, language, fallbackValue = null) {
    const lang = normalizeBusinessLanguage(language);
    const translations = normalizeTranslations(source?.translations);
    const fieldTranslations = translations[field] || {};

    if (typeof fieldTranslations[lang] === 'string' && fieldTranslations[lang].trim()) {
        return fieldTranslations[lang].trim();
    }

    if (lang !== 'en' && typeof fieldTranslations.en === 'string' && fieldTranslations.en.trim()) {
        return fieldTranslations.en.trim();
    }

    if (typeof source?.[field] === 'string' && source[field].trim()) {
        return source[field].trim();
    }

    if (typeof fallbackValue === 'string') {
        return fallbackValue.trim();
    }

    return fallbackValue;
}

export function serializeLocalizedEntity(record, { language = 'en', fields = [], includeTranslations = true } = {}) {
    if (!record) return record;
    const plain = record.toJSON ? record.toJSON() : { ...record };

    fields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(plain, field)) {
            plain[field] = getLocalizedValue(plain, field, language, plain[field] ?? null);
        }
    });

    if (includeTranslations) {
        plain.translations = normalizeTranslations(plain.translations);
    } else {
        delete plain.translations;
    }

    return plain;
}
