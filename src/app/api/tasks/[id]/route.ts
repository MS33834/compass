import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { updateTask, deleteTask } from "@/lib/services/task-service";
import { updateTaskSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// PATCH /api/tasks/:id
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
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const task = await updateTask(userId, params.id, parsed.data);

    if (!task) {
      return NextResponse.json(
        { error: "任务不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("[PATCH /api/tasks/:id] 更新任务失败:", error);
    return NextResponse.json(
      { error: "更新任务失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const deleted = await deleteTask(userId, params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "任务不存在或无权操作" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/tasks/:id] 删除任务失败:", error);
    return NextResponse.json(
      { error: "删除任务失败，请稍后再试" },
      { status: 500 }
    );
  }
}
