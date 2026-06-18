// 指南 · 入口
import { useT } from './i18n';
import { useEffect, useState } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { Prologue } from './pages/Prologue';
import { Path } from './pages/Path';
import { Way } from './pages/Way';
import { Reflection } from './pages/Reflection';

export function App() {
  const phase = useStore(s => s.phase);
  const t = useT();
  const [currentPhase, setCurrentPhase] = useState(phase);
  const [exiting, setExiting] = useState(false);

  // 阶段变化：先淡出旧页面，再切换到新页面（带入场动画）
  useEffect(() => {
    if (phase === currentPhase) return;
    setExiting(true);
    const timer = setTimeout(() => {
      // 新页面挂载前回到顶部
      window.scrollTo(0, 0);
      setCurrentPhase(phase);
      setExiting(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [phase, currentPhase]);

  // 答题页沉浸模式：隐藏 TopBar，让固定视口占满全屏
  const immersive = phase === 'way';

  return (
    <>
      <a className="jx-skip-link" href="#main-content">
        {t.ui.skipToContent}
      </a>
      {!immersive && <TopBar />}
      <main
        id="main-content"
        tabIndex={-1}
        className={`jx-page-enter${exiting ? ' jx-page-exit' : ''}`}
        key={currentPhase}
      >
        {currentPhase === 'prologue' && <Prologue key="prologue" />}
        {currentPhase === 'path' && <Path key="path" />}
        {currentPhase === 'way' && <Way key="way" />}
        {currentPhase === 'reflection' && <Reflection key="reflection" />}
      </main>
    </>
  );
}
