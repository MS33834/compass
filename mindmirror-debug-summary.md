# MindMirror 部署白屏 Debug 总结

## 问题
GitHub Pages 部署后，页面显示启动引导页（"入镜中…"），React 从未挂载，#root 保持空。

## 已确认的信息

### ✅ 构建产物正确
- `tsc -b` 零错误
- `vite build --base=/MindMirror/` 成功输出 dist/
- 产物含: `index.html`, `assets/index-BqPNVKFH.js` (230KB), `assets/vendor-react-DbsbXn43.js` (149KB), `assets/index-x97-8h8Z.css` (14.8KB)
- Node.js 语法验证通过: node --check 无语法错误

### ✅ 部署文件验证（2026-06-14 19:43 线上）
- HTML 中包含正确的 `<script type="module" crossorigin src="/MindMirror/assets/index-BqPNVKFH.js">`
- 包含 `<link rel="modulepreload" crossorigin href="/MindMirror/assets/vendor-react-DbsbXn43.js">`
- 包含 `<link rel="stylesheet" crossorigin href="/MindMirror/assets/index-x97-8h8Z.css">`
- `manifest.webmanifest`、`favicon.svg`、`patterns/rice-paper.svg`、`sw.js` 均正确部署
- 所有 JS/CSS HTTP 200, Content-Type 正确, CORS `Access-Control-Allow-Origin: *` 存在
- **local 与 remote 的 hash 比对因文件过大被 SIGKILL，未能完成**

### ✅ 本地构建正常
- `npm run dev` (Vite dev server) 正常工作
- 构建后在 dist/ 目录下由 http-server / python3 静态服务本地测试正常
- CSS body 背景引用了 `/MindMirror/patterns/rice-paper.svg` 路径正确

### ✅ 架构分析：代码侧无明显缺陷
- `main.tsx`: IIFE 设置主题 → IIFE URL resume → `createRoot(root).render()` → `requestAnimationFrame` 移除 boot
- `App.tsx`: 从 zustand store 读取 phase → lazy 600ms 翻页延迟
- `Prologue.tsx`: useRef 替代 useState 惰性初始化（修复 React #310）
- `store.ts`: zustand + persist/createJSONStorage + merge 迁移 + onRehydrateStorage
- `sw.js v5`: 极简策略，不拦截 .js/.css/.html

### ✅ Git 历史显示多轮针对性修复（React Error #310 "Invalid hook call"）
| Commit | 修复内容 |
|--------|----------|
| af44ad9 | useState → useRef 避免惰性初始化时访问 Hook 值 |
| 96111c6 | 合并 zustand 到 vendor-react chunk，避免两个 React 实例 |
| ea06c7a | resolve.dedupe + SW v5 不拦截 + 破坏旧 SW 缓存 |

## 已排除的因素
- ❌ Service Worker 不拦截 JS/CSS/HTML
- ❌ GitHub Pages Jekyll 处理（已禁用以 .nojekyll）
- ❌ CSP header 不存在
- ❌ 模块导入链正确（main → vendor 6 个命名导出完全匹配）
- ❌ 字体加载不影响模块执行
- ❌ 404.html 仅用作 SPA 重定向，不影响主页面加载

## 根因推断
**最大嫌疑：Zustand persist `onRehydrateStorage` 中的错误导致 React 渲染过程中抛出异常，被 GlobalErrorBoundary 捕获但错误 UI 无法正常渲染。**

更具体来说，可能存在以下情况之一：

1. **存储数据损坏**：用户之前使用旧版本时，localStorage 中保存了 `mindmirror-v2` 数据。如果数据格式不兼容（如旧版 store 被 persist 保存后格式变更），`onRehydrateStorage` 或 `merge` 函数中抛出的异常会被 zustand 内部 catch 且不会阻止 UI 渲染，但可能导致 `applyTheme` 等副作用失败。

2. **Zustand persist + React 18 Strict 模式交互**：Strict 模式下 React 18 会 double-invoke render 和 effects，可能导致 persist 的 rehydration 时机与组件挂载顺序产生竞争条件。

3. **JS 模块图加载顺序的边缘情况**：Vite 生产构建将 React 拆分到 vendor chunk，主 chunk import 从 vendor chunk。理论上是正确的，但如果 CDN 对 vendor chunk 的响应稍慢于主 chunk，存在极短暂的时序窗口。

## 建议的排查/修复步骤（需在浏览器中操作）

### 1️⃣ 用户端验证
1. **先清除该站点的 localStorage 和 Service Worker**（在 Chrome DevTools > Application 面板中）
2. **无痕窗口打开** `https://badhope.github.io/MindMirror/`
3. **查看 Console 面板**，确认是否有以下错误：
   - `Uncaught SyntaxError` / `TypeError` / `ReferenceError`
   - `Failed to rehydrate state:` (zustand 的 `onRehydrateStorage` 会 log 此错误)
   - `Invalid hook call` (React #310)
   - Network 面板确认模块 JS 是否加载完整

### 2️⃣ 增强错误捕获（代码修复）
```ts
// main.tsx 中添加未捕获错误监听
window.addEventListener('error', (e) => {
  console.error('[ROOT] 未捕获错误:', e.message, e.error?.stack);
  // 显示到 boot 页面
  const bootMsg = document.getElementById('boot-msg');
  if (bootMsg) bootMsg.textContent = '错误: ' + (e.message || '');
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[ROOT] 未处理的 Promise rejected:', e.reason);
});
```

### 3️⃣ 简化调试入口
创建 `debug.html` 仅加载 React + main.tsx 的最小配置，排除 SW、manifest 等因素。

### 4️⃣ 检查 CDN 缓存
GitHub Pages 页面使用 `Cache-Control: max-age=600`（10分钟）。部署后需要等待 CDN 缓存失效。添加 `?v=build-timestamp` 参数到主 JS 链接可绕过。

## 结论（个人评估）
**该问题很可能已不存在于最新部署中。** 开发者已在 git 中锚定了三个修复提交。如果用户仍遇到白屏，大概率是：
1. 陈旧 localStorage 数据导致 zustand persist 水合异常
2. 浏览器缓存了旧版页面（SW 或 CDN 缓存）
3. 浏览器 DevTools 中已有错误信息但被忽略

建议：**先清所有缓存，再开无痕窗口，看 Console 报错**。
