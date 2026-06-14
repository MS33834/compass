import { chromium } from 'playwright';

const URL = 'https://badhope.github.io/MindMirror/';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Collect all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Collect all errors
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(`[PAGE_ERROR] ${err.message}\n${err.stack}`);
  });

  // Collect all failed requests
  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push(`[FAILED] ${req.url()}: ${req.failure()?.errorText}`);
  });

  console.log(`Navigating to ${URL}...`);
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log(`Navigation error: ${e.message}`);
  }

  // Wait a bit for any late errors
  await page.waitForTimeout(3000);

  console.log('\n=== Console Messages ===');
  for (const msg of consoleMessages) {
    console.log(msg);
  }

  console.log('\n=== Page Errors ===');
  for (const err of pageErrors) {
    console.log(err);
  }

  console.log('\n=== Failed Requests ===');
  for (const req of failedRequests) {
    console.log(req);
  }

  // Check the page state
  const title = await page.title();
  console.log(`\n=== Page Title: "${title}" ===`);

  const hasRoot = await page.$('#root');
  const rootContent = hasRoot ? await hasRoot.textContent() : 'N/A';
  console.log(`Root content: "${rootContent?.trim().substring(0, 200)}"`);

  const hasBoot = await page.$('#jx-boot');
  console.log(`Boot element exists: ${!!hasBoot}`);
  if (hasBoot) {
    const bootStyle = await hasBoot.getAttribute('style');
    console.log(`Boot style: ${bootStyle?.substring(0, 200)}`);
  }

  // Check for React mount
  const hasReactRoot = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.children.length : -1;
  });
  console.log(`Root children count: ${hasReactRoot}`);

  // Take a screenshot
  await page.screenshot({ path: 'test-deployed-screenshot.png', fullPage: true });
  console.log('\nScreenshot saved.');

  await browser.close();
}

main().catch(console.error);
