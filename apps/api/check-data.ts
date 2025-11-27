import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查用户数据 ===');
  const users = await prisma.user.findMany();
  console.log('用户列表:', users);

  console.log('\n=== 检查组织数据 ===');
  const organizations = await prisma.organization.findMany();
  console.log('组织列表:', organizations);

  console.log('\n=== 检查成员关系数据 ===');
  const memberships = await prisma.membership.findMany({
    include: {
      user: true,
      organization: true
    }
  });
  console.log('成员关系列表:', memberships);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });