import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 入参校验
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }
    const { token, password } = parsed.data;

    // 查找 token 对应记录
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    // 校验：记录不存在、已使用或已过期均视为无效
    if (
      !resetRecord ||
      resetRecord.used ||
      resetRecord.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "重置链接无效或已过期" },
        { status: 400 }
      );
    }

    // 哈希新密码
    const passwordHash = await bcrypt.hash(password, 12);

    // 更新用户密码
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    // 标记 token 为已使用
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    return NextResponse.json({ message: "密码重置成功" });
  } catch (error) {
    console.error("[reset-password] 重置失败:", error);
    return NextResponse.json(
      { error: "重置失败，请稍后再试" },
      { status: 400 }
    );
  }
}
