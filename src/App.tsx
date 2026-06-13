// 镜心 · 入口
import { Component, useEffect, useState, type ReactNode } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { Prologue } from './pages/Prologue';
import { Path } from './pages/Path';
import { Way } from './pages/Way';
import { Reflection } from './pages/Reflection';

// 错误边界：组件渲染异常时显示降级 UI，避免整页白屏
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            maxWidth: '32rem',
            margin: '4rem auto',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
          }}
        >
          <h2
            style={{
              color: 'var(--cinnabar)',
              fontFamily: 'var(--font-display)',
              marginBottom: '1rem',
            }}
          >
            镜中现影异常
          </h2>
          <p style={{ color: 'var(--ink-faint)', marginBottom: '1.5rem' }}>
            请尝试重新加载，或返回首页。
          </p>
          <button
            onClick={() => location.reload()}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'var(--ink)',
              color: 'var(--rice)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { phase } = useStore();
  const [currentPhase, setCurrentPhase] = useState(phase);

  // 阶段变化：先 600ms 翻页退出，再切换到新页面（带入场动画）
  useEffect(() => {
    if (phase === currentPhase) return;
    const timer = setTimeout(() => setCurrentPhase(phase), 600);
    return () => clearTimeout(timer);
  }, [phase, currentPhase]);

  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPhase]);

  return (
    <ErrorBoundary>
      <a className="jx-skip-link" href="#main-content">
        跳至正文
      </a>
      <TopBar />
      <main
        id="main-content"
        tabIndex={-1}
        className="jx-page-enter"
        key={currentPhase}
      >
        {currentPhase === 'prologue' && <Prologue key="prologue" />}
        {currentPhase === 'path' && <Path key="path" />}
        {currentPhase === 'way' && <Way key="way" />}
        {currentPhase === 'reflection' && <Reflection key="reflection" />}
      </main>
    </ErrorBoundary>
  );
}
