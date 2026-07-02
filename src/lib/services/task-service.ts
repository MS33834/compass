import { prisma } from "@/lib/prisma";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations";
import { recalculateGoalProgress } from "@/lib/services/goal-service";

// 查询里程碑下的所有任务，验证归属
export async function getTasksByMilestone(userId: string, milestoneId: string) {
  return prisma.task.findMany({
    where: { milestoneId, milestone: { goal: { userId } } },
    orderBy: { sortOrder: "asc" },
  });
}

// 创建任务，验证 milestone 归属
export async function createTask(
  userId: string,
  milestoneId: string,
  data: CreateTaskInput
) {
  // 验证里程碑归属
  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, goal: { userId } },
  });
  if (!milestone) return null;

  return prisma.task.create({
    data: {
      milestoneId,
      title: data.title,
    },
  });
}

// 更新任务，验证归属。如果 status 变为 done，触发里程碑进度重算
export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskInput
) {
  // 若状态变为 done，提前获取所属 goalId 用于进度重算
  let goalId: string | null = null;
  if (data.status === "done") {
    const taskWithGoal = await prisma.task.findFirst({
      where: { id: taskId, milestone: { goal: { userId } } },
      select: { milestone: { select: { goalId: true } } },
    });
    if (!taskWithGoal) return null;
    goalId = taskWithGoal.milestone.goalId;
  }

  const task = await prisma.task.update({
    where: { id: taskId, milestone: { goal: { userId } } },
    data,
  });

  if (goalId) {
    await recalculateGoalProgress(goalId);
  }

  return task;
}

// 删除任务，验证归属。删除后触发里程碑进度重算
export async function deleteTask(userId: string, taskId: string) {
  // 先获取 goalId 用于重算
  const taskWithGoal = await prisma.task.findFirst({
    where: { id: taskId, milestone: { goal: { userId } } },
    select: { milestone: { select: { goalId: true } } },
  });
  if (!taskWithGoal) return null;

  const goalId = taskWithGoal.milestone.goalId;

  await prisma.task.delete({
    where: { id: taskId, milestone: { goal: { userId } } },
  });

  await recalculateGoalProgress(goalId);
}
