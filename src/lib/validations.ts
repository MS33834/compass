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
