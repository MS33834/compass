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
      // 强制复用顶层 React，避免多实例
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
            // 把 react / react-dom / zustand 等合并到 vendor-react，避免重复打包
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/use-sync-external-store')
            ) {
              return 'vendor-react';
            }
            // 人物库 / 题库通过 import.meta.glob 动态导入，
            // 不强制归并到单 chunk，使每个域可独立按需加载。
          },
        },
      },
    },
    // 生产环境移除 console.log/debug
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
