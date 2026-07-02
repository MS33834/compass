import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

// 注册接口限流：每 IP 每 15 分钟 5 次
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  // 限流：取 x-forwarded-for 首个 IP 作为标识
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const limited = rateLimit(`register:${ip}`, LIMIT, WINDOW_MS);
  if (!limited.success) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // 入参校验
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // bcrypt 哈希密码，cost = 12
    const passwordHash = await bcrypt.hash(password, 12);

    // 创建用户
    await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return NextResponse.json({ message: "注册成功" });
  } catch (error) {
    console.error("[register] 注册失败:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后再试" },
      { status: 400 }
    );
  }
}
