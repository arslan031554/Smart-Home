import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGS = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'ro', labelKey: 'language.ro' }
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation();
  const currentCode = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('ro') ? 'ro' : 'en';
  const currentLanguage = LANGS.find((lang) => lang.code === currentCode) || LANGS[0];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLanguageSelect = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('language.label')}
        className="group relative flex min-w-[124px] items-center justify-between gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 shadow-soft backdrop-blur-xl transition-all duration-300 hover:border-primary-500/25 hover:bg-white/8 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,83,45,0.08),rgba(255,255,255,0))] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary-500/18 bg-primary-500/12 text-primary-300">
            <Globe className="h-2.5 w-2.5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-textPrimary">
            {t(currentLanguage.labelKey)}
          </span>
        </div>
        <ChevronDown className={`relative h-3 w-3 text-primary-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[156px] overflow-hidden rounded-[1.1rem] border border-primary-500/18 bg-[#181818]/96 p-1.5 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="px-2.5 pb-1.5 pt-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
            {t('language.label')}
          </div>
          <div className="space-y-1" role="listbox" aria-label={t('language.label')}>
            {LANGS.map((lang) => {
              const isActive = lang.code === currentCode;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`flex w-full items-center justify-between rounded-[0.9rem] border px-2.5 py-2 text-left transition-all duration-200 ${
                    isActive
                      ? 'border-primary-500/24 bg-primary-500/12 text-textPrimary'
                      : 'border-transparent bg-white/0 text-textSecondary hover:border-white/8 hover:bg-white/5 hover:text-textPrimary'
                  }`}
                  role="option"
                  aria-selected={isActive}
                >
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">
                      {t(lang.labelKey)}
                    </p>
                    <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.16em] text-textSecondary">
                      {lang.code === 'en' ? 'Default international' : 'Romanian interface'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] ${
                      isActive
                        ? 'border-primary-500/24 bg-primary-500/12 text-primary-300'
                        : 'border-white/8 bg-white/5 text-textSecondary'
                    }`}>
                      {lang.code}
                    </span>
                    {isActive ? <Check className="h-3 w-3 text-primary-300" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

    </div>
  );
}
