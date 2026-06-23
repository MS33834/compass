// 指南 · UI/UX 人工审查截图脚本
// 生成桌面端与移动端各关键页面截图，供检查界面与动画。

import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/compass/';
const OUT = '/workspace/compass/test-screenshots/ui-audit';
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

function buildBaseUrl() {
  const url = new URL(BASE);
  url.searchParams.set('lang', 'zh');
  return url.toString();
}

async function capture(viewport) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.name === 'mobile' ? 2 : 1,
  });
  const page = await context.newPage();
  await page.evaluate(() => localStorage.clear());

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  const shot = async name => {
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    return page.screenshot({
      path: `${OUT}/${viewport.name}-${name}.png`,
      fullPage: name !== 'way',
    });
  };

  // 1. 首页
  await page.goto(buildBaseUrl(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot('prologue');

  // 2. 选域页
  await page.click('[data-testid="btn-enter"]');
  await page.waitForTimeout(1200);
  await shot('path');

  // 3. 答题页
  await page.click('[data-testid="domain-card-east-literati"]');
  await page.click('[data-testid="btn-start"]');
  await page.waitForTimeout(1000);
  await shot('way');

  // 4. 结果页
  for (let i = 0; i < 48; i++) {
    await page.click('[data-opt-index="0"]');
    await page.waitForTimeout(30);
    if (i < 47) {
      await page.click('[data-testid="btn-next"]');
      await page.waitForTimeout(30);
    }
  }
  await page.click('[data-testid="btn-finish"]');
  await page.waitForSelector('[data-figure="primary"]', { timeout: 5000 });
  await page.waitForTimeout(1500);
  await shot('reflection');

  // 5. 人物详情页
  await page.click('[data-figure-portrait]');
  await page.waitForSelector('.cp-figure-overlay', { timeout: 5000 });
  await page.waitForTimeout(800);
  await shot('figure-detail');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 6. 分享卡
  await page.click('[data-testid="btn-share-card"]');
  await page.waitForSelector('.cp-share-card-overlay', { timeout: 5000 });
  await page.waitForSelector('.cp-share-card-canvas:not(.cp-share-card-canvas--loading)', {
    timeout: 5000,
  });
  await page.waitForTimeout(800);
  await shot('share-card');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 7. 暗色主题结果页
  await page.click('[data-testid="btn-theme"]');
  await page.waitForTimeout(600);
  await shot('reflection-dark');

  await browser.close();

  if (errors.length > 0) {
    console.log(`[${viewport.name}] 页面错误:`, errors);
  }
  return errors;
}

async function run() {
  let allErrors = [];
  for (const vp of viewports) {
    console.log(`\n开始 ${vp.name} 截图...`);
    const errs = await capture(vp);
    allErrors = allErrors.concat(errs);
  }
  console.log(`\n截图已保存至 ${OUT}`);
  if (allErrors.length > 0) {
    console.error('累计页面错误:', allErrors);
    process.exit(1);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
