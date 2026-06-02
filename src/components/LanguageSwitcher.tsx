import { useAppStore } from '../store';
import { type Locale } from '../i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useAppStore();

  const toggleLocale = () => {
    const newLocale: Locale = locale === 'en' ? 'zh' : 'en';
    setLocale(newLocale);
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      aria-label={locale === 'en' ? 'Switch to Chinese' : 'Switch to English'}
      aria-pressed={false}
      type="button"
    >
      <span className="text-lg" aria-hidden="true">
        {locale === 'en' ? '🇺🇸' : '🇨🇳'}
      </span>
      <span>{locale === 'en' ? '中文' : 'English'}</span>
    </button>
  );
}
