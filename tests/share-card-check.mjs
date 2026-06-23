// 指南 · 分享卡功能测试
// 模拟用户答完题后点击分享卡按钮，验证弹窗与 Canvas 渲染。

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/compass/';
const SCREENSHOT_DIR = '/workspace/compass/test-screenshots';
mkdirSync(SCREENSHOT_DIR, { recursive: true });
const OUT = `${SCREENSHOT_DIR}/share-card.png`;

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(BASE);
  await page.click('[data-testid="btn-enter"]');
  await page.click('[data-testid="domain-card-east-literati"]');
  await page.click('[data-testid="btn-start"]');

  // 快速答 48 题
  for (let i = 0; i < 48; i++) {
    await page.click('[data-opt-index="0"]');
    await page.waitForTimeout(50);
    if (i < 47) {
      await page.click('[data-testid="btn-next"]');
      await page.waitForTimeout(50);
    }
  }
  await page.click('[data-testid="btn-finish"]');

  await page.waitForSelector('[data-figure="primary"]');
  await page.waitForTimeout(1200);

  // 打开分享卡
  await page.click('[data-testid="btn-share-card"]');
  await page.waitForSelector('.cp-share-card-overlay', { timeout: 5000 });
  await page.waitForSelector('.cp-share-card-canvas:not(.cp-share-card-canvas--loading)', {
    timeout: 5000,
  });
  await page.waitForTimeout(800);

  const title = await page.textContent('#share-card-title');
  console.log('分享卡标题:', title?.trim());

  // 检查 Canvas 是否有内容（toDataURL 不为空透明图）
  const canvasData = await page.evaluate(() => {
    const canvas = document.querySelector('.cp-share-card-canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let nonBlank = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) nonBlank++;
    }
    return { width: canvas.width, height: canvas.height, nonBlank };
  });
  console.log('Canvas 尺寸与像素:', canvasData);

  if (!canvasData || canvasData.nonBlank < 100) {
    throw new Error('分享卡 Canvas 渲染异常');
  }

  await page.screenshot({ path: OUT, fullPage: false });
  console.log('截图已保存:', OUT);

  if (errors.length > 0) {
    console.error('页面错误:', errors);
    throw new Error(`分享卡测试出现 ${errors.length} 个页面错误`);
  }

  await browser.close();
  console.log('分享卡测试通过');
}

run().catch(e => {
  console.error('测试失败:', e);
  process.exit(1);
});
