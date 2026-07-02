import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getGoalById, updateGoal, deleteGoal } from "@/lib/services/goal-service";
import { updateGoalSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/goals/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const goal = await getGoalById(userId, params.id);
    if (!goal) {
      return NextResponse.json({ error: "目标不存在" }, { status: 404 });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("[GET /api/goals/:id] 获取目标失败:", error);
    return NextResponse.json(
      { error: "获取目标失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// PATCH /api/goals/:id
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
    const parsed = updateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const goal = await updateGoal(userId, params.id, parsed.data);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("[PATCH /api/goals/:id] 更新目标失败:", error);
    return NextResponse.json(
      { error: "更新目标失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    await deleteGoal(userId, params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/goals/:id] 删除目标失败:", error);
    return NextResponse.json(
      { error: "删除目标失败，请稍后再试" },
      { status: 500 }
    );
  }
}
