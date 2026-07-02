// Compass 数据库种子脚本
// 创建测试用户及其示例目标、里程碑与任务
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 哈希用户密码
  const passwordHash = await bcrypt.hash('compass123', 10);

  // 创建测试用户（如已存在则更新），同时级联创建目标、里程碑与任务
  const user = await prisma.user.upsert({
    where: { email: 'captain@compass.dev' },
    update: { passwordHash },
    create: {
      email: 'captain@compass.dev',
      name: 'Captain',
      passwordHash,
      theme: 'deep-sea',
      goals: {
        create: [
          // 目标一：北方象限，高优先级
          {
            title: '完成 Compass MVP 上线',
            description: '将个人方向导航系统的最小可用版本部署到生产环境',
            quadrant: 'north',
            priority: 'high',
            status: 'active',
            progress: 20,
            sortOrder: 0,
            targetDate: new Date('2026-09-30'),
            milestones: {
              create: [
                {
                  title: '搭建项目基础设施',
                  description: '完成数据库、认证与基础页面框架',
                  status: 'in_progress',
                  sortOrder: 0,
                  dueDate: new Date('2026-08-15'),
                  tasks: {
                    create: [
                      {
                        title: '配置 Prisma schema 与迁移',
                        status: 'done',
                        sortOrder: 0,
                      },
                      {
                        title: '接入 NextAuth 邮箱密码登录',
                        status: 'in_progress',
                        sortOrder: 1,
                      },
                    ],
                  },
                },
                {
                  title: '完成目标与里程碑管理页面',
                  description: '实现 CRUD 界面与拖拽排序',
                  status: 'todo',
                  sortOrder: 1,
                  dueDate: new Date('2026-09-10'),
                  tasks: {
                    create: [
                      {
                        title: '罗盘主视图组件',
                        status: 'todo',
                        sortOrder: 0,
                      },
                    ],
                  },
                },
              ],
            },
          },
          // 目标二：东方象限，中优先级
          {
            title: '坚持每周深度阅读',
            description: '每周末完成一本专业书籍的阅读并整理笔记',
            quadrant: 'east',
            priority: 'medium',
            status: 'active',
            progress: 35,
            sortOrder: 1,
            milestones: {
              create: [
                {
                  title: '建立阅读清单与节奏',
                  description: '梳理待读书目并确定每周固定阅读时段',
                  status: 'done',
                  sortOrder: 0,
                  dueDate: new Date('2026-07-31'),
                  tasks: {
                    create: [
                      {
                        title: '整理本月待读书单',
                        status: 'done',
                        sortOrder: 0,
                      },
                      {
                        title: '设置周末阅读提醒',
                        status: 'todo',
                        sortOrder: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Created user: ${user.email}`);
  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
