#!/bin/sh
set -e

# 若存在 Prisma 迁移目录，则执行数据库迁移
if [ -d "/app/prisma/migrations" ]; then
  echo "==> 执行 Prisma 数据库迁移 (migrate deploy)..."
  node ./node_modules/prisma/build/index.js migrate deploy
  echo "==> 数据库迁移完成。"
fi

# 启动 Next.js standalone 服务（参数由 Dockerfile CMD 传入：node server.js）
echo "==> 启动 Compass 应用..."
exec "$@"
