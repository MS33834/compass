import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getTasksByMilestone, createTask } from "@/lib/services/task-service";
import { createTaskSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/milestones/:id/tasks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const tasks = await getTasksByMilestone(userId, params.id);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[GET /api/milestones/:id/tasks] 获取任务列表失败:", error);
    return NextResponse.json(
      { error: "获取任务列表失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// POST /api/milestones/:id/tasks
export async function POST(
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
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const task = await createTask(userId, params.id, parsed.data);

    if (!task) {
      return NextResponse.json(
        { error: "里程碑不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/milestones/:id/tasks] 创建任务失败:", error);
    return NextResponse.json(
      { error: "创建任务失败，请稍后再试" },
      { status: 500 }
    );
  }
}
