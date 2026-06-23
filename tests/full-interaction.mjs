// 指南 · 全交互自动化测试
// 模拟人类点击所有页面、所有按钮，收集控制台错误与中间结果
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173/';
const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'desktop-1280', width: 1280, height: 800 },
];

const consoleErrors = [];
const pageErrors = [];
const testLog = [];

function log(msg) {
  const line = `[${new Date().toISOString().slice(11, 23)}] ${msg}`;
  console.log(line);
  testLog.push(line);
}

async function wait(ms) {
  await new Promise(r => setTimeout(r, ms));
}

async function attachListeners(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // 忽略 favicon 等无关错误
      if (!text.includes('favicon') && !text.includes('Failed to load resource')) {
        consoleErrors.push(text);
      }
    }
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message + '\n' + (err.stack || ''));
  });
}

async function testPrologue(page) {
  log('── Prologue 页面测试 ──');
  await page.goto(BASE);
  await wait(1500);

  // 检查启动屏是否消失
  const boot = await page.$('#cp-boot');
  if (boot) {
    const visible = await boot.isVisible();
    log(`启动屏可见: ${visible}`);
  }

  // 检查主标题
  const h1 = await page.textContent('h1').catch(() => null);
  log(`主标题: ${h1}`);

  // 查找所有按钮
  const buttons = await page.$$('button');
  log(`Prologue 按钮数量: ${buttons.length}`);
  for (let i = 0; i < buttons.length; i++) {
    const text = (await buttons[i].textContent())?.trim();
    const testid = await buttons[i].getAttribute('data-testid');
    log(`  按钮[${i}]: "${text}" testid=${testid}`);
  }

  // 测试语言切换（TopBar）
  const langBtn = await page.$(
    '[data-testid="btn-lang"], button:has-text("中"), button:has-text("EN")'
  );
  if (langBtn) {
    await langBtn.click();
    await wait(500);
    const h1After = await page.textContent('h1').catch(() => null);
    log(`语言切换后标题: ${h1After}`);
    // 切回来
    await langBtn.click();
    await wait(500);
  }

  // 测试主题切换
  const themeBtn = await page.$(
    '[data-testid="btn-theme"], button:has-text("☾"), button:has-text("☼")'
  );
  if (themeBtn) {
    await themeBtn.click();
    await wait(500);
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    log(`主题切换后: ${theme}`);
    await themeBtn.click();
    await wait(500);
  }

  // 点击开始按钮
  const startBtn = await page.$(
    '[data-testid="btn-start"], button:has-text("Begin"), button:has-text("始"), button:has-text("入"), button:has-text("启")'
  );
  if (startBtn) {
    await startBtn.click();
    await wait(1000);
    log('已点击开始按钮');
  } else {
    // 尝试任何主按钮
    const primary = await page.$('button.cp-primary, .cp-cta button, main button:last-of-type');
    if (primary) {
      await primary.click();
      await wait(1000);
      log('已点击主按钮');
    }
  }
}

async function testPath(page) {
  log('── Path 选域页面测试 ──');
  await wait(1000);

  // 检查东西方切换
  const tabs = await page.$$('[role="tab"]');
  log(`东西方 Tab 数量: ${tabs.length}`);
  for (const tab of tabs) {
    const text = (await tab.textContent())?.trim();
    log(`  Tab: "${text}"`);
  }

  // 点击西方
  if (tabs.length >= 2) {
    await tabs[1].click();
    await wait(500);
    log('已切换到西方');
  }

  // 检查域卡片
  const cards = await page.$$('[data-testid^="domain-card-"]');
  log(`西方域卡片数量: ${cards.length}`);
  for (const card of cards) {
    const testid = await card.getAttribute('data-testid');
    const ready = await card.getAttribute('data-ready');
    log(`  卡片: ${testid} ready=${ready}`);
  }

  // 切回东方
  if (tabs.length >= 1) {
    await tabs[0].click();
    await wait(500);
    log('已切换回东方');
  }

  const eastCards = await page.$$('[data-testid^="domain-card-"]');
  log(`东方域卡片数量: ${eastCards.length}`);

  // 选择第一个域（east-literati）
  if (eastCards.length > 0) {
    await eastCards[0].click();
    await wait(500);
    log('已选择东方文人墨客');

    // 点击开始
    const startBtn = await page.$('[data-testid="btn-start"]');
    if (startBtn) {
      await startBtn.click();
      await wait(1000);
      log('已进入答题页');
    }
  }
}

