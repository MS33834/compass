#!/usr/bin/env node
/**
 * Post-build steps for MindMirror.
 *
 * - Copies index.html to 404.html so GitHub Pages can serve the SPA
 *   shell for any unknown route (BrowserRouter fallback).
 * - Optionally creates CNAME if VITE_PAGES_CNAME is set.
 */
import { copyFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')
const indexPath = resolve(distDir, 'index.html')

if (!existsSync(indexPath)) {
  console.error('[postbuild] dist/index.html not found. Run `npm run build` first.')
  process.exit(1)
}

copyFileSync(indexPath, resolve(distDir, '404.html'))
console.log('[postbuild] dist/404.html created from dist/index.html')

const cname = (process.env.VITE_PAGES_CNAME || '').trim()
if (cname) {
  writeFileSync(resolve(distDir, 'CNAME'), cname + '\n')
  console.log(`[postbuild] dist/CNAME written: ${cname}`)
}

console.log('[postbuild] done.')
