import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import roCommon from './locales/ro/common.json';

const DEFAULT_LANG = 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    resources: {
      en: { common: enCommon },
      ro: { common: roCommon },
    },
    fallbackLng: DEFAULT_LANG,
    supportedLngs: ['en', 'ro'],
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hsc_lang',
    },
    react: {
      useSuspense: false,
    },
  });

// Silence i18next promotional/info logs in dev console.
// (We still surface real errors via the app ErrorBoundary.)
i18n.services.logger = {
  log() {},
  warn() {},
  error() {}
};

export default i18n;

