// 镜心 · 金样例
// 5 个虚拟用户向量 → 期望主镜人物
// 跑法：npm test

import { similarity } from '../src/domain/matching/scoring.ts';
import { FIGURES_EAST_LITERATI } from '../src/domain/figures/figures.east-literati.ts';

let pass = 0;
let fail = 0;

function close(a, b, eps = 1e-9) {
  return Math.abs(a - b) < eps;
}

function check(name, user, expectedId, minScore = 0) {
  const ranked = FIGURES_EAST_LITERATI.map(f => ({
    id: f.id,
    name: f.name,
    score: similarity(user, f.vector),
  })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const top = ranked[0];
  const ok = top.id === expectedId && top.score >= minScore;
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}  →  ${top.name}（${(top.score * 100).toFixed(1)}%）`);
  } else {
    fail++;
    console.log(`  ✗ ${name}`);
    console.log(`     期望：${expectedId}`);
    console.log(`     实际：${top.id} (${top.name})  相似度 ${top.score.toFixed(4)}`);
    console.log(
      `     Top 3：${ranked
        .slice(0, 3)
        .map(r => `${r.name}:${(r.score * 100).toFixed(1)}%`)
        .join('  ')}`
    );
  }
}

console.log('镜心 · 金样例 · 5 问\n');

// 1. 全极端外 → 老子
check(
  '全极端外（思辨 0.95 革新 0.95 意志 0.95 时间 0.95）',
  [0.95, 0.4, 0.5, 0.95, 0.5, 0.5, 0.95, 0.9, 0.4, 0.95, 0.6, 0.4],
  'el-laozi'
);

// 2. 中段守成 → 孔子
check(
  '中段守成（思辨 0.55 行动 0.55 学识 0.95 处世 0.50）',
  [0.55, 0.5, 0.55, 0.45, 0.65, 0.5, 0.55, 0.95, 0.5, 0.85, 0.45, 0.55],
  'el-kongzi'
);

// 3. 极端内（情深、忧民、表达） → 李清照
check(
  '极端内（情感 0.95 表达 0.95 思辨 0.35）',
  [0.35, 0.95, 0.3, 0.35, 0.4, 0.9, 0.45, 0.65, 0.45, 0.5, 0.3, 0.95],
  'el-liushao'
);

// 4. 革新极强 → 王安石
check(
  '革新极强（思辨 0.85 革新 0.95 行动 0.95 风险 0.85）',
  [0.85, 0.4, 0.95, 0.95, 0.7, 0.4, 0.9, 0.9, 0.3, 0.8, 0.85, 0.55],
  'el-wanganshi'
);

// 5. 逍遥游于物之初 → 庄子
check(
  '逍遥（思辨 0.95 革新 0.95 群我 0.30 风险 0.75）',
  [0.95, 0.6, 0.45, 0.95, 0.3, 0.8, 0.65, 0.85, 0.85, 0.95, 0.75, 0.85],
  'el-zhuangzi'
);

console.log(`\n总计：${pass} 通过 / ${fail} 失败`);
if (fail > 0) {
  process.exit(1);
}
