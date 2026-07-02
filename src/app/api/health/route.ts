import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 强制动态渲染，避免构建时尝试连接数据库
export const dynamic = "force-dynamic";

// 健康检查接口：探活并验证数据库连通性
export async function GET() {
  try {
    // 执行简单查询验证数据库连接
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("[health] 数据库连接失败:", error);
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 500 }
    );
  }
}
