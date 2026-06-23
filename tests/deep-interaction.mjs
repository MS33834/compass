// 指南 · 深度全交互测试 - 测试所有 5 个域 + 所有按钮 + 截图
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://127.0.0.1:4173/compass/';
const SCREENSHOT_DIR = '/workspace/compass/test-screenshots';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const DOMAINS = [
  { id: 'east-literati', name: '东方文人墨客', tab: 'east', cardIndex: 0 },
  { id: 'east-statesman', name: '东方治国名臣', tab: 'east', cardIndex: 1 },
  { id: 'east-scientist', name: '东方科技先驱', tab: 'east', cardIndex: 2 },
  { id: 'west-philosopher', name: '西方哲学大家', tab: 'west', cardIndex: 0 },
  { id: 'west-scientist', name: '西方科学巨擘', tab: 'west', cardIndex: 1 },
];

const consoleErrors = [];
const pageErrors = [];
const testLog = [];
const bugs = [];

function log(msg) {
  const line = `[${new Date().toISOString().slice(11, 23)}] ${msg}`;
  console.log(line);
  testLog.push(line);
}

function bug(msg) {
  log(`  🐛 BUG: ${msg}`);
  bugs.push(msg);
}

async function wait(ms) {
  await new Promise(r => setTimeout(r, ms));
}

async function attachListeners(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('Failed to load resource')) {
        consoleErrors.push(text);
      }
    }
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message + '\n' + (err.stack || ''));
  });
}

async function clearStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function answerAllQuestions(page) {
  // 使用 JS 直接点击选项和导航，绕过 Playwright 动画稳定性检查
  for (let i = 0; i < 55; i++) {
    // 先回到最前
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

    // 检查当前题是否已答
    const isSelected = await page.evaluate(() => {
      return !!document.querySelector('.cp-way-option--selected');
    });
    if (!isSelected) {
      // 用 JS 直接点击选项 0
      await page.evaluate(() => {
        const opt = document.querySelector('[data-testid="option-0"]');
        if (opt) opt.click();
      });
      await wait(150);
    }

    // 检查是否有 Next 按钮
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
      // 用 JS 直接点击 Next
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
        const finishDisabled = await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="btn-finish"]');
          return btn ? btn.disabled : true;
        });
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

