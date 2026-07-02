import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/mail";

// 忘记密码接口限流：每 IP 每 15 分钟 5 次
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  // 限流
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const limited = rateLimit(`forgot-password:${ip}`, LIMIT, WINDOW_MS);
  if (!limited.success) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // 入参校验
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }
    const { email } = parsed.data;

    // 查找用户：不存在也返回成功，防止邮箱枚举攻击
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // 生成随机 token
      const token = crypto.randomUUID();
      // 过期时间：30 分钟后
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // 创建密码重置记录
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // 发送重置邮件
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      message: "如果该邮箱已注册，你将收到重置邮件",
    });
  } catch (error) {
    console.error("[forgot-password] 处理失败:", error);
    return NextResponse.json(
      { error: "处理失败，请稍后再试" },
      { status: 400 }
    );
  }
}
