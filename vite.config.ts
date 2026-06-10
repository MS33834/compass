import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const REPO_NAME = 'MindMirror';
const DEFAULT_BASE = `/${REPO_NAME}/`;

export default defineConfig(({ mode }) => {
  const base = process.env.VITE_BASE_PATH || DEFAULT_BASE;
  return {
    base: mode === 'static' ? './' : base,
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/zustand')) {
              return 'vendor-state';
            }
          },
        },
      },
    },
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