async function testDomain(browser, domain) {
  log(`\n══════ 测试域: ${domain.name} (${domain.id}) ══════`);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await attachListeners(page);

  try {
    // 清空存储
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await wait(1500);
    await clearStorage(page);
    await page.reload({ waitUntil: 'networkidle' });
    await wait(1500);

    // Prologue → 截图后再点击 Begin
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-prologue.png` });
    const beginBtn = await page.$('[data-testid="btn-enter"]');
    if (!beginBtn) {
      bug(`${domain.id}: Prologue 无 Begin 按钮`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-prologue-fail.png` });
      await context.close();
      return;
    }
    await page.evaluate(() => document.querySelector('[data-testid="btn-enter"]')?.click());
    await wait(1800);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-path.png` });

    // Path → 选择东西方
    const tabs = await page.$$('[role="tab"]');
    if (domain.tab === 'west' && tabs.length >= 2) {
      await page.evaluate(idx => {
        const tabs = document.querySelectorAll('[role="tab"]');
        if (tabs[idx]) tabs[idx].click();
      }, 1);
      await wait(500);
    }

    // 选择域卡片
    const cards = await page.$$('[data-testid^="domain-card-"]');
    if (cards.length === 0) {
      bug(`${domain.id}: 无域卡片`);
      await context.close();
      return;
    }
    if (domain.cardIndex < cards.length) {
      await page.evaluate(idx => {
        const cards = document.querySelectorAll('[data-testid^="domain-card-"]');
        if (cards[idx]) cards[idx].click();
      }, domain.cardIndex);
      await wait(500);
    }

    // 点击开始
    const startBtn = await page.$('[data-testid="btn-start"]');
    if (!startBtn) {
      bug(`${domain.id}: Path 无 Start 按钮`);
      await context.close();
      return;
    }
    await page.evaluate(() => document.querySelector('[data-testid="btn-start"]')?.click());
    await wait(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-way-start.png` });

    // 检查答题页
    const prompt = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
    if (!prompt) {
      bug(`${domain.id}: 答题页无题目`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-way-fail.png` });
      await context.close();
      return;
    }
    log(`  首题: ${prompt.slice(0, 40)}`);

    // 检查选项数
    const options = await page.$$('[data-testid^="option-"]');
    if (options.length !== 6) {
      bug(`${domain.id}: 选项数=${options.length}（预期 6）`);
    }

    // 答完所有题
    const finished = await answerAllQuestions(page);
    if (!finished) {
      bug(`${domain.id}: 无法完成答题`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-way-stuck.png` });
      await context.close();
      return;
    }

    // 检查 Reflection 页
    await wait(1000);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${domain.id}-reflection.png`,
      fullPage: true,
    });

    const primaryName = await page.textContent('[data-figure="primary"]').catch(() => null);
    log(`  主匹配: ${primaryName?.replace(/\s+/g, ' ').trim()}`);
    if (!primaryName) {
      bug(`${domain.id}: Reflection 无主匹配`);
    }

    // 检查同道
    const alts = await page.$$('[data-figure="alternate"]');
    log(`  同道数: ${alts.length}`);
    if (alts.length !== 4) {
      bug(`${domain.id}: 同道数=${alts.length}（预期 4）`);
    }

    // 检查十二维卡片
    const traits = await page.$$('[data-trait-id]');
    log(`  十二维卡片数: ${traits.length}`);
    if (traits.length !== 12) {
      bug(`${domain.id}: 十二维卡片数=${traits.length}（预期 12）`);
    }

    // 测试 Copy Resume Link
    const copyBtn = await page.$('[data-testid="btn-copy-resume"]');
    if (copyBtn) {
      await page.evaluate(() => document.querySelector('[data-testid="btn-copy-resume"]')?.click());
      await wait(500);
      const toast = await page.$('[role="status"]');
      log(`  Copy Resume Toast: ${toast ? '出现' : '未出现'}`);
    }

    // 测试 Export JSON
    const exportBtn = await page.$('[data-testid="btn-export"]');
    if (exportBtn) {
      await page.evaluate(() => document.querySelector('[data-testid="btn-export"]')?.click());
      await wait(500);
      log('  Export JSON 已点击');
    }

    // 测试 Change Domain
    const changeBtn = await page.$('[data-testid="btn-change-domain"]');
    if (changeBtn) {
      await page.evaluate(() =>
        document.querySelector('[data-testid="btn-change-domain"]')?.click()
      );
      await wait(1000);
      const pathTitle = await page.textContent('#path-title').catch(() => null);
      log(`  Change Domain 后: ${pathTitle ? '回到选域页' : '未跳转'}`);
      if (!pathTitle) {
        bug(`${domain.id}: Change Domain 未跳转到选域页`);
      }
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-after-change.png` });
    }

    // 测试语言切换
    const langBtn = await page.$('[data-testid="btn-lang"]');
    if (langBtn) {
      const beforeText = await page.textContent('h1').catch(() => '');
      await page.evaluate(() => document.querySelector('[data-testid="btn-lang"]')?.click());
      await wait(500);
      const afterText = await page.textContent('h1').catch(() => '');
      log(`  语言切换: "${beforeText?.trim()}" → "${afterText?.trim()}"`);
      await page.evaluate(() => document.querySelector('[data-testid="btn-lang"]')?.click());
      await wait(300);
    }

    // 测试主题切换
    const themeBtn = await page.$('[data-testid="btn-theme"]');
    if (themeBtn) {
      await page.evaluate(() => document.querySelector('[data-testid="btn-theme"]')?.click());
      await wait(500);
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      log(`  主题切换: ${theme}`);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${domain.id}-dark-theme.png`,
        fullPage: true,
      });
      await page.evaluate(() => document.querySelector('[data-testid="btn-theme"]')?.click());
      await wait(300);
    }
  } catch (err) {
    bug(`${domain.id}: 测试异常 - ${err.message}`);
    try {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${domain.id}-error.png` });
    } catch {}
  }

  await context.close();
}

