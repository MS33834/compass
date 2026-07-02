import { z } from "zod";

// 登录校验 schema：邮箱 + 密码（至少 8 位）
export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少 8 位"),
});

// 注册校验 schema：昵称（1-50）、邮箱、密码（8-72）
export const registerSchema = z.object({
  name: z.string().min(1, "昵称不能为空").max(50, "昵称最多 50 个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少 8 位").max(72, "密码最多 72 位"),
});

// 忘记密码校验 schema：仅邮箱
export const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

// 重置密码校验 schema：令牌 + 新密码（8-72）
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "令牌不能为空"),
  password: z.string().min(8, "密码至少 8 位").max(72, "密码最多 72 位"),
});

// 派生类型导出，便于在 API 与组件中复用
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ===== 目标（Goal）校验 =====

export const createGoalSchema = z.object({
  title: z.string().min(1, "目标标题不能为空").max(100, "标题最多 100 字"),
  description: z.string().max(500, "描述最多 500 字").optional(),
  quadrant: z.enum(["north", "east", "south", "west"]),
  priority: z.enum(["low", "medium", "high"]),
  targetDate: z.string().datetime().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1, "目标标题不能为空").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  quadrant: z.enum(["north", "east", "south", "west"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  targetDate: z.string().datetime().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(["active", "paused", "completed", "archived"]).optional(),
  sortOrder: z.number().int().optional(),
});

// ===== 里程碑（Milestone）校验 =====

export const createMilestoneSchema = z.object({
  title: z.string().min(1, "里程碑标题不能为空").max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  sortOrder: z.number().int().optional(),
});

// ===== 任务（Task）校验 =====

export const createTaskSchema = z.object({
  title: z.string().min(1, "任务标题不能为空").max(100),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  sortOrder: z.number().int().optional(),
});

// ===== 日志（Log）校验 =====

export const createLogSchema = z.object({
  content: z.string().min(1, "日志内容不能为空").max(5000),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  tags: z.array(z.string().max(20)).max(10, "最多 10 个标签").default([]),
  goalIds: z.array(z.string().uuid()).max(10).optional(),
});

export const updateLogSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string().max(20)).max(10).optional(),
  goalIds: z.array(z.string().uuid()).max(10).optional(),
});

// 派生类型
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateLogInput = z.infer<typeof createLogSchema>;
export type UpdateLogInput = z.infer<typeof updateLogSchema>;
