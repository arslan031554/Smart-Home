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

export const DICTIONARY_FALLBACKS = {
    ro: {
        // Offer Conditions
        'This offer is valid for 30 days from the date of issue.': 'Aceasta oferta este valabila 30 de zile de la data emiterii.',
        'Prices are excluding VAT unless otherwise stated.': 'Preturile nu includ TVA, cu exceptia cazului in care se specifica altfel.',
        'Installation and commissioning may be quoted separately.': 'Instalarea si punerea in functiune pot fi ofertate separat.',
        // Disclaimers
        'Technical specifications are subject to change. Final product may vary.': 'Specificatiile tehnice pot fi modificate. Produsul final poate varia.',
        'Smart home systems require compatible network and power infrastructure.': 'Sistemele smart home necesita o infrastructura compatibila de retea si alimentare.',
        // Services
        'Installation': 'Instalare',
        'Configuration': 'Configurare',
        'Installation & Commissioning': 'Instalare si punere in functiune',
        'Smart Home Configuration': 'Configurare Smart Home',
        'Design & Engineering': 'Proiectare si inginerie',
        'Maintenance & Support': 'Intretinere si asistenta',
        'Electrical Installation': 'Instalatie electrica',
        // Products
        'Smart Switch 1-gang': 'Intrerupator inteligent 1 canal',
        'Smart Switch 2-gang': 'Intrerupator inteligent 2 canale',
        'Room Thermostat': 'Termostat de camera',
        'PIR Motion Sensor': 'Senzor de miscare PIR',
        '8-Channel Actuator 16A': 'Actuator 8 canale 16A',
        'Single Relay Module': 'Modul releu simplu',
        'Switching actuator for lights/sockets': 'Actuator de comutare pentru lumini/prize',
        'Auxiliary relay module': 'Modul releu auxiliar',
        // Building Types
        'Apartment': 'Apartament',
        'Single-family House': 'Casa unifamiliala',
        'Villa': 'Vila',
        'Commercial': 'Spatiu comercial',
        'Office Space': 'Spatiu de birouri',
        'Hotel': 'Hotel',
        // Colors & Ranges
        'White': 'Alb',
        'Black': 'Negru',
        'Anthracite': 'Antracit',
        'Silver': 'Argintiu',
        'Aluminium': 'Aluminiu',
        'Standard': 'Standard',
        'Premium': 'Premium',
        'Essential': 'Essential',
        'Standard Range': 'Gama Standard',
        'Premium Range': 'Gama Premium',
        'Essential Range': 'Gama Essential',
    },
};

export function getLocalizedValue(source, field, language, fallbackValue = null) {
    const lang = normalizeBusinessLanguage(language);
    const translations = normalizeTranslations(source?.translations);
    const fieldTranslations = translations[field] || {};

    if (typeof fieldTranslations[lang] === 'string' && fieldTranslations[lang].trim()) {
        return fieldTranslations[lang].trim();
    }

    if (lang !== 'en' && typeof fieldTranslations.en === 'string' && fieldTranslations.en.trim()) {
        const enVal = fieldTranslations.en.trim();
        if (lang === 'ro' && DICTIONARY_FALLBACKS.ro[enVal]) {
            return DICTIONARY_FALLBACKS.ro[enVal];
        }
        return enVal;
    }

    const rawValue = typeof source?.[field] === 'string' ? source[field].trim() : null;
    if (rawValue) {
        if (lang === 'ro' && DICTIONARY_FALLBACKS.ro[rawValue]) {
            return DICTIONARY_FALLBACKS.ro[rawValue];
        }
        return rawValue;
    }

    if (typeof fallbackValue === 'string') {
        const trimmedFallback = fallbackValue.trim();
        if (lang === 'ro' && DICTIONARY_FALLBACKS.ro[trimmedFallback]) {
            return DICTIONARY_FALLBACKS.ro[trimmedFallback];
        }
        return trimmedFallback;
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