async function testResumeUrl(browser) {
  log('\n══════ 测试续答 URL ══════');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await attachListeners(page);

  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await wait(1500);
    await clearStorage(page);

    // 先答几题，获取 resume URL
    await page.evaluate(() => document.querySelector('[data-testid="btn-enter"]')?.click());
    await wait(1000);
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('[role="tab"]');
      if (tabs[0]) tabs[0].click();
    });
    await wait(300);
    const cards = await page.$$('[data-testid^="domain-card-"]');
    if (cards.length > 0) {
      await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid^="domain-card-"]');
        if (cards[0]) cards[0].click();
      });
      await wait(300);
      await page.evaluate(() => document.querySelector('[data-testid="btn-start"]')?.click());
      await wait(1000);

      // 答 5 题
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          const opt = document.querySelector('[data-testid="option-0"]');
          if (opt) opt.click();
        });
        await wait(150);
        await page.evaluate(() => {
          const next = document.querySelector('[data-testid="btn-next"]');
          if (next && !next.disabled) next.click();
        });
        await wait(100);
      }

      // 获取 resume URL
      const resumeUrl = await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('compass-v2') || '{}');
        const state = s.state || {};
        const exportShape = {
          v: 1,
          ts: Date.now(),
          domain: state.domain,
          currentIndex: state.currentIndex,
          answers: state.answers,
          locale: state.locale,
          theme: state.theme,
        };
        const json = JSON.stringify(exportShape);
        const b64 = btoa(unescape(encodeURIComponent(json)));
        return `${window.location.origin}${window.location.pathname}?resume=${b64}`;
      });

      log(`  Resume URL 长度: ${resumeUrl.length}`);

      // 新页面打开 resume URL
      const page2 = await context.newPage();
      await attachListeners(page2);
      await page2.goto(resumeUrl, { waitUntil: 'networkidle' });
      await wait(2000);

      const prompt = await page2.textContent('[data-testid="way-prompt"]').catch(() => null);
      log(`  续答后题目: ${prompt?.slice(0, 40) || '无（可能不在答题页）'}`);

      const ansCount = await page2.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('compass-v2') || '{}');
        return Object.keys(s.state?.answers || {}).length;
      });
      log(`  续答后答案数: ${ansCount}`);
      if (ansCount !== 5) {
        bug(`续答 URL: 答案数=${ansCount}（预期 5）`);
      }
      await page2.close();
    }
  } catch (err) {
    bug(`续答 URL 测试异常: ${err.message}`);
  }
  await context.close();
}

async function testResetFlow(browser) {
  log('\n══════ 测试重置流程 ══════');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await attachListeners(page);

  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await wait(1500);
    await clearStorage(page);

    // 快速完成一次测试
    await page.evaluate(() => document.querySelector('[data-testid="btn-enter"]')?.click());
    await wait(1000);
    const cards = await page.$$('[data-testid^="domain-card-"]');
    if (cards.length > 0) {
      await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid^="domain-card-"]');
        if (cards[0]) cards[0].click();
      });
      await wait(300);
      await page.evaluate(() => document.querySelector('[data-testid="btn-start"]')?.click());
      await wait(1000);
      await answerAllQuestions(page);
      await wait(1000);

      // 点击重置（需要处理 confirm 对话框）
      page.on('dialog', dialog => dialog.accept());
      const resetBtn = await page.$('[data-testid="btn-reset"]');
      if (resetBtn) {
        await page.evaluate(() => document.querySelector('[data-testid="btn-reset"]')?.click());
        await wait(1500);
        const prologueTitle = await page.textContent('#prologue-title').catch(() => null);
        log(`  重置后: ${prologueTitle ? '回到首页' : '未跳转'}`);
        if (!prologueTitle) {
          bug('重置后未回到 Prologue');
        }
      }
    }
  } catch (err) {
    bug(`重置流程测试异常: ${err.message}`);
  }
  await context.close();
}

