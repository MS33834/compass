// 指南 · 金样例
// 5 个域 × 多组虚拟用户向量 → 期望主镜人物
// 用法：npm test

import { similarity } from '../src/domain/matching/scoring.ts';
import { FIGURES_EAST_LITERATI } from '../src/domain/figures/figures.east-literati.ts';
import { FIGURES_EAST_STATESMAN } from '../src/domain/figures/figures.east-statesman.ts';
import { FIGURES_EAST_SCIENTIST } from '../src/domain/figures/figures.east-scientist.ts';
import { FIGURES_WEST_PHILOSOPHER } from '../src/domain/figures/figures.west-philosopher.ts';
import { FIGURES_WEST_SCIENTIST } from '../src/domain/figures/figures.west-scientist.ts';

let pass = 0;
let fail = 0;

function close(a, b, eps = 1e-9) {
  return Math.abs(a - b) < eps;
}

function check(domain, name, user, expectedId, minScore = 0) {
  const figures =
    {
      'east-literati': FIGURES_EAST_LITERATI,
      'east-statesman': FIGURES_EAST_STATESMAN,
      'east-scientist': FIGURES_EAST_SCIENTIST,
      'west-philosopher': FIGURES_WEST_PHILOSOPHER,
      'west-scientist': FIGURES_WEST_SCIENTIST,
    }[domain] ?? [];

  const ranked = figures
    .map(f => ({
      id: f.id,
      name: f.name,
      score: similarity(user, f.vector),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const top = ranked[0];
  const ok = top.id === expectedId && top.score >= minScore;
  if (ok) {
    pass++;
    console.log(`  ✓ [${domain}] ${name} → ${top.name}（${(top.score * 100).toFixed(1)}%）`);
  } else {
    fail++;
    console.log(`  ✗ [${domain}] ${name}`);
    console.log(`     期望：${expectedId}`);
    console.log(`     实际：${top.id} (${top.name}) 相似度 ${top.score.toFixed(4)}`);
    console.log(
      `     Top 3：${ranked
        .slice(0, 3)
        .map(r => `${r.name}:${(r.score * 100).toFixed(1)}%`)
        .join('  ')}`
    );
  }
}

function perturb(vector, seed) {
  // 以固定伪随机扰动向量，制造「像某人但又不完全一样」的用户
  let s = seed;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return vector.map(v => {
    const delta = (next() - 0.5) * 0.08; // ±0.04
    return Math.max(0.05, Math.min(0.95, v + delta));
  });
}

console.log('指南 · 金样例 · 5 域\n');

// ── 东方文人墨客 ──
console.log('▸ 东方文人墨客');
check(
  'east-literati',
  '全极端外（思辨 0.95 革新 0.95 意志 0.95 时间 0.95）',
  [0.95, 0.4, 0.5, 0.95, 0.5, 0.5, 0.95, 0.9, 0.4, 0.95, 0.6, 0.4],
  'el-laozi'
);
check(
  'east-literati',
  '中段守成（思辨 0.55 行动 0.55 学识 0.95 处世 0.50）',
  [0.55, 0.5, 0.55, 0.45, 0.65, 0.5, 0.55, 0.95, 0.5, 0.85, 0.45, 0.55],
  'el-kongzi'
);
check(
  'east-literati',
  '极端内（情感 0.95 表达 0.95 思辨 0.35）',
  [0.35, 0.95, 0.3, 0.35, 0.4, 0.9, 0.45, 0.65, 0.45, 0.5, 0.3, 0.95],
  'el-liushao'
);
check(
  'east-literati',
  '革新极强（思辨 0.85 革新 0.95 行动 0.95 风险 0.85）',
  [0.85, 0.4, 0.95, 0.95, 0.7, 0.4, 0.9, 0.9, 0.3, 0.8, 0.85, 0.55],
  'el-wanganshi'
);
check(
  'east-literati',
  '逍遥（思辨 0.95 革新 0.95 群我 0.30 风险 0.75）',
  [0.95, 0.6, 0.45, 0.95, 0.3, 0.8, 0.65, 0.85, 0.85, 0.95, 0.75, 0.85],
  'el-zhuangzi'
);

// ── 东方治国能臣 ──
console.log('\n▸ 东方治国能臣');
check(
  'east-statesman',
  '变法果决（思辨 0.92 行动 0.95 革新 0.98 意志 0.95 风险 0.90）',
  perturb([0.92, 0.35, 0.95, 0.98, 0.7, 0.3, 0.95, 0.85, 0.3, 0.6, 0.9, 0.4], 1),
  'es-shangyang',
  0.85
);
check(
  'east-statesman',
  '精忠报国（行动 0.95 群我 0.85 意志 0.95 风险 0.85）',
  perturb([0.7, 0.7, 0.95, 0.6, 0.85, 0.5, 0.95, 0.6, 0.3, 0.7, 0.85, 0.4], 2),
  'es-yuefei',
  0.85
);
check(
  'east-statesman',
  '鞠躬尽瘁（思辨 0.88 学识 0.95 意志 0.90 群我 0.70）',
  perturb([0.88, 0.5, 0.75, 0.7, 0.7, 0.5, 0.9, 0.95, 0.5, 0.7, 0.65, 0.65], 3),
  'es-zhuge',
  0.85
);
check(
  'east-statesman',
  '扪虱谈天下（思辨 0.85 行动 0.90 革新 0.85 意志 0.90）',
  perturb([0.85, 0.5, 0.9, 0.85, 0.5, 0.35, 0.9, 0.85, 0.4, 0.6, 0.8, 0.45], 4),
  'es-wangmeng',
  0.85
);

// ── 东方科技先贤 ──
console.log('\n▸ 东方科技先贤');
check(
  'east-scientist',
  '地动仪与浑天（思辨 0.95 学识 0.98 革新 0.90 审美 0.55）',
  perturb([0.95, 0.45, 0.85, 0.9, 0.45, 0.55, 0.8, 0.98, 0.4, 0.65, 0.8, 0.65], 5),
  'esci-zhangheng',
  0.85
);
check(
  'east-scientist',
  '圆周率与大明历（思辨 0.95 学识 0.98 时间 0.70 意志 0.85）',
  perturb([0.95, 0.4, 0.8, 0.9, 0.4, 0.5, 0.85, 0.98, 0.35, 0.7, 0.8, 0.55], 6),
  'esci-zu',
  0.85
);
check(
  'east-scientist',
  '格物穷理（思辨 0.85 学识 0.98 审美 0.50 行动 0.75）',
  perturb([0.85, 0.5, 0.75, 0.8, 0.5, 0.5, 0.8, 0.98, 0.45, 0.7, 0.7, 0.65], 7),
  'esci-shen',
  0.85
);
check(
  'east-scientist',
  '本草济世（思辨 0.85 学识 0.98 意志 0.90 时间 0.80）',
  perturb([0.85, 0.5, 0.75, 0.85, 0.5, 0.5, 0.9, 0.98, 0.45, 0.8, 0.75, 0.6], 8),
  'esci-li',
  0.85
);

// ── 西方文哲巨擘 ──
console.log('\n▸ 西方文哲巨擘');
check(
  'west-philosopher',
  '产婆术（思辨 0.98 表达 0.95 意志 0.92 风险 0.85）',
  perturb([0.98, 0.45, 0.7, 0.92, 0.55, 0.4, 0.92, 0.85, 0.5, 0.75, 0.85, 0.95], 9),
  'wp-socrates',
  0.85
);
check(
  'west-philosopher',
  '理念论（思辨 0.96 审美 0.70 时间 0.85 表达 0.95）',
  perturb([0.96, 0.5, 0.6, 0.95, 0.5, 0.7, 0.85, 0.95, 0.5, 0.85, 0.7, 0.95], 10),
  'wp-plato',
  0.85
);
check(
  'west-philosopher',
  '我思故我在（思辨 0.92 学识 0.95 处世 0.40 表达 0.85）',
  perturb([0.92, 0.4, 0.6, 0.85, 0.5, 0.5, 0.8, 0.95, 0.4, 0.75, 0.65, 0.85], 11),
  'wp-descartes',
  0.85
);
check(
  'west-philosopher',
  '上帝已死（思辨 0.92 情感 0.85 革新 0.98 风险 0.95）',
  perturb([0.92, 0.85, 0.7, 0.98, 0.35, 0.9, 0.95, 0.9, 0.3, 0.7, 0.95, 0.98], 12),
  'wp-nietzsche',
  0.85
);

// ── 西方科学与思想 ──
console.log('\n▸ 西方科学与思想');
check(
  'west-scientist',
  '巨人肩上（思辨 0.98 学识 0.98 时间 0.85 革新 0.95）',
  perturb([0.98, 0.4, 0.6, 0.95, 0.4, 0.5, 0.9, 0.98, 0.4, 0.85, 0.65, 0.5], 13),
  'ws-newton',
  0.85
);
check(
  'west-scientist',
  '时空相对（思辨 0.98 审美 0.85 革新 0.98 表达 0.90）',
  perturb([0.98, 0.7, 0.55, 0.98, 0.55, 0.85, 0.85, 0.95, 0.35, 0.85, 0.85, 0.9], 14),
  'ws-einstein',
  0.85
);
check(
  'west-scientist',
  '实验之父（思辨 0.95 行动 0.85 革新 0.95 意志 0.92）',
  perturb([0.95, 0.5, 0.85, 0.95, 0.5, 0.55, 0.92, 0.95, 0.5, 0.7, 0.92, 0.7], 15),
  'ws-galileo',
  0.85
);
check(
  'west-scientist',
  '万物演化（思辨 0.85 审美 0.70 时间 0.85 学识 0.95）',
  perturb([0.85, 0.5, 0.7, 0.8, 0.4, 0.7, 0.8, 0.95, 0.4, 0.85, 0.7, 0.7], 16),
  'ws-darwin',
  0.85
);

console.log(`\n总计：${pass} 通过 / ${fail} 失败`);
if (fail > 0) {
  process.exit(1);
}
