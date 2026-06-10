// 镜心 · 入口
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { Prologue } from './pages/Prologue';
import { Path } from './pages/Path';
import { Way } from './pages/Way';
import { Reflection } from './pages/Reflection';

export function App() {
  const { phase } = useStore();
  return (
    <>
      <TopBar />
      <main>
        {phase === 'prologue' && <Prologue />}
        {phase === 'path' && <Path />}
        {phase === 'way' && <Way />}
        {phase === 'reflection' && <Reflection />}
      </main>
    </>
  );
}
