// 镜心 · 入门 · 题
import { useStore } from '../store';
import { BrushButton } from '../components/BrushButton';
import { Verse } from '../components/Verse';

const INTROS = [
  [
    { text: '镜心', gloss: '一面问己之镜。' },
    {
      text: '你若在千古之中，能与何人对坐？',
      gloss: '答以形，答以神，答以一段并行于时间里的同频共振。',
    },
  ],
  [
    { text: '镜中自有千古', gloss: '不必外求，汝答即是照。' },
    { text: '他人之影非汝，亦非非汝。', gloss: '问汝若他，他会如何处世？' },
  ],
  [
    { text: '入镜', gloss: '三分钟，三千年。' },
    { text: '借古人三千年的影子，映汝一念之端。', gloss: '所答无对错，唯以诚为要。' },
  ],
];

export function Prologue() {
  const { goPhase } = useStore();
  const pick = Math.floor(Math.random() * INTROS.length);
  const lines = INTROS[pick];

  return (
    <section className="jx-container-narrow jx-fade-enter" aria-labelledby="prologue-title">
      <div style={{ textAlign: 'center', padding: '4rem 0 2rem' }}>
        <div
          aria-hidden
          style={{
            fontSize: '6rem',
            color: 'var(--cinnabar)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.3em',
            lineHeight: 1,
            marginBottom: '1.5rem',
          }}
        >
          镜
        </div>
        <h1 id="prologue-title" style={{ marginBottom: '2rem' }}>
          镜心
        </h1>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        {lines.map((l, i) => (
          <Verse key={i} text={l.text} gloss={l.gloss} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        <BrushButton variant="primary" onClick={() => goPhase('path')}>
          入镜
        </BrushButton>
      </div>

      <p
        style={{
          textAlign: 'center',
          color: 'var(--ink-faint)',
          fontSize: '0.875rem',
          marginTop: '4rem',
        }}
      >
        所答仅存汝之本地，镜心不联网。
      </p>
    </section>
  );
}
