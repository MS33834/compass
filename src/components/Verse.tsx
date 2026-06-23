// 指南 · 古文-白话 双行排版

type Props = { text: string; gloss?: string; reveal?: boolean };

export function Verse({ text, gloss, reveal = false }: Props) {
  return (
    <div className={`cp-verse${reveal ? ' cp-verse-reveal' : ''}`}>
      <span className="ancient">「{text}」</span>
      {gloss && <span className="gloss">—— {gloss}</span>}
    </div>
  );
}
