import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGS = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'ro', labelKey: 'language.ro' }
];

export default function LanguageSwitcher({ className = '', variant = 'dropdown' }) {
  const { i18n, t } = useTranslation();
  const currentCode = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('ro') ? 'ro' : 'en';
  const currentLanguage = LANGS.find((lang) => lang.code === currentCode) || LANGS[0];
  const nextLanguage = LANGS.find((lang) => lang.code !== currentCode) || LANGS[0];
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

  if (variant === 'compact') {
    const switchLabel = t('language.switchTo', { language: t(nextLanguage.labelKey), defaultValue: 'Switch to ' + t(nextLanguage.labelKey) });
    function handleCompactSelect() {
      handleLanguageSelect(nextLanguage.code);
    }

    return React.createElement(
      'button',
      {
        type: 'button',
        onClick: handleCompactSelect,
        'aria-label': switchLabel,
        title: switchLabel,
        className: [
          'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-textPrimary shadow-soft transition-all hover:border-primary-500/22 hover:bg-white/10 hover:text-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10',
          className,
        ].filter(Boolean).join(' '),
      },
      React.createElement(Globe, { className: 'h-3.5 w-3.5 text-primary-300' }),
      React.createElement('span', null, currentCode),
    );
  }
  if (variant === 'inline') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 p-1 shadow-lg shadow-emerald/10 backdrop-blur-xl ${className}`}
        aria-label={t('language.label')}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald/12 text-emerald">
          <Globe className="h-3.5 w-3.5" />
        </span>
        {LANGS.map((lang) => {
          const isActive = lang.code === currentCode;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageSelect(lang.code)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${
                isActive
              ? 'bg-emerald text-ink shadow-glow'
              : 'text-white/62 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t(lang.labelKey)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('language.label')}
        className="group relative flex min-w-[124px] items-center justify-between gap-2 overflow-hidden rounded-full border border-emerald/20 bg-white px-2.5 py-1.5 shadow-lg shadow-emerald/10 backdrop-blur-xl transition-all duration-300 hover:border-emerald/35 hover:bg-emerald/10 focus:outline-none focus:ring-4 focus:ring-emerald/12"
      >
        <div className="relative flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald">
            <Globe className="h-2.5 w-2.5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-textPrimary">
            {t(currentLanguage.labelKey)}
          </span>
        </div>
        <ChevronDown className={`relative h-3 w-3 text-emerald transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[156px] overflow-hidden rounded-lg border border-emerald/18 bg-white p-1.5 shadow-2xl shadow-emerald/15 backdrop-blur-2xl">
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
                      ? 'border-emerald/24 bg-emerald/12 text-textPrimary'
                      : 'border-transparent bg-white/0 text-textSecondary hover:border-emerald/16 hover:bg-emerald/8 hover:text-emerald'
                  }`}
                  role="option"
                  aria-selected={isActive}
                >
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">
                      {t(lang.labelKey)}
                    </p>
                    <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.16em] text-textSecondary">
                      {t(lang.code === 'en' ? 'language.enDescription' : 'language.roDescription')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] ${
                      isActive
                        ? 'border-emerald/24 bg-emerald/12 text-emerald'
                        : 'border-emerald/12 bg-fog text-textSecondary'
                    }`}>
                      {lang.code}
                    </span>
                    {isActive ? <Check className="h-3 w-3 text-emerald" /> : null}
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
