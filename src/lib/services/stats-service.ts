import { prisma } from "@/lib/prisma";

// 仪表盘聚合统计
export async function getDashboardStats(userId: string) {
  const [
    totalGoals,
    activeGoals,
    completedGoals,
    totalMilestones,
    completedMilestones,
    totalTasks,
    completedTasks,
    activeGoalsData,
    recentLogs,
  ] = await Promise.all([
    // 用户目标总数（status != archived）
    prisma.goal.count({
      where: { userId, status: { not: "archived" } },
    }),
    // active 目标数
    prisma.goal.count({
      where: { userId, status: "active" },
    }),
    // completed 目标数
    prisma.goal.count({
      where: { userId, status: "completed" },
    }),
    // 所有目标下的里程碑总数
    prisma.milestone.count({
      where: { goal: { userId } },
    }),
    // status = done 的里程碑数
    prisma.milestone.count({
      where: { goal: { userId }, status: "done" },
    }),
    // 所有任务总数
    prisma.task.count({
      where: { milestone: { goal: { userId } } },
    }),
    // status = done 的任务数
    prisma.task.count({
      where: { milestone: { goal: { userId } }, status: "done" },
    }),
    // 所有 active 目标的进度（用于计算平均进度）
    prisma.goal.findMany({
      where: { userId, status: "active" },
      select: { progress: true },
    }),
    // 最近 3 条日志
    prisma.log.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        content: true,
        mood: true,
        energy: true,
        createdAt: true,
      },
    }),
  ]);

  // 所有 active 目标的平均进度（取整）
  const averageProgress =
    activeGoalsData.length > 0
      ? Math.round(
          activeGoalsData.reduce((sum, g) => sum + g.progress, 0) /
            activeGoalsData.length
        )
      : 0;

  // 日志 content 截取前 100 字
  const recentLogsWithExcerpt = recentLogs.map((log) => ({
    ...log,
    content: log.content.slice(0, 100),
  }));

  // 连续记录日志的天数
  const streakDays = await calculateStreakDays(userId);

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    totalMilestones,
    completedMilestones,
    totalTasks,
    completedTasks,
    averageProgress,
    recentLogs: recentLogsWithExcerpt,
    streakDays,
  };
}

// 计算连续记录日志的天数（从今天往前推，连续有日志的天数）
async function calculateStreakDays(userId: string): Promise<number> {
  const logs = await prisma.log.findMany({
    where: { userId },
    select: { createdAt: true },
  });

  // 收集所有有日志的日期（YYYY-MM-DD，按 UTC）
  const dateSet = new Set<string>();
  for (const log of logs) {
    dateSet.add(log.createdAt.toISOString().slice(0, 10));
  }

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    if (dateSet.has(dateStr)) {
      streak++;
    } else {
      // 今天还没记日志不算中断，允许从昨天继续算
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}
