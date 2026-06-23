// 指南 · 入口
import { useT } from './i18n';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { Prologue } from './pages/Prologue';
import { Path } from './pages/Path';
import { Way } from './pages/Way';
import { Reflection } from './pages/Reflection';
import { FigureDetail } from './components/FigureDetail';

export function App() {
  const phase = useStore(s => s.phase);
  const t = useT();
  const mainRef = useRef<HTMLElement>(null);
  const [currentPhase, setCurrentPhase] = useState(phase);
  const [exiting, setExiting] = useState(false);

  // 阶段变化：先淡出旧页面，再切换到新页面（带入场动画）
  useEffect(() => {
    if (phase === currentPhase) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || phase === 'prologue') {
      window.scrollTo(0, 0);
      setCurrentPhase(phase);
      return;
    }

    setExiting(true);
    const ctx = gsap.context(() => {
      gsap.to(mainRef.current, {
        autoAlpha: 0,
        scale: 0.98,
        filter: 'blur(4px)',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          window.scrollTo(0, 0);
          setCurrentPhase(phase);
          setExiting(false);
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, [phase, currentPhase]);

  // 新页面入场
  useEffect(() => {
    if (exiting) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { autoAlpha: 0, scale: 0.98, filter: 'blur(6px)', y: 16 },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }, mainRef);

    return () => ctx.revert();
  }, [currentPhase, exiting]);

  // 答题页沉浸模式：隐藏 TopBar，让固定视口占满全屏
  const immersive = phase === 'way';

  return (
    <>
      <a className="cp-skip-link" href="#main-content">
        {t.ui.skipToContent}
      </a>
      {!immersive && <TopBar />}
      <main id="main-content" ref={mainRef} tabIndex={-1} key={currentPhase}>
        {currentPhase === 'prologue' && <Prologue key="prologue" />}
        {currentPhase === 'path' && <Path key="path" />}
        {currentPhase === 'way' && <Way key="way" />}
        {currentPhase === 'reflection' && <Reflection key="reflection" />}
      </main>
      <FigureDetail />
    </>
  );
}
