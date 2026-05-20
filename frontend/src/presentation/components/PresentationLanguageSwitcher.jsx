import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';

const LANGUAGES = [
  { code: 'ro', label: 'RO', name: 'Romana' },
  { code: 'en', label: 'EN', name: 'English' },
];

export default function PresentationLanguageSwitcher({ className = '', variant = 'dark' }) {
  const { i18n } = useTranslation();
  const currentCode = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('ro') ? 'ro' : 'en';
  const isDark = variant === 'dark';

  const shellClass = isDark
    ? 'border-white/15 bg-white/10 text-white shadow-black/10'
    : 'border-emerald/20 bg-white text-graphite shadow-emerald/10';

  const iconClass = isDark ? 'text-orange' : 'text-emerald';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border p-1 shadow-lg backdrop-blur-xl ${shellClass} ${className}`}
      aria-label="Language selector"
    >
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isDark ? 'bg-white/10' : 'bg-emerald/10'}`}>
        <Globe2 size={14} className={iconClass} />
      </span>
      {LANGUAGES.map((language) => {
        const isActive = language.code === currentCode;

        return (
          <button
            key={language.code}
            type="button"
            title={language.name}
            aria-pressed={isActive}
            onClick={() => i18n.changeLanguage(language.code)}
            className={`min-w-10 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition ${
              isActive
                ? isDark
                  ? 'bg-orange text-white shadow-orange'
                  : 'bg-emerald text-white shadow-glow'
                : isDark
                  ? 'text-white/72 hover:bg-white/10 hover:text-white'
                  : 'text-graphite/58 hover:bg-emerald/10 hover:text-emerald'
            }`}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
