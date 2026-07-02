import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getDashboardStats } from "@/lib/services/stats-service";

export const dynamic = "force-dynamic";

// GET /api/stats
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const stats = await getDashboardStats(userId);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("[GET /api/stats] 获取仪表盘统计失败:", error);
    return NextResponse.json(
      { error: "获取仪表盘统计失败，请稍后再试" },
      { status: 500 }
    );
  }
}
