// 镜心 · 入口
import { useEffect } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { Prologue } from './pages/Prologue';
import { Path } from './pages/Path';
import { Way } from './pages/Way';
import { Reflection } from './pages/Reflection';

export function App() {
  const { phase } = useStore();
  
  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);
  
  return (
    <>
      <a className="jx-skip-link" href="#main-content">
        跳至正文
      </a>
      <TopBar />
      <main id="main-content" tabIndex={-1} className="jx-fade-enter">
        {phase === 'prologue' && <Prologue key="prologue" />}
        {phase === 'path' && <Path key="path" />}
        {phase === 'way' && <Way key="way" />}
        {phase === 'reflection' && <Reflection key="reflection" />}
      </main>
    </>
  );
}
