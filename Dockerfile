# =============================================================================
# Compass · Next.js 14 (standalone) + Prisma 多阶段构建
# =============================================================================

# ===== Stage 1: 安装依赖 =====
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# ===== Stage 2: 构建 =====
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
# 复用 deps 阶段已安装的 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 生成 Prisma Client，随后构建 Next.js standalone 产物
RUN pnpm prisma generate && pnpm build
# 收集 Prisma CLI 及其运行时依赖 @prisma/engines 到独立目录
#   - cp -L 解引用 pnpm 的符号链接，得到真实文件
#   - prisma@* 通配版本号，避免在 Dockerfile 中硬编码版本
# 这部分会复制到 runner 阶段，用于启动时执行 prisma migrate deploy
RUN mkdir -p /prisma-cli/node_modules/@prisma \
 && cp -rL node_modules/.pnpm/prisma@*/node_modules/prisma /prisma-cli/node_modules/prisma \
 && cp -rL node_modules/.pnpm/prisma@*/node_modules/@prisma/engines /prisma-cli/node_modules/@prisma/engines

# ===== Stage 3: 运行 =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOME=/home/node

# Next.js standalone 输出（含 server.js 及运行所需 node_modules）
COPY --chown=node:node --from=builder /app/.next/standalone ./
# 静态资源（standalone 不包含，需单独放置到 .next/static）
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
# public 目录
COPY --chown=node:node --from=builder /app/public ./public
# Prisma schema、迁移文件
COPY --chown=node:node --from=builder /app/prisma ./prisma
# Prisma 生成的 Client（standalone 不会自动追踪，必须显式复制）
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Prisma CLI 与 engines（供 entrypoint 执行 migrate deploy）
COPY --chown=node:node --from=builder /prisma-cli/node_modules/prisma ./node_modules/prisma
COPY --chown=node:node --from=builder /prisma-cli/node_modules/@prisma/engines ./node_modules/@prisma/engines
# 启动入口脚本
COPY --chown=node:node docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

# 以非 root 用户运行
USER node

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
