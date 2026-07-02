# Compass · 项目总计划书

> **个人方向与目标导航系统** — 锚定目标 · 规划航程 · 校准方向
>
> 本文档是 Compass 项目的唯一权威计划文档，包含已完成基础工程的特色概括和后续全部阶段的详细计划与进度跟踪。

---

## 一、已完成基础工程（Phase 0 特色概括）

### 技术栈

Next.js 14 App Router 全栈 · TypeScript 严格模式 · Tailwind CSS 3.4 · Prisma 5 + PostgreSQL · NextAuth.js 4 (JWT) · Framer Motion · Docker Compose 部署

### 已交付模块

| 模块 | 文件数 | 核心内容 |
|------|--------|----------|
| 项目骨架 | 7 | package.json, tsconfig, next.config(standalone), tailwind.config, postcss, eslint, next-env.d.ts |
| 数据层 | 4 | Prisma schema (7 模型 4 枚举), PrismaClient 单例, 类型导出, 种子脚本 |
| 认证系统 | 11 | NextAuth Credentials Provider, JWT Session, 注册/登录/忘记密码/重置密码 API, 限流器, Nodemailer 邮件, 路由中间件, SessionProvider |
| 设计系统 | 8 | 三字体配置 (Cormorant Garamond + Source Sans 3 + JetBrains Mono), 全局样式 (深海星图背景/滚动条/工具类), 根布局, Button/Card/Input 组件, AppShell 导航壳, cn 工具函数 |
| 前端页面 | 6 | 落地页 (Hero + 功能亮点 + CTA), 登录/注册/忘记密码/重置密码 4 个认证页, CompassRose SVG 组件 |
| 部署方案 | 6 | 多阶段 Dockerfile, docker-compose (app+db+nginx), Nginx 反向代理+SSL+安全头, .env.example, .dockerignore, entrypoint 脚本 |

### 验证状态

- [x] `pnpm typecheck` — 零错误
- [x] `pnpm build` — 12 页面/路由全部生成成功
- [x] Prisma Client 生成成功
- [x] Next.js standalone 输出正常

### 设计语言

- **主色板**：深海墨蓝 `#0B1426`（背景）/ 象牙白 `#F5F1E8`（文字）/ 黄铜金 `#C9A227`（强调）
- **辅助色**：潮汐青 `#4A7C82` / 珊瑚橙 `#D97757` / 星光银 `#A8B4C4`
- **字体**：Cormorant Garamond（标题衬线）/ Source Sans 3（正文）/ JetBrains Mono（数据）
- **风格**：深海航海仪器 × 现代极简主义，罗盘玫瑰旋转动画，玻璃质感面板

### 数据模型

```
User ─┬─ Goal ── Milestone ── Task
      ├─ Log ←→ GoalLogs ←→ Goal
      └─ PasswordReset
```

7 个模型：User, Goal, Milestone, Task, Log, GoalLogs (N:N 关联), PasswordReset

---

## 二、后续开发计划

### Phase 1：核心后端 API（目标/里程碑/任务/日志 CRUD）

> 为所有前端页面提供数据接口，是后续所有功能的地基。

- [ ] **1.1** 创建 `src/lib/services/goal-service.ts` — 目标 CRUD + 进度计算 + 状态机
- [ ] **1.2** 创建 `src/lib/services/milestone-service.ts` — 里程碑 CRUD + 排序
- [ ] **1.3** 创建 `src/lib/services/task-service.ts` — 任务 CRUD + 状态切换
- [ ] **1.4** 创建 `src/lib/services/log-service.ts` — 日志 CRUD + 标签管理
- [ ] **1.5** 创建 `src/app/api/goals/route.ts` — GET 列表 / POST 创建
- [ ] **1.6** 创建 `src/app/api/goals/[id]/route.ts` — GET / PATCH / DELETE
- [ ] **1.7** 创建 `src/app/api/goals/[goalId]/milestones/route.ts` — GET / POST
- [ ] **1.8** 创建 `src/app/api/milestones/[id]/route.ts` — PATCH / DELETE
- [ ] **1.9** 创建 `src/app/api/milestones/[id]/tasks/route.ts` — POST
- [ ] **1.10** 创建 `src/app/api/tasks/[id]/route.ts` — PATCH / DELETE
- [ ] **1.11** 创建 `src/app/api/logs/route.ts` — GET (分页/筛选) / POST
- [ ] **1.12** 创建 `src/app/api/logs/[id]/route.ts` — PATCH / DELETE
- [ ] **1.13** 创建 `src/app/api/stats/route.ts` — 仪表盘聚合统计
- [ ] **1.14** 编写 Zod 校验 schema 扩展（goal/milestone/task/log）
- [ ] **1.15** 类型检查 + 构建验证通过

