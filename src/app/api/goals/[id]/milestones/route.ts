import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getMilestonesByGoal, createMilestone } from "@/lib/services/milestone-service";
import { createMilestoneSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/goals/:goalId/milestones
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const milestones = await getMilestonesByGoal(userId, params.id);

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error("[GET /api/goals/:goalId/milestones] 获取里程碑列表失败:", error);
    return NextResponse.json(
      { error: "获取里程碑列表失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// POST /api/goals/:goalId/milestones
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
    const parsed = createMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const milestone = await createMilestone(userId, params.id, parsed.data);

    if (!milestone) {
      return NextResponse.json(
        { error: "目标不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/goals/:goalId/milestones] 创建里程碑失败:", error);
    return NextResponse.json(
      { error: "创建里程碑失败，请稍后再试" },
      { status: 500 }
    );
  }
}
