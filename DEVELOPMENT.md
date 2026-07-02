# Compass 开发者文档

> 本文档是 Compass 项目开发者的必读指南。**每次开始开发工作前，请务必完成「每次必做检查清单」。**

---

## 一、仓库信息

| 平台 | 地址 | 用途 |
|------|------|------|
| GitHub（主仓） | https://github.com/MS33834/compass | 主仓库，PR/Issue 在此提交 |
| GitCode（镜像） | https://gitcode.com/badhope/compass | 代码镜像，仅同步不处理 PR/Issue |

**所有 Pull Request 和 Issue 只在 GitHub 主仓提交。**

---

## 二、每次必做检查清单

> **重要：每次开始开发前和提交代码后，都必须执行以下检查。**

### 2.1 开发前检查

- [ ] **拉取最新代码**：`git pull github main && git pull gitcode main`
- [ ] **检查远程分支**：`git fetch --all && git branch -r` — 是否有新分支需要合并或处理
- [ ] **检查 GitHub PR**：访问 https://github.com/MS33834/compass/pulls — 是否有待处理的 PR
- [ ] **检查 GitHub Issues**：访问 https://github.com/MS33834/compass/issues — 是否有需要处理的 Issue
- [ ] **检查 CI 状态**：访问 https://github.com/MS33834/compass/actions — 最近一次构建是否全绿
- [ ] **检查 GitCode 同步状态**：确认 GitCode main 分支与 GitHub 一致

### 2.2 提交后检查

- [ ] **推送两个仓库**：`git push github main && git push gitcode main`
- [ ] **确认 CI 触发**：推送后访问 GitHub Actions 页面，确认 CI 已触发
- [ ] **等待 CI 全绿**：确认 typecheck + build + lint 全部通过
- [ ] **确认 GitCode 已同步**：`git ls-remote gitcode main` 与 `git ls-remote github main` 的 commit hash 一致

### 2.3 分支处理规则

- 发现远程有非 `main` 分支时：
  1. 检查分支内容是否与当前项目方向一致
  2. 如果是旧项目残留 → 不要合并，报告后删除或忽略
  3. 如果是新功能分支 → Review 后决定是否合并
- 禁止 force push 到 main 分支（除非确认覆盖旧项目残留）

---

## 三、技术栈

- **框架**：Next.js 14（App Router）+ React 18
- **语言**：TypeScript（严格模式）
- **样式**：Tailwind CSS 3.4
- **动画**：Framer Motion
- **数据库**：PostgreSQL 14+ + Prisma 5
- **认证**：NextAuth.js 4（JWT Session）
- **包管理器**：pnpm
- **部署**：Docker Compose（Next.js + PostgreSQL + Nginx）

---

## 四、本地开发环境

### 4.1 前置要求

- Node.js ≥ 20
- pnpm ≥ 9（`corepack enable && corepack prepare pnpm@latest --activate`）
- PostgreSQL 14+（或使用 Docker）

### 4.2 初始化

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client
pnpm db:generate

# 复制环境变量模板并填写
cp .env.example .env
# 编辑 .env，至少配置 DATABASE_URL 和 NEXTAUTH_SECRET

# 执行数据库迁移（开发环境）
pnpm db:migrate

# （可选）填充种子数据
pnpm db:seed

# 启动开发服务器
pnpm dev
```

### 4.3 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（http://localhost:3000） |
| `pnpm build` | 生产构建 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | ESLint 检查 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:migrate` | 创建并执行数据库迁移（开发环境） |
| `pnpm db:deploy` | 执行已有迁移（生产环境） |
| `pnpm db:seed` | 填充种子数据 |
| `pnpm db:studio` | 打开 Prisma Studio |

---

## 五、代码规范

### 5.1 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证页面
│   ├── api/               # API 路由
│   ├── dashboard/         # 仪表盘
│   ├── compass/           # 罗盘页
│   ├── voyage/            # 航程页
│   ├── logbook/           # 日志页
│   ├── profile/           # 个人中心
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 落地页
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   └── ...               # 业务组件
├── lib/                   # 工具与配置
│   ├── auth.ts           # NextAuth 配置
│   ├── prisma.ts         # Prisma Client 单例
│   ├── validations.ts    # Zod 校验 schema
│   ├── rate-limit.ts     # 限流器
│   ├── mail.ts           # 邮件发送
│   ├── fonts.ts          # 字体配置
│   ├── utils.ts          # 通用工具函数
│   └── services/         # 业务 Service 层
├── types/                 # TypeScript 类型定义
└── middleware.ts          # NextAuth 路由保护中间件
```

### 5.2 命名约定

- **文件**：kebab-case（如 `goal-service.ts`）
- **组件**：PascalCase（如 `CompassRose.tsx`）
- **函数/变量**：camelCase（如 `getGoalsByUser`）
- **类型/接口**：PascalCase（如 `GoalWithMilestones`）
- **常量**：UPPER_SNAKE_CASE（如 `MAX_GOALS_PER_USER`）

### 5.3 提交规范

```
<type>(<scope>): <description>

type: feat | fix | docs | chore | refactor | test | style
scope: 可选，如 auth, db, api, ui, deploy
```

示例：
- `feat(api): 实现目标 CRUD 接口`
- `fix(auth): 修复密码重置令牌校验逻辑`
- `docs: 更新开发者文档`

### 5.4 安全规范

- **密钥安全**：API 密钥、数据库密码等敏感信息只放在 `.env` 文件中，**绝不提交到仓库**
- **数据隔离**：所有数据查询必须携带 `userId` 过滤
- **输入校验**：所有 API 入参使用 Zod 校验
- **密码哈希**：使用 bcrypt，cost ≥ 12

---

## 六、部署

参见 [PLAN.md](./PLAN.md) Phase 9 和项目根目录的 `Dockerfile`、`docker-compose.yml`、`nginx.conf`。

```bash
# 生产部署
cp .env.example .env  # 填写生产环境配置
docker compose up -d --build
docker compose exec app pnpm db:deploy  # 首次执行迁移
```
