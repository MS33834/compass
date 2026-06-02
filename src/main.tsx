import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const STORAGE_KEY_LOCALE = 'locale'
const storedLocale = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY_LOCALE) || 'zh'
  } catch {
    return 'zh'
  }
})()

document.documentElement.lang = storedLocale === 'zh' ? 'zh-CN' : 'en'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found in document')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
