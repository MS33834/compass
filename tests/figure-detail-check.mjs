// 指南 · 人物详情页快速验证
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173/compass/';
const OUT = '/workspace/compass/test-screenshots/figure-detail-debug.png';

async function wait(ms) {
  await new Promise(r => setTimeout(r, ms));
}

// 稳健答题循环：参考 deep-interaction.mjs 的 answerAllQuestions
// 使用 page.evaluate 直接操作 DOM，绕过 Playwright 动画稳定性检查
// 循环上限 55 略大于实际 48 题，用于吸收导航回退/越界保护的开销
async function answerAllQuestions(page) {
  for (let i = 0; i < 55; i++) {
    // 首轮先回到最前，确保从第 1 题开始
    if (i === 0) {
      for (let j = 0; j < 55; j++) {
        const prevDisabled = await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="btn-prev"]');
          return btn ? btn.disabled : true;
        });
        if (prevDisabled) break;
        await page.evaluate(() => document.querySelector('[data-testid="btn-prev"]')?.click());
        await wait(50);
      }
    }

    // 先确保当前题已选选项
    const isSelected = await page.evaluate(() => {
      return !!document.querySelector('.cp-way-option--selected');
    });
    if (!isSelected) {
      await page.evaluate(() => {
        const opt = document.querySelector('[data-testid="option-0"]');
        if (opt) opt.click();
      });
      await wait(150);
    }

    // 再点 next（若存在）
    const hasNext = await page.evaluate(() => !!document.querySelector('[data-testid="btn-next"]'));
    if (hasNext) {
      const nextDisabled = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="btn-next"]');
        return btn ? btn.disabled : true;
      });
      if (nextDisabled) {
        // 选项点击后可能还没生效，再等一下并重试
        await wait(200);
        await page.evaluate(() => {
          const opt = document.querySelector('[data-testid="option-0"]');
          if (opt) opt.click();
        });
        await wait(200);
      }
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="btn-next"]');
        if (btn && !btn.disabled) btn.click();
      });
      await wait(100);
    } else {
      // 到最后一题了
      const hasFinish = await page.evaluate(
        () => !!document.querySelector('[data-testid="btn-finish"]')
      );
      if (hasFinish) {
        // 确保最后一题已答
        const sel = await page.evaluate(() => !!document.querySelector('.cp-way-option--selected'));
        if (!sel) {
          await page.evaluate(() => {
            const opt = document.querySelector('[data-testid="option-0"]');
            if (opt) opt.click();
          });
          await wait(200);
        }
        // 检测 finish 按钮 disabled 状态，带合理重试（需答够 30 题才可用）
        let finishDisabled = true;
        for (let k = 0; k < 30; k++) {
          finishDisabled = await page.evaluate(() => {
            const btn = document.querySelector('[data-testid="btn-finish"]');
            return btn ? btn.disabled : true;
          });
          if (!finishDisabled) break;
          await wait(200);
        }
        if (!finishDisabled) {
          await page.evaluate(() => document.querySelector('[data-testid="btn-finish"]')?.click());
          await wait(2000);
          return true;
        }
      }
      break;
    }
  }
  return false;
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

await page.goto(BASE);
await page.click('[data-testid="btn-enter"]');
await page.waitForSelector('[data-testid="domain-card-east-literati"]');
await page.click('[data-testid="domain-card-east-literati"]');
await page.click('[data-testid="btn-start"]');

// 等待答题页就绪后再进入稳健答题循环
await page.waitForSelector('[data-testid="way-prompt"]', { timeout: 5000 });
const finished = await answerAllQuestions(page);
if (!finished) {
  throw new Error('答题循环未能完成（finish 按钮不可用或未到达最后一题）');
}

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
