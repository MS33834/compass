// 指南 · 入口
import { Component, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { useStore } from './store';
import { decodeResume } from './share';
import './index.css';

// 主题：首屏前应用 data-theme，避免白闪
(() => {
  try {
    const saved = localStorage.getItem('compass-v2.theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const theme = saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    /* noop */
  }
})();

// URL 续答 + 语言切换：?resume=BASE64 & ?lang=zh|en
// 顺序：先 resume（恢复存档），再 lang（URL 参数覆盖存档语言）
(() => {
  try {
    const params = new URLSearchParams(window.location.search);

    // 1. 续答：同步导入，避免与 ?lang= 竞态
    const r = params.get('resume');
    if (r) {
      const s = decodeResume(r);
      if (s) {
        useStore.getState().importState(s);
        params.delete('resume');
      }
    }

    // 2. 语言：URL 参数优先于存档
    const lang = params.get('lang');
    if (lang === 'zh' || lang === 'en') {
      useStore.getState().setLocale(lang);
      params.delete('lang');
    }

    // 清理 URL 参数
    const newQ = params.toString();
    if (newQ !== window.location.search.slice(1)) {
      const newUrl = window.location.pathname + (newQ ? '?' + newQ : '');
      window.history.replaceState({}, '', newUrl);
    }
  } catch {
    /* noop */
  }
})();

const root = document.getElementById('root');
if (!root) throw new Error('root not found');

// 纯内联样式的错误降级页，不依赖任何 CSS 变量
function renderErrorUI(container: HTMLElement, title: string, message: string, stack?: string) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'max-width:560px;margin:60px auto;padding:24px;text-align:center;font-family:system-ui,sans-serif;color:#333;background:#fff;border:2px solid #a8322e;border-radius:8px;';

  const h2 = document.createElement('h2');
  h2.textContent = title;
  h2.style.cssText = 'margin:0 0 16px;color:#a8322e;font-size:1.4rem;';
  wrap.appendChild(h2);

  const p = document.createElement('p');
  p.textContent = message || '(No error message)';
  p.style.cssText = 'margin:0 0 8px;color:#555;font-size:0.95rem;word-break:break-all;';
  wrap.appendChild(p);

  if (stack) {
    const pre = document.createElement('pre');
    pre.textContent = stack;
    pre.style.cssText =
      'text-align:left;background:#f5f5f5;padding:12px;border-radius:4px;font-size:0.75rem;overflow-x:auto;max-height:300px;overflow-y:auto;margin:12px 0;color:#333;';
    wrap.appendChild(pre);
  }

  const btn = document.createElement('button');
  btn.textContent = 'Reload';
  btn.onclick = () => location.reload();
  btn.style.cssText =
    'padding:10px 24px;background:#a8322e;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:1rem;margin-top:8px;';
  wrap.appendChild(btn);

  container.appendChild(wrap);
}

// 全局错误边界
class GlobalErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error('[GlobalErrorBoundary] 渲染异常:', error);
    console.error('[GlobalErrorBoundary] 组件信息:', info);
    if (error.stack) {
      console.error('[GlobalErrorBoundary] 堆栈:', error.stack);
    }
  }
  render() {
    if (this.state.error) {
      const boot = document.getElementById('cp-boot');
      if (boot) boot.remove();

      const e = this.state.error;
      return (
        <div
          style={{
            maxWidth: '560px',
            margin: '60px auto',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
            color: '#333',
            background: '#fff',
            border: '2px solid #a8322e',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ margin: '0 0 16px', color: '#a8322e', fontSize: '1.4rem' }}>
            Loading Error
          </h2>
          <p
            style={{
              margin: '0 0 8px',
              color: '#555',
              fontSize: '0.95rem',
              wordBreak: 'break-all',
            }}
          >
            {e.message || '(No error message)'}
          </p>
          {e.stack && (
            <pre
              style={{
                textAlign: 'left',
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                overflowX: 'auto',
                maxHeight: '300px',
                overflowY: 'auto',
                margin: '12px 0',
                color: '#333',
                whiteSpace: 'pre-wrap',
              }}
            >
              {e.stack}
            </pre>
          )}
          <button
            onClick={() => location.reload()}
            style={{
              padding: '10px 24px',
              background: '#a8322e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '8px',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  ReactDOM.createRoot(root).render(
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  );
} catch (e) {
  const boot = document.getElementById('cp-boot');
  if (boot) boot.remove();
  renderErrorUI(root, 'Loading Failed', (e as Error)?.message || String(e), (e as Error)?.stack);
  throw e;
}

// React 挂载完成后清除启动加载页
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const boot = document.getElementById('cp-boot');
    if (boot && boot.parentNode) {
      boot.style.transition = 'opacity 400ms ease';
      boot.style.opacity = '0';
      setTimeout(() => boot.remove(), 450);
    }
  });
});
