#!/usr/bin/env node
/**
 * Compass · 生成 CSP (Content-Security-Policy)
 * 用法: node scripts/generate-csp.mjs [--inject]
 *
 * 功能:
 * 1. 生成 CSP 策略字符串
 * 2. 可选: 注入到 index.html 中
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const INDEX_HTML = resolve(ROOT, 'index.html');

// CSP 策略配置
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'"], // 不允许 unsafe-inline，Vite 会生成 nonce 或 hash
  'style-src': ["'self'", "'unsafe-inline'"], // CSS-in-JS 可能需要 inline style
  'img-src': ["'self'", 'data:'], // 允许 data: URI (base64 图片)
  'font-src': ["'self'"],
  'connect-src': ["'self'"], // 不允许连接到外部 API
  'media-src': ["'self'"],
  'object-src': ["'none'"], // 不允许 object/embed/applet
  'base-uri': ["'self'"], // 限制 base 标签
  'form-action': ["'none'"], // 不允许表单提交（纯前端应用）
  'frame-ancestors': ["'none'"], // 不允许在 iframe 中嵌入
  'upgrade-insecure-requests': [], // 自动升级 HTTP 到 HTTPS
};

/**
 * 生成 CSP 策略字符串
 */
function generateCSPString() {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * 注入 CSP 到 index.html
 */
function injectCSPToHTML(cspString) {
  const html = readFileSync(INDEX_HTML, 'utf-8');

  // 检查是否已有 CSP meta 标签
  const cspMetaRegex =
    /<meta\s+http-equiv\s*=\s*["']Content-Security-Policy["']\s*content\s*=\s*["'][^"']*["']\s*\/?>/i;

  const newCSPMeta = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;

  if (cspMetaRegex.test(html)) {
    // 替换现有的 CSP meta 标签
    const updatedHTML = html.replace(cspMetaRegex, newCSPMeta);
    writeFileSync(INDEX_HTML, updatedHTML, 'utf-8');
    console.log('✓ 已更新 index.html 中的 CSP meta 标签');
  } else {
    // 在 <head> 标签后插入 CSP meta 标签
    const headRegex = /<head[^>]*>/i;
    if (headRegex.test(html)) {
      const updatedHTML = html.replace(headRegex, (match) => `${match}\n    ${newCSPMeta}`);
      writeFileSync(INDEX_HTML, updatedHTML, 'utf-8');
      console.log('✓ 已向 index.html 注入 CSP meta 标签');
    } else {
      console.error('✗ 无法找到 <head> 标签，注入失败');
      process.exit(1);
    }
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const shouldInject = args.includes('--inject');

  console.log('指南 · 生成 CSP (Content-Security-Policy)\n');

  const cspString = generateCSPString();

  console.log('CSP 策略:');
  console.log(cspString);
  console.log();

  if (shouldInject) {
    injectCSPToHTML(cspString);
  } else {
    console.log('提示: 使用 --inject 参数将 CSP 注入到 index.html');
    console.log(`示例: node scripts/generate-csp.mjs --inject`);
  }
}

main();
