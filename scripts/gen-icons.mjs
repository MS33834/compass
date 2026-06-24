// 指南 · PWA 图标生成
//
// 用 Playwright 将 favicon.svg 渲染为 192/512 PNG 图标，
// 并生成 maskable 版本（safe zone 内缩，背景填满）。
//
// 用法：node scripts/gen-icons.mjs
// 前置：需先 npm install playwright 并 npx playwright install chromium

import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '../public');
const SVG_PATH = resolve(PUBLIC_DIR, 'favicon.svg');

const SIZES = [192, 512];

// maskable 版本：背景填满整个画布，字符内缩到 safe zone（约 80%）
function maskableSvg(charSvg) {
  // 读取原 SVG 中的 text 内容
  const match = charSvg.match(/<text[^>]*>([^<]*)<\/text>/);
  const ch = match ? match[1] : '指';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#a8322e"/>
  <text x="256" y="340" text-anchor="middle" font-family="'霞鹜文楷','LXGW WenKai','STKaiti',serif" font-size="280" fill="#f5efe0">${ch}</text>
</svg>`;
}

async function renderSvgToPng(page, svgContent, size, outPath) {
  const dataUri = 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');
  await page.setContent(
    `<!doctype html><html><body style="margin:0;padding:0;"><img src="${dataUri}" width="${size}" height="${size}"/></body></html>`
  );
  await page.waitForLoadState('networkidle');
  const img = await page.$('img');
  await img.screenshot({ path: outPath, omitBackground: false });
}

async function main() {
  const svg = await readFile(SVG_PATH, 'utf-8');
  const maskSvg = maskableSvg(svg);

  await mkdir(resolve(PUBLIC_DIR, 'icons'), { recursive: true });

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1,
  });

  for (const size of SIZES) {
    // any purpose
    const anyPath = resolve(PUBLIC_DIR, `icons/icon-${size}.png`);
    await renderSvgToPng(page, svg, size, anyPath);
    console.log(`✓ 生成 ${size}x${size} (any): ${anyPath}`);

    // maskable purpose
    const maskPath = resolve(PUBLIC_DIR, `icons/maskable-${size}.png`);
    await renderSvgToPng(page, maskSvg, size, maskPath);
    console.log(`✓ 生成 ${size}x${size} (maskable): ${maskPath}`);
  }

  await browser.close();
  console.log('\n图标生成完成。请更新 manifest.webmanifest 引用这些图标。');
}

main().catch(err => {
  console.error('图标生成失败:', err);
  process.exit(1);
});
