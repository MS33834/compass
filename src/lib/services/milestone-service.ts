import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@/lib/validations";
import { recalculateGoalProgress } from "@/lib/services/goal-service";

// 查询目标下的所有里程碑，include tasks，按 sortOrder 排序
export async function getMilestonesByGoal(userId: string, goalId: string) {
  return prisma.milestone.findMany({
    where: { goalId, goal: { userId } },
    orderBy: { sortOrder: "asc" },
    include: { tasks: true },
  });
}

// 创建里程碑，先验证 goal 属于该 userId
export async function createMilestone(
  userId: string,
  goalId: string,
  data: CreateMilestoneInput
) {
  // 验证目标归属
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });
  if (!goal) return null;

  return prisma.milestone.create({
    data: {
      goalId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
}

// 更新里程碑，where 通过 milestone → goal → userId 验证归属
export async function updateMilestone(
  userId: string,
  milestoneId: string,
  data: UpdateMilestoneInput
) {
  const { dueDate, ...rest } = data;
  return prisma.milestone.update({
    where: { id: milestoneId, goal: { userId } },
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });
}

// 删除里程碑，同样验证归属
export async function deleteMilestone(userId: string, milestoneId: string) {
  return prisma.milestone.delete({
    where: { id: milestoneId, goal: { userId } },
  });
}

// 更新里程碑状态后，自动调用 goal-service 的 recalculateGoalProgress
export async function updateMilestoneStatus(
  userId: string,
  milestoneId: string,
  status: TaskStatus
) {
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId, goal: { userId } },
    data: { status },
  });

  await recalculateGoalProgress(milestone.goalId);

  return milestone;
}