### Phase 2：仪表盘页面（Dashboard）

> 用户登录后的首页，一屏掌握全局。

- [ ] **2.1** 创建 `src/app/dashboard/layout.tsx` — 套用 AppShell
- [ ] **2.2** 创建 `src/app/dashboard/page.tsx` — Server Component 获取数据
- [ ] **2.3** 今日聚焦卡片 — 最高优先级目标 + 3 个待办任务 + 进度环
- [ ] **2.4** 进度总览卡片 — 目标总数、完成率、里程碑达成数、连续记录天数
- [ ] **2.5** 最近日志列表 — 最近 3 条日志摘要 + 快速新增入口
- [ ] **2.6** 空状态处理 — 无目标时显示引导创建入口
- [ ] **2.7** Framer Motion 页面加载动画（stagger reveal）
- [ ] **2.8** 类型检查 + 构建验证通过

### Phase 3：罗盘页（Compass Canvas）

> 核心差异化页面，可视化目标在人生四象限的分布。

- [ ] **3.1** 创建 `src/app/compass/page.tsx` — 罗盘画布主页面
- [ ] **3.2** 罗盘玫瑰背景（复用 CompassRose 组件，放大版）
- [ ] **3.3** 四象限区域布局（北=事业 / 东=学习 / 南=生活 / 西=健康）
- [ ] **3.4** 目标卡片组件 — 进度条、优先级色点、截止日期、hover 浮起
- [ ] **3.5** 拖拽功能 — 目标卡片可在象限间拖拽（使用 Framer Motion drag）
- [ ] **3.6** 拖拽落点保存 — PATCH 更新目标 quadrant
- [ ] **3.7** 新建目标弹窗 — 选择象限、输入标题/优先级/截止日期
- [ ] **3.8** 响应式适配 — 移动端缩放 + 触控拖拽
- [ ] **3.9** 类型检查 + 构建验证通过

### Phase 4：航程页（Voyage）

> 目标拆解为里程碑与任务，时间线 + 看板双视图。

- [ ] **4.1** 创建 `src/app/voyage/page.tsx` — 目标列表 + 筛选器
- [ ] **4.2** 目标列表卡片 — 状态标签、进度条、点击进入详情
- [ ] **4.3** 创建 `src/app/voyage/[goalId]/page.tsx` — 单目标详情
- [ ] **4.4** 里程碑时间线视图 — 垂直时间线、节点圆点、状态标签
- [ ] **4.5** 任务列表 — 每个里程碑下的任务，状态切换
- [ ] **4.6** 看板视图 — 三列（待办/进行中/已完成），拖拽切换状态
- [ ] **4.7** 新增/编辑里程碑弹窗
- [ ] **4.8** 新增/编辑/删除任务
- [ ] **4.9** 进度自动计算 — 根据任务完成比例更新里程碑和目标进度
- [ ] **4.10** 视图切换按钮（时间线 ↔ 看板）
- [ ] **4.11** 类型检查 + 构建验证通过

### Phase 5：日志页（Logbook）

> 记录执行反馈，周期性复盘。

- [ ] **5.1** 创建 `src/app/logbook/page.tsx` — 日志时间轴主页面
- [ ] **5.2** 日志编辑器组件 — Markdown 轻量编辑、工具栏
- [ ] **5.3** 心情/能量滑块 — 1-5 分评分，带表情图标
- [ ] **5.4** 标签输入 — 自动补全已有标签
- [ ] **5.5** 关联目标选择 — 多选目标 ID
- [ ] **5.6** 日志时间轴 — 按月分组、折叠展开
- [ ] **5.7** 搜索 + 标签筛选
- [ ] **5.8** 日志编辑/删除
- [ ] **5.9** 类型检查 + 构建验证通过

### Phase 6：引导页 + 个人中心（Onboarding & Profile）

> 首次使用引导和账户管理。

- [ ] **6.1** 创建 `src/app/onboarding/page.tsx` — 分步引导
- [ ] **6.2** 步骤 1：输入第一个目标标题 + 选择象限
- [ ] **6.3** 步骤 2：设置优先级 + 截止日期
- [ ] **6.4** 步骤 3：系统自动生成初始里程碑建议
- [ ] **6.5** 步骤 4：完成 → 跳转仪表盘
- [ ] **6.6** 创建 `src/app/profile/page.tsx` — 个人中心
- [ ] **6.7** 账户设置 — 修改用户名、邮箱
- [ ] **6.8** 修改密码 — 旧密码验证 + 新密码
- [ ] **6.9** 偏好设置 — 主题切换（深海/羊皮纸）、通知开关
- [ ] **6.10** 数据导出 — 导出 JSON（目标+里程碑+任务+日志）
- [ ] **6.11** 类型检查 + 构建验证通过

