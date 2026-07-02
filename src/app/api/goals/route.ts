import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getAllGoals, createGoal } from "@/lib/services/goal-service";
import { createGoalSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/goals?status=active&quadrant=north
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 从 URL searchParams 获取 status 和 quadrant 筛选参数
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") ?? undefined;
    const quadrant = searchParams.get("quadrant") ?? undefined;

    const goals = await getAllGoals(userId, { status, quadrant });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("[GET /api/goals] 获取目标列表失败:", error);
    return NextResponse.json(
      { error: "获取目标列表失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// POST /api/goals
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();

    // 入参校验
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const goal = await createGoal(userId, parsed.data);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/goals] 创建目标失败:", error);
    return NextResponse.json(
      { error: "创建目标失败，请稍后再试" },
      { status: 500 }
    );
  }
}
