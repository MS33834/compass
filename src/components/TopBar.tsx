// 镜心 · 顶部导航
import { useStore } from '../store';
import { BrushButton } from './BrushButton';
import { useT } from '../i18n';

export function TopBar() {
  const phase = useStore(s => s.phase);
  const locale = useStore(s => s.locale);
  const theme = useStore(s => s.theme);
  const reset = useStore(s => s.reset);
  const setLocale = useStore(s => s.setLocale);
  const setTheme = useStore(s => s.setTheme);
  const t = useT();
  const onLogo = () => {
    if (confirm(t.ui.returnHomeConfirm)) reset();
  };
  const label = t.ui.phase[phase];
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        position: 'sticky',
        top: 0,
        background: 'var(--rice-translucent)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
        borderBottom: '1px solid var(--rice-deep)',
        minHeight: '3.5rem',
        gap: '0.5rem',
      }}
    >
      <button
        onClick={onLogo}
        title={t.ui.returnHome}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.5rem',
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          letterSpacing: '0.2em',
          minHeight: '2.5rem',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
        aria-label={`${t.ui.appName} — ${t.ui.returnHome}`}
      >
        <span className="jx-seal" aria-hidden>
          {t.ui.sealChar}
        </span>
        <span>{t.ui.appName}</span>
      </button>

      <nav
        style={{
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <span
          data-testid="topbar-phase"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--ink-faint)',
            fontSize: '0.875rem',
            letterSpacing: '0.1em',
            padding: '0 0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <BrushButton
          variant="ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? t.ui.themeLight : t.ui.themeDark}
          data-testid="btn-theme"
          aria-label={theme === 'dark' ? t.ui.themeLabelLight : t.ui.themeLabelDark}
          style={{ minWidth: '2.5rem', padding: '0.25rem 0.6rem' }}
        >
          {theme === 'dark' ? '☾' : '☼'}
        </BrushButton>
        <BrushButton
          variant="ghost"
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          data-testid="btn-lang"
          style={{ minWidth: '2.5rem', padding: '0.25rem 0.6rem' }}
        >
          {t.ui.toggleLang}
        </BrushButton>
      </nav>
    </header>
  );
}