async function testEdgeCases(browser) {
  log('\n══════ 测试边界情况 ══════');
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await attachListeners(page);

  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await wait(1500);
    await clearStorage(page);

    // 测试：直接访问答题页（无 domain）
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('compass-v2') || '{}');
      s.state = {
        phase: 'way',
        domain: null,
        answers: {},
        currentIndex: 0,
        locale: 'en',
        theme: 'light',
      };
      localStorage.setItem('compass-v2', JSON.stringify(s));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await wait(2000);
    const prompt = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
    log(`  无 domain 访问 way: ${prompt ? '仍显示答题页（可能 bug）' : '已重定向'}`);
    if (prompt) {
      bug('无 domain 仍显示答题页');
    }

    // 测试：无效 domain
    await clearStorage(page);
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('compass-v2') || '{}');
      s.state = {
        phase: 'way',
        domain: 'invalid-domain',
        answers: {},
        currentIndex: 0,
        locale: 'en',
        theme: 'light',
      };
      localStorage.setItem('compass-v2', JSON.stringify(s));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await wait(2000);
    const prompt2 = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
    log(`  无效 domain 访问 way: ${prompt2 ? '仍显示答题页（可能 bug）' : '已重定向'}`);

    // 测试：越界 currentIndex
    await clearStorage(page);
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('compass-v2') || '{}');
      s.state = {
        phase: 'way',
        domain: 'east-literati',
        answers: {},
        currentIndex: 999,
        locale: 'en',
        theme: 'light',
      };
      localStorage.setItem('compass-v2', JSON.stringify(s));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await wait(2000);
    const prompt3 = await page.textContent('[data-testid="way-prompt"]').catch(() => null);
    const pathTitle3 = await page.textContent('#path-title').catch(() => null);
    log(
      `  越界 currentIndex: ${prompt3 ? '仍显示答题页（bug）' : pathTitle3 ? '已重定向到选域页' : '无题目（bug）'}`
    );
    if (!prompt3 && !pathTitle3) {
      bug('越界 currentIndex 导致空白页');
    }
    if (prompt3) {
      bug('越界 currentIndex 仍显示答题页');
    }

    // 测试：Reflection 无 report
    await clearStorage(page);
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('compass-v2') || '{}');
      s.state = {
        phase: 'reflection',
        domain: 'east-literati',
        answers: {},
        currentIndex: 0,
        locale: 'en',
        theme: 'light',
      };
      localStorage.setItem('compass-v2', JSON.stringify(s));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await wait(2000);
    const prologueTitle = await page.textContent('#prologue-title').catch(() => null);
    log(
      `  无 report 访问 reflection: ${prologueTitle ? '已重定向到首页' : '未重定向（可能卡住）'}`
    );
    if (!prologueTitle) {
      bug('无 report 访问 reflection 未重定向');
    }
  } catch (err) {
    bug(`边界情况测试异常: ${err.message}`);
  }
  await context.close();
}

async function run() {
  log('=== 指南 · 深度全交互测试开始 ===');
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // 测试所有 5 个域
  for (const domain of DOMAINS) {
    await testDomain(browser, domain);
  }

  // 测试续答 URL
  await testResumeUrl(browser);

  // 测试重置流程
  await testResetFlow(browser);

  // 测试边界情况
  await testEdgeCases(browser);

  await browser.close();

  log('\n=== 测试总结 ===');
  log(`控制台错误数: ${consoleErrors.length}`);
  for (const e of consoleErrors) log(`  [CONSOLE ERROR] ${e}`);
  log(`页面错误数: ${pageErrors.length}`);
  for (const e of pageErrors) log(`  [PAGE ERROR] ${e}`);
  log(`发现 Bug 数: ${bugs.length}`);
  for (const b of bugs) log(`  🐛 ${b}`);

  console.log('\n=== BUG LIST ===');
  console.log(JSON.stringify(bugs, null, 2));
}

run().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
