import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { updateMilestone, deleteMilestone } from "@/lib/services/milestone-service";
import { updateMilestoneSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// PATCH /api/milestones/:id
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
    const parsed = updateMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const milestone = await updateMilestone(userId, params.id, parsed.data);

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error("[PATCH /api/milestones/:id] 更新里程碑失败:", error);
    return NextResponse.json(
      { error: "更新里程碑失败，请稍后再试" },
      { status: 500 }
    );
  }
}

// DELETE /api/milestones/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    await deleteMilestone(userId, params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/milestones/:id] 删除里程碑失败:", error);
    return NextResponse.json(
      { error: "删除里程碑失败，请稍后再试" },
      { status: 500 }
    );
  }
}