### Phase 7：交互优化与动画打磨

> 让产品从"能用"到"好用"。

- [ ] **7.1** 全局页面切换动画（共享布局淡入淡出）
- [ ] **7.2** 数字滚动动画（进度更新时）
- [ ] **7.3** 卡片 hover 微交互统一（Y 轴上浮 + 阴影 + 金色边框）
- [ ] **7.4** 罗盘拖拽磁吸感 + 涟漪反馈
- [ ] **7.5** Toast 通知组件 — 操作成功/失败反馈
- [ ] **7.6** 确认弹窗组件 — 删除操作前确认
- [ ] **7.7** 加载骨架屏 — 数据获取时的占位
- [ ] **7.8** 深色/浅色主题完整适配
- [ ] **7.9** 类型检查 + 构建验证通过

### Phase 8：测试与质量保证

> 确保上线前无致命 bug。

- [ ] **8.1** 单元测试 — service 层业务逻辑（进度计算、状态机）
- [ ] **8.2** 单元测试 — Zod 校验 schema
- [ ] **8.3** API 集成测试 — Goal/Milestone/Task/Log CRUD 全流程
- [ ] **8.4** API 集成测试 — 认证流程（注册/登录/密码重置）
- [ ] **8.5** E2E 测试 — 落地页 → 注册 → 引导 → 仪表盘 全流程
- [ ] **8.6** E2E 测试 — 罗盘拖拽、看板拖拽
- [ ] **8.7** 响应式测试 — 桌面/平板/移动端
- [ ] **8.8** 安全审计 — 权限隔离、注入防护、限流验证
- [ ] **8.9** 性能审计 — Lighthouse 评分 ≥ 90
- [ ] **8.10** 无障碍审计 — 键盘导航、ARIA 标签

### Phase 9：生产部署与上线

> 从开发环境到公开网站。

- [ ] **9.1** 生成 Prisma migration 文件
- [ ] **9.2** 配置生产环境变量（.env）
- [ ] **9.3** SSL 证书配置（Let's Encrypt 或自有证书）
- [ ] **9.4** 域名 DNS 解析配置
- [ ] **9.5** Docker Compose 一键部署验证
- [ ] **9.6** Nginx 反向代理 + 安全头验证
- [ ] **9.7** 健康检查接口验证
- [ ] **9.8** 数据库备份策略配置
- [ ] **9.9** 日志收集与监控
- [ ] **9.10** 上线前最终冒烟测试

### Phase 10：迭代增强（上线后）

> 持续打磨的方向。

- [ ] **10.1** OAuth 登录接入（GitHub / Google）
- [ ] **10.2** 数据可视化增强（周报/月报图表）
- [ ] **10.3** PWA 离线支持
- [ ] **10.4** 多语言支持（i18n）
- [ ] **10.5** 移动端手势优化
- [ ] **10.6** 目标模板库
- [ ] **10.7** 导入/导出功能增强

---

## 三、进度统计

| 阶段 | 总任务数 | 已完成 | 进度 |
|------|----------|--------|------|
| Phase 0 · 基础工程 | 42 文件 | 42 | ████████████████████ 100% |
| Phase 1 · 核心 API | 15 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 2 · 仪表盘 | 8 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 3 · 罗盘页 | 9 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 4 · 航程页 | 11 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 5 · 日志页 | 9 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 6 · 引导+个人中心 | 11 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 7 · 交互打磨 | 9 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 8 · 测试 QA | 10 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 9 · 生产部署 | 10 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |
| Phase 10 · 迭代增强 | 7 | 0 | ░░░░░░░░░░░░░░░░░░░░ 0% |

**总体进度：Phase 0 完成，Phase 1-10 待启动**

---

## 四、开发规范

- **代码规范**：TypeScript 严格模式，ESLint + Prettier，所有注释使用中文
- **路径别名**：`@/*` → `src/*`
- **命名约定**：文件 kebab-case，组件 PascalCase，函数 camelCase
- **提交规范**：`type(scope): description`（feat/fix/docs/chore/refactor）
- **分支策略**：main 分支保持可部署状态，功能开发在 feature 分支
- **同步策略**：每个 Phase 完成后同步推送 GitHub + GitCode 两个仓库
