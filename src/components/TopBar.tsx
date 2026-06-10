// 镜心 · 顶部导航
import { useStore } from '../store';
import { BrushButton } from './BrushButton';

export function TopBar() {
  const { phase, goPhase, reset, locale, setLocale } = useStore();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        background: 'rgba(245, 239, 224, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
        borderBottom: '1px solid var(--rice-deep)',
      }}
    >
      <button
        onClick={() => (phase === 'reflection' ? goPhase('prologue') : reset())}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: 0,
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          letterSpacing: '0.2em',
        }}
        aria-label="镜心"
      >
        <span className="jx-seal" aria-hidden>
          镜
        </span>
        <span>镜心</span>
      </button>

      <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <BrushButton variant="ghost" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>
          {locale === 'zh' ? 'EN' : '中'}
        </BrushButton>
      </nav>
    </header>
  );
}
