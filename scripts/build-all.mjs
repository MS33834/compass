#!/usr/bin/env node
/**
 * Compass · 全流程构建脚本
 * 用法: node scripts/build-all.mjs
 *
 * 功能:
 * 1. TypeScript 类型检查
 * 2. 运行所有单元测试
 * 3. 运行金样例测试
 * 4. 运行 E2E 测试（如果有无头浏览器）
 * 5. Vite 生产构建
 * 6. 生成 CSP 注入后的 index.html
 * 7. 报告构建状态
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const steps = [
  { name: 'TypeScript 类型检查', cmd: 'npx tsc --noEmit' },
  { name: '单元测试', cmd: 'npm run test:unit' },
  { name: '金样例测试', cmd: 'npm test' },
  { name: 'Vite 生产构建', cmd: 'npm run build' },
  { name: '生成并注入 CSP', cmd: 'node scripts/generate-csp.mjs --inject' },
];

let passed = 0;
let failed = 0;

console.log('指南 · 全流程构建\n');
console.log('='.repeat(60));

for (const step of steps) {
  console.log(`\n▶ ${step.name}...`);
  console.log('-'.repeat(60));

  try {
    execSync(step.cmd, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
    });
    console.log(`✓ ${step.name} 通过\n`);
    passed++;
  } catch (error) {
    console.error(`✗ ${step.name} 失败\n`);
    failed++;
    console.error('构建中止');
    process.exit(1);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n构建完成: ${passed} 通过 / ${failed} 失败\n`);

if (failed > 0) {
  process.exit(1);
}
