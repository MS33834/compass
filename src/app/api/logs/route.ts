import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getLogs, createLog } from "@/lib/services/log-service";
import { createLogSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/logs?period=week&tag=foo&limit=20&offset=0
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 从 URL searchParams 获取 period、tag、limit、offset 筛选参数
    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    // 校验分页参数，限制 limit 范围 [1, 100]
    let limit = 20;
    let offset = 0;
    if (limitParam) {
      const n = Number(limitParam);
      if (Number.isNaN(n) || n < 1) {
        return NextResponse.json(
          { error: "limit 必须是正整数" },
          { status: 400 }
        );
      }
      limit = Math.min(n, 100);
    }
    if (offsetParam) {
      const n = Number(offsetParam);
      if (Number.isNaN(n) || n < 0) {
        return NextResponse.json(
          { error: "offset 必须是非负整数" },
          { status: 400 }
        );
      }
      offset = n;
    }

    const { logs, total } = await getLogs(userId, { period, tag, limit, offset });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("[GET /api/logs] 获取日志列表失败:", error);
    return NextResponse.json(
      { error: "获取日志列表失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// POST /api/logs
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();

    // 入参校验
    const parsed = createLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const log = await createLog(userId, parsed.data);

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/logs] 创建日志失败:", error);
    return NextResponse.json(
      { error: "创建日志失败，请稍后再试" },
      { status: 500 }
    );
  }
}