async function testWay(page) {
  log('── Way 答题页测试 ──');
  await wait(1000);

  // 检查进度文本
  const progressText = await page
    .textContent('[data-testid="way-progress-text"]')
    .catch(() => null);
  log(`进度文本: ${progressText?.replace(/\s+/g, ' ').trim()}`);

  // 检查题目
  const prompt = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
  log(`当前题目: ${prompt?.slice(0, 50)}`);

  // 检查选项
  const options = await page.$$('[data-testid^="option-"]');
  log(`选项数量: ${options.length}`);

  // 测试主题切换
  const themeBtn = await page.$('[data-testid="way-btn-theme"]');
  if (themeBtn) {
    await themeBtn.click();
    await wait(300);
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    log(`答题页主题切换: ${theme}`);
    await themeBtn.click();
    await wait(300);
  }

  // 测试语言切换
  const langBtn = await page.$('[data-testid="way-btn-lang"]');
  if (langBtn) {
    await langBtn.click();
    await wait(300);
    const promptAfter = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
    log(`语言切换后题目: ${promptAfter?.slice(0, 50)}`);
    await langBtn.click();
    await wait(300);
  }

  // 测试键盘导航：按 1 选择第一个选项
  await page.keyboard.press('1');
  await wait(300);
  const selected = await page.$('.cp-way-option--selected');
  log(`键盘按 1 选择: ${selected ? '成功' : '失败'}`);

  // 测试下一题
  const nextBtn = await page.$('[data-testid="btn-next"]');
  if (nextBtn) {
    await nextBtn.click();
    await wait(500);
    const prompt2 = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
    log(`第 2 题: ${prompt2?.slice(0, 50)}`);
  }

  // 测试上一题
  const prevBtn = await page.$('[data-testid="btn-prev"]');
  if (prevBtn) {
    await prevBtn.click();
    await wait(500);
    const promptBack = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
    log(`返回第 1 题: ${promptBack?.slice(0, 50)}`);
  }

  // 快速答完 30 题（每题选选项 0）
  log('开始快速答题（30题，每题选 A）...');
  for (let i = 0; i < 48; i++) {
    const opts = await page.$$('[data-testid^="option-"]');
    if (opts.length > 0) {
      await opts[0].click();
      await wait(80);
    }
    const next = await page.$('[data-testid="btn-next"]');
    if (next) {
      const disabled = await next.getAttribute('disabled');
      if (disabled) {
        // 可能需要先答题
        continue;
      }
      await next.click();
      await wait(80);
    } else {
      // 可能到了最后一题
      break;
    }
  }

  // 检查是否出现完成按钮
  const finishBtn = await page.$('[data-testid="btn-finish"]');
  if (finishBtn) {
    const disabled = await finishBtn.getAttribute('disabled');
    log(`完成按钮存在, disabled=${disabled}`);

    // 检查已答题数
    const progress = await page.textContent('[data-testid="way-progress-text"]').catch(() => null);
    log(`完成前进度: ${progress?.replace(/\s+/g, ' ').trim()}`);

    if (disabled) {
      // 还没答够 30 题，继续答
      log('未达 30 题，继续答题...');
      // 回到开头逐题检查
      for (let i = 0; i < 48; i++) {
        const prev = await page.$('[data-testid="btn-prev"]');
        if (prev) {
          const prevDisabled = await prev.getAttribute('disabled');
          if (prevDisabled) break;
          await prev.click();
          await wait(50);
        }
      }
      // 从头开始逐题答
      for (let i = 0; i < 48; i++) {
        const opts = await page.$$('[data-testid^="option-"]');
        const selectedNow = await page.$('.cp-way-option--selected');
        if (!selectedNow && opts.length > 0) {
          await opts[0].click();
          await wait(50);
        }
        const next = await page.$('[data-testid="btn-next"]');
        if (next) {
          await next.click();
          await wait(50);
        } else {
          break;
        }
      }
    }

    // 尝试点击完成
    const finishBtn2 = await page.$('[data-testid="btn-finish"]');
    if (finishBtn2) {
      const disabled2 = await finishBtn2.getAttribute('disabled');
      log(`再次检查完成按钮 disabled=${disabled2}`);
      if (!disabled2) {
        await finishBtn2.click();
        await wait(2000);
        log('已点击完成按钮');
      } else {
        // 强制用 JS 完成
        log('完成按钮仍禁用，检查答题状态...');
        const ansCount = await page.evaluate(() => {
          const s = JSON.parse(localStorage.getItem('compass-v2') || '{}');
          return Object.keys(s.state?.answers || {}).length;
        });
        log(`localStorage 中答案数: ${ansCount}`);
      }
    }
  } else {
    log('未找到完成按钮');
    // 检查当前状态
    const nav = await page.$$('[data-testid="way-nav"] button');
    log(`导航按钮数量: ${nav.length}`);
  }
}

async function testReflection(page) {
  log('── Reflection 映照页测试 ──');
  await wait(2000);

  // 检查是否到达映照页
  const url = page.url();
  log(`当前 URL: ${url}`);

  // 检查主匹配人物
  const primaryName = await page
    .textContent('h1, h2, .cp-primary-name, [data-testid="primary-name"]')
    .catch(() => null);
  log(`主匹配: ${primaryName?.replace(/\s+/g, ' ').trim()}`);

  // 列出所有按钮
  const buttons = await page.$$('button');
  log(`Reflection 按钮数量: ${buttons.length}`);
  for (let i = 0; i < Math.min(buttons.length, 15); i++) {
    const text = (await buttons[i].textContent())?.trim().slice(0, 30);
    const testid = await buttons[i].getAttribute('data-testid');
    log(`  按钮[${i}]: "${text}" testid=${testid}`);
  }

  // 测试分享功能
  const shareBtn = await page.$(
    '[data-testid="btn-share"], button:has-text("Share"), button:has-text("分享"), button:has-text("享")'
  );
  if (shareBtn) {
    await shareBtn.click();
    await wait(1000);
    log('已点击分享按钮');
    // 检查是否出现对话框
    const dialog = await page.$('[role="dialog"], .cp-dialog, .cp-modal');
    log(`分享对话框: ${dialog ? '出现' : '未出现'}`);
    // 关闭
    const closeBtn = await page.$(
      'button:has-text("Close"), button:has-text("关"), [aria-label="Close"]'
    );
    if (closeBtn) {
      await closeBtn.click();
      await wait(300);
    }
  }

  // 测试重新开始
  const restartBtn = await page.$(
    '[data-testid="btn-restart"], button:has-text("Restart"), button:has-text("重新"), button:has-text("再"), button:has-text("重")'
  );
  if (restartBtn) {
    log('找到重新开始按钮，暂不点击（避免破坏状态）');
  }
}

async function run() {
  log('=== 指南 · 全交互自动化测试开始 ===');

  for (const vp of VIEWPORTS) {
    log(`\n=== 视口: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const browser = await chromium.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    await attachListeners(page);

    try {
      await testPrologue(page);
      await testPath(page);
      await testWay(page);
      await testReflection(page);
    } catch (err) {
      log(`测试异常: ${err.message}`);
      pageErrors.push(`测试异常: ${err.message}`);
    }

    await browser.close();
  }

  log('\n=== 测试总结 ===');
  log(`控制台错误数: ${consoleErrors.length}`);
  for (const e of consoleErrors) log(`  [CONSOLE ERROR] ${e}`);
  log(`页面错误数: ${pageErrors.length}`);
  for (const e of pageErrors) log(`  [PAGE ERROR] ${e}`);

  // 输出 JSON 报告
  const report = {
    timestamp: new Date().toISOString(),
    consoleErrors,
    pageErrors,
    log: testLog,
  };
  console.log('\n=== JSON REPORT ===');
  console.log(JSON.stringify(report, null, 2));
}

run().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
