import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { updateLog, deleteLog } from "@/lib/services/log-service";
import { updateLogSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// PATCH /api/logs/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();

    // 入参校验
    const parsed = updateLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const log = await updateLog(userId, params.id, parsed.data);

    if (!log) {
      return NextResponse.json(
        { error: "日志不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error("[PATCH /api/logs/:id] 更新日志失败:", error);
    return NextResponse.json(
      { error: "更新日志失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// DELETE /api/logs/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    await deleteLog(userId, params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/logs/:id] 删除日志失败:", error);
    return NextResponse.json(
      { error: "删除日志失败，请稍后再试" },
      { status: 500 }
    );
  }
}
