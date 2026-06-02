/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import dataRoutes from './routes/data.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

// CORS: 在生产环境收紧为已知来源，开发环境放开
const isProd = process.env.NODE_ENV === 'production'
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (!isProd) return callback(null, true)
      if (allowedOrigins.length === 0) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 简易内存限流：在 serverless 中每个实例独立计数，可在外部叠加 Vercel 限流
interface RateEntry {
  count: number
  resetAt: number
}
const rateLimitStore = new Map<string, RateEntry>()
const WINDOW_MS = 60_000
const AUTH_LIMIT = 20
const DATA_LIMIT = 120

function rateLimit(limit: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip || 'unknown'}:${req.path}`
    const now = Date.now()
    const entry = rateLimitStore.get(key)
    if (!entry || entry.resetAt < now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS })
      next()
      return
    }
    if (entry.count >= limit) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000).toString())
      res.status(429).json({ success: false, error: 'Too many requests' })
      return
    }
    entry.count += 1
    next()
  }
}

// 定期清理过期的限流项
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetAt < now) rateLimitStore.delete(k)
  }
}, WINDOW_MS).unref?.()

/**
 * API Routes
 */
app.use('/api/auth', rateLimit(AUTH_LIMIT), authRoutes)
app.use('/api/data', rateLimit(DATA_LIMIT), dataRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
      timestamp: new Date().toISOString(),
    })
  },
)

// 仅在非生产环境暴露 API 文档入口
if (!isProd) {
  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      success: true,
      name: 'MindMirror API',
      version: '1.0.0',
      endpoints: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'GET  /api/auth/me',
        'GET  /api/data/history',
        'POST /api/data/history',
        'DELETE /api/data/history/:id',
        'GET  /api/data/mood',
        'POST /api/data/mood',
        'GET  /api/data/achievements',
        'POST /api/data/achievements',
        'GET  /api/health',
      ],
    })
  })
}

/**
 * error handler middleware
 */
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api] error:', error.message)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
