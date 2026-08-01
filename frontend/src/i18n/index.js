import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enUi from './locales/en/ui.json';
import roCommon from './locales/ro/common.json';
import roAdminExtra from './locales/ro/admin-extra.json';
import roCarouselExtra from './locales/ro/carousel-extra.json';
import roConfiguratorExtra from './locales/ro/configurator-extra.json';
import roFlowExtra from './locales/ro/flow-extra.json';
import roMasterDataExtra from './locales/ro/master-data-extra.json';
import roPresentationExtra from './locales/ro/presentation-extra.json';
import roSupplement from './locales/ro/supplement.json';
import roUi from './locales/ro/ui.json';

const DEFAULT_LANG = 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    resources: {
      en: { common: { ...enCommon, ...enUi } },
      ro: { common: { ...roCommon, ...roSupplement, ...roUi, ...roConfiguratorExtra, ...roFlowExtra, ...roAdminExtra, ...roPresentationExtra, ...roMasterDataExtra, ...roCarouselExtra } },
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

