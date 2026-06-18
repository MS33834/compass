import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const REPO_NAME = 'compass';
const DEFAULT_BASE = `/${REPO_NAME}/`;

export default defineConfig(({ mode }) => {
  const base = process.env.VITE_BASE_PATH || DEFAULT_BASE;
  return {
    base,
    plugins: [react()],
    resolve: {
      // 防御性配置：强制所有依赖使用顶层 React，避免嵌套依赖导致多实例
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'use-sync-external-store'],
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: 'hidden',
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 关键修复：把 zustand 与 react 合并到同一块，避免两个 React 实例
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/use-sync-external-store')
            ) {
              return 'vendor-react';
            }
            // 按域拆分数据块，减少首屏主 chunk 体积
            if (id.includes('/domain/figures/')) return 'figures';
            if (id.includes('/domain/items/')) return 'items';
          },
        },
      },
    },
    // 生产环境移除 console.log/debug（Vite 8 使用 oxc，通过 define 兜底）
    define:
      mode === 'production'
        ? {
            'console.log': '() => {}',
            'console.debug': '() => {}',
          }
        : {},
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
  };
});
