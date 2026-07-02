import { prisma } from "@/lib/prisma";
import type { GoalStatus, Quadrant } from "@prisma/client";
import type { CreateGoalInput, UpdateGoalInput } from "@/lib/validations";

// 查询用户所有目标，支持按 status 和 quadrant 筛选，按 sortOrder 排序
// include milestones（带 tasks 计数）
export async function getAllGoals(
  userId: string,
  filters?: { status?: string; quadrant?: string }
) {
  const where: {
    userId: string;
    status?: GoalStatus;
    quadrant?: Quadrant;
  } = { userId };

  if (filters?.status) {
    where.status = filters.status as GoalStatus;
  }
  if (filters?.quadrant) {
    where.quadrant = filters.quadrant as Quadrant;
  }

  return prisma.goal.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: {
      milestones: {
        include: {
          _count: { select: { tasks: true } },
        },
      },
    },
  });
}

// 查询单个目标详情，include milestones 和 milestones.tasks
export async function getGoalById(userId: string, goalId: string) {
  return prisma.goal.findFirst({
    where: { id: goalId, userId },
    include: {
      milestones: {
        orderBy: { sortOrder: "asc" },
        include: { tasks: true },
      },
    },
  });
}

// 创建目标，targetDate 如果有则转 Date 对象
export async function createGoal(userId: string, data: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      quadrant: data.quadrant,
      priority: data.priority,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    },
  });
}

// 更新目标，where 条件包含 userId 和 id（数据隔离）
// targetDate 处理同 createGoal
export async function updateGoal(
  userId: string,
  goalId: string,
  data: UpdateGoalInput
) {
  const { targetDate, ...rest } = data;
  return prisma.goal.update({
    where: { id: goalId, userId },
    data: {
      ...rest,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    },
  });
}

// 删除目标，where 条件包含 userId 和 id（数据隔离）
export async function deleteGoal(userId: string, goalId: string) {
  return prisma.goal.delete({
    where: { id: goalId, userId },
  });
}

// 重新计算目标进度：
// 查询该目标下所有 milestone 的所有 task，
// progress = doneTasks / totalTasks * 100（取整）
// 如果 totalTasks 为 0，progress 保持不变
export async function recalculateGoalProgress(goalId: string): Promise<void> {
  const milestones = await prisma.milestone.findMany({
    where: { goalId },
    include: {
      tasks: { select: { status: true } },
    },
  });

  const allTasks = milestones.flatMap((m) => m.tasks);
  const totalTasks = allTasks.length;

  // 没有任务时保持进度不变
  if (totalTasks === 0) return;

  const doneTasks = allTasks.filter((t) => t.status === "done").length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  await prisma.goal.update({
    where: { id: goalId },
    data: { progress },
  });
}
