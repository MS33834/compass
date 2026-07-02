import { prisma } from "@/lib/prisma";
import type { CreateLogInput, UpdateLogInput } from "@/lib/validations";

// 查询日志，支持按 period（week/month）筛选时间范围，按 tag 筛选，分页
// include goals（GoalLogs → Goal 的 id 和 title）
export async function getLogs(
  userId: string,
  filters?: {
    period?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }
) {
  const where: {
    userId: string;
    createdAt?: { gte: Date };
    tags?: { has: string };
  } = { userId };

  // 按时间范围筛选
  if (filters?.period) {
    const now = new Date();
    let gte: Date;
    if (filters.period === "week") {
      gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filters.period === "month") {
      gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // 未知 period 不返回历史数据
      gte = now;
    }
    where.createdAt = { gte };
  }

  // 按标签筛选
  if (filters?.tag) {
    where.tags = { has: filters.tag };
  }

  const limit = filters?.limit ?? 20;
  const offset = filters?.offset ?? 0;

  // 并行查询数据和总数
  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        goals: {
          include: {
            goal: { select: { id: true, title: true } },
          },
        },
      },
    }),
    prisma.log.count({ where }),
  ]);

  return { logs, total };
}

// 查询单条日志详情
export async function getLogById(userId: string, logId: string) {
  return prisma.log.findFirst({
    where: { id: logId, userId },
    include: {
      goals: {
        include: {
          goal: { select: { id: true, title: true } },
        },
      },
    },
  });
}

// 创建日志，如果有 goalIds 则创建 GoalLogs 关联
// 安全：goalIds 必须验证归属于当前用户，防止越权关联他人目标
export async function createLog(userId: string, data: CreateLogInput) {
  // 校验 goalIds 归属：只保留属于当前用户的目标 ID
  let validGoalIds: string[] = [];
  if (data.goalIds && data.goalIds.length > 0) {
    const ownedGoals = await prisma.goal.findMany({
      where: { id: { in: data.goalIds }, userId },
      select: { id: true },
    });
    validGoalIds = ownedGoals.map((g) => g.id);
  }

  return prisma.log.create({
    data: {
      userId,
      content: data.content,
      mood: data.mood,
      energy: data.energy,
      tags: data.tags,
      goals: validGoalIds.length > 0
        ? {
            create: validGoalIds.map((goalId) => ({ goalId })),
          }
        : undefined,
    },
    include: {
      goals: {
        include: {
          goal: { select: { id: true, title: true } },
        },
      },
    },
  });
}

// 更新日志，如果 data 中有 goalIds 则先删除旧关联再创建新关联
// 安全：goalIds 同样需验证归属
export async function updateLog(
  userId: string,
  logId: string,
  data: UpdateLogInput
) {
  // 先验证日志归属
  const existing = await prisma.log.findFirst({
    where: { id: logId, userId },
  });
  if (!existing) return null;

  // 如果提供了 goalIds，先删除旧关联，再校验归属后创建新关联
  if (data.goalIds) {
    await prisma.goalLogs.deleteMany({ where: { logId } });
    if (data.goalIds.length > 0) {
      const ownedGoals = await prisma.goal.findMany({
        where: { id: { in: data.goalIds }, userId },
        select: { id: true },
      });
      if (ownedGoals.length > 0) {
        await prisma.goalLogs.createMany({
          data: ownedGoals.map((g) => ({ goalId: g.id, logId })),
        });
      }
    }
  }

  // goalIds 不属于 Log 字段，从更新数据中剔除
  const { goalIds, ...rest } = data;
  return prisma.log.update({
    where: { id: logId },
    data: rest,
    include: {
      goals: {
        include: {
          goal: { select: { id: true, title: true } },
        },
      },
    },
  });
}

// 删除日志（GoalLogs 会因 onDelete: Cascade 自动级联删除）
export async function deleteLog(userId: string, logId: string) {
  return prisma.log.delete({
    where: { id: logId, userId },
  });
}

// 查询用户所有日志中的唯一标签列表
export async function getTags(userId: string): Promise<string[]> {
  const logs = await prisma.log.findMany({
    where: { userId },
    select: { tags: true },
  });

  const tagSet = new Set<string>();
  for (const log of logs) {
    for (const tag of log.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet);
}
