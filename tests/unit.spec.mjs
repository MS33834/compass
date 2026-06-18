// 指南 · 单元测试 · 向量生成、匹配算法、置信度计算
// 用法：npm run test:unit

import { computeUserVector } from '../src/domain/matching/vector.ts';
import { similarity, breakTie } from '../src/domain/matching/scoring.ts';
import { confidence } from '../src/domain/matching/confidence.ts';
import { ITEMS_EAST_LITERATI } from '../src/domain/items/items.east-literati.ts';

let pass = 0;
let fail = 0;

function assert(condition, message) {
  if (condition) {
    pass++;
    console.log(`  ✓ ${message}`);
  } else {
    fail++;
    console.log(`  ✗ ${message}`);
  }
}

function close(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

console.log('指南 · 单元测试\n');

console.log('向量生成');

// 测试 1：全未答题（应使用全局均值）
{
  const answers = {};
  const vector = computeUserVector(answers, ITEMS_EAST_LITERATI);
  assert(vector.length === 12, '全未答题：向量长度为 12');
  assert(
    vector.every(v => v >= 0.05 && v <= 0.95),
    '全未答题：所有值在 [0.05, 0.95] 范围内'
  );
  const mean = vector.reduce((s, v) => s + v, 0) / 12;
  assert(mean >= 0.4 && mean <= 0.6, `全未答题：均值接近 0.5（实际 ${mean.toFixed(3)}）`);
}

// 测试 2：部分答题（只答第 1 题）
{
  const answers = { 'el-001': 0 }; // 选择第 1 题的第 1 个选项
  const vector = computeUserVector(answers, ITEMS_EAST_LITERATI);
  assert(vector.length === 12, '部分答题：向量长度为 12');
  assert(
    vector.every(v => v >= 0.05 && v <= 0.95),
    '部分答题：所有值在 [0.05, 0.95] 范围内'
  );
  const unansweredDims = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // 除第 0 维外
  const unansweredMean = unansweredDims.reduce((s, i) => s + vector[i], 0) / unansweredDims.length;
  assert(
    unansweredMean >= 0.45 && unansweredMean <= 0.55,
    `部分答题：未答题维度均值接近 0.5（实际 ${unansweredMean.toFixed(3)}）`
  );
}

// 测试 3：极端答案（全选极端选项）
{
  const answers = {};
  ITEMS_EAST_LITERATI.forEach(item => {
    answers[item.id] = 0;
  });
  const vector = computeUserVector(answers, ITEMS_EAST_LITERATI);
  assert(vector.length === 12, '极端答案：向量长度为 12');
  assert(
    vector.every(v => v >= 0.05 && v <= 0.95),
    '极端答案：所有值在 [0.05, 0.95] 范围内'
  );
}

// 测试 4：自适应 sigmoid 系数
{
  const answers1 = { 'el-001': 0, 'el-002': 0 }; // 2 题
  const answers2 = { 'el-001': 0, 'el-002': 0, 'el-003': 0, 'el-004': 0 }; // 4 题
  const vector1 = computeUserVector(answers1, ITEMS_EAST_LITERATI);
  const vector2 = computeUserVector(answers2, ITEMS_EAST_LITERATI);
  assert(vector1.length === 12 && vector2.length === 12, '自适应系数：不同覆盖度生成不同向量');
}

console.log('\n匹配算法');

// 测试 1：相同向量相似度应为 1
{
  const v = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  const sim = similarity(v, v);
  assert(close(sim, 1.0, 1e-6), `相同向量：相似度为 1（实际 ${sim.toFixed(6)}）`);
}

// 测试 2：零向量处理
{
  const v1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const v2 = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  const sim = similarity(v1, v2);
  assert(sim >= 0 && sim <= 1, `零向量处理：相似度在 [0, 1] 范围内（实际 ${sim.toFixed(6)}）`);
}

// 测试 3：极端向量相似度
{
  const v1 = [0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95];
  const v2 = [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05];
  const sim = similarity(v1, v2);
  assert(sim >= 0 && sim <= 1, `极端向量：相似度在 [0, 1] 范围内（实际 ${sim.toFixed(6)}）`);
}

// 测试 4：平局检测
{
  const user = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  const fig1 = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  const fig2 = [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6];
  const result = breakTie(user, fig1, fig2, 0.01);
  assert(result < 0, `平局检测：fig1 更接近用户（结果 ${result}）`);
}

// 测试 5：权重比例验证
{
  const v1 = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  const v2 = [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6];
  const sim = similarity(v1, v2);
  assert(sim >= 0.5 && sim <= 1, `权重比例：相似度合理（实际 ${sim.toFixed(6)}）`);
}

console.log('\n置信度计算');

// 测试 1：全未答题
{
  const answers = {};
  const conf = confidence(answers, ITEMS_EAST_LITERATI);
  assert(conf >= 0 && conf <= 1, `全未答题：置信度在 [0, 1] 范围内（实际 ${conf.toFixed(6)}）`);
  assert(conf < 0.3, `全未答题：置信度应较低（实际 ${conf.toFixed(6)}）`);
}

// 测试 2：部分答题（60%）
{
  const answers = {};
  const count = Math.ceil(ITEMS_EAST_LITERATI.length * 0.6);
  ITEMS_EAST_LITERATI.slice(0, count).forEach(item => {
    answers[item.id] = 0;
  });
  const conf = confidence(answers, ITEMS_EAST_LITERATI);
  assert(
    conf >= 0 && conf <= 1,
    `部分答题（60%）：置信度在 [0, 1] 范围内（实际 ${conf.toFixed(6)}）`
  );
  assert(conf >= 0.4 && conf <= 0.8, `部分答题（60%）：置信度中等（实际 ${conf.toFixed(6)}）`);
}

// 测试 3：全部答题
{
  const answers = {};
  ITEMS_EAST_LITERATI.forEach(item => {
    answers[item.id] = 0;
  });
  const conf = confidence(answers, ITEMS_EAST_LITERATI);
  assert(conf >= 0 && conf <= 1, `全部答题：置信度在 [0, 1] 范围内（实际 ${conf.toFixed(6)}）`);
  assert(conf >= 0.7, `全部答题：置信度应较高（实际 ${conf.toFixed(6)}）`);
}

// 测试 4：一致性检测（答案前后矛盾）
{
  const answers = {};
  ITEMS_EAST_LITERATI.slice(0, 8).forEach((item, idx) => {
    answers[item.id] = idx % 2 === 0 ? 0 : 1;
  });
  const conf = confidence(answers, ITEMS_EAST_LITERATI);
  assert(conf >= 0 && conf <= 1, `一致性检测：置信度在 [0, 1] 范围内（实际 ${conf.toFixed(6)}）`);
}

// 测试 5：决断度检测（答案是否明确）
{
  const answers = {};
  ITEMS_EAST_LITERATI.forEach(item => {
    answers[item.id] = 0;
  });
  const conf = confidence(answers, ITEMS_EAST_LITERATI);
  assert(conf >= 0 && conf <= 1, `决断度检测：置信度在 [0, 1] 范围内（实际 ${conf.toFixed(6)}）`);
}

console.log(`\n总计：${pass} 通过 / ${fail} 失败`);
if (fail > 0) {
  process.exit(1);
}
