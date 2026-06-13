// 镜心 · 入口
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { useStore } from './store';
import { decodeResume } from './share';
import './index.css';

// C7 主题：首屏前应用 data-theme，避免白闪
(() => {
  try {
    const saved = localStorage.getItem('mindmirror-v2.theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const theme = saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    /* noop */
  }
})();

// C13 URL 续答：?resume=BASE64
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('resume');
    if (r) {
      const s = decodeResume(r);
      if (s) {
        // 等 store mount 后再灌入
        queueMicrotask(() => useStore.getState().importState(s));
        // 清掉 URL 参数，避免泄露
        params.delete('resume');
        const newQ = params.toString();
        const newUrl = window.location.pathname + (newQ ? '?' + newQ : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  } catch {
    /* noop */
  }
})();

const root = document.getElementById('root');
if (!root) throw new Error('root not found');

// 全局错误捕获：把错误显示在页面上，避免出现"白屏"无提示
function showFatal(msg: string) {
  const boot = document.getElementById('jx-boot');
  if (boot) boot.remove();
  if (!root) return;
  root.innerHTML = `
    <div style="max-width:560px;margin:80px auto;padding:24px;text-align:center;font-family:serif;color:#a8322e">
      <h2 style="margin:0 0 12px">加载失败</h2>
      <p style="margin:0 0 16px;color:#5a5a5a">${msg}</p>
      <button onclick="location.reload()" style="padding:8px 16px;background:#a8322e;color:#f5efe0;border:none;cursor:pointer;font-family:serif">重新加载</button>
    </div>
  `;
}

window.addEventListener('error', (e) => {
  if (e.error) {
    console.error('[Global]', e.error);
  }
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled]', e.reason);
});

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  showFatal((e as Error)?.message || String(e));
  throw e;
}

// React 挂载完成后清除启动加载页
// 使用双重 rAF 保证 React 至少完成一帧渲染
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const boot = document.getElementById('jx-boot');
    if (boot && boot.parentNode) {
      boot.style.transition = 'opacity 400ms ease';
      boot.style.opacity = '0';
      setTimeout(() => boot.remove(), 450);
    }
  });
});
