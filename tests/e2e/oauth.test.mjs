/**
 * End-to-end test: GitHub OAuth registration flow in a real browser.
 *
 * Boots a Playwright Chromium, drives the SPA on the dev server, clicks
 * the "GitHub" button on the Register page, fills in the dev consent
 * shim, and verifies the user lands back in the SPA logged in. We
 * exercise the dev-mode shim (MINDMIRROR_DEV_OAUTH=true) so the test
 * doesn't need a real GitHub OAuth App.
 *
 * Run with: node tests/e2e/oauth.test.mjs
 */
import { chromium } from 'playwright';

const SPA_URL = process.env.SPA_URL || 'http://localhost:5173/MindMirror/';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api/v1';

const log = (...a) => console.log('[e2e]', ...a);

async function run() {
  log('booting chromium');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'zh-CN',
  });
  const page = await ctx.newPage();

  // Surface page-side console errors in the test output — way easier
  // to debug than a blank screenshot.
  page.on('console', msg => {
    if (msg.type() === 'error') log('  browser-console-error:', msg.text());
  });
  page.on('pageerror', err => log('  browser-pageerror:', err.message));
  page.on('request', r => log('  → req:', r.method(), r.url()));
  page.on('response', r => log('  ← res:', r.status(), r.url()));

  log('opening', SPA_URL);
  await page.goto(SPA_URL, { waitUntil: 'networkidle' });

  log('clicking register link');
  // The Home page exposes a "免费开始" / "开始" CTA; the cleanest
  // path is to navigate directly to /register.
  await page.goto(SPA_URL + 'register', { waitUntil: 'networkidle' });

  log('clicking the GitHub OAuth button');
  // Find the GitHub button. We use a partial match because the
  // button label is localized ("使用 GitHub 继续" in zh, "Continue
  // with GitHub" in en). `getByRole('button')` + name substring
  // works for both.
  const ghBtn = page.getByRole('button', { name: /github/i });
  await ghBtn.waitFor({ state: 'visible', timeout: 10000 });
  await ghBtn.click();

  // The SPA bounces the browser to either:
  //   - the dev shim (no real GitHub creds), or
  //   - github.com (real flow, would fail without creds).
  // We just wait for the URL to leave the SPA.
  log('waiting for navigation away from SPA');
  // Snapshot all responses so we can see what /authorize actually did.
  const responses = [];
  page.on('response', r => responses.push(`${r.status()} ${r.url()}`));
  try {
    await page.waitForURL(url => !url.toString().startsWith(SPA_URL), { timeout: 10000 });
  } catch (e) {
    log('  responses seen:');
    for (const r of responses.slice(-15)) log('    ', r);
    throw e;
  }
  log('  landed on', page.url());

  // dev-shim path: the shim is a static form on our own backend.
  if (page.url().includes('/api/v1/auth/oauth/github/dev/authorize')) {
    log('dev shim detected — filling the consent form');
    await page.locator('input#login').fill('playwright-octocat');
    await Promise.all([
      page.waitForURL(/auth\/callback/, { timeout: 10000 }),
      page.locator('button.primary[type=submit]').click(),
    ]);
  } else {
    throw new Error(
      `Expected the dev shim URL but got: ${page.url()}. ` +
        'Set MINDMIRROR_DEV_OAUTH=true on the backend and restart it.'
    );
  }
  log('  back on', page.url());

  // We're now on /auth/callback; the SPA is calling
  // /auth/oauth/github/callback and storing the token. Give it a
  // moment to redirect to "/".
  log('waiting for SPA to redirect to /');
  await page.waitForURL(url => new URL(url).pathname === '/MindMirror/', {
    timeout: 10000,
  });
  log('  landed on', page.url());

  // Check localStorage to confirm the JWT was persisted.
  const stored = await page.evaluate(() => ({
    token: localStorage.getItem('mindmirror_token'),
    user: localStorage.getItem('mindmirror_user'),
  }));
  if (!stored.token) throw new Error('No JWT in localStorage after OAuth');
  log('JWT in localStorage: ', stored.token.slice(0, 24) + '...');
  const user = JSON.parse(stored.user || '{}');
  if (!user.email || !user.email.includes('playwright-octocat')) {
    throw new Error(`Unexpected user in localStorage: ${JSON.stringify(user)}`);
  }
  log('user from localStorage: ', user.email, '|', user.username);

  // The navbar should now show the user as logged in. We look for the
  // logout / 个人中心 / dashboard link which only renders when
  // authenticated.
  log('looking for logged-in UI markers');
  const dashLink = page.getByRole('link', { name: /个人中心|dashboard/i });
  await dashLink.first().waitFor({ state: 'visible', timeout: 8000 });
  log('  ✓ logged-in marker visible');

  // Visit a protected page (History) and verify the SPA lets us in
  // (i.e. doesn't bounce us to /login).
  log('navigating to a protected page (/history)');
  await page.goto(SPA_URL + 'history', { waitUntil: 'networkidle' });
  const finalUrl = page.url();
  if (finalUrl.includes('/login')) {
    throw new Error(`Protected page bounced us back to login: ${finalUrl}`);
  }
  log('  ✓ protected page accessible at', finalUrl);

  // Use the JWT directly to call the backend, just to confirm it's
  // a real working token.
  log('calling backend /auth/me with the JWT');
  const me = await page.evaluate(async ([url, token]) => {
    const r = await fetch(url + '/auth/me', {
      headers: { Authorization: 'Bearer ' + token },
    });
    return { status: r.status, body: await r.json() };
  }, [BACKEND_URL, stored.token]);
  if (me.status !== 200) {
    throw new Error(`/auth/me returned HTTP ${me.status}: ${JSON.stringify(me.body)}`);
  }
  log('  ✓ /auth/me → 200, email =', me.body.email);

  await browser.close();
  log('ALL CHECKS PASSED');
}

run().catch(err => {
  console.error('[e2e] FAILED:', err);
  process.exit(1);
});
