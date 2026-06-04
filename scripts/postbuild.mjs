#!/usr/bin/env node
/**
 * Post-build steps for MindMirror.
 *
 * - Copies index.html to 404.html so GitHub Pages can serve the SPA
 *   shell for any unknown route (BrowserRouter fallback).
 * - Injects Cache-Control: no-store meta tags so browsers, service
 *   workers, corporate proxies and CDN edge nodes never serve a
 *   stale 404 shell that was cached during the brief window when
 *   GitHub Pages was disabled. We still let the static /assets/*
 *   cache normally (those are content-hashed and immutable).
 * - Optionally creates CNAME if VITE_PAGES_CNAME is set.
 */
import { copyFileSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
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

/**
 * Inject aggressive no-cache directives into the SPA shell. We only
 * touch index.html and 404.html (the document), never the hashed
 * /assets/* files which are content-addressed and safe to cache.
 *
 * This is a defense-in-depth measure: even if an edge node (Cloudflare,
 * corporate proxy, ISP transparent proxy) cached a stale "Pages
 * disabled" 404 response during the brief window when GitHub Pages
 * was turned off, the next reload will revalidate and pick up the
 * real SPA shell.
 */
const NO_CACHE_META = [
  '<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" />',
  '<meta http-equiv="Pragma" content="no-cache" />',
  '<meta http-equiv="Expires" content="0" />',
].join('\n    ')

function injectNoCache(htmlPath) {
  const original = readFileSync(htmlPath, 'utf8')
  if (original.includes('http-equiv="Cache-Control"')) {
    // Already injected (re-running postbuild).
    return false
  }
  // Insert right after the <head> opening tag so the directives are
  // seen before any other <meta> is parsed.
  const patched = original.replace(/<head>/i, `<head>\n    ${NO_CACHE_META}`)
  if (patched === original) {
    console.warn(`[postbuild] could not find <head> in ${htmlPath}; skipping no-cache inject`)
    return false
  }
  writeFileSync(htmlPath, patched, 'utf8')
  return true
}

const touchedIndex = injectNoCache(indexPath)
const touched404 = injectNoCache(resolve(distDir, '404.html'))
if (touchedIndex) console.log('[postbuild] no-cache meta injected into dist/index.html')
if (touched404) console.log('[postbuild] no-cache meta injected into dist/404.html')

const cname = (process.env.VITE_PAGES_CNAME || '').trim()
if (cname) {
  writeFileSync(resolve(distDir, 'CNAME'), cname + '\n')
  console.log(`[postbuild] dist/CNAME written: ${cname}`)
}

console.log('[postbuild] done.')
