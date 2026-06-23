// 指南 · 人物详情页快速验证
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173/compass/';
const OUT = '/workspace/compass/test-screenshots/figure-detail-debug.png';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

await page.goto(BASE);
await page.click('[data-testid="btn-enter"]');
await page.waitForSelector('[data-testid="domain-card-east-literati"]');
await page.click('[data-testid="domain-card-east-literati"]');
await page.click('[data-testid="btn-start"]');

for (let i = 0; i < 48; i++) {
  await page.click('[data-opt-index="0"]');
  await page.waitForTimeout(50);
  if (i < 47) {
    await page.click('[data-testid="btn-next"]');
    await page.waitForTimeout(50);
  }
}
await page.waitForTimeout(200);
await page.click('[data-testid="btn-finish"]');

await page.waitForSelector('[data-figure="primary"]');
await page.waitForTimeout(1200);

await page.click('[data-figure-portrait]');
await page.waitForSelector('.cp-figure-overlay', { timeout: 5000 });
await page.waitForTimeout(1000);

const title = await page.textContent('#figure-detail-title');
console.log('详情页标题:', title?.trim());

await page.screenshot({ path: OUT, fullPage: false });
console.log('详情页截图已保存:', OUT);

await browser.close();
