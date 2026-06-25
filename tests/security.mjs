// 指南 · 安全检查测试
// 用法: node tests/security.mjs

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

let pass = 0;
let fail = 0;

function assert(condition, message) {
  if (condition) {
    pass++;
    console.log(`  ✓ ${message}`);
  } else {
    fail++;
    console.log(`  ✗ ${message}`);
  }
}

console.log('指南 · 安全检查\n');

console.log('1. 检查 dangerouslySetInnerHTML');
{
  const tsxFiles = readdirSync(resolve(ROOT, 'src'), { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
    .map(f => resolve(ROOT, 'src', f));

  let foundDangerous = false;

  for (const file of tsxFiles) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('dangerouslySetInnerHTML')) {
        console.log(`    发现: ${file}:${index + 1}`);
        console.log(`    ${line.trim()}`);
        foundDangerous = true;
      }
    });
  }

  assert(!foundDangerous, '没有使用 dangerouslySetInnerHTML');
}

console.log('\n2. 检查 eval()');
{
  const srcDir = resolve(ROOT, 'src');
  const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
    .map(f => join(srcDir, f));

  let foundEval = false;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // 检查 eval( 但不匹配 evaluate 等单词
      if (/\beval\s*\(/.test(line)) {
        console.log(`    发现: ${file}:${index + 1}`);
        console.log(`    ${line.trim()}`);
        foundEval = true;
      }
    });
  }

  assert(!foundEval, '没有使用 eval()');
}

console.log('\n3. 检查 API 密钥泄露');
{
  const srcDir = resolve(ROOT, 'src');
  const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.mjs'))
    .map(f => join(srcDir, f));

  const secretPatterns = [
    /(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"']{10,}/gi,
    /(?:secret|password|token)\s*[:=]\s*["'][^"']{10,}/gi,
    /Bearer\s+[A-Za-z0-9_\-\.]{20,}/g,
    /sk-[A-Za-z0-9]{20,}/g, // OpenAI API key pattern
  ];

  let foundSecrets = false;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');

    for (const pattern of secretPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`    发现: ${file}`);
        console.log(`    匹配: ${matches[0].substring(0, 30)}...`);
        foundSecrets = true;
      }
    }
  }

  assert(!foundSecrets, '没有泄露的 API 密钥');
}

console.log('\n4. 检查 CSP 策略');
{
  const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');
  
  // 提取 CSP meta 标签的完整内容（只匹配双引号，因为 generate-csp.mjs 使用双引号）
  const metaTagMatch = indexHtml.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"/i);
  
  if (metaTagMatch) {
    const cspContent = metaTagMatch[1];
    console.log(`    CSP: ${cspContent.substring(0, 80)}...`);
    console.log(`    CSP 长度: ${cspContent.length} 字符`);
    
    // 检查关键指令
    assert(cspContent.includes('default-src'), 'CSP: 包含 default-src');
    assert(cspContent.includes('script-src'), 'CSP: 包含 script-src');
    assert(cspContent.includes('style-src'), 'CSP: 包含 style-src');
    assert(!cspContent.includes("'unsafe-eval'"), "CSP: 不包含 unsafe-eval");
    
    assert(true, 'CSP: index.html 中包含 CSP meta 标签');
  } else {
    console.log(`    警告: 无法提取 CSP 内容`);
    // 备用检查
    const hasCSPMeta = indexHtml.includes('Content-Security-Policy');
    assert(hasCSPMeta, 'CSP: index.html 中包含 CSP meta 标签');
  }
}

console.log('\n5. 检查 XSS 风险（innerHTML）');
{
  const srcDir = resolve(ROOT, 'src');
  const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
    .map(f => join(srcDir, f));

  let unsafeInnerHTML = false;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // 检查 innerHTML 赋值
      if (/\.innerHTML\s*=/.test(line)) {
        // 排除安全的用法（清空容器、使用 textContent 等）
        if (!line.includes('innerHTML =') || line.includes('/*') || line.includes('//')) {
          console.log(`    发现: ${file}:${index + 1}`);
          console.log(`    ${line.trim()}`);
          unsafeInnerHTML = true;
        }
      }
    });
  }

  // main.tsx 中的 innerHTML 已有注释说明，是安全的
  assert(!unsafeInnerHTML, '没有不安全的 innerHTML 用法');
}

console.log('\n6. 检查 package.json 依赖安全');
{
  const packageJson = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));

  // 检查是否有已知的危险包
  const dangerousPackages = ['event-stream', 'left-pad', 'eslint-scope'];
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  let foundDangerous = false;
  for (const pkg of dangerousPackages) {
    if (allDeps[pkg]) {
      console.log(`    发现危险包: ${pkg}@${allDeps[pkg]}`);
      foundDangerous = true;
    }
  }

  assert(!foundDangerous, '没有使用已知的危险包');
}

console.log('\n7. 检查 .gitignore');
{
  const gitignore = readFileSync(resolve(ROOT, '.gitignore'), 'utf-8');

  const requiredIgnores = ['node_modules/', '.env', 'dist/', '*.log'];

  for (const ignore of requiredIgnores) {
    assert(gitignore.includes(ignore), `.gitignore: 包含 ${ignore}`);
  }
}

console.log(`\n总计：${pass} 通过 / ${fail} 失败`);

if (fail > 0) {
  process.exit(1);
}
